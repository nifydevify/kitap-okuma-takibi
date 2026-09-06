import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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
    for (const session of sessions) {
      map.set(session.bookId, (map.get(session.bookId) ?? 0) + session.pagesRead)
    }
    return books
      .map((book) => ({ book, pages: map.get(book.id) ?? 0 }))
      .filter((row) => row.pages > 0)
      .sort((a, b) => b.pages - a.pages)
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
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthKey((m) => shiftMonthKey(m, -1))}
          className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300"
          aria-label="Önceki ay"
        >
          ←
        </button>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{monthKeyLabel(monthKey)}</h1>
        <button
          type="button"
          onClick={() => setMonthKey((m) => shiftMonthKey(m, 1))}
          className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300"
          aria-label="Sonraki ay"
        >
          →
        </button>
      </div>

      <Card className="text-center">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bu ay toplam sayfa</p>
        <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{totalPages}</p>
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">Günlük dağılım</h2>
        {totalPages === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Bu ay için kayıt yok.</p>
        ) : (
          <div className="-ml-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={Math.ceil(chartData.length / 8)} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={28} />
                <Tooltip formatter={(value) => [`${value} sayfa`, 'Okunan']} labelFormatter={(label) => label} />
                <Bar dataKey="pages" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">Kitap bazlı kırılım</h2>
        {perBook.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Bu ay için kayıt yok.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 font-medium">Kitap</th>
                <th className="pb-2 text-right font-medium">Sayfa</th>
                <th className="pb-2 text-right font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {perBook.map(({ book, pages }) => (
                <tr key={book.id} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="flex items-center gap-2 py-2 text-slate-700 dark:text-slate-200">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: book.color }} />
                    {book.name}
                  </td>
                  <td className="py-2 text-right text-slate-700 dark:text-slate-200">{pages}</td>
                  <td className="py-2 text-right text-slate-500 dark:text-slate-400">
                    {book.effectivePages > 0 ? `%${((pages / book.effectivePages) * 100).toFixed(1)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">Gün gün liste</h2>
        {dailyTotals.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Bu ay için kayıt yok.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {dailyTotals.map((day) => (
              <li key={day.date} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-600 dark:text-slate-300">{shortDateLabel(day.date)}</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">{day.pages} sayfa</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
