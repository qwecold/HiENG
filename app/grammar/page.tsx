'use client'

import { useState } from 'react'
import { GRAMMAR_TOPICS } from '@/lib/grammar-topics'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface LessonContent {
  explanation: string
  examples: { en: string; ru: string }[]
}

const LESSON_CONTENT: Record<string, LessonContent> = {
  'to-be': {
    explanation: 'Глагол to be — самый важный глагол в английском. Он связывает подлежащее с дополнением и показывает состояние, местоположение или характеристику. Формы: am (I), is (he/she/it), are (we/you/they) — настоящее время; was (I/he/she/it), were (we/you/they) — прошедшее время. Отрицание: am not, is not (isn\'t), are not (aren\'t), was not (wasn\'t), were not (weren\'t).',
    examples: [
      { en: 'I am a student.', ru: 'Я студент.' },
      { en: 'She is happy today.', ru: 'Она сегодня счастлива.' },
      { en: 'They are in the park.', ru: 'Они в парке.' },
      { en: 'He was tired yesterday.', ru: 'Он вчера устал.' },
      { en: 'We were at home.', ru: 'Мы были дома.' },
      { en: 'Is this your book?', ru: 'Это твоя книга?' },
      { en: 'They are not ready.', ru: 'Они не готовы.' },
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
  'there-is-are': {
    explanation: 'Конструкция There is / There are используется, чтобы сказать, что что-то «есть» или «находится» где-то. There is — с единственным числом, There are — с множественным. Вопрос: Is there...? / Are there...? Отрицание: There is not (isn\'t) / There are not (aren\'t).',
    examples: [
      { en: 'There is a book on the table.', ru: 'На столе есть книга.' },
      { en: 'There are three cats in the garden.', ru: 'В саду три кошки.' },
      { en: 'Is there a bank near here?', ru: 'Здесь рядом есть банк?' },
      { en: 'There isn\'t any milk in the fridge.', ru: 'В холодильнике нет молока.' },
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
  'possessive-pronouns': {
    explanation: 'Притяжательные местоимения показывают принадлежность: my (мой), your (твой/ваш), his (его), her (её), its (его/её — для неодушевлённых), our (наш), their (их). Они всегда стоят перед существительным.',
    examples: [
      { en: 'This is my book.', ru: 'Это моя книга.' },
      { en: 'Her car is red.', ru: 'Её машина красная.' },
      { en: 'Their house is big.', ru: 'Их дом большой.' },
      { en: 'Our teacher is kind.', ru: 'Наш учитель добрый.' },
    ],
  },
  'demonstrative-pronouns': {
    explanation: 'Указательные местоимения this (этот) и these (эти) указывают на близкие предметы, that (тот) и those (те) — на далёкие. This/that — с единственным числом, these/those — с множественным.',
    examples: [
      { en: 'This is my phone.', ru: 'Это мой телефон.' },
      { en: 'That building is very old.', ru: 'То здание очень старое.' },
      { en: 'These apples are fresh.', ru: 'Эти яблоки свежие.' },
      { en: 'Those shoes are expensive.', ru: 'Те туфли дорогие.' },
    ],
  },
  'countable-uncountable': {
    explanation: 'Исчисляемые существительные (countable) можно посчитать: one apple, two books. С ними используются a/an и множественное число. Неисчисляемые (uncountable) — нельзя посчитать: water, money, information. Они не имеют множественного числа и используются с some/much/a little.',
    examples: [
      { en: 'I have two apples.', ru: 'У меня два яблока.' },
      { en: 'Can I have some water?', ru: 'Можно мне немного воды?' },
      { en: 'There isn\'t much sugar.', ru: 'Там не много сахара.' },
      { en: 'She gave me good advice.', ru: 'Она дала мне хороший совет.' },
    ],
  },
  'comparative-superlative': {
    explanation: 'Сравнительная степень (comparative) сравнивает два предмета: tall → taller, interesting → more interesting. Превосходная степень (superlative) выделяет один предмет среди всех: tall → the tallest, interesting → the most interesting. Односложные прилагательные — -er/-est, многосложные — more/most.',
    examples: [
      { en: 'This book is better than that one.', ru: 'Эта книга лучше той.' },
      { en: 'She is the smartest student in class.', ru: 'Она самая умная ученица в классе.' },
      { en: 'Today is colder than yesterday.', ru: 'Сегодня холоднее, чем вчера.' },
      { en: 'This is the most expensive restaurant.', ru: 'Это самый дорогой ресторан.' },
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
  'present-perfect-continuous': {
    explanation: 'Present Perfect Continuous (Настоящее совершённое длительное) подчёркивает длительность действия, которое началось в прошлом и только что закончилось или всё ещё продолжается. Формула: have/has been + V-ing. Часто используется с how long, for, since.',
    examples: [
      { en: 'I have been studying English for five years.', ru: 'Я изучаю английский уже пять лет (и продолжаю).' },
      { en: 'She is tired because she has been working all day.', ru: 'Она устала, потому что работала весь день.' },
      { en: 'How long have you been waiting?', ru: 'Как долго ты ждёшь?' },
    ],
  },
  'past-perfect': {
    explanation: 'Past Perfect (Прошедшее совершённое) используется, когда нужно показать, что одно действие в прошлом произошло раньше другого. Формула: had + V3. Часто встречается вместе с before, after, when, by the time.',
    examples: [
      { en: 'When I arrived, the train had already left.', ru: 'Когда я прибыл, поезд уже ушёл.' },
      { en: 'She had finished her homework before dinner.', ru: 'Она закончила домашку до ужина.' },
      { en: 'I realized I had forgotten my keys.', ru: 'Я понял, что забыл ключи.' },
    ],
  },
  'future-forms': {
    explanation: 'В английском есть три основных способа выразить будущее: will — для спонтанных решений и предсказаний; be going to — для намерений и очевидных предзнаменований; Present Continuous — для запланированных действий.',
    examples: [
      { en: 'I will help you. (спонтанное)', ru: 'Я помогу тебе.' },
      { en: 'I am going to study medicine. (намерение)', ru: 'Я собираюсь изучать медицину.' },
      { en: 'Look at those clouds! It is going to rain. (предзнаменование)', ru: 'Смотри на тучи! Сейчас пойдёт дождь.' },
      { en: 'I am meeting him tomorrow. (запланировано)', ru: 'Я встречаюсь с ним завтра.' },
    ],
  },
  'passive-voice': {
    explanation: 'Passive Voice (Страдательный залог) используется, когда важно не кто совершил действие, а что произошло. Формула: to be + V3. Время определяется формой to be.',
    examples: [
      { en: 'The cake was eaten by the children.', ru: 'Торт был съеден детьми.' },
      { en: 'This book was written in 1920.', ru: 'Эта книга была написана в 1920 году.' },
      { en: 'The window has been broken.', ru: 'Окно разбито (неважно кем).' },
      { en: 'My car is being repaired.', ru: 'Мою машину сейчас ремонтируют.' },
    ],
  },
  'conditionals': {
    explanation: 'Conditionals (Условные предложения): Zero — общие истины (If you heat water, it boils); First — реальные будущие (If it rains, I will stay); Second — нереальные настоящие (If I were rich, I would travel); Third — нереальные прошлые (If I had known, I would have told).',
    examples: [
      { en: 'If you mix blue and yellow, you get green.', ru: 'Если смешать синий и жёлтый, получится зелёный.' },
      { en: 'If I win the lottery, I will buy a house.', ru: 'Если выиграю в лотерею, куплю дом.' },
      { en: 'If I were you, I would apologize.', ru: 'На твоём месте я бы извинился.' },
      { en: 'If she had studied harder, she would have passed.', ru: 'Если бы она училась усерднее, она бы сдала.' },
    ],
  },
  'reported-speech': {
    explanation: 'Reported Speech (Косвенная речь) — передача чужих слов без прямых кавычек. Глаголы отодвигаются на шаг назад во времени (Present → Past), местоимения и обстоятельства времени меняются (now → then, here → there, today → that day).',
    examples: [
      { en: '"I am tired," she said. → She said (that) she was tired.', ru: '«Я устала», — сказала она. → Она сказала, что устала.' },
      { en: '"I will call you tomorrow," he said. → He said he would call me the next day.', ru: '«Я позвоню тебе завтра», — сказал он. → Он сказал, что позвонит мне на следующий день.' },
      { en: '"Did you see that?" she asked. → She asked if I had seen that.', ru: '«Ты это видел?» — спросила она. → Она спросила, видел ли я это.' },
    ],
  },
  'gerund-infinitive': {
    explanation: 'Gerund (V-ing) используется после предлогов и некоторых глаголов (enjoy, avoid, finish, mind). Infinitive (to + V) используется после других глаголов (want, decide, hope, need). Некоторые глаголы меняют значение: remember doing = помнить, что делал; remember to do = не забыть сделать.',
    examples: [
      { en: 'I enjoy reading before bed.', ru: 'Я люблю читать перед сном.' },
      { en: 'She decided to leave early.', ru: 'Она решила уйти пораньше.' },
      { en: 'I stopped smoking. (бросил курить)', ru: 'Я бросил курить.' },
      { en: 'I stopped to smoke. (остановился, чтобы покурить)', ru: 'Я остановился, чтобы покурить.' },
    ],
  },
  'phrasal-verbs': {
    explanation: 'Phrasal Verbs (Фразовые глаголы) — глагол + частица (предлог/наречие). Значение часто нельзя вывести из отдельных слов. Некоторые separable (можно разделить: turn off the light / turn the light off), другие inseparable.',
    examples: [
      { en: 'I look forward to meeting you.', ru: 'Я с нетерпением жду встречи с тобой.' },
      { en: 'Please turn off the lights.', ru: 'Пожалуйста, выключи свет.' },
      { en: 'She gave up smoking last year.', ru: 'Она бросила курить в прошлом году.' },
      { en: 'We need to put off the meeting.', ru: 'Нам нужно отложить встречу.' },
    ],
  },
  'relative-clauses': {
    explanation: 'Relative Clauses (Придаточные определительные) дают дополнительную информацию о существительном. Who — для людей, which — для вещей, that — универсально, whose — притяжательное, where — для мест. Определительные (без запятой) и неопределительные (с запятой).',
    examples: [
      { en: 'The man who lives next door is a doctor.', ru: 'Человек, который живёт по соседству, — врач.' },
      { en: 'This is the book that I told you about.', ru: 'Это книга, о которой я тебе говорил.' },
      { en: 'My brother, who lives in Paris, is visiting us.', ru: 'Мой брат, который живёт в Париже, навещает нас.' },
      { en: 'That is the restaurant where we first met.', ru: 'Это ресторан, где мы впервые встретились.' },
    ],
  },
  'used-to-would': {
    explanation: 'Used to + V — привычка или состояние в прошлом, которое больше не актуально. Would + V — только повторяющиеся действия в прошлом (не состояния). Be used to + V-ing / Get used to + V-ing — быть привыкшим / привыкнуть к чему-то.',
    examples: [
      { en: 'I used to play football every day.', ru: 'Раньше я играл в футбол каждый день.' },
      { en: 'I would walk to school as a child.', ru: 'В детстве я ходил в школу пешком.' },
      { en: 'I am used to waking up early.', ru: 'Я привык рано вставать.' },
      { en: 'You will get used to the weather here.', ru: 'Ты привыкнешь к погоде здесь.' },
    ],
  },
  'linking-words': {
    explanation: 'Linking Words (Связующие слова) соединяют части текста и показывают логические отношения: добавление (furthermore, moreover, in addition), контраст (however, nevertheless, although), причина (therefore, thus, consequently), пример (for instance, such as).',
    examples: [
      { en: 'The weather was bad. However, we went out.', ru: 'Погода была плохая. Тем не менее, мы вышли.' },
      { en: 'She is intelligent. Moreover, she is hardworking.', ru: 'Она умна. Более того, она трудолюбива.' },
      { en: 'He was ill. Therefore, he missed the meeting.', ru: 'Он был болен. Следовательно, он пропустил встречу.' },
      { en: 'I love fruits, such as apples and oranges.', ru: 'Я люблю фрукты, такие как яблоки и апельсины.' },
    ],
  },
  'inversion': {
    explanation: 'Inversion (Инверсия) — изменение обычного порядка слов (вспомогательный глагол перед подлежащим). Используется после отрицательных наречий (never, hardly, seldom, rarely, no sooner), в условных предложениях без if (Had I known...), и для эмфазы (Not only did he...).',
    examples: [
      { en: 'Never have I seen such beauty.', ru: 'Никогда не видел такой красоты.' },
      { en: 'Hardly had I arrived when it started raining.', ru: 'Едва я приехал, как начался дождь.' },
      { en: 'Had I known, I would have acted differently.', ru: 'Знай я (тогда), я бы поступил иначе.' },
      { en: 'Not only does she sing, but she also dances.', ru: 'Она не только поёт, но и танцует.' },
    ],
  },
  'subjunctive': {
    explanation: 'Subjunctive Mood (Сослагательное наклонение) выражает желания, сожаления, нереальность. I wish + Past Simple (о настоящем), I wish + Past Perfect (о прошлом). It\'s time + Past Simple. If only — более эмоциональный вариант wish.',
    examples: [
      { en: 'I wish I knew the answer.', ru: 'Жаль, что я не знаю ответа.' },
      { en: 'I wish I had studied harder.', ru: 'Жаль, что я не учился усерднее.' },
      { en: 'It\'s time we left.', ru: 'Пора нам уходить.' },
      { en: 'If only she were here!', ru: 'Если бы она только была здесь!' },
    ],
  },
  'complex-gerund': {
    explanation: 'Perfect Gerund (having + V3) подчёркивает, что действие герундия произошло раньше другого. Perfect Infinitive (to have + V3) — то же самое для инфинитива. Используются, когда важен порядок действий.',
    examples: [
      { en: 'Having finished her work, she went home.', ru: 'Закончив работу, она пошла домой.' },
      { en: 'He admitted having stolen the money.', ru: 'Он признался, что украл деньги.' },
      { en: 'She seems to have forgotten.', ru: 'Кажется, она забыла.' },
      { en: 'I am glad to have met you.', ru: 'Я рад, что встретил тебя.' },
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