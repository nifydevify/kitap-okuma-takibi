import type { Book, BookWithComputed, ReadingSession, SessionWithComputed } from '../types'

export function withBookComputed(book: Book): BookWithComputed {
  const effectivePages = Math.max(book.totalPages - book.frontMatterPages, 0)
  const startingPage = book.frontMatterPages + 1
  const progressPages = Math.max(book.currentPage - startingPage, 0)
  const progressPercent = effectivePages > 0 ? Math.min((progressPages / effectivePages) * 100, 100) : 0
  const remainingPages = Math.max(effectivePages - progressPages, 0)

  return {
    ...book,
    effectivePages,
    startingPage,
    progressPages,
    progressPercent,
    remainingPages,
  }
}

export function withSessionComputed(session: ReadingSession): SessionWithComputed {
  const pagesRead =
    session.bookId !== undefined
      ? (session.endPage ?? 0) - (session.startPage ?? 0)
      : (session.pageCount ?? 0)
  return { ...session, pagesRead }
}

export function startingPageOf(book: Pick<Book, 'frontMatterPages'>): number {
  return book.frontMatterPages + 1
}
