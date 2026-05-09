'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Sparkles, KeyRound, ChevronDown, ChevronUp, Check, X, RotateCcw } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getWords } from '@/lib/storage'
import { getGuestWords } from '@/lib/guest-storage'
import { generateDailyTask, TutorTask } from '@/lib/tutor-data'
import { getGuestApiKeys } from '@/lib/guest-storage'

const TASK_STORAGE_KEY = 'tutor-last-task'
const API_KEY_STORAGE_KEY = 'tutor-api-key'

interface AIFeedback {
  correct: boolean
  comment: string
}

type AIProvider = 'openai' | 'gemini' | 'openrouter'

export default function TutorPage() {
  const { user, isGuest } = useAuth()
  const [words, setWords] = useState<Array<{ english: string; russian: string }>>([])
  const [currentTask, setCurrentTask] = useState<TutorTask | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null)
  const [checking, setChecking] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [provider, setProvider] = useState<AIProvider>('openai')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [showAiExplanation, setShowAiExplanation] = useState(false)

  useEffect(() => {
    const loadWords = async () => {
      if (isGuest) {
        const guestWords = getGuestWords()
        setWords(guestWords)
      } else if (user) {
        const supabaseWords = await getWords(user.id)
        setWords(supabaseWords)
      }
    }
    loadWords()

    const savedKey = localStorage.getItem('openai-api-key')
    if (savedKey) {
      setApiKey(savedKey)
      setProvider('openai')
    } else {
      const geminiKey = localStorage.getItem('gemini-api-key')
      if (geminiKey) {
        setApiKey(geminiKey)
        setProvider('gemini')
      } else {
        const openrouterKey = localStorage.getItem('openrouter-api-key')
        if (openrouterKey) {
          setApiKey(openrouterKey)
          setProvider('openrouter')
        }
      }
    }

    const savedTask = localStorage.getItem(TASK_STORAGE_KEY)
    if (savedTask) {
      try {
        const parsed = JSON.parse(savedTask)
        setCurrentTask(parsed.task)
      } catch { /* ignore */ }
    }
  }, [user, isGuest])

  const generateTask = () => {
    const grammarTopics = [
      'present-simple', 'past-simple', 'present-perfect',
      'conditionals', 'passive-voice', 'modal-verbs'
    ]
    const task = generateDailyTask(words, grammarTopics)
    setCurrentTask(task)
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify({ task, date: new Date().toDateString() }))
    setUserAnswer('')
    setShowResult(false)
    setIsCorrect(false)
    setAiFeedback(null)
  }

  const checkAnswer = () => {
    if (!currentTask) return
    const correct = userAnswer.toLowerCase().trim() === currentTask.answer.toLowerCase().trim()
    setIsCorrect(correct)
    setShowResult(true)
  }

  const checkWithAI = async () => {
    if (!currentTask || !userAnswer.trim() || !apiKey.trim()) return
    setChecking(true)
    setAiFeedback(null)

    const systemPrompt = `Ты — преподаватель английского языка. Пользователь выполнил задание. Проверь ответ:
1. Сравни ответ пользователя с правильным ответом
2. Если ответ близок по смыслу — засчитай как правильный
3. Дай краткий комментарий на русском

Ответь СТРОГО в формате JSON: {"correct": true/false, "comment": "текст"}`

    const userPrompt = `ЗАДАНИЕ: ${currentTask.instruction}\nВОПРОС: ${currentTask.content}\nОТВЕТ ПОЛЬЗОВАТЕЛЯ: ${userAnswer.trim()}\nПРАВИЛЬНЫЙ ОТВЕТ: ${currentTask.answer}`

    try {
      let content = ''

      if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error?.message || `HTTP ${res.status}`)
        }

        const data = await res.json()
        content = data.choices?.[0]?.message?.content || ''
      } else if (provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }
            ],
            generationConfig: { temperature: 0.3 },
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error?.message || `HTTP ${res.status}`)
        }

        const data = await res.json()
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      } else if (provider === 'openrouter') {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'HiENG',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error?.message || `HTTP ${res.status}`)
        }

        const data = await res.json()
        content = data.choices?.[0]?.message?.content || ''
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setAiFeedback({ correct: parsed.correct, comment: parsed.comment })
      } else {
        setAiFeedback({ correct: isCorrect, comment: 'Ответ проверен вручную' })
      }
    } catch (e: any) {
      setAiFeedback({ correct: isCorrect, comment: `Ошибка: ${e.message}` })
    } finally {
      setChecking(false)
    }
  }

  const resetTask = () => {
    localStorage.removeItem(TASK_STORAGE_KEY)
    setCurrentTask(null)
    setUserAnswer('')
    setShowResult(false)
    setIsCorrect(false)
    setAiFeedback(null)
  }

  return (
    <div className="min-h-screen bg-background pt-14 sm:pt-4">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Репетитор</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Ежедневные задания для закрепления знаний
          </p>
        </header>

        <div className="mb-6">
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {apiKey ? 'AI-проверка подключена' : 'Добавить OpenAI API-ключ'}
            {showKeyInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showKeyInput && (
            <div className="mt-2 flex flex-col sm:flex-row gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProvider('openai')}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${provider === 'openai' ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground'}`}
                >
                  OpenAI
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('gemini')}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${provider === 'gemini' ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground'}`}
                >
                  Gemini
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('openrouter')}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${provider === 'openrouter' ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground'}`}
                >
                  OpenRouter
                </button>
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  if (provider === 'openai') {
                    localStorage.setItem('openai-api-key', e.target.value)
                  } else if (provider === 'gemini') {
                    localStorage.setItem('gemini-api-key', e.target.value)
                  } else {
                    localStorage.setItem('openrouter-api-key', e.target.value)
                  }
                }}
                placeholder={provider === 'openai' ? 'sk-...' : provider === 'gemini' ? 'AIza...' : 'openrouter_...'}
                className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={() => setShowKeyInput(false)}
                className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
              >
                Сохранить
              </button>
            </div>
          )}
        </div>

        {!currentTask ? (
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-lg sm:text-xl font-semibold mb-2">
              Новое задание
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Нажмите кнопку, чтобы получить ежедневное задание по английскому языку
            </p>
            <button
              onClick={generateTask}
              className="px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 active:bg-foreground/80 transition-colors touch-manipulation"
            >
              Получить задание
            </button>
            {words.length === 0 && (
              <p className="text-xs text-muted-foreground mt-4">
                Добавьте слова в приложении, чтобы получать более персонализированные задания
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  currentTask.level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                  currentTask.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {currentTask.level === 'beginner' ? 'Начальный' : currentTask.level === 'intermediate' ? 'Средний' : 'Продвинутый'}
                </span>
                <button
                  onClick={resetTask}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Новое задание"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-base sm:text-lg font-semibold mb-2">{currentTask.title}</h2>
              <p className="text-sm text-muted-foreground mb-4">{currentTask.instruction}</p>

              <div className="bg-muted rounded-lg p-4 mb-4">
                <p className="text-sm sm:text-base font-medium">{currentTask.content}</p>
              </div>

              {!showResult ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Ваш ответ..."
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base"
                    onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                  />
                  <button
                    onClick={checkAnswer}
                    disabled={!userAnswer.trim()}
                    className="w-full px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 active:bg-foreground/80 transition-colors disabled:opacity-50 touch-manipulation"
                  >
                    Проверить
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                      <span className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? 'Правильно!' : 'Неправильно'}
                      </span>
                    </div>
                    {!isCorrect && (
                      <p className="text-sm text-muted-foreground">
                        Правильный ответ: <span className="text-foreground font-medium">{currentTask.answer}</span>
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">{currentTask.explanation}</p>

                  {apiKey && (
                    <>
                      <button
                        onClick={checkWithAI}
                        disabled={checking}
                        className="w-full px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        {checking ? 'Проверяем...' : `Проверить через ${provider === 'openai' ? 'OpenAI' : provider === 'gemini' ? 'Gemini' : 'OpenRouter'}`}
                      </button>

                      {aiFeedback && (
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-sm font-medium mb-1">Комментарий ИИ:</p>
                          <p className="text-sm text-muted-foreground">{aiFeedback.comment}</p>
                        </div>
                      )}
                    </>
                  )}

                  <button
                    onClick={generateTask}
                    className="w-full px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 active:bg-foreground/80 transition-colors touch-manipulation"
                  >
                    Следующее задание
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
