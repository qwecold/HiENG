'use client'

import { Flame, LogOut } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { PixelLogo } from './pixel-logo'
import { useAuth } from '@/lib/auth-context'

interface HeaderProps {
  streak: number
  totalWords: number
}

export function Header({ streak, totalWords }: HeaderProps) {
  const { signOut } = useAuth()

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 safe-area-inset">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-shrink-0">
            <PixelLogo size={36} />
          </div>
          <span className="font-semibold text-base sm:text-lg tracking-tight">
            HiENG
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden xs:flex items-center gap-2 text-sm text-muted-foreground">
            <span>{totalWords} слов</span>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{streak}</span>
              <span className="hidden sm:inline">дней</span>
            </div>
          )}
          <ThemeToggle />
          <button
            onClick={signOut}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Выйти"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
