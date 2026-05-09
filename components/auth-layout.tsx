'use client'

import { useAuth } from '@/lib/auth-context'
import NavBar from './nav-bar'
import { usePathname } from 'next/navigation'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth()
  const pathname = usePathname()
  const isAuthPage = pathname === '/'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
      <NavBar />
      {children}
    </>
  )
}
