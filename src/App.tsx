import { useState } from 'react'
import { BottomNav, type Tab } from './components/BottomNav'
import { Home } from './components/screens/Home'
import { MonthlySummary } from './components/screens/MonthlySummary'
import { MyBooks } from './components/screens/MyBooks'
import { BookDetail } from './components/screens/BookDetail'
import { Settings } from './components/screens/Settings'
import { useDarkMode } from './hooks/useDarkMode'

function App() {
  useDarkMode()
  const [tab, setTab] = useState<Tab>('home')
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null)

  function handleTabChange(nextTab: Tab) {
    setSelectedBookId(null)
    setTab(nextTab)
  }

  let content
  if (selectedBookId !== null) {
    content = <BookDetail bookId={selectedBookId} onBack={() => setSelectedBookId(null)} />
  } else {
    switch (tab) {
      case 'home':
        content = <Home />
        break
      case 'monthly':
        content = <MonthlySummary />
        break
      case 'books':
        content = <MyBooks onOpenBook={setSelectedBookId} />
        break
      case 'settings':
        content = <Settings />
        break
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-slate-50 pb-20 dark:bg-slate-900">
      {content}
      <BottomNav active={tab} onChange={handleTabChange} />
    </div>
  )
}

export default App
