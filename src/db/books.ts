import { db } from './db'
import { startingPageOf } from './computed'
import type { Book } from '../types'

export type NewBookInput = Pick<Book, 'name' | 'totalPages' | 'frontMatterPages' | 'color'>

export async function addBook(input: NewBookInput): Promise<number> {
  const startingPage = startingPageOf(input)
  return db.books.add({
    ...input,
    currentPage: startingPage,
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
