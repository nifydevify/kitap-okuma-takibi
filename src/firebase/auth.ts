import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth, isFirebaseConfigured } from './config'

export function useAuthUser(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    // auth varlığı isFirebaseConfigured ile birebir örtüşür; false ise loading zaten
    // useState başlangıç değeriyle false'tur, burada ekstra setState gerekmez.
    if (!auth) return
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  return { user, loading }
}

export async function signInWithGoogle(): Promise<void> {
  if (!auth) throw new Error('Firebase yapılandırılmadı.')
  await signInWithPopup(auth, new GoogleAuthProvider())
}

export async function signOutUser(): Promise<void> {
  if (!auth) return
  await signOut(auth)
}
