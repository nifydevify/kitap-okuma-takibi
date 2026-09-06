import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { withSessionComputed } from '../db/computed'
import { compareSessionsChronological } from '../utils/sessionOrder'
import type { SessionWithComputed } from '../types'

function sortChronologicalDesc(sessions: SessionWithComputed[]): SessionWithComputed[] {
  return [...sessions].sort((a, b) => -compareSessionsChronological(a, b))
}

export function useSessionsForDate(date: string): SessionWithComputed[] {
  const sessions = useLiveQuery(
    () => db.sessions.where('date').equals(date).toArray(),
    [date],
    [],
  )
  return sortChronologicalDesc(sessions.map(withSessionComputed))
}

export function useSessionsForMonth(monthKey: string): SessionWithComputed[] {
  const sessions = useLiveQuery(
    () => db.sessions.where('date').startsWith(monthKey).toArray(),
    [monthKey],
    [],
  )
  return [...sessions.map(withSessionComputed)].sort(compareSessionsChronological)
}

export function useSessionsForBook(bookId: number): SessionWithComputed[] {
  const sessions = useLiveQuery(
    () => db.sessions.where('bookId').equals(bookId).toArray(),
    [bookId],
    [],
  )
  return sortChronologicalDesc(sessions.map(withSessionComputed))
}
