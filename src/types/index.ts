export interface Book {
  id: number
  name: string
  totalPages: number
  frontMatterPages: number
  color: string
  currentPage: number
  /** true ise: belirli bir kitaba bağlı olmayan, sadece kümülatif sayfa sayacı tutulan özel kitap. */
  isFreeform?: boolean
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
  bookId: number
  date: string // YYYY-MM-DD
  startTime?: string // HH:mm
  endTime?: string // HH:mm
  startPage: number
  endPage: number
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
