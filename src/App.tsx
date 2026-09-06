import { useState } from 'react'
import { BottomNav, type Tab } from './components/BottomNav'
import { Home } from './components/screens/Home'
import { MonthlySummary } from './components/screens/MonthlySummary'
import { MyBooks } from './components/screens/MyBooks'
import { BookDetail } from './components/screens/BookDetail'
import { Settings } from './components/screens/Settings'
import { useDarkMode } from './hooks/useDarkMode'
import { useCloudSync } from './hooks/useCloudSync'

function App() {
  useDarkMode()
  const cloudSync = useCloudSync()
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
        content = <Settings cloudSync={cloudSync} />
        break
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-zinc-50 pb-20 dark:bg-zinc-950">
      {content}
      <BottomNav active={tab} onChange={handleTabChange} />
    </div>
  )
}

export default App
