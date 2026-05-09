'use client'

import { useState, useEffect } from 'react'
import { Headphones, X, Send, AlertCircle, Sparkles, KeyRound, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { BUILT_IN_VIDEOS, ListeningVideo, getVideoEmbedUrl, extractYoutubeId } from '@/lib/listening-data'
import { getGuestApiKeys, setGuestApiKey, getGuestStorySummaries, saveGuestStorySummary } from '@/lib/guest-storage'

type AIProvider = 'openai' | 'gemini' | 'openrouter'

interface AIFeedback {
  score: number
  comment: string
}

export default function ListeningPage() {
  const [videos, setVideos] = useState<ListeningVideo[]>(BUILT_IN_VIDEOS)
  const [selectedVideo, setSelectedVideo] = useState<ListeningVideo | null>(null)
  const [summary, setSummary] = useState('')
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null)
  const [checking, setChecking] = useState(false)
  const [provider, setProvider] = useState<AIProvider>('openai')
  const [apiKey, setApiKey] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [savedSummaries, setSavedSummaries] = useState<Record<string, string>>({})
  const [customUrl, setCustomUrl] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('listening-summaries')
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

  const saveSummary = () => {
    if (!selectedVideo || !summary.trim()) return
    const updated = { ...savedSummaries, [selectedVideo.id]: summary.trim() }
    setSavedSummaries(updated)
    localStorage.setItem('listening-summaries', JSON.stringify(updated))
    setSelectedVideo(null)
    setSummary('')
    setAiFeedback(null)
  }

  const addCustomVideo = () => {
    const id = extractYoutubeId(customUrl)
    if (!id) {
      alert('Неверная ссылка на YouTube')
      return
    }
    const video: ListeningVideo = {
      id: `custom-${id}`,
      title: customTitle.trim() || 'Custom Video',
      youtubeId: id,
      description: 'Добавлено пользователем',
      level: 'medium',
      duration: '?',
    }
    const updated = [...videos, video]
    setVideos(updated)
    const customOnly = updated.slice(BUILT_IN_VIDEOS.length)
    localStorage.setItem('listening-custom-videos', JSON.stringify(customOnly))
    setCustomUrl('')
    setCustomTitle('')
    setShowAddForm(false)
  }

  const deleteCustomVideo = (videoId: string) => {
    const updated = videos.filter(v => v.id !== videoId)
    setVideos(updated)
    const customOnly = updated.slice(BUILT_IN_VIDEOS.length)
    localStorage.setItem('listening-custom-videos', JSON.stringify(customOnly))
  }

  const checkWithAI = async () => {
    if (!selectedVideo || !summary.trim() || !apiKey.trim()) return
    setChecking(true)
    setAiFeedback(null)

    const systemPrompt = `Ты — помощник для изучения английского. Пользователь посмотрел видео (эпизод South Park или другое англоязычное видео) и написал краткое описание того, что произошло. Твоя задача:
1. Оцени, насколько точно и полно описание передаёт содержание (0–100 баллов)
2. Дай короткий отзыв (1–2 предложения) на русском — что хорошо, что можно улучшить
3. Если есть грубые ошибки в понимании сюжета, мягко укажи на них
Ответь СТРОГО в формате JSON: {"score": число, "comment": "текст"}`

    const userPrompt = `НАЗВАНИЕ ВИДЕО: ${selectedVideo.title}\nОПИСАНИЕ ПОЛЬЗОВАТЕЛЯ:\n${summary.trim()}`

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

  return (
    <div className="min-h-screen bg-background pt-14 sm:pt-4">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Слушанье</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Смотри видео на английском и тренируй восприятие на слух
          </p>
        </header>

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

        <div className="mb-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Отмена' : 'Добавить своё видео'}
          </button>
          {showAddForm && (
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Название видео"
                className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Ссылка на YouTube"
                className="flex-[2] px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={addCustomVideo}
                className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
              >
                Добавить
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => {
                setSelectedVideo(video)
                setSummary(savedSummaries[video.id] || '')
                setAiFeedback(null)
              }}
              className="w-full text-left bg-card border border-border rounded-xl p-3 sm:p-4 hover:border-primary/30 active:border-primary/50 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <Headphones className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm sm:text-base mb-1 line-clamp-2">{video.title}</h3>
                    {video.id.startsWith('custom-') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteCustomVideo(video.id) }}
                        className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {video.level === 'easy' ? 'Лёгкий' : video.level === 'medium' ? 'Средний' : 'Сложный'} уровень • {video.duration}
                  </p>
                  {savedSummaries[video.id] && (
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">
                      Описание сохранено
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/90 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-card border border-border rounded-t-xl sm:rounded-xl w-full max-w-2xl max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between gap-4 z-10">
                <h2 className="font-semibold text-base sm:text-lg line-clamp-2">{selectedVideo.title}</h2>
                <button
                  onClick={() => { setSelectedVideo(null); setSummary(''); setAiFeedback(null) }}
                  className="p-2 text-muted-foreground hover:text-foreground shrink-0 touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4 flex-1">
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={getVideoEmbedUrl(selectedVideo.youtubeId)}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>

                <p className="text-xs text-muted-foreground">{selectedVideo.description}</p>

                <div className="border-t border-border pt-4">
                  <label className="block text-sm font-medium mb-2">
                    Кратко опишите, о чём было видео:
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
