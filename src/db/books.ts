import { db } from './db'
import { startingPageOf } from './computed'
import type { Book } from '../types'

export type NewBookInput = Pick<Book, 'name' | 'totalPages' | 'frontMatterPages' | 'color'>

export const FREEFORM_BOOK_NAME = 'Serbest Okuma'

export async function addBook(input: NewBookInput): Promise<number> {
  const startingPage = startingPageOf(input)
  return db.books.add({
    ...input,
    currentPage: startingPage,
  })
}

/**
 * "Belirli bir kitaba bağlı değilim, sadece sayfa sayacı artsın" durumu için tek seferlik özel
 * kitap. Sayfa aralığı zorunluluğu yoktur (bkz. validateSessionPages), currentPage sadece
 * kümülatif okunan sayfa sayacı olarak artar. Zaten varsa mevcut olanın id'sini döner.
 */
export async function ensureFreeformBook(): Promise<number> {
  const existing = await db.books.filter((b) => b.isFreeform === true).first()
  if (existing) return existing.id
  return db.books.add({
    name: FREEFORM_BOOK_NAME,
    totalPages: 0,
    frontMatterPages: 0,
    color: '#64748b',
    currentPage: 1,
    isFreeform: true,
  })
}

export async function updateBook(id: number, changes: Partial<NewBookInput>): Promise<void> {
  await db.books.update(id, changes)
}

export async function setBookCurrentPage(id: number, currentPage: number): Promise<void> {
  await db.books.update(id, { currentPage })
}

export async function bookHasSessions(id: number): Promise<boolean> {
  const count = await db.sessions.where('bookId').equals(id).count()
  return count > 0
}

export async function deleteBookWithSessions(id: number): Promise<void> {
  await db.transaction('rw', db.books, db.sessions, async () => {
    await db.sessions.where('bookId').equals(id).delete()
    await db.books.delete(id)
  })
}
