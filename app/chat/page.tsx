'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Settings, Plus, Trash2, User, Sparkles, MessageCircle, Smile } from 'lucide-react'
import { PRESET_PERSONAS, Persona, createCustomPersona } from '@/lib/chat-persona'
import { useAuth } from '@/lib/auth-context'
import { getGuestChatHistory, saveGuestChatMessage, clearGuestChatHistory, ChatMessage } from '@/lib/guest-storage'

interface Message {
  role: 'user' | 'assistant'
  content: string
  mediaUrl?: string
  mediaType?: 'image' | 'gif' | 'video'
  timestamp: number
}

type AIProvider = 'openai' | 'gemini' | 'openrouter'

export default function ChatPage() {
  const { user, isGuest } = useAuth()
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showPersonaSelector, setShowPersonaSelector] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [provider, setProvider] = useState<AIProvider>('openai')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('gpt-4o-mini')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load API key
    const openaiKey = localStorage.getItem('openai-api-key')
    if (openaiKey) {
      setApiKey(openaiKey)
      setProvider('openai')
      setModel(localStorage.getItem('chat-model') || 'gpt-4o-mini')
    } else {
      const geminiKey = localStorage.getItem('gemini-api-key')
      if (geminiKey) {
        setApiKey(geminiKey)
        setProvider('gemini')
        setModel(localStorage.getItem('chat-model') || 'gemini-2.0-flash')
      } else {
        const openrouterKey = localStorage.getItem('openrouter-api-key')
        if (openrouterKey) {
          setApiKey(openrouterKey)
          setProvider('openrouter')
          setModel(localStorage.getItem('chat-model') || 'google/gemini-2.0-flash-exp:free')
        }
      }
    }

    // Load last persona
    const savedPersona = localStorage.getItem('chat-last-persona')
    if (savedPersona) {
      try {
        const persona = JSON.parse(savedPersona)
        setCurrentPersona(persona)
      } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    if (currentPersona) {
      const userId = isGuest ? 'guest' : user?.id
      if (userId) {
        const history = getGuestChatHistory(userId, currentPersona.id)
        setMessages(history)
      }
    }
  }, [currentPersona, isGuest, user?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const saveMessage = (role: 'user' | 'assistant', content: string, mediaUrl?: string, mediaType?: 'image' | 'gif' | 'video') => {
    const newMessage: Message = { role, content, mediaUrl, mediaType, timestamp: Date.now() }
    setMessages(prev => [...prev, newMessage])
    
    if (currentPersona) {
      const userId = isGuest ? 'guest' : user?.id
      if (userId) {
        saveGuestChatMessage(userId, currentPersona.id, newMessage)
      }
    }
  }

  const getRandomGif = () => {
    const gifs = [
      { url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif', title: 'Cool' },
      { url: 'https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif', title: 'Love' },
      { url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', title: 'Shocked' },
      { url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', title: 'Laughing' },
      { url: 'https://media.giphy.com/media/26BRyO7jOq8mW2dBy/giphy.gif', title: 'Party' },
      { url: 'https://media.giphy.com/media/l0Ex6MURA0C97l3gI/giphy.gif', title: 'Yeet' },
    ]
    return gifs[Math.floor(Math.random() * gifs.length)]
  }

  const getRandomEmoji = () => {
    const emojis = ['😂', '💀', '🔥', '😍', '🤣', '💯', '✨', '🙌', '😎', '👀', '💅', '🌚']
    return emojis[Math.floor(Math.random() * emojis.length)]
  }

  const handleEmojiSelect = (emoji: string) => {
    setInputMessage(prev => prev + emoji)
  }

  const handleGifSelect = (gifUrl: string, gifTitle: string) => {
    saveMessage('user', '', gifUrl, 'gif')
    setShowEmojiPicker(false)
  }

  const handleSendGif = () => {
    const gif = getRandomGif()
    saveMessage('user', '', gif.url, 'gif')
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentPersona || !apiKey.trim()) return
    
    const userMsg = inputMessage.trim()
    setInputMessage('')
    saveMessage('user', userMsg)
    setIsTyping(true)

    try {
      const userPrompt = `
You are having a natural conversation with someone. 
Your character: ${currentPersona.systemPrompt}

Previous conversation:
${messages.slice(-10).map(m => `${m.role === 'user' ? 'User' : 'You'}: ${m.content}`).join('\n')}

User: ${userMsg}

Respond naturally as ${currentPersona.name}, keeping your personality. Keep your response conversational (1-3 sentences).`

      let content = ''

      if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: model || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: currentPersona.systemPrompt },
              ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: userMsg }
            ],
            temperature: 0.8,
            max_tokens: 200,
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error?.message || `HTTP ${res.status}`)
        }

        const data = await res.json()
        content = data.choices?.[0]?.message?.content || ''
      } else if (provider === 'gemini') {
        const modelName = (model || 'gemini-2.0-flash').replace(':free', '')
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: userPrompt }] }
            ],
            generationConfig: { temperature: 0.8, maxOutputTokens: 200 },
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
            model: model || 'google/gemini-2.0-flash-exp:free',
            messages: [
              { role: 'system', content: currentPersona.systemPrompt },
              ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: userMsg }
            ],
            temperature: 0.8,
            max_tokens: 200,
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error?.message || `HTTP ${res.status}`)
        }

        const data = await res.json()
        content = data.choices?.[0]?.message?.content || ''
      }

      // Clean up the response
      const cleanContent = content.replace(/^["']|["']$/g, '').trim()
      saveMessage('assistant', cleanContent)
    } catch (e: any) {
      saveMessage('assistant', `Sorry, I got an error: ${e.message}`)
    } finally {
      setIsTyping(false)
    }
  }

  const selectPersona = (persona: Persona) => {
    setCurrentPersona(persona)
    localStorage.setItem('chat-last-persona', JSON.stringify(persona))
    setShowPersonaSelector(false)
  }

  const clearChat = () => {
    setMessages([])
    if (currentPersona) {
      const userId = isGuest ? 'guest' : user?.id
      if (userId) {
        clearGuestChatHistory(userId, currentPersona.id)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!currentPersona) {
    return (
      <div className="min-h-screen bg-background pt-14 sm:pt-4">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <header className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">Чат с ИИ</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Выбери персонажа и начни общаться на английском
            </p>
          </header>

          <div className="mb-6">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              {apiKey ? `${provider.toUpperCase()} настроен` : 'Настроить AI-провайдера'}
            </button>
            {showSettings && (
              <div className="mt-3 p-4 bg-card border border-border rounded-lg space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setProvider('openai')}
                    className={`px-3 py-1 text-xs rounded border ${provider === 'openai' ? 'bg-primary/10 border-primary' : 'border-border'}`}
                  >
                    OpenAI
                  </button>
                  <button
                    onClick={() => setProvider('gemini')}
                    className={`px-3 py-1 text-xs rounded border ${provider === 'gemini' ? 'bg-primary/10 border-primary' : 'border-border'}`}
                  >
                    Gemini
                  </button>
                  <button
                    onClick={() => setProvider('openrouter')}
                    className={`px-3 py-1 text-xs rounded border ${provider === 'openrouter' ? 'bg-primary/10 border-primary' : 'border-border'}`}
                  >
                    OpenRouter
                  </button>
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value)
                    localStorage.setItem(`${provider}-api-key`, e.target.value)
                  }}
                  placeholder="API Key"
                  className="w-full px-3 py-2 bg-input border border-border rounded text-sm"
                />
                <input
                  type="text"
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value)
                    localStorage.setItem('chat-model', e.target.value)
                  }}
                  placeholder="Модель (например, gpt-4o-mini)"
                  className="w-full px-3 py-2 bg-input border border-border rounded text-sm"
                />
              </div>
            )}
          </div>

          {!apiKey && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-500">
                ⚠️ Пожалуйста, настройте API-ключ в настройках, чтобы начать общение
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRESET_PERSONAS.map((persona) => (
              <button
                key={persona.id}
                onClick={() => selectPersona(persona)}
                className="text-left bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{persona.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1">{persona.name}, {persona.age}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{persona.personality}</p>
                    <p className="text-sm line-clamp-2">{persona.description}</p>
                  </div>
                </div>
              </button>
            ))}

            <button
              onClick={() => {
                const name = prompt('Имя персонажа:')
                if (!name) return
                const age = parseInt(prompt('Возраст:') || '20')
                const genderPrompt = prompt('Пол (male/female/non-binary):') || 'female'
                const personality = prompt('Характер (через запятую):') || 'friendly'
                const description = prompt('Описание персонажа:') || 'Собеседник для общения'
                
                const gender = genderPrompt === 'male' ? 'male' : genderPrompt === 'non-binary' ? 'non-binary' : 'female'
                const traits = personality.split(',').map(t => t.trim()).filter(Boolean)
                
                const customPersona = createCustomPersona(name, age, gender, personality, description, traits)
                selectPersona(customPersona)
              }}
              className="text-left bg-card border-2 border-dashed border-border rounded-xl p-4 hover:border-primary transition-colors flex items-center justify-center gap-2 min-h-[160px]"
            >
              <Plus className="w-6 h-6 text-muted-foreground" />
              <span className="text-muted-foreground">Создать своего персонажа</span>
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-14 sm:pt-4 flex flex-col">
      <header className="bg-card border-b border-border px-3 sm:px-4 py-3 sticky top-14 sm:top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentPersona(null)}
            className="flex items-center gap-2"
          >
            <div className="text-2xl">{currentPersona.avatar}</div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-base">{currentPersona.name}</h1>
              <p className="text-xs text-muted-foreground">{currentPersona.age} • {currentPersona.gender}</p>
            </div>
            <div className="sm:hidden">
              <h1 className="font-semibold text-base">{currentPersona.name}</h1>
            </div>
          </button>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={clearChat}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              title="Очистить чат"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Настройки"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        {showSettings && (
          <div className="mt-3 p-3 bg-muted rounded-lg space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => setProvider('openai')}
                className={`px-3 py-1 text-xs rounded border ${provider === 'openai' ? 'bg-primary/10 border-primary' : 'border-border'}`}
              >
                OpenAI
              </button>
              <button
                onClick={() => setProvider('gemini')}
                className={`px-3 py-1 text-xs rounded border ${provider === 'gemini' ? 'bg-primary/10 border-primary' : 'border-border'}`}
              >
                Gemini
              </button>
              <button
                onClick={() => setProvider('openrouter')}
                className={`px-3 py-1 text-xs rounded border ${provider === 'openrouter' ? 'bg-primary/10 border-primary' : 'border-border'}`}
              >
                OpenRouter
              </button>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                localStorage.setItem(`${provider}-api-key`, e.target.value)
              }}
              placeholder="API Key"
              className="w-full px-3 py-2 bg-input border border-border rounded text-sm"
            />
            <input
              type="text"
              value={model}
              onChange={(e) => {
                setModel(e.target.value)
                localStorage.setItem('chat-model', e.target.value)
              }}
              placeholder="Модель (gpt-4o-mini)"
              className="w-full px-3 py-2 bg-input border border-border rounded text-sm"
            />
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 sm:py-8">
              <MessageCircle className="w-16 h-16 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-sm sm:text-base">
                Начни разговор с {currentPersona.name}!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Она говорит только на английском
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                }`}
              >
                {msg.mediaUrl && (
                  <div className="mb-2">
                    {msg.mediaType === 'video' ? (
                      <video src={msg.mediaUrl} controls className="max-w-full rounded-lg" />
                    ) : (
                      <img src={msg.mediaUrl} alt="Media" className="max-w-full rounded-lg" />
                    )}
                  </div>
                )}
                {msg.content && <p className="text-sm sm:text-base whitespace-pre-wrap">{msg.content}</p>}
                <p className="text-xs mt-1 opacity-50">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-card border-t border-border p-2 sm:p-4">
        <div className="max-w-6xl mx-auto">
          {/* Quick emoji/gif buttons for mobile */}
          <div className="flex gap-1 mb-2 overflow-x-auto pb-2 sm:hidden">
            {['😂', '💀', '🔥', '😍', '🤣', '💯', '✨', '🙌', '😎', '👀', '💅', '🌚'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className="text-xl px-2 py-1 flex-shrink-0 bg-muted rounded hover:bg-muted/70 transition-colors"
              >
                {emoji}
              </button>
            ))}
            <button
              onClick={handleSendGif}
              className="px-3 py-1 flex-shrink-0 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors text-sm"
            >
              🎬 GIF
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Сообщение для ${currentPersona.name}...`}
                disabled={!apiKey.trim()}
                rows={1}
                className="w-full px-4 py-3 bg-input border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 resize-none max-h-32"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                type="button"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={sendMessage}
              disabled={(!inputMessage.trim() && !showEmojiPicker) || !apiKey.trim() || isTyping}
              className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {showEmojiPicker && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <div className="grid grid-cols-6 gap-2 mb-3">
                {['😀', '😂', '🥰', '😎', '🤔', '😭', '😡', '👏', '🔥', '💯', '😍', '🤣', '😘', '🙌', '👍', '💀', '🙄', '😏', '🤷', '💩', '🎉', '❤️', '✨', '👀', '🚀', '💪', '🥺', '😤', '💅', '🌚', '🌝', '🗿'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      handleEmojiSelect(emoji)
                      setShowEmojiPicker(false)
                    }}
                    className="text-2xl hover:bg-background rounded p-1 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
                  'https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif',
                  'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
                  'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif',
                  'https://media.giphy.com/media/26BRyO7jOq8mW2dBy/giphy.gif',
                  'https://media.giphy.com/media/l0Ex6MURA0C97l3gI/giphy.gif',
                ].map((gifUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleGifSelect(gifUrl, 'GIF')
                    }}
                    className="rounded overflow-hidden hover:opacity-80 transition-opacity"
                  >
                    <img src={gifUrl} alt="GIF" className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {!apiKey.trim() && (
            <p className="text-xs text-yellow-500 mt-2 text-center">
              Настройте API-ключ для начала общения
            </p>
          )}
        </div>
      </footer>
    </div>
  )
}
