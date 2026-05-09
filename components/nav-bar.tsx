'use client'

import { usePathname } from 'next/navigation'
import { useIsMobile } from '@/hooks/use-mobile'
import { BookOpen, GraduationCap, Menu, Flame } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getStats } from '@/lib/storage'

export default function NavBar() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [streak, setStreak] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      getStats(user.id).then((stats) => setStreak(stats.streak))
    }
  }, [user])

  if (isMobile) {
    return (
      <>
        <nav className="fixed top-0 left-0 right-0 flex items-center justify-between bg-background/80 backdrop-blur-sm border-b border-border p-2 z-50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">HiENG</span>
          </div>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-orange-500">
                <Flame className="w-4 h-4" />
                <span>{streak}</span>
              </div>
            )}
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <nav className="fixed top-14 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border p-4 z-40">
            <div className="flex flex-col gap-2">
              <a
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors 
                  ${pathname === '/' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-muted/50'}`}
              >
                <BookOpen className="w-5 h-5" />
                <span>Слова</span>
              </a>
              
              <a
                href="/grammar"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors 
                  ${pathname === '/grammar' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-muted/50'}`}
              >
                <GraduationCap className="w-5 h-5" />
                <span>Грамматика</span>
              </a>
            </div>
          </nav>
        )}
      </>
    )
  }

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-background border-b border-border sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="font-bold text-xl">HiENG</span>
      </div>
      
      <div className="flex items-center gap-4">
        <a
          href="/"
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors 
            ${pathname === '/' 
              ? 'bg-primary/10 text-primary' 
              : 'text-muted-foreground hover:bg-muted/50'}`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Слова</span>
        </a>
        
        <a
          href="/grammar"
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors 
            ${pathname === '/grammar' 
              ? 'bg-primary/10 text-primary' 
              : 'text-muted-foreground hover:bg-muted/50'}`}
        >
          <GraduationCap className="w-5 h-5" />
          <span>Грамматика</span>
        </a>
        
        {streak > 0 && (
          <div className="flex items-center gap-1 text-sm font-medium text-orange-500">
            <Flame className="w-4 h-4" />
            <span>{streak}</span>
          </div>
        )}
        
        <ThemeToggle />
      </div>
    </nav>
  )
}