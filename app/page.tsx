'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { AuthForm } from '@/components/auth-form'
import { Header } from '@/components/header'
import { AddWordForm } from '@/components/add-word-form'
import { WordList } from '@/components/word-list'
import { TestModal } from '@/components/test-modal'
import { StatsCard } from '@/components/stats-card'
import {
  getWords,
  getStats,
  needsTestToday,
  Word,
  UserStats,
} from '@/lib/storage'

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const [words, setWords] = useState<Word[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalWords: 0,
    wordsLearned: 0,
    streak: 0,
    lastTestDate: null,
    testResults: [],
  })
  const [needsTest, setNeedsTest] = useState(false)
  const [isTestOpen, setIsTestOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const refreshData = async () => {
    if (!user) return

    const [loadedWords, loadedStats, testNeeded] = await Promise.all([
      getWords(user.id, true),
      getStats(user.id),
      needsTestToday(user.id),
    ])

    setWords(loadedWords)
    setStats({
      ...loadedStats,
      totalWords: loadedWords.length,
      wordsLearned: loadedWords.filter((w) => w.level >= 3).length,
    })
    setNeedsTest(testNeeded)
  }

  useEffect(() => {
    if (user) {
      refreshData().then(() => setIsLoaded(true))
    }
  }, [user])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        <section className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold mb-2 text-balance">
            Добро пожаловать в HiENG
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-pretty">
            Добавляйте новые слова каждый день и проходите тесты для запоминания
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <StatsCard
            stats={stats}
            needsTest={needsTest}
            onStartTest={() => setIsTestOpen(true)}
          />
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
            Добавить слово
          </h2>
          <AddWordForm onWordAdded={refreshData} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-medium">Мои слова</h2>
            {words.length > 0 && (
              <button
                onClick={() => setIsTestOpen(true)}
                className="text-sm text-muted-foreground hover:text-foreground active:text-foreground/80 transition-colors touch-manipulation"
              >
                Начать тест
              </button>
            )}
          </div>
          <WordList words={words} onWordDeleted={refreshData} />
        </section>
      </main>

      <TestModal
        isOpen={isTestOpen}
        onClose={() => setIsTestOpen(false)}
        onComplete={refreshData}
      />
    </div>
  )
}
