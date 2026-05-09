'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useIsMobile } from '@/hooks/use-mobile'
import { addWord, getWords, getBasicWords100, getBasicWords500, deleteAllWords } from '@/lib/storage'

interface AddWordFormProps {
  onWordAdded: () => void
}

export function AddWordForm({ onWordAdded }: AddWordFormProps) {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [english, setEnglish] = useState('')
  const [russian, setRussian] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [basicLoading, setBasicLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

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

  const loadBasic100 = async () => {
    if (!user) return
    
    setBasicLoading(true)
    try {
      const existingWords = await getWords(user.id)
      const existingEnglish = new Set(existingWords.map(w => w.english.toLowerCase()))
      
      const basicWords = await getBasicWords100()
      const newWords = basicWords.filter(word => 
        !existingEnglish.has(word.english.toLowerCase())
      )
      
      for (const word of newWords) {
        await addWord(user.id, word.english, word.russian)
      }
      
      onWordAdded()
    } catch (error) {
      console.error('Error loading basic 100 words:', error)
    } finally {
      setBasicLoading(false)
    }
  }

  const loadBasic500 = async () => {
    if (!user) return
    
    setBasicLoading(true)
    try {
      const existingWords = await getWords(user.id)
      const existingEnglish = new Set(existingWords.map(w => w.english.toLowerCase()))
      
      const basicWords = await getBasicWords500()
      const newWords = basicWords.filter(word => 
        !existingEnglish.has(word.english.toLowerCase())
      )
      
      for (const word of newWords) {
        await addWord(user.id, word.english, word.russian)
      }
      
      onWordAdded()
    } catch (error) {
      console.error('Error loading basic 500 words:', error)
    } finally {
      setBasicLoading(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!user) return
    
    if (!window.confirm('Вы уверены, что хотите удалить ВСЕ ваши слова? Это действие необратимо.')) {
      return
    }
    
    setDeleteLoading(true)
    try {
      await deleteAllWords(user.id)
      onWordAdded()
    } catch (error) {
      console.error('Error deleting all words:', error)
      setError('Не удалось удалить слова. Попробуйте еще раз.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-3">
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
            className="px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 active:bg-foreground/80 transition-colors touch-manipulation disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Добавить</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={loadBasic100}
            disabled={basicLoading || loading}
            className={`flex-1 px-4 py-3 bg-muted text-muted-foreground hover:bg-muted/80 font-medium rounded-lg touch-manipulation transition-colors disabled:opacity-50 ${isMobile ? 'text-base' : 'text-sm'}`}
          >
            {basicLoading ? 'Загрузка...' : 'Загрузить 100 базовых слов'}
          </button>
          <button
            onClick={loadBasic500}
            disabled={basicLoading || loading}
            className={`flex-1 px-4 py-3 bg-muted text-muted-foreground hover:bg-muted/80 font-medium rounded-lg touch-manipulation transition-colors disabled:opacity-50 ${isMobile ? 'text-base' : 'text-sm'}`}
          >
            {basicLoading ? 'Загрузка...' : 'Загрузить 500 базовых слов'}
          </button>
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleDeleteAll}
            disabled={deleteLoading}
            className={`w-full px-4 py-3 bg-destructive/10 text-destructive hover:bg-destructive/20 font-medium rounded-lg touch-manipulation transition-colors ${isMobile ? 'text-base' : 'text-sm'}`}
          >
            {deleteLoading ? 'Удаление...' : 'Удалить все слова'}
          </button>
        </div>
      </div>
      
      {error && <p className="mt-4 text-destructive text-sm">{error}</p>}
    </form>
  )
}
