import type { Book } from '../types'

export function validatePageCount(value: number): string | null {
  if (!Number.isFinite(value) || value <= 0) {
    return 'Sayfa sayısı 0’dan büyük bir sayı olmalı.'
  }
  return null
}

export function validateSessionPages(book: Book, startPage: number, endPage: number): string | null {
  if (!Number.isFinite(startPage) || !Number.isFinite(endPage)) {
    return 'Sayfa alanları geçerli bir sayı olmalı.'
  }
  if (book.totalPages <= 0) {
    return 'Önce bu kitabın başlangıç/bitiş sayfasını girmelisin (Kitaplarım veya kitap detay ekranından).'
  }
  if (endPage <= startPage) {
    return 'Bitiş sayfası, başlangıç sayfasından büyük olmalı.'
  }
  if (endPage > book.totalPages) {
    return `Bitiş sayfası kitabın toplam sayfa sayısını (${book.totalPages}) geçemez.`
  }
  return null
}
