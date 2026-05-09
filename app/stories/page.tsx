'use client'

import { useState, useEffect } from 'react'
import { Search, BookOpen, X, Send, AlertCircle, Sparkles, Shuffle, KeyRound, ChevronDown, ChevronUp } from 'lucide-react'
import { BUILT_IN_STORIES, getRandomStories, BuiltInStory } from '@/lib/stories-data'
import { useAuth } from '@/lib/auth-context'
import { getGuestApiKeys, setGuestApiKey } from '@/lib/guest-storage'

type AIProvider = 'openai' | 'gemini' | 'openrouter'

interface RedditPost {
  id: string
  title: string
  selftext: string
  subreddit: string
  author: string
  permalink: string
}

type StoryItem = { type: 'reddit'; data: RedditPost } | { type: 'builtin'; data: BuiltInStory }

interface AIFeedback {
  score: number
  comment: string
}

export default function StoriesPage() {
  const { isGuest } = useAuth()
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<StoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState<StoryItem | null>(null)
  const [summary, setSummary] = useState('')
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null)
  const [checking, setChecking] = useState(false)
  const [provider, setProvider] = useState<AIProvider>('openai')
  const [apiKey, setApiKey] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [savedSummaries, setSavedSummaries] = useState<Record<string, string>>({})
  const [source, setSource] = useState<'reddit' | 'builtin'>('reddit')

  useEffect(() => {
    const saved = localStorage.getItem('story-summaries')
    if (saved) {
      try { setSavedSummaries(JSON.parse(saved)) } catch { /* ignore */ }
    }
    const openaiKey = localStorage.getItem('openai-api-key')
    if (openaiKey) {
      setApiKey(openaiKey)
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
  }, [])

  const searchStories = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setItems([])
    setSource('reddit')

    try {
      const subreddits = 'shortstories+shortscarystories+tifu+pettyrevenge+MaliciousCompliance+TwoSentenceHorror+nosleep'
      const url = `https://www.reddit.com/r/${subreddits}/search.json?q=${encodeURIComponent(query)}&limit=15&sort=relevance&restrict_sr=on`

      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const redditItems: RedditPost[] = data.data.children
        .map((c: any) => c.data)
        .filter((p: any) => p.selftext && p.selftext.length > 100 && p.selftext.length < 8000)
        .map((p: any) => ({
          id: p.id,
          title: p.title,
          selftext: p.selftext,
          subreddit: p.subreddit,
          author: p.author,
          permalink: p.permalink,
        }))

      if (redditItems.length === 0) {
        throw new Error('no results')
      }

      setItems(redditItems.map(d => ({ type: 'reddit', data: d })))
    } catch (e) {
      const builtIn = query.trim()
        ? BUILT_IN_STORIES.filter(s =>
            s.title.toLowerCase().includes(query.toLowerCase()) ||
            s.text.toLowerCase().includes(query.toLowerCase()) ||
            s.topic.includes(query.toLowerCase())
          )
        : getRandomStories(5)

      setItems(builtIn.length > 0
        ? builtIn.map(d => ({ type: 'builtin', data: d }))
        : getRandomStories(5).map(d => ({ type: 'builtin', data: d }))
      )
      setSource('builtin')
      if (builtIn.length === 0) {
        setError('Ничего не найдено. Попробуйте другой запрос.')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadRandom = () => {
    setItems(getRandomStories(5).map(d => ({ type: 'builtin', data: d })))
    setSource('builtin')
    setError('')
  }

  const checkWithAI = async () => {
    if (!selectedItem || !summary.trim() || !apiKey.trim()) return
    setChecking(true)
    setAiFeedback(null)

    const storyText = selectedItem.type === 'reddit'
      ? selectedItem.data.selftext
      : selectedItem.data.text

    const systemPrompt = `Ты — помощник для изучения английского. Пользователь прочитал короткую историю на английском и написал краткое описание её сути. Твоя задача:
1. Оцени, насколько точно описание передаёт главную мысль истории (0–100 баллов)
2. Дай короткий отзыв (1–2 предложения) на русском — что хорошо, что можно улучшить
3. Если есть грубые ошибки в понимании сюжета, мягко укажи на них
Ответь СТРОГО в формате JSON: {"score": число, "comment": "текст"}`

    const userPrompt = `ИСТОРИЯ:\n${storyText}\n\nОПИСАНИЕ ПОЛЬЗОВАТЕЛЯ:\n${summary.trim()}`

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
            temperature: 0.5,
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
            generationConfig: { temperature: 0.5 },
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
            temperature: 0.5,
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
        setAiFeedback({ score: parsed.score, comment: parsed.comment })
      } else {
        setAiFeedback({ score: 0, comment: 'Не удалось разобрать ответ ИИ. Попробуйте ещё раз.' })
      }
    } catch (e: any) {
      setAiFeedback({ score: 0, comment: `Ошибка: ${e.message}. Проверьте API-ключ.` })
    } finally {
      setChecking(false)
    }
  }

  const saveSummary = () => {
    if (!selectedItem || !summary.trim()) return
    const id = selectedItem.type === 'reddit' ? selectedItem.data.id : selectedItem.data.id
    const updated = { ...savedSummaries, [id]: summary.trim() }
    setSavedSummaries(updated)
    localStorage.setItem('story-summaries', JSON.stringify(updated))
    setSelectedItem(null)
    setSummary('')
    setAiFeedback(null)
  }

  const openItem = (item: StoryItem) => {
    setSelectedItem(item)
    const id = item.type === 'reddit' ? item.data.id : item.data.id
    setSummary(savedSummaries[id] || '')
    setAiFeedback(null)
  }

  const storyTitle = (item: StoryItem) => item.type === 'reddit' ? item.data.title : item.data.title
  const storyText = (item: StoryItem) => item.type === 'reddit' ? item.data.selftext : item.data.text
  const storyMeta = (item: StoryItem) =>
    item.type === 'reddit'
      ? `r/${item.data.subreddit} • u/${item.data.author}`
      : `Встроенная история • ${item.data.level === 'easy' ? 'Лёгкий' : item.data.level === 'medium' ? 'Средний' : 'Сложный'} уровень`

  return (
    <div className="min-h-screen bg-background pt-14 sm:pt-4">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Чтение историй</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Читайте короткие истории на английском и тренируйте понимание
          </p>
        </header>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Тема: love, horror, work, funny..."
            className="flex-1 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base"
            onKeyDown={(e) => e.key === 'Enter' && searchStories()}
          />
          <div className="flex gap-2">
            <button
              onClick={searchStories}
              disabled={loading || !query.trim()}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 active:bg-foreground/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Найти</span>
            </button>
            <button
              onClick={loadRandom}
              className="px-4 py-3 bg-muted text-muted-foreground font-medium rounded-lg hover:bg-muted/80 active:bg-muted/60 transition-colors flex items-center justify-center gap-2 touch-manipulation"
              title="Случайные истории"
            >
              <Shuffle className="w-4 h-4 shrink-0" />
              <span className="sm:hidden">Случайные</span>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {apiKey ? `${provider === 'openai' ? 'OpenAI' : 'Gemini'} подключен` : 'Добавить API-ключ для AI-проверки'}
            {showKeyInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showKeyInput && (
            <div className="mt-2 space-y-2">
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
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                {provider === 'openai'
                  ? 'Ключ из OpenAI (platform.openai.com)'
                  : provider === 'gemini'
                  ? 'Ключ из Google AI Studio (aistudio.google.com)'
                  : 'Ключ из OpenRouter (openrouter.ai)'}
              </p>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-12 text-muted-foreground animate-pulse">
            Ищем истории...
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl mb-4">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {items.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Введите тему или нажмите «Случайные», чтобы начать</p>
          </div>
        )}

        <div className="space-y-3">
          {items.map((item) => (
            <button
              key={item.type === 'reddit' ? item.data.id : item.data.id}
              onClick={() => openItem(item)}
              className="w-full text-left bg-card border border-border rounded-xl p-3 sm:p-4 hover:border-primary/30 active:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm sm:text-base mb-1 line-clamp-2">{storyTitle(item)}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {storyMeta(item)} • {storyText(item).slice(0, 140).replace(/\n/g, ' ')}...
                  </p>
                  {savedSummaries[item.type === 'reddit' ? item.data.id : item.data.id] && (
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">
                      Описание сохранено
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {items.length > 0 && source === 'builtin' && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            Встроенные истории (Reddit недоступен)
          </p>
        )}

        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/90 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-card border border-border rounded-t-xl sm:rounded-xl w-full max-w-2xl max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between gap-4 z-10">
                <h2 className="font-semibold text-base sm:text-lg line-clamp-2">{storyTitle(selectedItem)}</h2>
                <button
                  onClick={() => { setSelectedItem(null); setSummary(''); setAiFeedback(null) }}
                  className="p-2 text-muted-foreground hover:text-foreground shrink-0 touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4 flex-1">
                <div className="text-xs text-muted-foreground">{storyMeta(selectedItem)}</div>

                <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {storyText(selectedItem)}
                </div>

                <div className="border-t border-border pt-4">
                  <label className="block text-sm font-medium mb-2">
                    Кратко опишите, о чём была история:
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => {
                      setSummary(e.target.value)
                      setAiFeedback(null)
                    }}
                    placeholder="Напишите 2–3 предложения на русском или английском..."
                    rows={4}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />

                  {apiKey && (
                    <button
                      onClick={checkWithAI}
                      disabled={checking || !summary.trim()}
                      className="mt-2 w-full px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 active:bg-primary/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation"
                    >
                      <Sparkles className="w-4 h-4" />
                      {checking ? 'Проверяем...' : `Проверить через ${provider === 'openai' ? 'OpenAI' : provider === 'gemini' ? 'Gemini' : 'OpenRouter'}`}
                    </button>
                  )}

                  {aiFeedback && (
                    <div className={`mt-3 p-3 rounded-lg border ${aiFeedback.score >= 70 ? 'bg-green-500/10 border-green-500/30' : aiFeedback.score >= 40 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">
                          Оценка: {aiFeedback.score}/100
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{aiFeedback.comment}</p>
                    </div>
                  )}

                  <div className="flex justify-end mt-3">
                    <button
                      onClick={saveSummary}
                      disabled={!summary.trim()}
                      className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 active:bg-foreground/80 transition-colors disabled:opacity-50 flex items-center gap-2 touch-manipulation"
                    >
                      <Send className="w-4 h-4" />
                      Сохранить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
