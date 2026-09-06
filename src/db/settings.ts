import { db } from './db'
import type { AppSettings } from '../types'

/**
 * db.settings.update() satır yoksa sessizce hiçbir şey yapmaz (Dexie'de update no-op döner).
 * Normalde 'settings' satırı populate hook'uyla garanti var, ama silinmiş/bozulmuş olsa bile
 * ayar değişikliğinin sessizce kaybolmaması için get+put ile upsert yapıyoruz.
 */
async function upsertSettings(changes: Partial<Omit<AppSettings, 'id'>>): Promise<void> {
  const existing = await db.settings.get('settings')
  await db.settings.put({ id: 'settings', darkMode: false, ...existing, ...changes })
}

export async function getDarkMode(): Promise<boolean> {
  const settings = await db.settings.get('settings')
  return settings?.darkMode ?? false
}

export async function setDarkMode(darkMode: boolean): Promise<void> {
  await upsertSettings({ darkMode })
}

export async function getCloudSyncAccount(): Promise<string | undefined> {
  const settings = await db.settings.get('settings')
  return settings?.cloudSyncAccount
}

export async function setCloudSyncAccount(uid: string | undefined): Promise<void> {
  await upsertSettings({ cloudSyncAccount: uid })
}

/** Tüm kitapları ve kayıtları kalıcı olarak siler; kitap listesi tamamen boş kalır (yeniden tohumlanmaz). */
export async function resetAllData(): Promise<void> {
  await db.transaction('rw', db.books, db.sessions, db.settings, async () => {
    await db.sessions.clear()
    await db.books.clear()
    const existing = await db.settings.get('settings')
    await db.settings.put({ id: 'settings', darkMode: false, cloudSyncAccount: existing?.cloudSyncAccount })
  })
}
