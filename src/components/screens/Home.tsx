import { useBooks } from '../../hooks/useBooks'
import { useSessionsForDate } from '../../hooks/useSessions'
import { todayDateStr } from '../../utils/date'
import { Card } from '../ui/Card'
import { SessionForm } from '../home/SessionForm'
import { TodaySessionList } from '../home/TodaySessionList'
import { CurrentlyReading } from '../home/CurrentlyReading'

export function Home() {
  const books = useBooks()
  const today = todayDateStr()
  const sessions = useSessionsForDate(today)
  const totalPagesToday = sessions.reduce((sum, s) => sum + s.pagesRead, 0)

  return (
    <div className="space-y-4 px-6 py-4">
      <Card className="text-center">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
          Bugün okunan sayfa
        </p>
        <p className="font-display text-6xl font-semibold text-amber-600 dark:text-amber-400">{totalPagesToday}</p>
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-zinc-800 dark:text-zinc-100">Yeni kayıt</h2>
        <SessionForm books={books} />
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-zinc-800 dark:text-zinc-100">Bugünün oturumları</h2>
        <TodaySessionList sessions={sessions} books={books} />
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-zinc-800 dark:text-zinc-100">Şu an okunan kitaplar</h2>
        <CurrentlyReading books={books} />
      </Card>
    </div>
  )
}
