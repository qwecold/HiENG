'use client'

import { usePathname } from 'next/navigation'
import { BookOpen, GraduationCap } from 'lucide-react'

export default function DesktopNav() {
  const pathname = usePathname()

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