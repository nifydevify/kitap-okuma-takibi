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
  if (endPage <= startPage) {
    return 'Bitiş sayfası, başlangıç sayfasından büyük olmalı.'
  }
  // Serbest Okuma kitabının sayfa aralığı/toplam sayfa zorunluluğu yoktur, sadece sayaç olarak artar.
  if (book.isFreeform) {
    return null
  }
  if (book.totalPages <= 0) {
    return 'Önce bu kitabın başlangıç/bitiş sayfasını girmelisin (Kitaplarım veya kitap detay ekranından).'
  }
  const startingPage = book.frontMatterPages + 1
  if (startPage < startingPage) {
    return `Başlangıç sayfası, kitabın okumaya başladığı sayfadan (${startingPage}) küçük olamaz. Önsöz/giriş sayfaları okumaya dahil edilmez.`
  }
  if (endPage > book.totalPages) {
    return `Bitiş sayfası kitabın toplam sayfa sayısını (${book.totalPages}) geçemez.`
  }
  return null
}
