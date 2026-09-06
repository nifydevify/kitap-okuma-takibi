import Dexie, { type EntityTable } from 'dexie'
import type { AppSettings, Book, ReadingSession } from '../types'

const SEED_BOOK_NAMES = [
  "Sözler",
  'Mektubat',
  "Lem'alar",
  'Şualar',
  'Mesnevi-i Nuriye',
  "İşârâtü'l-İ'câz",
  'Barla Lâhikası',
  'Kastamonu Lâhikası',
  'Emirdağ Lâhikası',
  'Tarihçe-i Hayat',
  'Sikke-i Tasdik-i Gaybî',
  'Asâ-yı Mûsâ',
  'Hutbe-i Şamiye',
  'Muhakemat',
]

const SEED_COLORS = [
  '#4f46e5',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#db2777',
  '#65a30d',
  '#0284c7',
  '#ea580c',
  '#9333ea',
  '#16a34a',
  '#e11d48',
  '#2563eb',
]

export class AppDatabase extends Dexie {
  books!: EntityTable<Book, 'id'>
  sessions!: EntityTable<ReadingSession, 'id'>
  settings!: EntityTable<AppSettings, 'id'>

  constructor() {
    super('kitap-okuma-takibi')

    this.version(1).stores({
      books: '++id, name',
      sessions: '++id, bookId, date, createdAt',
      settings: 'id',
    })

    this.on('populate', () => this.seed())
  }

  private async seed() {
    await this.books.bulkAdd(
      SEED_BOOK_NAMES.map((name, index) => ({
        name,
        totalPages: 0,
        frontMatterPages: 0,
        color: SEED_COLORS[index % SEED_COLORS.length],
        currentPage: 1,
      })),
    )
    await this.settings.put({ id: 'settings', darkMode: false })
  }
}

export const db = new AppDatabase()
