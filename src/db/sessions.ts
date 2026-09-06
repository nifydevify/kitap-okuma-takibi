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

  await db.books.update(bookId, { currentPage: last.endPage })
}

export async function addSession(input: NewSessionInput): Promise<number> {
  return db.transaction('rw', db.books, db.sessions, async () => {
    const id = await db.sessions.add({ ...input, createdAt: Date.now() })
    await recomputeBookCurrentPage(input.bookId)
    return id
  })
}

export async function updateSession(id: number, changes: Partial<NewSessionInput>): Promise<void> {
  await db.transaction('rw', db.books, db.sessions, async () => {
    const existing = await db.sessions.get(id)
    if (!existing) return
    await db.sessions.update(id, changes)
    await recomputeBookCurrentPage(changes.bookId ?? existing.bookId)
    if (changes.bookId && changes.bookId !== existing.bookId) {
      await recomputeBookCurrentPage(existing.bookId)
    }
  })
}

export async function deleteSession(id: number): Promise<void> {
  await db.transaction('rw', db.books, db.sessions, async () => {
    const existing = await db.sessions.get(id)
    if (!existing) return
    await db.sessions.delete(id)
    await recomputeBookCurrentPage(existing.bookId)
  })
}
