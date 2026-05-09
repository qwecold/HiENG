'use client'

import { Trash2, Volume2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Word, deleteWord } from '@/lib/storage'
import { speak, isSpeechSynthesisSupported } from '@/lib/speech-utils'

interface WordListProps {
  words: Word[]
  onWordDeleted: () => void
}

function getLevelColor(level: number): string {
  if (level === 0) return 'bg-muted'
  if (level <= 2) return 'bg-orange-500/20 text-orange-400'
  if (level <= 4) return 'bg-blue-500/20 text-blue-400'
  return 'bg-green-500/20 text-green-400'
}

function getLevelText(level: number): string {
  if (level === 0) return 'Новое'
  if (level <= 2) return 'Учу'
  if (level <= 4) return 'Знаю'
  return 'Выучено'
}

export function WordList({ words, onWordDeleted }: WordListProps) {
  const { user } = useAuth()

  const handleDelete = async (id: string) => {
    if (!user) return
    await deleteWord(user.id, id)
    onWordDeleted()
  }

  if (words.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>У вас пока нет слов</p>
        <p className="text-sm mt-1">Добавьте первое слово выше</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {words.map((word) => (
        <div
          key={word.id}
          className="group flex items-center justify-between p-3 sm:p-4 bg-card border border-border rounded-lg hover:border-muted-foreground/30 transition-colors"
        >
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate text-sm sm:text-base">
                  {word.english}
                </p>
                {isSpeechSynthesisSupported() && (
                  <button
                    onClick={() => speak(word.english)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors touch-manipulation flex-shrink-0"
                    aria-label="Прослушать произношение"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {word.russian}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getLevelColor(word.level)}`}
              >
                {getLevelText(word.level)}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleDelete(word.id)}
            className="ml-2 sm:ml-3 p-2 text-muted-foreground hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 transition-all touch-manipulation"
            aria-label="Удалить слово"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
