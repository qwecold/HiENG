'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { addWord, getWords } from '@/lib/storage'

interface AddWordFormProps {
  onWordAdded: () => void
}

export function AddWordForm({ onWordAdded }: AddWordFormProps) {
  const { user } = useAuth()
  const [english, setEnglish] = useState('')
  const [russian, setRussian] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) return

    const englishTrimmed = english.trim()
    const russianTrimmed = russian.trim()

    if (!englishTrimmed || !russianTrimmed) {
      setError('Заполните оба поля')
      return
    }

    try {
      const existingWords = await getWords(user.id)
      const duplicate = existingWords.find(
        (w) => w.english.toLowerCase() === englishTrimmed.toLowerCase()
      )

      if (duplicate) {
        setError('Это слово уже добавлено')
        return
      }

      setLoading(true)
      const result = await addWord(user.id, englishTrimmed, russianTrimmed)
      setLoading(false)

      if (!result) {
        setError('Не удалось добавить слово. Попробуйте еще раз.')
        return
      }

      setEnglish('')
      setRussian('')
      onWordAdded()
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      setLoading(false)
      setError('Произошла ошибка. Попробуйте еще раз.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          placeholder="English word"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="flex-1 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-base"
        />
        <input
          type="text"
          value={russian}
          onChange={(e) => setRussian(e.target.value)}
          placeholder="Перевод"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="flex-1 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-base"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 active:bg-foreground/80 transition-colors flex items-center justify-center gap-2 touch-manipulation disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить</span>
        </button>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </form>
  )
}
