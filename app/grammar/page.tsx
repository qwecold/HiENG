'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { GRAMMAR_TOPICS, GrammarTopic } from '@/lib/grammar-topics'
import { ChevronDown, ChevronUp, Check, Lock, BookOpen } from 'lucide-react'

interface LessonContent {
  explanation: string
  examples: { en: string; ru: string }[]
  exercise: { question: string; answer: string; hint: string }
}

const LESSON_CONTENT: Record<string, LessonContent> = {
  'present-simple': {
    explanation: 'Present Simple используется для описания регулярных действий, привычек и общих истин. В третьем лице единственного числа (he/she/it) к глаголу добавляется окончание -s или -es.',
    examples: [
      { en: 'I work every day.', ru: 'Я работаю каждый день.' },
      { en: 'She walks to school.', ru: 'Она ходит в школу пешком.' },
      { en: 'The sun rises in the east.', ru: 'Солнце встает на востоке.' },
    ],
    exercise: { question: 'He (work) in a bank.', answer: 'works', hint: '3-е лицо ед. числа — добавьте -s' }
  },
  'present-continuous': {
    explanation: 'Present Continuous описывает действия, происходящие прямо сейчас или вокруг текущего момента. Формула: am/is/are + глагол с окончанием -ing.',
    examples: [
      { en: 'I am reading a book now.', ru: 'Я сейчас читаю книгу.' },
      { en: 'They are playing football.', ru: 'Они играют в футбол.' },
    ],
    exercise: { question: 'Look! It (rain).', answer: 'is raining', hint: 'Действие происходит прямо сейчас' }
  },
  'past-simple': {
    explanation: 'Past Simple используется для завершенных действий в прошлом. Правильные глаголы образуют форму прошедшего времени с помощью окончания -ed.',
    examples: [
      { en: 'I watched TV yesterday.', ru: 'Я смотрел телевизор вчера.' },
      { en: 'She visited Paris last year.', ru: 'Она посетила Париж в прошлом году.' },
    ],
    exercise: { question: 'We (play) tennis yesterday.', answer: 'played', hint: 'Прошедшее время правильного глагола — добавьте -ed' }
  },
  'future-simple': {
    explanation: 'Future Simple используется для предсказаний, обещаний или спонтанных решений. Формула: will + глагол в начальной форме.',
    examples: [
      { en: 'I will help you tomorrow.', ru: 'Я помогу тебе завтра.' },
      { en: 'It will rain later.', ru: 'Позже пойдет дождь.' },
    ],
    exercise: { question: 'I think she (come) to the party.', answer: 'will come', hint: 'Используйте will + глагол' }
  },
  'present-perfect': {
    explanation: 'Present Perfect связывает прошлое с настоящим. Формула: have/has +过去分词 (V3). Используется для действий, результат которых важен сейчас.',
    examples: [
      { en: 'I have lost my keys.', ru: 'Я потерял ключи (и сейчас их нет).' },
      { en: 'She has visited London twice.', ru: 'Она была в Лондоне дважды.' },
    ],
    exercise: { question: 'They (finish) the project.', answer: 'have finished', hint: 'Have/Has + V3' }
  },
  'past-continuous': {
    explanation: 'Past Continuous описывает длительное действие в прошлом, часто прерванное другим. Формула: was/were + глагол с -ing.',
    examples: [
      { en: 'I was reading when he called.', ru: 'Я читал, когда он позвонил.' },
      { en: 'They were playing at 5 PM.', ru: 'Они играли в 5 вечера.' },
    ],
    exercise: { question: 'She (sleep) when the phone rang.', answer: 'was sleeping', hint: 'Was/Were + V-ing' }
  },
  'modal-verbs': {
    explanation: 'Модальные глаголы (can, must, should, may) выражают возможность, необходимость, совет или разрешение. После них глагол всегда используется без частицы to.',
    examples: [
      { en: 'I can swim.', ru: 'Я умею плавать.' },
      { en: 'You must study hard.', ru: 'Ты должен усердно учиться.' },
      { en: 'We should eat healthy food.', ru: 'Нам следует есть здоровую пищу.' },
    ],
    exercise: { question: 'You (should / must) see a doctor if you feel ill.', answer: 'should', hint: 'Совет vs строгая необходимость' }
  },
  'articles': {
    explanation: 'Артикли a/an используются с исчисляемыми существительными в единственном числе при первом упоминании. Артикль the используется, когда предмет конкретный или уже упоминался.',
    examples: [
      { en: 'I saw a cat. The cat was black.', ru: 'Я увидел кошку. Кошка была черной.' },
      { en: 'An apple a day keeps the doctor away.', ru: 'Яблоко в день — и ты здоров.' },
    ],
    exercise: { question: 'She is ___ best student in ___ class.', answer: 'the / the', hint: 'Определенный артикль для конкретики' }
  },
  'prepositions': {
    explanation: 'Предлоги места (in, on, at, under, behind) и времени (at 5 o\'clock, on Monday, in July) показывают отношения между словами в предложении.',
    examples: [
      { en: 'The book is on the table.', ru: 'Книга на столе.' },
      { en: 'I was born in 1990.', ru: 'Я родился в 1990 году.' },
    ],
    exercise: { question: 'The cat is hiding ___ the bed.', answer: 'under', hint: 'Под чем-то' }
  },
  'question-words': {
    explanation: 'Вопросительные слова (what, where, when, why, how, who) используются для получения информации. Они ставятся в начале предложения.',
    examples: [
      { en: 'Where do you live?', ru: 'Где ты живешь?' },
      { en: 'Why are you late?', ru: 'Почему ты опоздал?' },
    ],
    exercise: { question: '___ is your favorite color?', answer: 'What', hint: 'Какой / Что' }
  },
}

export default function GrammarPage() {
  const { user } = useAuth()
  const [topics, setTopics] = useState<GrammarTopic[]>([])
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  useEffect(() => {
    const savedProgress = localStorage.getItem('grammar-progress')
    let completedIds: string[] = []
    if (savedProgress) {
      try {
        completedIds = JSON.parse(savedProgress)
      } catch { /* ignore */ }
    }

    const updatedTopics = GRAMMAR_TOPICS.map(topic => ({
      ...topic,
      completed: completedIds.includes(topic.id),
    }))
    
    const finalTopics = updatedTopics.map(topic => {
      if (!topic.prerequisiteIds) return topic
      const prerequisitesMet = topic.prerequisiteIds.every(prereqId => {
        const prereqTopic = updatedTopics.find(t => t.id === prereqId)
        return prereqTopic?.completed ?? false
      })
      return { ...topic, locked: !prerequisitesMet && !topic.completed }
    })
      
    setTopics(finalTopics)
  }, [])

  const completeTopic = (topicId: string) => {
    const savedProgress = localStorage.getItem('grammar-progress')
    let completedIds: string[] = []
    if (savedProgress) {
      try { completedIds = JSON.parse(savedProgress) } catch { /* ignore */ }
    }
    if (!completedIds.includes(topicId)) {
      completedIds.push(topicId)
      localStorage.setItem('grammar-progress', JSON.stringify(completedIds))
    }

    setTopics(prev => prev.map(t => {
      if (t.id === topicId) return { ...t, completed: true, locked: false }
      if (t.prerequisiteIds?.includes(topicId)) {
        const prereqsMet = t.prerequisiteIds.every(pid => {
          const p = topics.find(x => x.id === pid) ?? prev.find(x => x.id === pid)
          return p?.completed || pid === topicId
        })
        if (prereqsMet) return { ...t, locked: false }
      }
      return t
    }))
    setActiveTopicId(null)
    setUserAnswer('')
    setShowResult(false)
  }

  const checkExercise = (topicId: string) => {
    const lesson = LESSON_CONTENT[topicId]
    if (!lesson) return
    const correct = userAnswer.toLowerCase().trim() === lesson.exercise.answer.toLowerCase().trim()
    setIsCorrect(correct)
    setShowResult(true)
    if (correct) {
      setTimeout(() => completeTopic(topicId), 1200)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Войдите, чтобы изучать грамматику</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-14 sm:pt-4">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Дорожная карта грамматики</h1>
          <p className="text-muted-foreground">
            Изучайте основы английской грамматики пошагово
          </p>
        </header>

        <div className="space-y-4">
          {topics.map((topic, index) => {
            const isActive = activeTopicId === topic.id
            const lesson = LESSON_CONTENT[topic.id]

            return (
              <div key={topic.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {topic.completed ? (
                        <div className="w-8 h-8 flex items-center justify-center bg-green-500/20 rounded-full">
                          <Check className="w-4 h-4 text-green-500" />
                        </div>
                      ) : topic.locked ? (
                        <div className="w-8 h-8 flex items-center justify-center bg-muted/50 rounded-full">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full">
                          <span className="text-primary font-bold text-sm">{index + 1}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold ${topic.completed ? 'text-green-500' : topic.locked ? 'text-muted-foreground' : 'text-primary'}`}>
                          {topic.title}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${topic.level === 'beginner' ? 'bg-blue-500/20 text-blue-500' : topic.level === 'intermediate' ? 'bg-purple-500/20 text-purple-500' : 'bg-red-500/20 text-red-500'}`}>
                          {topic.level === 'beginner' ? 'Начальный' : topic.level === 'intermediate' ? 'Средний' : 'Продвинутый'}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {topic.description}
                      </p>

                      {!topic.completed && !topic.locked && (
                        <button
                          onClick={() => {
                            setActiveTopicId(isActive ? null : topic.id)
                            setUserAnswer('')
                            setShowResult(false)
                          }}
                          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          <BookOpen className="w-4 h-4" />
                          {isActive ? 'Свернуть урок' : 'Начать урок'}
                          {isActive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}

                      {topic.locked && (
                        <p className="text-xs text-muted-foreground">Завершите предварительные темы, чтобы открыть</p>
                      )}

                      {topic.completed && (
                        <p className="text-xs text-green-500 font-medium">Урок завершён</p>
                      )}
                    </div>
                  </div>
                </div>

                {isActive && lesson && (
                  <div className="border-t border-border px-4 pb-4 pt-4 bg-muted/20">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Объяснение</h4>
                        <p className="text-sm text-muted-foreground">{lesson.explanation}</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Примеры</h4>
                        <div className="space-y-2">
                          {lesson.examples.map((ex, i) => (
                            <div key={i} className="bg-card border border-border rounded-lg p-3">
                              <p className="text-sm font-medium">{ex.en}</p>
                              <p className="text-sm text-muted-foreground">{ex.ru}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Практическое задание</h4>
                        <p className="text-sm mb-2">{lesson.exercise.question}</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => {
                              setUserAnswer(e.target.value)
                              setShowResult(false)
                            }}
                            placeholder="Ваш ответ..."
                            className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !showResult) {
                                checkExercise(topic.id)
                              }
                            }}
                          />
                          <button
                            onClick={() => checkExercise(topic.id)}
                            disabled={showResult}
                            className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
                          >
                            Проверить
                          </button>
                        </div>
                        {showResult && (
                          <p className={`text-sm mt-2 ${isCorrect ? 'text-green-500' : 'text-red-400'}`}>
                            {isCorrect ? 'Правильно! Урок завершён.' : `Неправильно. Подсказка: ${lesson.exercise.hint}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        <div className="mt-8 pt-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-4">Ваш прогресс</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Завершено тем</span>
              <span className="text-sm font-mono">{topics.filter(t => t.completed).length}/{topics.length}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(topics.filter(t => t.completed).length / topics.length) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round((topics.filter(t => t.completed).length / topics.length) * 100)}% завершено
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}