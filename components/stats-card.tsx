'use client'

import { TrendingUp, BookCheck, Target, Flame } from 'lucide-react'
import { UserStats } from '@/lib/storage'

interface StatsCardProps {
  stats: UserStats
  needsTest: boolean
  onStartTest: () => void
}

export function StatsCard({ stats, needsTest, onStartTest }: StatsCardProps) {
  const lastResult = stats.testResults[stats.testResults.length - 1]
  const accuracy = lastResult 
    ? Math.round((lastResult.correctAnswers / lastResult.totalWords) * 100) 
    : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1 sm:mb-2">
          <BookCheck className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs truncate">Всего слов</span>
        </div>
        <p className="text-xl sm:text-2xl font-semibold">{stats.totalWords}</p>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1 sm:mb-2">
          <Target className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs truncate">Выучено</span>
        </div>
        <p className="text-xl sm:text-2xl font-semibold">{stats.wordsLearned}</p>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1 sm:mb-2">
          <Flame className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs truncate">Серия</span>
        </div>
        <p className="text-xl sm:text-2xl font-semibold">{stats.streak} <span className="text-sm font-normal text-muted-foreground">дней</span></p>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1 sm:mb-2">
          <TrendingUp className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs truncate">Точность</span>
        </div>
        <p className="text-xl sm:text-2xl font-semibold">{accuracy}%</p>
      </div>
      
      {needsTest && stats.totalWords > 0 && (
        <div className="col-span-2 lg:col-span-4">
          <button
            onClick={onStartTest}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-foreground text-background font-medium rounded-xl hover:bg-foreground/90 active:bg-foreground/80 transition-colors text-base sm:text-lg touch-manipulation"
          >
            Пройти ежедневный тест
          </button>
        </div>
      )}
    </div>
  )
}
