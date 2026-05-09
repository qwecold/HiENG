'use client'

import { usePathname } from 'next/navigation'
import { useIsMobile } from '@/hooks/use-mobile'
import { BookOpen, GraduationCap } from 'lucide-react'

export default function NavBar() {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around bg-background/80 backdrop-blur-sm border-t border-border p-2 z-50">
        <a
          href="/"
          className={`flex flex-col items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors 
            ${pathname === '/' 
              ? 'bg-primary/20 text-primary' 
              : 'text-muted-foreground hover:bg-muted/20'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Слова</span>
        </a>
        
        <a
          href="/grammar"
          className={`flex flex-col items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors 
            ${pathname === '/grammar' 
              ? 'bg-primary/20 text-primary' 
              : 'text-muted-foreground hover:bg-muted/20'}`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Грамматика</span>
        </a>
      </nav>
    )
  }

  return (
    <nav className="flex space-x-4 px-4 py-2 bg-muted/50 border-t border-border">
      <a
        href="/"
        className={`flex flex-col items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors 
          ${pathname === '/' 
            ? 'bg-primary/10 text-primary' 
            : 'text-muted-foreground hover:bg-muted/50'}`}
      >
        <BookOpen className="w-5 h-5" />
        <span>Слова</span>
      </a>
      
      <a
        href="/grammar"
        className={`flex flex-col items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors 
          ${pathname === '/grammar' 
            ? 'bg-primary/10 text-primary' 
            : 'text-muted-foreground hover:bg-muted/50'}`}
      >
        <GraduationCap className="w-5 h-5" />
        <span>Грамматика</span>
      </a>
    </nav>
  )
}