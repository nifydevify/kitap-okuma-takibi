export interface Book {
  id: number
  name: string
  totalPages: number
  frontMatterPages: number
  color: string
  currentPage: number
}

export interface BookWithComputed extends Book {
  effectivePages: number
  startingPage: number
  progressPages: number
  progressPercent: number
  remainingPages: number
}

export interface ReadingSession {
  id: number
  /** undefined ise: belirli bir kitaba bağlı olmayan serbest okuma kaydı. */
  bookId?: number
  date: string // YYYY-MM-DD
  startTime?: string // HH:mm
  endTime?: string // HH:mm
  /** Sadece bookId doluyken kullanılır (kitabın gerçek sayfa numaraları). */
  startPage?: number
  endPage?: number
  /** Sadece bookId boşken (serbest kayıt) kullanılır: doğrudan girilen sayfa sayısı. */
  pageCount?: number
  note?: string
  createdAt: number
}

export interface SessionWithComputed extends ReadingSession {
  pagesRead: number
}

export interface AppSettings {
  id: 'settings'
  darkMode: boolean
  /** Bu cihazın bulut senkronizasyonu için "cihaz mı bulut mu" seçimini hangi Google hesabı (uid) için yaptığı. */
  cloudSyncAccount?: string
}

export interface BackupData {
  version: 1
  exportedAt: string
  books: Book[]
  sessions: ReadingSession[]
}
