import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'
import { db } from '../db/db'
import { setDarkMode } from '../db/settings'

export function useDarkMode(): [boolean, (value: boolean) => void] {
  const darkMode = useLiveQuery(async () => (await db.settings.get('settings'))?.darkMode ?? false, [], false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return [darkMode, (value: boolean) => void setDarkMode(value)]
}
