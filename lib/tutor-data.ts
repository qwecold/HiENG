export interface TutorTask {
  id: string
  type: 'vocabulary' | 'grammar' | 'translation' | 'fill-blanks' | 'phrasal-verb' | 'it-term'
  title: string
  instruction: string
  content: string
  answer: string
  explanation: string
  level: 'beginner' | 'intermediate' | 'advanced'
}

export function generateDailyTask(words: { english: string; russian: string }[], grammarTopics: string[]): TutorTask {
  const taskTypes: Array<'vocabulary' | 'grammar' | 'translation' | 'fill-blanks' | 'phrasal-verb' | 'it-term'> = [
    'vocabulary', 'grammar', 'translation', 'fill-blanks', 'phrasal-verb', 'it-term'
  ]
  const selectedType = taskTypes[Math.floor(Math.random() * taskTypes.length)]

  // Vocabulary task from user words
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

  // IT term task
  if (selectedType === 'it-term' && words.length >= 3) {
    const itWords = words.filter(w => 
      w.english.toLowerCase().includes('code') || 
      w.english.toLowerCase().includes('data') ||
      w.english.toLowerCase().includes('soft') ||
      w.english.toLowerCase().includes('web') ||
      w.english.toLowerCase().includes('app')
    )
    
    const targetWord = itWords.length > 0 
      ? itWords[Math.floor(Math.random() * itWords.length)]
      : words[Math.floor(Math.random() * words.length)]
    
    return {
      id: `it-${Date.now()}`,
      type: 'it-term',
      title: 'IT-термин',
      instruction: `Что означает термин "${targetWord.english}"?`,
      content: targetWord.english,
      answer: targetWord.russian,
      explanation: `Термин "${targetWord.english}" на русском — "${targetWord.russian}"`,
      level: 'intermediate',
    }
  }

  // Phrasal verb task
  if (selectedType === 'phrasal-verb' && words.length >= 3) {
    const phrasalWords = words.filter(w => 
      w.english.includes(' ') && 
      (w.english.includes('up') || w.english.includes('off') || w.english.includes('out') || w.english.includes('in'))
    )
    
    const targetWord = phrasalWords.length > 0
      ? phrasalWords[Math.floor(Math.random() * phrasalWords.length)]
      : words[Math.floor(Math.random() * words.length)]
    
    return {
      id: `phrasal-${Date.now()}`,
      type: 'phrasal-verb',
      title: 'Фразовый глагол',
      instruction: `Переведите фразовый глагол "${targetWord.english}"`,
      content: targetWord.english,
      answer: targetWord.russian,
      explanation: `"${targetWord.english}" означает "${targetWord.russian}"`,
      level: 'intermediate',
    }
  }

  // Grammar task
  if (selectedType === 'grammar' && grammarTopics.length > 0) {
    const grammarTasks: Record<string, TutorTask> = {
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
      'passive-voice': {
        id: `grammar-passive-${Date.now()}`,
        type: 'fill-blanks',
        title: 'Passive Voice',
        instruction: 'Переведите в пассивный залог: "They built this house in 1990"',
        content: 'They built this house in 1990',
        answer: 'This house was built in 1990',
        explanation: 'Пассив: объект + was/were + V3 + by + субъект (можно опустить)',
        level: 'intermediate',
      },
      'modal-verbs': {
        id: `grammar-modal-${Date.now()}`,
        type: 'fill-blanks',
        title: 'Модальные глаголы',
        instruction: 'Вставьте правильный модальный глагол (must, should, can, may)',
        content: 'You ___ study harder. You ___ drive fast here.',
        answer: 'should, must not',
        explanation: 'should — совет, must not — запрет',
        level: 'intermediate',
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
