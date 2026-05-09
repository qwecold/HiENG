'use client'

import { useState } from 'react'
import { Search, BookOpen, X, Send, AlertCircle } from 'lucide-react'

interface RedditPost {
  id: string
  title: string
  selftext: string
  subreddit: string
  author: string
  permalink: string
}

export default function StoriesPage() {
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState<RedditPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPost, setSelectedPost] = useState<RedditPost | null>(null)
  const [summary, setSummary] = useState('')
  const [savedSummaries, setSavedSummaries] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('story-summaries')
        return saved ? JSON.parse(saved) : {}
      } catch { return {} }
    }
    return {}
  })

  const searchStories = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setPosts([])

    try {
      const subreddits = 'shortstories+shortscarystories+tifu+pettyrevenge+MaliciousCompliance+TwoSentenceHorror+nosleep'
      const url = `https://www.reddit.com/r/${subreddits}/search.json?q=${encodeURIComponent(query)}&limit=15&sort=relevance&restrict_sr=on`

      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const items: RedditPost[] = data.data.children
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

      setPosts(items)
      if (items.length === 0) {
        setError('Истории не найдены. Попробуйте другой запрос: love, work, school, funny, horror...')
      }
    } catch (e) {
      setError('Reddit временно недоступен. Попробуйте обновить страницу или зайти позже.')
    } finally {
      setLoading(false)
    }
  }

  const saveSummary = () => {
    if (!selectedPost || !summary.trim()) return
    const updated = { ...savedSummaries, [selectedPost.id]: summary.trim() }
    setSavedSummaries(updated)
    localStorage.setItem('story-summaries', JSON.stringify(updated))
    setSelectedPost(null)
    setSummary('')
  }

  const openPost = (post: RedditPost) => {
    setSelectedPost(post)
    setSummary(savedSummaries[post.id] || '')
  }

  return (
    <div className="min-h-screen bg-background pt-14 sm:pt-4">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Чтение историй</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Найдите короткие истории на английском, прочитайте и кратко опишите суть
          </p>
        </header>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Тема: love, horror, work, funny..."
            className="flex-1 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base"
            onKeyDown={(e) => e.key === 'Enter' && searchStories()}
          />
          <button
            onClick={searchStories}
            disabled={loading || !query.trim()}
            className="px-4 sm:px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 active:bg-foreground/80 transition-colors disabled:opacity-50 flex items-center gap-2 touch-manipulation"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Найти</span>
          </button>
        </div>

        {loading && (
          <div className="text-center py-12 text-muted-foreground animate-pulse">
            Ищем истории на Reddit...
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl mb-4">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => openPost(post)}
              className="w-full text-left bg-card border border-border rounded-xl p-3 sm:p-4 hover:border-primary/30 active:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm sm:text-base mb-1 line-clamp-2">{post.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    r/{post.subreddit} • {post.selftext.slice(0, 140).replace(/\n/g, ' ')}...
                  </p>
                  {savedSummaries[post.id] && (
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">
                      Описание сохранено
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {posts.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            Источник: Reddit
          </p>
        )}

        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/90 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-card border border-border rounded-t-xl sm:rounded-xl w-full max-w-2xl max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between gap-4 z-10">
                <h2 className="font-semibold text-base sm:text-lg line-clamp-2">{selectedPost.title}</h2>
                <button
                  onClick={() => { setSelectedPost(null); setSummary('') }}
                  className="p-2 text-muted-foreground hover:text-foreground shrink-0 touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4 flex-1">
                <div className="text-xs text-muted-foreground">
                  r/{selectedPost.subreddit} • u/{selectedPost.author}
                </div>

                <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {selectedPost.selftext}
                </div>

                <div className="border-t border-border pt-4">
                  <label className="block text-sm font-medium mb-2">
                    Кратко опишите, о чём была история:
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Напишите 2–3 предложения на русском или английском..."
                    rows={4}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <div className="flex justify-end mt-2">
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
