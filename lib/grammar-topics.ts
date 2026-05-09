export interface GrammarTopic {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  completed: boolean
  locked: boolean
  prerequisiteIds?: string[]
}

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: 'to-be',
    title: 'Глагол to be',
    description: 'Формы am, is, are, was, were — самый важный глагол английского',
    level: 'beginner',
    completed: false,
    locked: false,
  },
  {
    id: 'articles',
    title: 'Articles',
    description: 'Артикли a, an, the',
    level: 'beginner',
    completed: false,
    locked: false,
  },
  {
    id: 'present-simple',
    title: 'Present Simple',
    description: 'Основы настоящего простого времени',
    level: 'beginner',
    completed: false,
    locked: false,
  },
  {
    id: 'present-continuous',
    title: 'Present Continuous',
    description: 'Настоящее длительное время',
    level: 'beginner',
    completed: false,
    locked: false,
  },
  {
    id: 'past-simple',
    title: 'Past Simple',
    description: 'Прошедшее простое время',
    level: 'beginner',
    completed: false,
    locked: false,
  },
  {
    id: 'future-simple',
    title: 'Future Simple',
    description: 'Будущее простое время',
    level: 'beginner',
    completed: false,
    locked: false,
  },
  {
    id: 'modal-verbs',
    title: 'Modal Verbs',
    description: 'Модальные глаголы (can, must, should, etc.)',
    level: 'beginner',
    completed: false,
    locked: false,
  },
  {
    id: 'there-is-are',
    title: 'There is / There are',
    description: 'Как сказать «есть» или «находится»',
    level: 'beginner',
    completed: false,
    locked: false,
  },
  {
    id: 'prepositions',
    title: 'Prepositions',
    description: 'Предлоги места и времени',
    level: 'beginner',
    completed: false,
    locked: false,
  },
  {
    id: 'question-words',
    title: 'Question Words',
    description: 'Вопросительные слова (what, where, when, why, how)',
    level: 'beginner',
    completed: false,
    locked: false,
  },
  {
    id: 'possessive-pronouns',
    title: 'Possessive Pronouns',
    description: 'Притяжательные местоимения (my, your, his, her, its, our, their)',
    level: 'beginner',
    completed: false,
    locked: false,
  },
  {
    id: 'demonstrative-pronouns',
    title: 'Demonstrative Pronouns',
    description: 'Указательные местоимения (this, that, these, those)',
    level: 'beginner',
    completed: false,
    locked: false,
  },
  {
    id: 'countable-uncountable',
    title: 'Countable / Uncountable Nouns',
    description: 'Исчисляемые и неисчисляемые существительные',
    level: 'beginner',
    completed: false,
    locked: false,
  },
  {
    id: 'comparative-superlative',
    title: 'Comparative & Superlative',
    description: 'Сравнительная и превосходная степени прилагательных',
    level: 'beginner',
    completed: false,
    locked: false,
  },
  {
    id: 'present-perfect',
    title: 'Present Perfect',
    description: 'Настоящее совершённое время',
    level: 'intermediate',
    completed: false,
    locked: false,
  },
  {
    id: 'past-continuous',
    title: 'Past Continuous',
    description: 'Прошедшее длительное время',
    level: 'intermediate',
    completed: false,
    locked: false,
  },
]