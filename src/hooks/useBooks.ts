import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { withBookComputed } from '../db/computed'
import type { BookWithComputed } from '../types'

export function useBooks(): BookWithComputed[] {
  const books = useLiveQuery(() => db.books.orderBy('name').toArray(), [], [])
  return books.map(withBookComputed)
}

export function useBook(bookId: number | undefined): BookWithComputed | undefined {
  const book = useLiveQuery(
    () => (bookId === undefined ? undefined : db.books.get(bookId)),
    [bookId],
  )
  return book ? withBookComputed(book) : undefined
}
