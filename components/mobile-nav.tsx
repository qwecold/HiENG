'use client'

import { usePathname } from 'next/navigation'
import { BookOpen, GraduationCap } from 'lucide-react'

export default function MobileNav() {
  const pathname = usePathname()

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