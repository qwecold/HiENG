'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { GRAMMAR_TOPICS } from '@/lib/grammar-topics'
import { getWords } from '@/lib/storage'

export default function GrammarPage() {
  const { user } = useAuth()
  const [topics, setTopics] = useState<typeof GRAMMAR_TOPICS>([])

  useEffect(() => {
    // Initialize topics with user progress (in a real app, this would come from Supabase)
    // For now, we'll simulate some progress
    const updatedTopics = GRAMMAR_TOPICS.map(topic => ({
      ...topic,
      completed: Math.random() > 0.7, // Simulate some completed topics
    }))
    
    // Update locked status based on prerequisites
    const finalTopics = updatedTopics.map(topic => {
      if (!topic.prerequisiteIds) return topic
      
      const prerequisitesMet = topic.prerequisiteIds.every(prereqId => {
        const prereqTopic = updatedTopics.find(t => t.id === prereqId)
        return prereqTopic?.completed ?? false
      })
      
      return {
        ...topic,
        locked: !prerequisitesMet && !topic.completed
      }
    })
    
    setTopics(finalTopics)
  }, [])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Дорожная карта грамматики</h1>
          <p className="text-muted-foreground">
            Изучайте основы английской грамматики пошагово, как в Duolingo
          </p>
        </header>

        <div className="space-y-6">
          {topics.map(topic => (
            <div key={topic.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {topic.completed ? (
                    <div className="w-8 h-8 flex items-center justify-center bg-green-500/20 rounded-full">
                      <span className="text-green-500 font-bold">✓</span>
                    </div>
                  ) : topic.locked ? (
                    <div className="w-8 h-8 flex items-center justify-center bg-muted/50 rounded-full">
                      <span className="text-muted-foreground">🔒</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full">
                      <span className="text-primary font-bold">{topics.indexOf(topic) + 1}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${topic.completed ? 'text-green-500' : topic.locked ? 'text-muted-foreground' : 'text-primary'}`}>
                      {topic.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${topic.level === 'beginner' ? 'bg-blue-500/20 text-blue-500' : topic.level === 'intermediate' ? 'bg-purple-500/20 text-purple-500' : 'bg-red-500/20 text-red-500'}`}>
                      {topic.level === 'beginner' ? 'Начальный' : topic.level === 'intermediate' ? 'Средний' : 'Продвинутый'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {topic.description}
                  </p>
                  
                  {topic.prerequisiteIds && topic.prerequisiteIds.length > 0 && (
                    <div className="text-xs text-muted-foreground mb-2">
                      Предварительные требования: 
                      {topic.prerequisiteIds!.map(id => {
                        const prereqTopic = topics.find(t => t.id === id)
                        return `${prereqTopic?.title}${topics.indexOf(topic) !== topic.prerequisiteIds!.length - 1 ? ', ' : ''}`
                      })}
                    </div>
                  )}
                  
                  {!topic.completed && !topic.locked ? (
                    <button
                      onClick={() => {
                        // In a real app, this would navigate to a lesson or mark as completed
                        alert(`Начинаем изучение: ${topic.title}\nЭто功能将在以后的版本中实现。`)
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary/foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Начать урок
                      <span className="text-xs">→</span>
                    </button>
                  ) : topic.locked ? (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-muted/50 text-muted-foreground font-medium rounded-lg hover:bg-muted/60 transition-colors"
                    >
                      Завершите предварительные требования
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 text-green-500 font-medium rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Урок завершен
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-4">Ваш прогресс</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Завершено тем</span>
              <span className="text-sm font-mono">{topics.filter(t => t.completed).length}/{topics.length}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(topics.filter(t => t.completed).length / topics.length) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round((topics.filter(t => t.completed).length / topics.length) * 100)}% завершено
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}