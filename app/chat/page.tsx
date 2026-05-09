'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Settings, Plus, Trash2, MessageCircle } from 'lucide-react'
import { PRESET_PERSONAS, Persona, createCustomPersona } from '@/lib/chat-persona'
import { useAuth } from '@/lib/auth-context'
import { getGuestChatHistory, saveGuestChatMessage, clearGuestChatHistory, ChatMessage } from '@/lib/guest-storage'

interface Message {
  role: 'user' | 'assistant'
  content: string
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

  const saveMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = { role, content, timestamp: Date.now() }
    setMessages(prev => [...prev, newMessage])
    
    if (currentPersona) {
      const userId = isGuest ? 'guest' : user?.id
      if (userId) {
        saveGuestChatMessage(userId, currentPersona.id, newMessage)
      }
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentPersona || !apiKey.trim()) return
    
    const userMsg = inputMessage.trim()
    setInputMessage('')
    saveMessage('user', userMsg)
    setIsTyping(true)

    try {
      const userPrompt = `You are having a natural, friendly conversation with someone learning English.
Your character: ${currentPersona.systemPrompt}

Previous conversation (last 10 messages):
${messages.slice(-10).map(m => `${m.role === 'user' ? 'User' : currentPersona.name}: ${m.content}`).join('\n')}

User's message: ${userMsg}

Respond naturally as ${currentPersona.name} with a conversational, friendly tone (1-3 sentences). Keep it engaging and encourage the user to continue talking.`

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
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.8,
            max_tokens: 150,
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
            generationConfig: { temperature: 0.8, maxOutputTokens: 150 },
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
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.8,
            max_tokens: 150,
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error?.message || `HTTP ${res.status}`)
        }

        const data = await res.json()
        content = data.choices?.[0]?.message?.content || ''
      }

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-14 sm:pt-4 flex flex-col">
      <header className="bg-card/80 backdrop-blur-md border-b border-border px-4 py-3 sticky top-14 sm:top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentPersona(null)}
            className="flex items-center gap-3 group"
          >
            <div className="text-3xl group-hover:scale-110 transition-transform">{currentPersona.avatar}</div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-base text-foreground">{currentPersona.name}</h1>
              <p className="text-xs text-muted-foreground">{currentPersona.age} • {currentPersona.personality}</p>
            </div>
            <div className="sm:hidden">
              <h1 className="font-semibold text-base">{currentPersona.name}</h1>
            </div>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Очистить чат"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Настройки"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        {showSettings && (
          <div className="mt-3 mx-4 p-4 bg-muted/80 backdrop-blur rounded-xl border border-border space-y-3">
            <div className="flex gap-2 flex-wrap">
              {(['openai', 'gemini', 'openrouter'] as AIProvider[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    provider === p
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:border-primary/50'
                  }`}
                >
                  {p === 'openai' ? 'OpenAI' : p === 'gemini' ? 'Gemini' : 'OpenRouter'}
                </button>
              ))}
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                localStorage.setItem(`${provider}-api-key`, e.target.value)
              }}
              placeholder="API Key"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              value={model}
              onChange={(e) => {
                setModel(e.target.value)
                localStorage.setItem('chat-model', e.target.value)
              }}
              placeholder="Модель (gpt-4o-mini)"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 animate-pulse">{currentPersona.avatar}</div>
              <h2 className="text-xl font-semibold mb-2">Привет, я {currentPersona.name}!</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Давай поболтаем на английском! Я {currentPersona.age} лет, {currentPersona.personality}.
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <span className="px-3 py-1 bg-muted rounded-full">{currentPersona.gender}</span>
                <span className="px-3 py-1 bg-muted rounded-full">Английский только</span>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border rounded-bl-sm'
                }`}
              >
                <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-card/80 backdrop-blur-md border-t border-border p-3 sm:p-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Напиши сообщение для ${currentPersona.name}...`}
                disabled={!apiKey.trim()}
                rows={1}
                className="w-full px-4 py-3 bg-input border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 resize-none max-h-32 transition-all"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || !apiKey.trim() || isTyping}
              className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95 flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {!apiKey.trim() && (
            <p className="text-xs text-yellow-500 mt-2 text-center flex items-center justify-center gap-1">
              ⚠️ Настройте API-ключ в настройках
            </p>
          )}
        </div>
      </footer>
    </div>
  )
}
