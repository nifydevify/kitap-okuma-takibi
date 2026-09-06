import { db } from './db'
import { compareSessionsChronological } from '../utils/sessionOrder'
import type { ReadingSession } from '../types'

export type NewSessionInput = Omit<ReadingSession, 'id' | 'createdAt'>

/**
 * Bir kitaba ait tüm oturumları tarih/saate göre sıralar ve book.currentPage'i son oturumun
 * endPage'ine eşitler. Hiç oturum kalmadıysa currentPage'e dokunmaz — kitap eklenirken veya
 * "Düzelt" ile manuel olarak ayarlanmış olabilir, bunu sıfırlamak veri kaybına yol açar.
 */
export async function recomputeBookCurrentPage(bookId: number): Promise<void> {
  const sessions = await db.sessions.where('bookId').equals(bookId).toArray()
  if (sessions.length === 0) return

  const sorted = [...sessions].sort(compareSessionsChronological)
  const last = sorted[sorted.length - 1]
  if (last.endPage === undefined) return

  await db.books.update(bookId, { currentPage: last.endPage })
}

export async function addSession(input: NewSessionInput): Promise<number> {
  return db.transaction('rw', db.books, db.sessions, async () => {
    const id = await db.sessions.add({ ...input, createdAt: Date.now() })
    if (input.bookId !== undefined) await recomputeBookCurrentPage(input.bookId)
    return id
  })
}

export async function updateSession(id: number, changes: Partial<NewSessionInput>): Promise<void> {
  await db.transaction('rw', db.books, db.sessions, async () => {
    const existing = await db.sessions.get(id)
    if (!existing) return
    await db.sessions.update(id, changes)
    const newBookId = 'bookId' in changes ? changes.bookId : existing.bookId
    if (newBookId !== undefined) await recomputeBookCurrentPage(newBookId)
    if (existing.bookId !== undefined && existing.bookId !== newBookId) {
      await recomputeBookCurrentPage(existing.bookId)
    }
  })
}

/** Bir kitaba bağlı oturumların kapladığı en dar sayfa aralığı (sayfaya bağlı olmayanlar hariç). */
export async function getBookSessionPageBounds(bookId: number): Promise<{ minStart: number; maxEnd: number } | null> {
  const sessions = await db.sessions.where('bookId').equals(bookId).toArray()
  const withPages = sessions.filter(
    (s): s is ReadingSession & { startPage: number; endPage: number } =>
      s.startPage !== undefined && s.endPage !== undefined,
  )
  if (withPages.length === 0) return null
  return {
    minStart: Math.min(...withPages.map((s) => s.startPage)),
    maxEnd: Math.max(...withPages.map((s) => s.endPage)),
  }
}

export async function deleteSession(id: number): Promise<void> {
  await db.transaction('rw', db.books, db.sessions, async () => {
    const existing = await db.sessions.get(id)
    if (!existing) return
    await db.sessions.delete(id)
    if (existing.bookId !== undefined) await recomputeBookCurrentPage(existing.bookId)
  })
}
