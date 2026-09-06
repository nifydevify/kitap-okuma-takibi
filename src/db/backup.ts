import { db } from './db'
import { recomputeBookCurrentPage } from './sessions'
import type { BackupData } from '../types'

export async function exportBackup(): Promise<BackupData> {
  const [books, sessions] = await Promise.all([db.books.toArray(), db.sessions.toArray()])
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    books,
    sessions,
  }
}

export async function downloadBackup(): Promise<void> {
  const data = await exportBackup()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = data.exportedAt.slice(0, 10)
  a.href = url
  a.download = `kitap-okuma-takibi-yedek-${stamp}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function isBackupData(value: unknown): value is BackupData {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<BackupData>
  return Array.isArray(candidate.books) && Array.isArray(candidate.sessions)
}

/**
 * İçe aktarılan veriyi mevcut veriyle birleştirir (üzerine yazmaz).
 * Aynı isimdeki kitaplar eşleştirilip mevcut kayıt kullanılır; diğerleri yeni kitap olarak eklenir.
 * Oturumlar her zaman yeni kayıt olarak eklenir, bookId eşleşen (yeni veya mevcut) kitaba yeniden bağlanır.
 */
export async function importBackup(json: string): Promise<{ addedBooks: number; addedSessions: number }> {
  const parsed: unknown = JSON.parse(json)
  if (!isBackupData(parsed)) {
    throw new Error('Geçersiz yedek dosyası.')
  }

  return db.transaction('rw', db.books, db.sessions, async () => {
    const existingBooks = await db.books.toArray()
    const nameToId = new Map(existingBooks.map((b) => [b.name.trim().toLowerCase(), b.id]))
    const oldIdToNewId = new Map<number, number>()
    let addedBooks = 0

    for (const book of parsed.books) {
      const key = book.name.trim().toLowerCase()
      const existingId = nameToId.get(key)
      if (existingId !== undefined) {
        oldIdToNewId.set(book.id, existingId)
        continue
      }
      const newId = await db.books.add({
        name: book.name,
        totalPages: book.totalPages,
        frontMatterPages: book.frontMatterPages,
        color: book.color,
        currentPage: book.currentPage,
      })
      nameToId.set(key, newId)
      oldIdToNewId.set(book.id, newId)
      addedBooks += 1
    }

    let addedSessions = 0
    for (const session of parsed.sessions) {
      // Serbest okuma kaydı (bookId yok): doğrudan aktar, kitap eşleştirmesi gerekmez.
      const bookId = session.bookId === undefined ? undefined : oldIdToNewId.get(session.bookId)
      if (session.bookId !== undefined && bookId === undefined) continue
      await db.sessions.add({
        bookId,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        startPage: session.startPage,
        endPage: session.endPage,
        pageCount: session.pageCount,
        note: session.note,
        createdAt: session.createdAt ?? Date.now(),
      })
      addedSessions += 1
    }

    for (const bookId of new Set(oldIdToNewId.values())) {
      await recomputeBookCurrentPage(bookId)
    }

    return { addedBooks, addedSessions }
  })
}
