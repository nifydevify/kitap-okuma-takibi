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
    <div className="space-y-4 p-4">
      <Card className="text-center">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bugün okunan sayfa</p>
        <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">{totalPagesToday}</p>
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">Yeni kayıt</h2>
        <SessionForm books={books} />
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">Bugünün oturumları</h2>
        <TodaySessionList sessions={sessions} books={books} />
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">Şu an okunan kitaplar</h2>
        <CurrentlyReading books={books} />
      </Card>
    </div>
  )
}
