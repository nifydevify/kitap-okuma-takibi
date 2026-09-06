import type { Table } from 'dexie'
import { doc, getDoc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore'
import { db } from '../db/db'
import { firestore } from './config'
import type { BackupData } from '../types'

function userDocRef(uid: string) {
  if (!firestore) throw new Error('Firestore yapılandırılmadı.')
  return doc(firestore, 'users', uid)
}

/** Bulutta bu hesap için daha önce senkronize edilmiş veri var mı (ilk kurulum seçimi için). */
export async function fetchCloudData(uid: string): Promise<BackupData | null> {
  const snap = await getDoc(userDocRef(uid))
  return snap.exists() ? (snap.data() as BackupData) : null
}

async function readLocalSnapshot(): Promise<BackupData> {
  const [books, sessions] = await Promise.all([db.books.toArray(), db.sessions.toArray()])
  return { version: 1, exportedAt: new Date().toISOString(), books, sessions }
}

// Firestore, alan değeri olarak `undefined` kabul etmez (ör. ReadingSession.note/startTime/
// endTime boşken undefined olur) ve setDoc'u hatayla reddeder. JSON round-trip, undefined
// anahtarları tamamen kaldırdığı için en güvenli temizleme yolu budur.
function stripUndefined<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T
}

export async function pushLocalToCloud(uid: string): Promise<void> {
  const data = await readLocalSnapshot()
  await setDoc(userDocRef(uid), stripUndefined(data))
}

export async function applyCloudToLocal(data: BackupData): Promise<void> {
  await db.transaction('rw', db.books, db.sessions, async () => {
    await db.sessions.clear()
    await db.books.clear()
    if (data.books.length > 0) await db.books.bulkAdd(data.books)
    if (data.sessions.length > 0) await db.sessions.bulkAdd(data.sessions)
  })
}

function serialize(data: BackupData): string {
  return JSON.stringify({ books: data.books, sessions: data.sessions })
}

/**
 * Bu hesap için ilk kurulum kararı verildikten sonra sürekli iki yönlü senkronizasyon başlatır:
 * - Buluttaki değişiklikler (başka bir cihazdan) yerel veritabanına yazılır.
 * - Yerel değişiklikler (bu cihazdan) buluta yazılır.
 * Kendi yazdığımız veriyi geri okuyup tekrar yazmayı (yankı) önlemek için son senkronize edilen
 * verinin serileştirilmiş hâli karşılaştırılır.
 */
export function startCloudSync(uid: string): Unsubscribe {
  let lastSynced: string | null = null
  let applyingRemote = false
  let pushTimer: ReturnType<typeof setTimeout> | undefined

  const unsubscribeRemote = onSnapshot(userDocRef(uid), (snap) => {
    if (!snap.exists()) return
    const data = snap.data() as BackupData
    const serialized = serialize(data)
    if (serialized === lastSynced) return
    lastSynced = serialized
    applyingRemote = true
    void applyCloudToLocal(data).finally(() => {
      applyingRemote = false
    })
  })

  async function pushIfChanged() {
    if (applyingRemote) return
    const data = await readLocalSnapshot()
    const serialized = serialize(data)
    if (serialized === lastSynced) return
    lastSynced = serialized
    await setDoc(userDocRef(uid), stripUndefined(data))
  }

  function schedulePush() {
    if (pushTimer) clearTimeout(pushTimer)
    pushTimer = setTimeout(() => void pushIfChanged(), 1500)
  }

  // Aynı fonksiyon referansı hem creating/updating/deleting olaylarına abone olmak hem de
  // temizlikte unsubscribe etmek için kullanılıyor; parametre farkları schedulePush'ta göz ardı edilir.
  const tables: Table[] = [db.books, db.sessions]
  for (const table of tables) {
    table.hook('creating', schedulePush)
    table.hook('updating', schedulePush)
    table.hook('deleting', schedulePush)
  }

  return () => {
    unsubscribeRemote()
    if (pushTimer) clearTimeout(pushTimer)
    for (const table of tables) {
      table.hook('creating').unsubscribe(schedulePush)
      table.hook('updating').unsubscribe(schedulePush)
      table.hook('deleting').unsubscribe(schedulePush)
    }
  }
}
