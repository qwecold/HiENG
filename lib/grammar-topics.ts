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
    locked: true,
    prerequisiteIds: ['present-simple'],
  },
  {
    id: 'past-simple',
    title: 'Past Simple',
    description: 'Прошедшее простое время',
    level: 'beginner',
    completed: false,
    locked: true,
    prerequisiteIds: ['present-simple'],
  },
  {
    id: 'future-simple',
    title: 'Future Simple',
    description: 'Будущее простое время',
    level: 'beginner',
    completed: false,
    locked: true,
    prerequisiteIds: ['present-simple'],
  },
  {
    id: 'present-perfect',
    title: 'Present Perfect',
    description: 'Настоящее совершённое время',
    level: 'intermediate',
    completed: false,
    locked: true,
    prerequisiteIds: ['past-simple'],
  },
  {
    id: 'past-continuous',
    title: 'Past Continuous',
    description: 'Прошедшее длительное время',
    level: 'intermediate',
    completed: false,
    locked: true,
    prerequisiteIds: ['past-simple'],
  },
  {
    id: 'modal-verbs',
    title: 'Modal Verbs',
    description: 'Модальные глаголы (can, must, should, etc.)',
    level: 'beginner',
    completed: false,
    locked: true,
    prerequisiteIds: ['present-simple'],
  },
  {
    id: 'articles',
    title: 'Articles',
    description: 'Артикли a, an, the',
    level: 'beginner',
    completed: false,
    locked: true,
    prerequisiteIds: ['present-simple'],
  },
  {
    id: 'prepositions',
    title: 'Prepositions',
    description: 'Предлоги места и времени',
    level: 'beginner',
    completed: false,
    locked: true,
    prerequisiteIds: ['present-simple'],
  },
  {
    id: 'question-words',
    title: 'Question Words',
    description: 'Вопросительные слова (what, where, when, why, how)',
    level: 'beginner',
    completed: false,
    locked: true,
    prerequisiteIds: ['present-simple'],
  },
]