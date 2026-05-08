import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

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

export async function getWords(userId: string): Promise<Word[]> {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching words:', error)
    return []
  }

  return data.map((w) => ({
    id: w.id,
    english: w.english,
    russian: w.russian,
    createdAt: w.created_at,
    lastReviewed: w.last_reviewed,
    correctCount: w.correct_count,
    incorrectCount: w.incorrect_count,
    level: w.level,
  }))
}

export async function addWord(
  userId: string,
  english: string,
  russian: string
): Promise<Word | null> {
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

  return {
    id: data.id,
    english: data.english,
    russian: data.russian,
    createdAt: data.created_at,
    lastReviewed: data.last_reviewed,
    correctCount: data.correct_count,
    incorrectCount: data.incorrect_count,
    level: data.level,
  }
}

export async function updateWord(
  userId: string,
  id: string,
  updates: Partial<Word>
): Promise<void> {
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
  const { error } = await supabase
    .from('words')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting word:', error)
  }
}

export async function getStats(userId: string): Promise<UserStats> {
  const [wordsResult, statsResult, testResultsResult] = await Promise.all([
    supabase.from('words').select('level').eq('user_id', userId),
    supabase.from('user_stats').select('*').eq('user_id', userId).single(),
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
}

export async function recordTestResult(
  userId: string,
  totalWords: number,
  correctAnswers: number
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  const { data: currentStats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

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

  await supabase.from('user_stats').upsert({
    user_id: userId,
    streak: newStreak,
    last_test_date: today,
  })

  await supabase.from('test_results').insert({
    user_id: userId,
    date: today,
    total_words: totalWords,
    correct_answers: correctAnswers,
    incorrect_answers: totalWords - correctAnswers,
  })
}

export async function getWordsForTest(
  userId: string,
  count: number = 10
): Promise<Word[]> {
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
}

export async function needsTestToday(userId: string): Promise<boolean> {
  const stats = await getStats(userId)
  if (!stats.lastTestDate) return true

  const today = new Date().toISOString().split('T')[0]
  return stats.lastTestDate !== today
}
