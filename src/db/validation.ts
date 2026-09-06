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

/** Belirli bir kitaba bağlı olmayan serbest okuma kaydı: doğrudan sayfa sayısı girilen mod. */
export function validateFreeSessionCount(count: number): string | null {
  if (!Number.isFinite(count) || count <= 0) {
    return 'Sayfa sayısı 0’dan büyük bir sayı olmalı.'
  }
  return null
}

/** Belirli bir kitaba bağlı olmayan serbest okuma kaydı: başlangıç/bitiş sayfasından hesaplama modu. */
export function validateFreeSessionRange(startPage: number, endPage: number): string | null {
  if (!Number.isFinite(startPage) || !Number.isFinite(endPage)) {
    return 'Sayfa alanları geçerli bir sayı olmalı.'
  }
  if (startPage < 0) {
    return 'Başlangıç sayfası negatif olamaz.'
  }
  if (endPage <= startPage) {
    return 'Bitiş sayfası, başlangıç sayfasından büyük olmalı.'
  }
  return null
}
