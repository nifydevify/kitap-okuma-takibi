import { db } from './db'

export async function getDarkMode(): Promise<boolean> {
  const settings = await db.settings.get('settings')
  return settings?.darkMode ?? false
}

export async function setDarkMode(darkMode: boolean): Promise<void> {
  await db.settings.put({ id: 'settings', darkMode })
}

/** Tüm kitapları ve kayıtları kalıcı olarak siler; kitap listesi tamamen boş kalır (yeniden tohumlanmaz). */
export async function resetAllData(): Promise<void> {
  await db.transaction('rw', db.books, db.sessions, db.settings, async () => {
    await db.sessions.clear()
    await db.books.clear()
    await db.settings.put({ id: 'settings', darkMode: false })
  })
}
