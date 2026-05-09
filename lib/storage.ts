import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'
import { GuestUser } from './auth-context'
import { BASIC_WORDS_100 } from './constants/basic-words-100'
import { BASIC_WORDS_500 } from './constants/basic-words-500'
import {
  getGuestWords,
  addGuestWord,
  updateGuestWord,
  deleteGuestWord,
  deleteAllGuestWords,
  getGuestStats,
  recordGuestTestResult,
  updateGuestStreakOnVisit,
  getGuestWordsForTest,
  guestNeedsTestToday,
} from './guest-storage'

const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const wordsCache = new Map<string, CacheEntry<Word[]>>()
const statsCache = new Map<string, CacheEntry<UserStats>>()

function getFromCache<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string
): T | null {
  const entry = cache.get(key)
  if (!entry) return null

  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(key)
    return null
  }

  return entry.data
}

function setCache<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  data: T
): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })
}

function clearCache(userId: string): void {
  wordsCache.delete(userId)
  statsCache.delete(userId)
}

export interface Word {
  id: string
  english: string
  russian: string
  createdAt: string
  lastReviewed: string | null
  correctCount: number
  incorrectCount: number
  level: number
}

export interface TestResult {
  date: string
  totalWords: number
  correctAnswers: number
  incorrectAnswers: number
}

export interface UserStats {
  totalWords: number
  wordsLearned: number
  streak: number
  lastTestDate: string | null
  testResults: TestResult[]
}

export async function getWords(userId: string, forceRefresh: boolean = false): Promise<Word[]> {
  if (userId === 'guest') {
    return getGuestWords()
  }

  if (!forceRefresh) {
    const cached = getFromCache(wordsCache, userId)
    if (cached) return cached
  }

  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching words:', error)
      return []
    }

    const words = data.map((w) => ({
      id: w.id,
      english: w.english,
      russian: w.russian,
      createdAt: w.created_at,
      lastReviewed: w.last_reviewed,
      correctCount: w.correct_count,
      incorrectCount: w.incorrect_count,
      level: w.level,
    }))

    setCache(wordsCache, userId, words)
    return words
  } catch (error) {
    console.error('Error in getWords:', error)
    return []
  }
}

export async function addWord(
  userId: string,
  english: string,
  russian: string
): Promise<Word | null> {
  if (userId === 'guest') {
    return addGuestWord(english, russian)
  }

  try {
    const { data, error } = await supabase
      .from('words')
      .insert({
        user_id: userId,
        english: english.toLowerCase().trim(),
        russian: russian.toLowerCase().trim(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding word:', error)
      return null
    }

    const word = {
      id: data.id,
      english: data.english,
      russian: data.russian,
      createdAt: data.created_at,
      lastReviewed: data.last_reviewed,
      correctCount: data.correct_count,
      incorrectCount: data.incorrect_count,
      level: data.level,
    }

    clearCache(userId)
    return word
  } catch (error) {
    console.error('Error in addWord:', error)
    return null
  }
}

export async function updateWord(
  userId: string,
  id: string,
  updates: Partial<Word>
): Promise<void> {
  if (userId === 'guest') {
    updateGuestWord(id, updates)
    return
  }

  const updateData: Record<string, unknown> = {}

  if (updates.english !== undefined) updateData.english = updates.english
  if (updates.russian !== undefined) updateData.russian = updates.russian
  if (updates.lastReviewed !== undefined)
    updateData.last_reviewed = updates.lastReviewed
  if (updates.correctCount !== undefined)
    updateData.correct_count = updates.correctCount
  if (updates.incorrectCount !== undefined)
    updateData.incorrect_count = updates.incorrectCount
  if (updates.level !== undefined) updateData.level = updates.level

  const { error } = await supabase
    .from('words')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating word:', error)
  }
}

export async function deleteWord(userId: string, id: string): Promise<void> {
  if (userId === 'guest') {
    deleteGuestWord(id)
    return
  }

  try {
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting word:', error)
      return
    }

    clearCache(userId)
  } catch (error) {
    console.error('Error in deleteWord:', error)
  }
}

export async function getStats(userId: string): Promise<UserStats> {
  if (userId === 'guest') {
    return getGuestStats()
  }

  try {
    const [wordsResult, statsResult, testResultsResult] = await Promise.all([
      supabase.from('words').select('level').eq('user_id', userId),
      supabase.from('user_stats').select('*').eq('user_id', userId).limit(1).maybeSingle(),
      supabase
        .from('test_results')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false }),
    ])

    const words = wordsResult.data || []
    const stats = statsResult.data
    const testResults = testResultsResult.data || []

    return {
      totalWords: words.length,
      wordsLearned: words.filter((w) => w.level >= 3).length,
      streak: stats?.streak || 0,
      lastTestDate: stats?.last_test_date || null,
      testResults: testResults.map((r) => ({
        date: r.date,
        totalWords: r.total_words,
        correctAnswers: r.correct_answers,
        incorrectAnswers: r.incorrect_answers,
      })),
    }
  } catch (error) {
    console.error('Error in getStats:', error)
    return {
      totalWords: 0,
      wordsLearned: 0,
      streak: 0,
      lastTestDate: null,
      testResults: [],
    }
  }
}

export async function recordTestResult(
  userId: string,
  totalWords: number,
  correctAnswers: number
): Promise<void> {
  if (userId === 'guest') {
    recordGuestTestResult(totalWords, correctAnswers)
    return
  }

  try {
    const today = new Date().toISOString().split('T')[0]

    const { data: currentStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Error fetching stats:', statsError)
      return
    }

    let newStreak = 1
    if (currentStats?.last_test_date) {
      const lastDate = new Date(currentStats.last_test_date)
      const todayDate = new Date(today)
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === 1) {
        newStreak = (currentStats.streak || 0) + 1
      } else if (diffDays === 0) {
        newStreak = currentStats.streak || 1
      }
    }

    const { error: upsertError } = await supabase
      .from('user_stats')
      .upsert(
        {
          user_id: userId,
          streak: newStreak,
          last_test_date: today,
        },
        { onConflict: 'user_id' }
      )

    if (upsertError) {
      console.error('Error upserting stats:', upsertError)
      return
    }

    const { error: insertError } = await supabase.from('test_results').insert({
      user_id: userId,
      date: today,
      total_words: totalWords,
      correct_answers: correctAnswers,
      incorrect_answers: totalWords - correctAnswers,
    })

    if (insertError) {
      console.error('Error inserting test result:', insertError)
    }
  } catch (error) {
    console.error('Error in recordTestResult:', error)
  }
}

export async function updateStreakOnVisit(userId: string): Promise<void> {
  if (userId === 'guest') {
    updateGuestStreakOnVisit()
    return
  }

  try {
    const today = new Date().toISOString().split('T')[0]

    const { data: currentStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Error fetching stats for visit:', statsError)
      return
    }

    let newStreak = 1
    if (currentStats?.last_test_date) {
      const lastDate = new Date(currentStats.last_test_date)
      const todayDate = new Date(today)
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === 1) {
        newStreak = (currentStats.streak || 0) + 1
      } else if (diffDays === 0) {
        newStreak = currentStats.streak || 1
      }
    }

    const { error: upsertError } = await supabase
      .from('user_stats')
      .upsert(
        {
          user_id: userId,
          streak: newStreak,
          last_test_date: today,
        },
        { onConflict: 'user_id' }
      )

    if (upsertError) {
      console.error('Error upserting visit stats:', upsertError)
    }
  } catch (error) {
    console.error('Error in updateStreakOnVisit:', error)
  }
}

export async function getWordsForTest(
  userId: string,
  count: number = 10
): Promise<Word[]> {
  if (userId === 'guest') {
    return getGuestWordsForTest(count)
  }

  const words = await getWords(userId)
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

    const weight = levelWeight * timeMultiplier

    return { word, weight }
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

export async function recordAnswer(
  userId: string,
  wordId: string,
  isCorrect: boolean
): Promise<void> {
  try {
    const words = await getWords(userId)
    const word = words.find((w) => w.id === wordId)
    if (!word) return

    const updates: Partial<Word> = {
      lastReviewed: new Date().toISOString(),
    }

    if (isCorrect) {
      updates.correctCount = word.correctCount + 1
      updates.level = Math.min(5, word.level + 1)
    } else {
      updates.incorrectCount = word.incorrectCount + 1
      updates.level = Math.max(0, word.level - 1)
    }

    await updateWord(userId, wordId, updates)
    clearCache(userId)
  } catch (error) {
    console.error('Error in recordAnswer:', error)
  }
}

export async function needsTestToday(userId: string): Promise<boolean> {
  if (userId === 'guest') {
    return guestNeedsTestToday()
  }

  const stats = await getStats(userId)
  if (!stats.lastTestDate) return true

  const today = new Date().toISOString().split('T')[0]
  return stats.lastTestDate !== today
}

export async function getBasicWords100(): Promise<Word[]> {
  return BASIC_WORDS_100.map(word => ({
    ...word,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    lastReviewed: null,
    correctCount: 0,
    incorrectCount: 0,
    level: 0
  }));
}

export async function getBasicWords500(): Promise<Word[]> {
  return BASIC_WORDS_500.map(word => ({
    ...word,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    lastReviewed: null,
    correctCount: 0,
    incorrectCount: 0,
    level: 0
  }));
}

export async function deleteAllWords(userId: string): Promise<void> {
  if (userId === 'guest') {
    deleteAllGuestWords()
    return
  }

  try {
    const { data: words, error: fetchError } = await supabase
      .from('words')
      .select('id')
      .eq('user_id', userId);
    
    if (fetchError) {
      console.error('Error fetching words for deletion:', fetchError);
      return;
    }
    
    if (!words || words.length === 0) {
      return;
    }
    
    const { error: deleteError } = await supabase
      .from('words')
      .delete()
      .in('id', words.map(w => w.id));
    
    if (deleteError) {
      console.error('Error deleting words:', deleteError);
      return;
    }
  } catch (error) {
    console.error('Error in deleteAllWords:', error)
  }
}

