'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { clearGuestData } from './guest-storage'

export interface GuestUser {
  id: 'guest'
  email: 'guest@hieng.local'
  user_metadata: { name: 'Гость' }
}

interface AuthContextType {
  user: User | GuestUser | null
  session: Session | null
  loading: boolean
  isGuest: boolean
  signInWithGithub: () => Promise<{ error: Error | null }>
  loginAsGuest: () => void
  signOut: () => Promise<void>
}

const GUEST_KEY = 'hieng-guest-session'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getGuestUser(): GuestUser | null {
  try {
    const raw = localStorage.getItem(GUEST_KEY)
    if (!raw) return null
    return JSON.parse(raw) as GuestUser
  } catch {
    return null
  }
}

function saveGuestUser(): GuestUser {
  const guest: GuestUser = {
    id: 'guest',
    email: 'guest@hieng.local',
    user_metadata: { name: 'Гость' },
  }
  localStorage.setItem(GUEST_KEY, JSON.stringify(guest))
  return guest
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | GuestUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    const guest = getGuestUser()
    if (guest) {
      setUser(guest)
      setIsGuest(true)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsGuest(false)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsGuest(false)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGithub = async () => {
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}${basePath}/auth/callback`,
          skipBrowserRedirect: true,
        },
      })

      if (error) {
        return { error: error as Error }
      }

      if (data?.url) {
        window.location.href = data.url
      }

      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const loginAsGuest = () => {
    const guest = saveGuestUser()
    setUser(guest)
    setIsGuest(true)
    setSession(null)
  }

  const signOut = async () => {
    if (isGuest) {
      localStorage.removeItem(GUEST_KEY)
      clearGuestData()
      setUser(null)
      setIsGuest(false)
    } else {
      await supabase.auth.signOut()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isGuest,
        signInWithGithub,
        loginAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
