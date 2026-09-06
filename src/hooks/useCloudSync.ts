import { useEffect, useRef, useState } from 'react'
import type { User } from 'firebase/auth'
import { isFirebaseConfigured } from '../firebase/config'
import { useAuthUser, signInWithGoogle, signOutUser } from '../firebase/auth'
import { applyCloudToLocal, fetchCloudData, pushLocalToCloud, startCloudSync } from '../firebase/sync'
import { getCloudSyncAccount, setCloudSyncAccount } from '../db/settings'

export type CloudSyncStatus =
  | { kind: 'disabled' }
  | { kind: 'signed-out' }
  | { kind: 'choosing'; cloudHasData: boolean }
  | { kind: 'syncing' }

export interface CloudSync {
  user: User | null
  status: CloudSyncStatus
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  chooseDevice: () => Promise<void>
  chooseCloud: () => Promise<void>
}

const emptyBackup = { version: 1 as const, exportedAt: new Date(0).toISOString(), books: [], sessions: [] }

export function useCloudSync(): CloudSync {
  const { user, loading } = useAuthUser()
  const [status, setStatus] = useState<CloudSyncStatus>(isFirebaseConfigured ? { kind: 'signed-out' } : { kind: 'disabled' })
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => () => cleanupRef.current?.(), [])

  useEffect(() => {
    if (!isFirebaseConfigured || loading) return
    let cancelled = false

    async function run() {
      cleanupRef.current?.()
      cleanupRef.current = null

      if (!user) {
        setStatus({ kind: 'signed-out' })
        return
      }

      const boundAccount = await getCloudSyncAccount()
      if (cancelled) return

      if (boundAccount === user.uid) {
        cleanupRef.current = startCloudSync(user.uid)
        setStatus({ kind: 'syncing' })
        return
      }

      const cloudData = await fetchCloudData(user.uid)
      if (cancelled) return
      const cloudHasData = Boolean(cloudData && (cloudData.books.length > 0 || cloudData.sessions.length > 0))
      setStatus({ kind: 'choosing', cloudHasData })
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [user, loading])

  async function chooseDevice() {
    if (!user) return
    await pushLocalToCloud(user.uid)
    await setCloudSyncAccount(user.uid)
    cleanupRef.current = startCloudSync(user.uid)
    setStatus({ kind: 'syncing' })
  }

  async function chooseCloud() {
    if (!user) return
    const cloudData = await fetchCloudData(user.uid)
    await applyCloudToLocal(cloudData ?? emptyBackup)
    await setCloudSyncAccount(user.uid)
    cleanupRef.current = startCloudSync(user.uid)
    setStatus({ kind: 'syncing' })
  }

  async function handleSignOut() {
    cleanupRef.current?.()
    cleanupRef.current = null
    await signOutUser()
  }

  return { user, status, signIn: signInWithGoogle, signOut: handleSignOut, chooseDevice, chooseCloud }
}
