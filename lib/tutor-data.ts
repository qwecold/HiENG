export interface TutorTask {
  id: string
  type: 'vocabulary' | 'grammar' | 'translation' | 'fill-blanks'
  title: string
  instruction: string
  content: string
  answer: string
  explanation: string
  level: 'beginner' | 'intermediate' | 'advanced'
}

export function generateDailyTask(words: { english: string; russian: string }[], grammarTopics: string[]): TutorTask {
  const taskTypes: Array<'vocabulary' | 'grammar' | 'translation' | 'fill-blanks'> = ['vocabulary', 'grammar', 'translation', 'fill-blanks']
  const selectedType = taskTypes[Math.floor(Math.random() * taskTypes.length)]

  // Vocabulary task
  if (selectedType === 'vocabulary' && words.length >= 3) {
    const targetWord = words[Math.floor(Math.random() * words.length)]
    const wrongTranslations = words
      .filter(w => w.english !== targetWord.english)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .map(w => w.russian)
    
    const options = [targetWord.russian, ...wrongTranslations].sort(() => Math.random() - 0.5)
    
    return {
      id: `vocab-${Date.now()}`,
      type: 'vocabulary',
      title: 'Перевод слова',
      instruction: `Выберите правильный перевод слова "${targetWord.english}"`,
      content: options.map((opt, i) => `${i + 1}. ${opt}`).join('\n'),
      answer: targetWord.russian,
      explanation: `"${targetWord.english}" переводится как "${targetWord.russian}"`,
      level: 'beginner',
    }
  }

  // Grammar task
  if (selectedType === 'grammar' && grammarTopics.length > 0) {
    const grammarTasks: Record<string, TutorTask> = {
      'to-be': {
        id: `grammar-to-be-${Date.now()}`,
        type: 'fill-blanks',
        title: 'Глагол to be',
        instruction: 'Вставьте правильную форму глагола to be (am, is, are, was, were)',
        content: 'She ___ a teacher. They ___ at home yesterday.',
        answer: 'is, were',
        explanation: 'Present Simple: She is... Past Simple: They were...',
        level: 'beginner',
      },
      'present-simple': {
        id: `grammar-present-${Date.now()}`,
        type: 'fill-blanks',
        title: 'Present Simple',
        instruction: 'Раскройте скобки, поставив глагол в Present Simple',
        content: 'He ___ (work) every day. She ___ (not like) coffee.',
        answer: 'works, does not like',
        explanation: 'В Present Simple для he/she/it добавляем -s. Отрицание: does not + глагол',
        level: 'beginner',
      },
      'past-simple': {
        id: `grammar-past-${Date.now()}`,
        type: 'fill-blanks',
        title: 'Past Simple',
        instruction: 'Поставьте глаголы в Past Simple',
        content: 'I ___ (go) to the store. She ___ (eat) breakfast.',
        answer: 'went, ate',
        explanation: 'went — неправильная форма go. ate — неправильная форма eat',
        level: 'beginner',
      },
      'present-perfect': {
        id: `grammar-perfect-${Date.now()}`,
        type: 'fill-blanks',
        title: 'Present Perfect',
        instruction: 'Раскройте скобки в Present Perfect',
        content: 'I ___ (just finish) my homework. She ___ (never be) to Paris.',
        answer: 'have just finished, has never been',
        explanation: 'have/has + V3 (прошедшая форма глагола)',
        level: 'intermediate',
      },
      'conditionals': {
        id: `grammar-conditional-${Date.now()}`,
        type: 'translation',
        title: 'Условные предложения',
        instruction: 'Переведите на английский: "Если бы я знал, я бы сказал"',
        content: 'Если бы я знал, я бы сказал',
        answer: 'If I had known, I would have told',
        explanation: 'Третий тип условных: If + Past Perfect, would have + V3',
        level: 'advanced',
      },
    }

    const topic = grammarTopics[Math.floor(Math.random() * grammarTopics.length)]
    const task = grammarTasks[topic] || grammarTasks['present-simple']
    return task
  }

  // Translation task
  if (selectedType === 'translation' && words.length >= 2) {
    const sentenceWords = words.slice(0, Math.min(3, words.length))
    const russianSentence = sentenceWords.map(w => w.russian).join(' ')
    const englishSentence = sentenceWords.map(w => w.english).join(' ')

    return {
      id: `trans-${Date.now()}`,
      type: 'translation',
      title: 'Перевод фразы',
      instruction: 'Переведите на английский',
      content: russianSentence,
      answer: englishSentence,
      explanation: `Прямой перевод: "${russianSentence}" → "${englishSentence}"`,
      level: 'intermediate',
    }
  }

  // Fallback: vocabulary
  const fallbackWord = words[0] || { english: 'hello', russian: 'привет' }
  return {
    id: `vocab-${Date.now()}`,
    type: 'vocabulary',
    title: 'Перевод слова',
    instruction: `Что означает слово "${fallbackWord.english}"?`,
    content: fallbackWord.english,
    answer: fallbackWord.russian,
    explanation: `"${fallbackWord.english}" = "${fallbackWord.russian}"`,
    level: 'beginner',
  }
}
