'use client'

import { useState } from 'react'
import { GRAMMAR_TOPICS } from '@/lib/grammar-topics'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface LessonContent {
  explanation: string
  examples: { en: string; ru: string }[]
}

const LESSON_CONTENT: Record<string, LessonContent> = {
  'present-simple': {
    explanation: 'Present Simple (Настоящее простое время) используется для описания регулярных действий, привычек, расписаний и общих истин. В третьем лице единственного числа (he/she/it) к глаголу добавляется окончание -s или -es. Отрицание и вопрос образуются с помощью вспомогательного глагола do/does.',
    examples: [
      { en: 'I work every day.', ru: 'Я работаю каждый день.' },
      { en: 'She walks to school.', ru: 'Она ходит в школу пешком.' },
      { en: 'The sun rises in the east.', ru: 'Солнце встает на востоке.' },
      { en: 'They do not like coffee.', ru: 'Они не любят кофе.' },
      { en: 'Does he play football?', ru: 'Он играет в футбол?' },
    ],
  },
  'present-continuous': {
    explanation: 'Present Continuous (Настоящее длительное время) описывает действия, происходящие прямо сейчас или вокруг текущего момента. Также используется для запланированных будущих действий. Формула: am/is/are + глагол с окончанием -ing.',
    examples: [
      { en: 'I am reading a book now.', ru: 'Я сейчас читаю книгу.' },
      { en: 'They are playing football.', ru: 'Они играют в футбол (сейчас).' },
      { en: 'She is meeting him tomorrow.', ru: 'Она встречается с ним завтра (запланировано).' },
    ],
  },
  'past-simple': {
    explanation: 'Past Simple (Прошедшее простое время) используется для завершенных действий в прошлом с указанием времени. Правильные глаголы образуют форму прошедшего времени с помощью окончания -ed. Неправильные глаголы имеют свои формы (go → went, see → saw). Отрицание и вопрос — с помощью did.',
    examples: [
      { en: 'I watched TV yesterday.', ru: 'Я смотрел телевизор вчера.' },
      { en: 'She visited Paris last year.', ru: 'Она посетила Париж в прошлом году.' },
      { en: 'He went to the cinema.', ru: 'Он пошел в кино.' },
      { en: 'Did you see that movie?', ru: 'Ты видел тот фильм?' },
    ],
  },
  'future-simple': {
    explanation: 'Future Simple (Будущее простое время) используется для предсказаний, обещаний, спонтанных решений и угроз. Формула: will + глагол в начальной форме. Отрицание: will not (won\'t) + глагол.',
    examples: [
      { en: 'I will help you tomorrow.', ru: 'Я помогу тебе завтра.' },
      { en: 'It will rain later.', ru: 'Позже пойдет дождь.' },
      { en: 'I think she will come.', ru: 'Я думаю, она придет.' },
      { en: 'He won\'t be late.', ru: 'Он не опоздает.' },
    ],
  },
  'present-perfect': {
    explanation: 'Present Perfect (Настоящее совершенное время) связывает прошлое с настоящим. Используется для действий, результат которых важен сейчас, или для жизненного опыта. Формула: have/has + третья форма глагола (V3).',
    examples: [
      { en: 'I have lost my keys.', ru: 'Я потерял ключи (и сейчас их нет).' },
      { en: 'She has visited London twice.', ru: 'Она была в Лондоне дважды (в жизни).' },
      { en: 'Have you ever been to Paris?', ru: 'Ты когда-нибудь был в Париже?' },
    ],
  },
  'past-continuous': {
    explanation: 'Past Continuous (Прошедшее длительное время) описывает длительное действие в прошлом, которое было прервано другим (Past Simple), или действие, происходившее в конкретный момент в прошлом. Формула: was/were + глагол с -ing.',
    examples: [
      { en: 'I was reading when he called.', ru: 'Я читал, когда он позвонил.' },
      { en: 'They were playing at 5 PM.', ru: 'Они играли в 5 вечера.' },
      { en: 'While she was cooking, I was setting the table.', ru: 'Пока она готовила, я накрывал на стол.' },
    ],
  },
  'modal-verbs': {
    explanation: 'Модальные глаголы (can, must, should, may, might, have to) выражают возможность, необходимость, совет, разрешение или запрет. После модального глагола всегда используется глагол без частицы to. Вопрос образуется инверсией, отрицание — добавлением not.',
    examples: [
      { en: 'I can swim.', ru: 'Я умею плавать.' },
      { en: 'You must study hard.', ru: 'Ты должен усердно учиться.' },
      { en: 'We should eat healthy food.', ru: 'Нам следует есть здоровую пищу.' },
      { en: 'May I use your phone?', ru: 'Можно мне воспользоваться твоим телефоном?' },
      { en: 'You mustn\'t smoke here.', ru: 'Тебе нельзя курить здесь.' },
    ],
  },
  'articles': {
    explanation: 'Неопределенные артикли a/an используются с исчисляемыми существительными в единственном числе при первом упоминании (a — перед согласными, an — перед гласными). Определенный артикль the используется, когда предмет конкретный, уникальный или уже упоминался.',
    examples: [
      { en: 'I saw a cat. The cat was black.', ru: 'Я увидел кошку. Кошка была черной.' },
      { en: 'An apple a day keeps the doctor away.', ru: 'Яблоко в день — и ты здоров.' },
      { en: 'The sun is hot.', ru: 'Солнце горячее (уникальный объект).' },
      { en: 'She is the best student.', ru: 'Она лучшая ученица (единственная).' },
    ],
  },
  'prepositions': {
    explanation: 'Предлоги места (in, on, at, under, behind, next to, between) и времени (at — для точного времени, on — для дней/дат, in — для месяцев/лет/долгих периодов) показывают отношения между словами в предложении.',
    examples: [
      { en: 'The book is on the table.', ru: 'Книга на столе.' },
      { en: 'I was born in 1990.', ru: 'Я родился в 1990 году.' },
      { en: 'She lives in London.', ru: 'Она живет в Лондоне.' },
      { en: 'The meeting is at 3 PM.', ru: 'Встреча в 3 часа дня.' },
      { en: 'See you on Monday!', ru: 'Увидимся в понедельник!' },
    ],
  },
  'question-words': {
    explanation: 'Вопросительные слова (what — что/какой, where — где, when — когда, why — почему, how — как, who — кто, whose — чей, which — который) используются для получения информации. Они ставятся в начале предложения, после них идёт вспомогательный глагол (do/does/did/is/are и т.д.).',
    examples: [
      { en: 'Where do you live?', ru: 'Где ты живешь?' },
      { en: 'Why are you late?', ru: 'Почему ты опоздал?' },
      { en: 'How much does it cost?', ru: 'Сколько это стоит?' },
      { en: 'Whose book is this?', ru: 'Чья это книга?' },
      { en: 'Which color do you prefer?', ru: 'Какой цвет ты предпочитаешь?' },
    ],
  },
}

export default function GrammarPage() {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background pt-14 sm:pt-4">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Грамматика английского языка</h1>
          <p className="text-muted-foreground">
            Справочник по основным темам английской грамматики с примерами
          </p>
        </header>

        <div className="space-y-4">
          {GRAMMAR_TOPICS.map((topic, index) => {
            const isActive = activeTopicId === topic.id
            const lesson = LESSON_CONTENT[topic.id]

            return (
              <div key={topic.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveTopicId(isActive ? null : topic.id)}
                  className="w-full p-4 text-left flex items-start gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full">
                    <span className="text-primary font-bold text-sm">{index + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-primary">{topic.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded shrink-0 ml-2 ${topic.level === 'beginner' ? 'bg-blue-500/20 text-blue-500' : topic.level === 'intermediate' ? 'bg-purple-500/20 text-purple-500' : 'bg-red-500/20 text-red-500'}`}>
                        {topic.level === 'beginner' ? 'Начальный' : topic.level === 'intermediate' ? 'Средний' : 'Продвинутый'}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {topic.description}
                    </p>
                  </div>

                  <div className="flex-shrink-0 mt-1">
                    {isActive ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isActive && lesson && (
                  <div className="border-t border-border px-4 pb-4 pt-4 bg-muted/20">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Объяснение</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{lesson.explanation}</p>
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
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}