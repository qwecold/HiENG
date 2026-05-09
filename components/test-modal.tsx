'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Check, ArrowRight, Volume2, Mic, MicOff } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
  Word,
  getWordsForTest,
  recordAnswer,
  recordTestResult,
} from '@/lib/storage'
import { speak, isSpeechSynthesisSupported, isSpeechRecognitionSupported, startListening } from '@/lib/speech-utils'

interface TestModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

type TestMode = 'en-to-ru' | 'ru-to-en'

export function TestModal({ isOpen, onClose, onComplete }: TestModalProps) {
  const { user } = useAuth()
  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [mode, setMode] = useState<TestMode>('en-to-ru')
  const [isFinished, setIsFinished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const stopListeningRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true)
      getWordsForTest(user.id, 10).then((testWords) => {
        setWords(testWords)
        setCurrentIndex(0)
        setUserAnswer('')
        setShowResult(false)
        setCorrectCount(0)
        setIsFinished(false)
        setMode(Math.random() > 0.5 ? 'en-to-ru' : 'ru-to-en')
        setLoading(false)
      })
    }
  }, [isOpen, user])

  if (!isOpen) return null

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  const currentWord = words[currentIndex]
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0

  const checkAnswer = async () => {
    if (!currentWord || !user) return

    const correctAnswer =
      mode === 'en-to-ru' ? currentWord.russian : currentWord.english
    const correct =
      userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase()

    setIsCorrect(correct)
    setShowResult(true)

    await recordAnswer(user.id, currentWord.id, correct)
  }

  const handleVoiceInput = () => {
    if (isListening) {
      stopListeningRef.current?.()
      stopListeningRef.current = null
      setIsListening(false)
      return
    }

    const lang = mode === 'en-to-ru' ? 'ru-RU' : 'en-US'
    const stopListening = startListening((transcript) => {
      setUserAnswer(transcript)
      setIsListening(false)
    }, lang)

    if (stopListening) {
      stopListeningRef.current = stopListening
      setIsListening(true)
    }
  }

  useEffect(() => {
    return () => {
      stopListeningRef.current?.()
    }
  }, [])

  const nextWord = async () => {
    if (!user) return

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1)
    }

    if (currentIndex + 1 >= words.length) {
      await recordTestResult(user.id, words.length, correctCount + (isCorrect ? 1 : 0))
      setIsFinished(true)
    } else {
      setCurrentIndex((prev) => prev + 1)
      setUserAnswer('')
      setShowResult(false)
      setIsCorrect(false)
      setMode(Math.random() > 0.5 ? 'en-to-ru' : 'ru-to-en')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    if (showResult) {
      setLoading(true)
      await nextWord()
      setLoading(false)
    } else {
      setLoading(true)
      await checkAnswer()
      setLoading(false)
    }
  }

  const handleFinish = () => {
    onComplete()
    onClose()
  }

  if (words.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 max-w-md w-full text-center">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            Нет слов для теста
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            Добавьте хотя бы одно слово, чтобы начать тестирование
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 active:bg-foreground/80 transition-colors touch-manipulation"
          >
            Понятно
          </button>
        </div>
      </div>
    )
  }

  if (isFinished) {
    const percentage = Math.round((correctCount / words.length) * 100)

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Check className="w-7 h-7 sm:w-8 sm:h-8 text-green-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">
            Тест завершён!
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            Правильных ответов: {correctCount} из {words.length} ({percentage}%)
          </p>
          <div className="w-full bg-muted rounded-full h-2 mb-4 sm:mb-6">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <button
            onClick={handleFinish}
            className="px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 active:bg-foreground/80 transition-colors w-full touch-manipulation"
          >
            Готово
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Слово {currentIndex + 1} из {words.length}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full bg-muted rounded-full h-1 mb-6 sm:mb-8">
          <div
            className="bg-foreground h-1 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
            {mode === 'en-to-ru' ? 'Переведите на русский' : 'Translate to English'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-2xl sm:text-3xl font-semibold break-words">
              {mode === 'en-to-ru' ? currentWord.english : currentWord.russian}
            </p>
            {mode === 'en-to-ru' && isSpeechSynthesisSupported() && (
              <button
                type="button"
                onClick={() => speak(currentWord.english)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                aria-label="Прослушать произношение"
              >
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={
                mode === 'en-to-ru'
                  ? 'Введите перевод...'
                  : 'Enter translation...'
              }
              disabled={showResult}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground text-center text-base sm:text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all disabled:opacity-50 pr-12"
            />
            {isSpeechRecognitionSupported() && (
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={showResult}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-colors touch-manipulation ${
                  isListening 
                    ? 'text-destructive animate-pulse' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label={isListening ? 'Остановить запись' : 'Начать запись'}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}
          </div>

          {showResult && (
            <div
              className={`mt-4 p-3 sm:p-4 rounded-lg ${isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}
            >
              {isCorrect ? (
                <p className="text-green-400 text-center font-medium">
                  Правильно!
                </p>
              ) : (
                <div className="text-center">
                  <p className="text-red-400 font-medium">Неправильно</p>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                    Правильный ответ:{' '}
                    <span className="text-foreground font-medium break-words">
                      {mode === 'en-to-ru'
                        ? currentWord.russian
                        : currentWord.english}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="mt-4 sm:mt-6 w-full px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 active:bg-foreground/80 transition-colors flex items-center justify-center gap-2 touch-manipulation"
          >
            {showResult ? (
              <>
                Далее
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              'Проверить'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
