export interface BuiltInStory {
  id: string
  title: string
  text: string
  level: 'easy' | 'medium' | 'hard'
  topic: string
}

export const BUILT_IN_STORIES: BuiltInStory[] = [
  {
    id: 'builtin-1',
    title: 'The Lost Key',
    level: 'easy',
    topic: 'daily',
    text: `Yesterday morning, Tom woke up late. He had an important meeting at 9 AM. He got dressed quickly, ate his breakfast, and ran to the door. But when he tried to open it, he couldn't find his key.

"Where is my key?" he asked himself. He looked in his pockets, on the table, under the bed — nowhere. He started to panic. The meeting was in thirty minutes.

Then he remembered. Last night, he came home very tired. He put the key on the kitchen shelf. He ran to the kitchen — and there it was, next to a cup of coffee he forgot to drink.

Tom smiled, took the key, and left the house. He arrived at the meeting just in time.`,
  },
  {
    id: 'builtin-2',
    title: 'A Strange Neighbor',
    level: 'easy',
    topic: 'mystery',
    text: `Sarah moved to a new apartment last month. The building was old but clean. Her neighbor, Mr. Brown, lived next door. He was a quiet man, about seventy years old. He never smiled and rarely spoke.

Every evening at exactly 7 PM, Sarah heard strange music from his apartment. It was not loud, but very unusual — like old jazz mixed with something she couldn't recognize. One day, she decided to ask him about it.

She knocked on his door. Mr. Brown opened it and looked at her with surprise. "Yes?" he said. "I just wanted to say hello," Sarah replied nervously. Then she saw inside his apartment — hundreds of vinyl records on the walls. "You like music?" she asked. For the first time, Mr. Brown smiled. "I used to be a musician," he said. "Would you like to listen?"

Since that day, Sarah and Mr. Brown became good friends. Every Sunday, they listened to jazz together.`,
  },
  {
    id: 'builtin-3',
    title: 'The Wrong Train',
    level: 'medium',
    topic: 'travel',
    text: `Mark had never traveled alone before. His first business trip was to a small town in the north of England. He packed his bag, arrived at the station, and looked at the departure board. His train was leaving from platform 4.

He found a seat, opened his laptop, and started working. Two hours later, he looked out the window. The landscape was beautiful — green hills, small villages, old bridges. But something felt wrong. The towns didn't match the names on his map.

He asked the passenger next to him: "Excuse me, where is this train going?" The man looked at him strangely. "To Edinburgh, of course." Mark's heart stopped. Edinburgh was in Scotland, four hours away from his destination.

He got off at the next station, bought a return ticket, and laughed at himself. "Next time," he thought, "I will check the train number twice." He arrived at his meeting six hours late, but with a great story to tell.`,
  },
  {
    id: 'builtin-4',
    title: 'The Last Photo',
    level: 'medium',
    topic: 'emotional',
    text: `Emma found an old camera in her grandmother's attic. It was a small silver device from the 1990s. Inside, there was still a memory card. Curious, she charged the camera and turned it on.

The screen showed 47 photos. She started scrolling. The first pictures were of her grandmother as a young woman — smiling, traveling, with friends Emma had never met. Then she saw a photo that made her stop. It was her grandmother and a young man, standing on a beach. They looked very happy.

Emma had never seen this man before. She ran downstairs and showed the photo to her grandmother, who was now ninety-two years old. The old woman looked at the screen, and her eyes filled with tears. "That was David," she whispered. "We were engaged. He died in an accident before the wedding. I never spoke about him because it hurt too much."

Emma hugged her grandmother tightly. "Tell me about him," she said. And for the next three hours, her grandmother shared stories she had kept inside for sixty years. It was the most important conversation they ever had.`,
  },
  {
    id: 'builtin-5',
    title: 'The Interview',
    level: 'easy',
    topic: 'work',
    text: `Lisa had been looking for a job for three months. She sent over fifty applications and finally got an interview at a small tech company. She prepared for days — practiced answers, researched the company, chose her best outfit.

On the day of the interview, she woke up early, had a good breakfast, and left the house with confidence. But when she arrived at the building, she realized she had left her portfolio at home. All her work examples were in it.

She took a deep breath and went inside anyway. During the interview, she spoke honestly about her mistake. "I forgot my portfolio," she said, "but I can describe every project in detail." The interviewer smiled. "Honesty is more important than a perfect presentation," he said.

Two days later, Lisa got the job. Her new boss told her later: "We chose you because you handled a difficult situation with confidence and honesty. That's the kind of person we need on our team."`,
  },
  {
    id: 'builtin-6',
    title: 'The Storm',
    level: 'medium',
    topic: 'nature',
    text: `The weather forecast said nothing about a storm. Jake and his brother decided to go fishing early in the morning. They took their small boat and rowed to the middle of the lake. The water was calm and the sky was clear.

Around noon, everything changed. Dark clouds appeared from nowhere. The wind started blowing stronger and stronger. Waves began to hit the boat. "We need to go back!" Jake shouted. But the wind was too strong — they couldn't row against it.

The boat started filling with water. Jake's brother was scared. "What do we do?" he cried. Jake remembered his father's advice: "When you can't fight the storm, float with it." They stopped rowing and used their hands to throw water out of the boat. Slowly, the storm moved past them. An hour later, the water was calm again.

They rowed back to shore, cold and wet, but alive. Jake never forgot that day. "Nature doesn't care about your plans," he told his friends later. "You have to respect it."`,
  },
  {
    id: 'builtin-7',
    title: 'The Coffee Shop',
    level: 'easy',
    topic: 'daily',
    text: `Every morning at 8 AM, Maria went to the same coffee shop. She always ordered the same thing: a cappuccino and a croissant. The barista, Alex, always smiled when he saw her. They never spoke much — just "Good morning" and "Thank you."

One rainy Tuesday, Maria walked in completely wet. Her umbrella broke, and she missed her bus. She looked terrible. Alex handed her the coffee and said, "Today it's on the house." Maria was surprised. "Why?" she asked. "Because everyone has bad days," Alex replied.

The next day, Maria brought Alex a piece of homemade cake. "Because everyone deserves something sweet," she said. They both laughed. From that day, they started having short conversations. Within a month, they were friends. Within a year, Maria and Alex opened their own coffee shop together. They called it "The Rainy Tuesday."`,
  },
  {
    id: 'builtin-8',
    title: 'The Museum Guard',
    level: 'hard',
    topic: 'art',
    text: `For thirty years, George worked as a night guard at the city museum. He was sixty-five now, and this was his last week before retirement. Every night, he walked through the same halls, past the same paintings, saying goodnight to each one. The staff thought he was strange, but George didn't care.

On his final night, something unusual happened. Around 2 AM, while he was sitting in the Impressionist room, he noticed a young woman standing in front of Monet's Water Lilies. She had been there for over an hour, just staring. George approached her. "It's beautiful, isn't it?" he asked. The woman turned around. Her face was covered in tears.

"My grandmother painted copies of this," she said. "She died last week. I came here to say goodbye to her through this painting." George understood. He had lost his wife five years ago, and every night he talked to her favorite painting — Van Gogh's Starry Night.

He didn't say anything. He just stood next to the woman, and they looked at the painting together for a long time. Before she left, she asked his name. "George," he said. "Thank you, George," she replied. "You made this easier."

The next morning, George retired. But he came back every Sunday — not as a guard, but as a visitor. Sometimes he would sit in the Impressionist room, hoping to see the young woman again. He never did. But he always left a small chair near the Water Lilies, just in case someone needed to sit and cry.`,
  },
  {
    id: 'builtin-9',
    title: 'The Lighthouse Keeper',
    level: 'hard',
    topic: 'nature',
    text: `Eleanor had lived on the island for forty-two years. She was born there, raised by her father who had been the lighthouse keeper before her, and now, at sixty, she was the last permanent resident of Blackrock Island. The government had tried to automate the lighthouse years ago, but Eleanor had fought them with lawyers and petitions until they agreed to let her stay as long as she maintained the light herself.

Every evening at sunset, she climbed the spiral stairs — all 137 of them — to the lantern room. She polished the Fresnel lens, checked the oil, and lit the wick with steady hands that had performed this ritual over fifteen thousand times. The light could be seen for twenty-three nautical miles, and ships passing through the channel depended on it.

In the winter of 2019, a storm unlike any other hit the coast. The wind howled at over eighty miles per hour, and waves crashed against the lighthouse with such force that Eleanor could feel the ancient stone tremble beneath her feet. The power went out around midnight, and she knew she had to get to the lantern room.

She wrapped herself in oilskins and began the climb, carrying a heavy backup lamp. The tower swayed slightly in the wind — something she had never felt before. Halfway up, a window shattered, spraying glass and rain into the stairwell. She shielded her face and kept climbing.

When she finally reached the lantern room, water was already pooling on the floor. She set up the backup lamp, lit it, and secured it in place. Then she sat on the cold metal floor, holding the lamp steady with both hands, feeling the tower shake around her. For six hours she sat there, while the storm raged and the light burned.

In the morning, the coast guard found her asleep on the floor, still holding the lamp. The storm had damaged three ships in the area, but none in her channel. The captain who radioed in said he had seen her light through the worst of it — a single, unwavering point in the chaos.

Eleanor died three years later, peacefully, in her sleep. The lighthouse is automated now, but sailors still call it "Eleanor's Light" on the radio. And on stormy nights, old fishermen claim they can see a figure in the lantern room, holding the lamp steady.`,
  },
  {
    id: 'builtin-10',
    title: 'The Translator',
    level: 'hard',
    topic: 'work',
    text: `Marcus Chen was the best simultaneous translator in the United Nations. He spoke Mandarin, English, French, Russian, and Arabic fluently, and could switch between them without pausing for breath. Delegates from five continents had praised his ability to capture not just words, but tone, nuance, and even subtle humor. He had mediated trade disputes, translated peace treaties, and once, during a particularly tense nuclear negotiation, his calm voice had prevented what analysts later agreed could have been a military escalation.

But Marcus had a secret. Fifteen years ago, when he was twenty-five and just starting his career, he had made a mistake. It was a small meeting — a bilateral trade discussion between two minor nations that no one expected to be significant. Marcus had been tired, working his third consecutive fourteen-hour day. The delegate from Country A had made a joke about the delegate from Country B's national dish. It was clearly meant to break the tension, a moment of levity in a difficult negotiation.

Marcus translated it literally. The joke, stripped of cultural context and delivered in flat diplomatic language, sounded like an insult. The delegate from Country B stood up, accused Country A of cultural insensitivity, and walked out of the room. The trade deal, which would have lifted thousands of people out of poverty, fell apart. Both countries drifted toward more isolationist policies over the following decade.

No one knew it was Marcus's fault. The official record blamed "irreconcilable cultural differences." But Marcus knew. He had replayed that moment in his mind thousands of times — the exact words, the delegate's smile, the sudden silence after his translation. He had considered confessing, but what good would it do? The damage was done.

So he dedicated his life to being perfect. He never worked more than ten hours. He meditated before every session. He studied not just languages, but history, politics, cuisine, music, and slang. He became the best because he could not bear to be less than perfect again.

Last month, at sixty, Marcus finally retired. At his farewell party, the Secretary-General gave a speech about his unparalleled contributions to international diplomacy. Marcus smiled and shook hands. That night, alone in his apartment, he opened a bottle of wine and looked out at the city lights. He thought about the delegates, about the trade deal, about all the things he had done right and the one thing he had done wrong.

He picked up his phone and drafted an email to the current ambassadors of both countries. "I need to tell you about a meeting in 2009," he wrote. Then he paused, his finger hovering over the send button. After a long moment, he deleted the draft, closed his laptop, and finished his wine in silence.

Some mistakes, he had learned, cannot be fixed. They can only be carried.`,
  },
  {
    id: 'builtin-11',
    title: 'The Last Bookstore',
    level: 'hard',
    topic: 'emotional',
    text: `In 2047, when physical books had become collector's items and most people consumed literature through neural implants, there was still one bookstore left in Manhattan. It was called "The Last Chapter," and it was run by an old woman named Iris who claimed to be ninety-four years old, though no one knew for certain because she had no digital footprint — no birth certificate, no credit history, no social profile.

The store itself was impossible. It occupied a space that, according to city records, did not exist — a narrow building squeezed between two skyscrapers that should have left no room for it. The shelves stretched up into darkness, filled with books that smelled of dust and time. Customers — the few who still came — often reported that the store seemed larger inside than out, that corridors led to rooms they couldn't find again, that they had discovered books that shouldn't exist: novels they remembered dreaming about, biographies of people they had invented in childhood, textbooks from universities that had never been built.

Iris never charged money. Instead, she asked each customer to leave something behind — a memory, she called it. "Tell me about the first time you were truly happy," she might say, or "Describe the person you wish you had become." She would listen with complete attention, her ancient eyes focused on the speaker's face, and when they finished, she would nod and hand them a book. Always the right book. A woman grieving her mother received a collection of poems that seemed to speak directly to her loss. A man facing a difficult decision found a novel about a character in exactly his situation. A child who had never learned to read was given a picture book that, somehow, she understood completely.

Critics and journalists tried to investigate the store. One reporter spent three weeks trying to map the interior, only to find that his measurements contradicted themselves. A physicist brought equipment to study the spatial anomalies and left in tears, refusing to discuss what he had found. A famous skeptic declared the whole thing a hoax, then visited the store and emerged six hours later, silent and pale, holding a book he would not let anyone see.

In 2051, a real estate developer bought the block. He planned to demolish everything and build a luxury residential tower. Protesters gathered, but the developer had all the legal permits. The demolition date was set for March 15th.

On March 14th, Iris announced that the store would close. Customers lined up around the block — the longest line the store had ever seen. Iris spent twelve hours listening to memories and handing out books. At midnight, she locked the door, turned to the crowd, and smiled. "Thank you for the stories," she said. "They kept the lights on."

The next morning, the demolition crew arrived. They found an empty lot where the store had been. No building, no books, no Iris. Just a single hardcover lying on the dirt. It was titled "The Last Chapter," and inside, on the first page, was an inscription: "For everyone who still believes that some things are real because we imagine them."

The developer built his tower. It was completed in 2053 and collapsed during a minor earthquake in 2055. The empty lot was never rebuilt on. Sometimes, late at night, pedestrians report seeing a narrow building there, with warm light in the windows and an old woman reading behind the counter. But when they look again, it's just an empty lot, and the wind carries the smell of dust and old paper.`,
  },
]


export function getRandomStories(count: number = 5): BuiltInStory[] {
  const shuffled = [...BUILT_IN_STORIES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function getStoriesByTopic(topic: string): BuiltInStory[] {
  return BUILT_IN_STORIES.filter(s =>
    s.topic.includes(topic) ||
    s.title.toLowerCase().includes(topic) ||
    s.text.toLowerCase().includes(topic)
  )
}
