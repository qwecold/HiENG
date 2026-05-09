'use client'

import { useAuth } from '@/lib/auth-context'
import NavBar from './nav-bar'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  // Показываем навигацию только если пользователь авторизован (гость или GitHub)
  if (!user) {
    return <>{children}</>
  }

  return (
    <>
      <NavBar />
      {children}
    </>
  )
}
