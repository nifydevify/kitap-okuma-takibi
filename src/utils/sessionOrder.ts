import type { ReadingSession } from '../types'

/** Tarih, ardından saat, ardından oluşturulma zamanına göre kronolojik (artan) sıralama. */
export function compareSessionsChronological(a: ReadingSession, b: ReadingSession): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1
  const aTime = a.startTime ?? ''
  const bTime = b.startTime ?? ''
  if (aTime !== bTime) return aTime < bTime ? -1 : 1
  return a.createdAt - b.createdAt
}
