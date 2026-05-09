import { Word, UserStats, TestResult } from './storage'

const KEYS = {
  words: 'guest-words',
  stats: 'guest-stats',
  testResults: 'guest-test-results',
  storySummaries: 'guest-story-summaries',
  apiKeys: 'guest-api-keys',
  chatHistory: 'guest-chat-history',
}

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getGuestWords(): Word[] {
  return get<Word[]>(KEYS.words, [])
}

export function addGuestWord(english: string, russian: string): Word {
  const words = getGuestWords()
  const word: Word = {
    id: crypto.randomUUID(),
    english: english.toLowerCase().trim(),
    russian: russian.toLowerCase().trim(),
    createdAt: new Date().toISOString(),
    lastReviewed: null,
    correctCount: 0,
    incorrectCount: 0,
    level: 0,
  }
  words.unshift(word)
  set(KEYS.words, words)
  return word
}

export function updateGuestWord(id: string, updates: Partial<Word>): void {
  const words = getGuestWords()
  const idx = words.findIndex((w) => w.id === id)
  if (idx === -1) return
  words[idx] = { ...words[idx], ...updates }
  set(KEYS.words, words)
}

export function deleteGuestWord(id: string): void {
  const words = getGuestWords().filter((w) => w.id !== id)
  set(KEYS.words, words)
}

export function deleteAllGuestWords(): void {
  set(KEYS.words, [])
}

export function getGuestStats(): UserStats {
  const words = getGuestWords()
  const stats = get<UserStats>(KEYS.stats, {
    totalWords: 0,
    wordsLearned: 0,
    streak: 0,
    lastTestDate: null,
    testResults: [],
  })
  return {
    ...stats,
    totalWords: words.length,
    wordsLearned: words.filter((w) => w.level >= 3).length,
  }
}

export function recordGuestTestResult(
  totalWords: number,
  correctAnswers: number
): void {
  const today = new Date().toISOString().split('T')[0]
  const stats = getGuestStats()

  let newStreak = 1
  if (stats.lastTestDate) {
    const lastDate = new Date(stats.lastTestDate)
    const todayDate = new Date(today)
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 1) {
      newStreak = stats.streak + 1
    } else if (diffDays === 0) {
      newStreak = stats.streak || 1
    }
  }

  set(KEYS.stats, {
    ...stats,
    streak: newStreak,
    lastTestDate: today,
  })

  const results = get<TestResult[]>(KEYS.testResults, [])
  results.unshift({
    date: today,
    totalWords,
    correctAnswers,
    incorrectAnswers: totalWords - correctAnswers,
  })
  set(KEYS.testResults, results)
}

export function updateGuestStreakOnVisit(): void {
  const today = new Date().toISOString().split('T')[0]
  const stats = getGuestStats()

  let newStreak = 1
  if (stats.lastTestDate) {
    const lastDate = new Date(stats.lastTestDate)
    const todayDate = new Date(today)
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 1) {
      newStreak = stats.streak + 1
    } else if (diffDays === 0) {
      newStreak = stats.streak || 1
    }
  }

  set(KEYS.stats, {
    ...stats,
    streak: newStreak,
    lastTestDate: today,
  })
}

export function getGuestWordsForTest(count: number = 10): Word[] {
  const words = getGuestWords()
  if (words.length === 0) return []

  const now = Date.now()
  const dayInMs = 24 * 60 * 60 * 1000

  const wordsWithWeight = words.map((word) => {
    const levelWeight = 6 - word.level
    let timeMultiplier = 1
    if (word.lastReviewed) {
      const daysSinceReview =
        (now - new Date(word.lastReviewed).getTime()) / dayInMs
      const expectedInterval = Math.pow(2, word.level)
      timeMultiplier = Math.max(0.1, daysSinceReview / expectedInterval)
    } else {
      timeMultiplier = 3
    }
    return { word, weight: levelWeight * timeMultiplier }
  })

  const selected: Word[] = []
  const available = [...wordsWithWeight]

  while (selected.length < count && available.length > 0) {
    const totalWeight = available.reduce((sum, w) => sum + w.weight, 0)
    let random = Math.random() * totalWeight
    for (let i = 0; i < available.length; i++) {
      random -= available[i].weight
      if (random <= 0) {
        selected.push(available[i].word)
        available.splice(i, 1)
        break
      }
    }
  }

  return selected.sort(() => Math.random() - 0.5)
}

export function guestNeedsTestToday(): boolean {
  const stats = getGuestStats()
  if (!stats.lastTestDate) return true
  const today = new Date().toISOString().split('T')[0]
  return stats.lastTestDate !== today
}

export function getGuestStorySummaries(): Record<string, string> {
  return get<Record<string, string>>(KEYS.storySummaries, {})
}

export function saveGuestStorySummary(id: string, summary: string): void {
  const summaries = getGuestStorySummaries()
  summaries[id] = summary
  set(KEYS.storySummaries, summaries)
}

export function getGuestApiKeys(): Record<string, string> {
  return get<Record<string, string>>(KEYS.apiKeys, {})
}

export function setGuestApiKey(provider: string, key: string): void {
  const keys = getGuestApiKeys()
  keys[provider] = key
  set(KEYS.apiKeys, keys)
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export function getGuestChatHistory(userId: string, personaId: string): ChatMessage[] {
  const allHistory = get<Record<string, ChatMessage[]>>(KEYS.chatHistory, {})
  return allHistory[`${userId}-${personaId}`] || []
}

export function saveGuestChatMessage(userId: string, personaId: string, message: ChatMessage): void {
  const allHistory = get<Record<string, ChatMessage[]>>(KEYS.chatHistory, {})
  const key = `${userId}-${personaId}`
  const history = allHistory[key] || []
  history.push(message)
  allHistory[key] = history
  set(KEYS.chatHistory, allHistory)
}

export function clearGuestChatHistory(userId: string, personaId: string): void {
  const allHistory = get<Record<string, ChatMessage[]>>(KEYS.chatHistory, {})
  const key = `${userId}-${personaId}`
  delete allHistory[key]
  set(KEYS.chatHistory, allHistory)
}

export function clearGuestData(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
}
