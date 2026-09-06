import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { BookWithComputed } from '../../types'
import { useBooks } from '../../hooks/useBooks'
import { useSessionsForMonth } from '../../hooks/useSessions'
import { currentMonthKey, daysInMonthKey, monthKeyLabel, shiftMonthKey, shortDateLabel } from '../../utils/date'
import { Card } from '../ui/Card'

export function MonthlySummary() {
  const [monthKey, setMonthKey] = useState(currentMonthKey())
  const books = useBooks()
  const sessions = useSessionsForMonth(monthKey)

  const totalPages = sessions.reduce((sum, s) => sum + s.pagesRead, 0)

  const perBook = useMemo(() => {
    const map = new Map<number, number>()
    let freePages = 0
    for (const session of sessions) {
      if (session.bookId === undefined) {
        freePages += session.pagesRead
      } else {
        map.set(session.bookId, (map.get(session.bookId) ?? 0) + session.pagesRead)
      }
    }
    const rows: { book: BookWithComputed | null; pages: number }[] = books
      .map((book) => ({ book, pages: map.get(book.id) ?? 0 }))
      .filter((row) => row.pages > 0)
    if (freePages > 0) {
      rows.push({ book: null, pages: freePages })
    }
    return rows.sort((a, b) => b.pages - a.pages)
  }, [books, sessions])

  const dailyTotals = useMemo(() => {
    const map = new Map<string, number>()
    for (const session of sessions) {
      map.set(session.date, (map.get(session.date) ?? 0) + session.pagesRead)
    }
    return daysInMonthKey(monthKey)
      .map((date) => ({ date, pages: map.get(date) ?? 0 }))
      .filter((day) => day.pages > 0)
  }, [sessions, monthKey])

  const chartData = useMemo(
    () => daysInMonthKey(monthKey).map((date) => ({ date, label: shortDateLabel(date), pages: dailyTotals.find((d) => d.date === date)?.pages ?? 0 })),
    [monthKey, dailyTotals],
  )

  return (
    <div className="space-y-4 px-6 py-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthKey((m) => shiftMonthKey(m, -1))}
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:border-zinc-600 dark:text-zinc-300"
          aria-label="Önceki ay"
        >
          ←
        </button>
        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">{monthKeyLabel(monthKey)}</h1>
        <button
          type="button"
          onClick={() => setMonthKey((m) => shiftMonthKey(m, 1))}
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:border-zinc-600 dark:text-zinc-300"
          aria-label="Sonraki ay"
        >
          →
        </button>
      </div>

      <Card className="text-center">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
          Bu ay toplam sayfa
        </p>
        <p className="font-display text-5xl font-semibold text-amber-600 dark:text-amber-400">{totalPages}</p>
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-zinc-800 dark:text-zinc-100">Günlük dağılım</h2>
        {totalPages === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Bu ay için kayıt yok.</p>
        ) : (
          <div className="-ml-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={Math.ceil(chartData.length / 8)} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={28} />
                <Tooltip formatter={(value) => [`${value} sayfa`, 'Okunan']} labelFormatter={(label) => label} />
                <Bar dataKey="pages" fill="#18181b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-zinc-800 dark:text-zinc-100">Kitap bazlı kırılım</h2>
        {perBook.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Bu ay için kayıt yok.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-400">
                <th className="pb-2 font-medium">Kitap</th>
                <th className="pb-2 text-right font-medium">Sayfa</th>
                <th className="pb-2 text-right font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {perBook.map(({ book, pages }) => (
                <tr key={book?.id ?? 'free'} className="border-t border-zinc-100 dark:border-zinc-700">
                  <td className="flex items-center gap-2 py-2 text-zinc-700 dark:text-zinc-200">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: book?.color ?? '#64748b' }}
                    />
                    {book?.name ?? 'Serbest okuma'}
                  </td>
                  <td className="py-2 text-right text-zinc-700 dark:text-zinc-200">{pages}</td>
                  <td className="py-2 text-right text-zinc-500 dark:text-zinc-400">
                    {book && book.effectivePages > 0 ? `%${((pages / book.effectivePages) * 100).toFixed(1)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-zinc-800 dark:text-zinc-100">Gün gün liste</h2>
        {dailyTotals.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Bu ay için kayıt yok.</p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-700">
            {dailyTotals.map((day) => (
              <li key={day.date} className="flex items-center justify-between py-2 text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">{shortDateLabel(day.date)}</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-100">{day.pages} sayfa</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
