export interface ListeningVideo {
  id: string
  title: string
  youtubeId: string
  description: string
  level: 'easy' | 'medium' | 'hard'
  duration: string
}

export const BUILT_IN_VIDEOS: ListeningVideo[] = [
  {
    id: 'sp-1',
    title: 'South Park — Scott Tenorman Must Die (clip)',
    youtubeId: 'NSt2VpNSx4E',
    description: 'Классическая сцена из South Park. Картман мстит Скотту Тенорману. Отличное произношение, много сленга.',
    level: 'medium',
    duration: '3:24',
  },
  {
    id: 'sp-2',
    title: 'South Park — Make Love, Not Warcraft (clip)',
    youtubeId: 'tdljWvV8SQM',
    description: 'Мальчики играют в World of Warcraft. Много игровой терминологии и современного сленга.',
    level: 'medium',
    duration: '4:12',
  },
  {
    id: 'sp-3',
    title: 'South Park — The Coon (clip)',
    youtubeId: 'J3nK3yP5r5s',
    description: 'Картман становится супергероем. Быстрая речь, ирония, поп-культурные отсылки.',
    level: 'hard',
    duration: '3:45',
  },
  {
    id: 'sp-4',
    title: 'South Park — Guitar Queer-O (clip)',
    youtubeId: 'QJ8m9fYX4lM',
    description: 'Мальчики играют в Guitar Hero. Разговорная речь, музыкальная терминология.',
    level: 'medium',
    duration: '3:18',
  },
  {
    id: 'sp-5',
    title: 'South Park — Grounded Vindaloop (clip)',
    youtubeId: 'WvX7hXWf-7o',
    description: 'Баттерс попадает в виртуальную реальность. Философские диалоги, технологическая лексика.',
    level: 'hard',
    duration: '4:05',
  },
  {
    id: 'sp-6',
    title: 'South Park — Tegridy Farms (clip)',
    youtubeId: 'bX9j8cD2y3s',
    description: 'Рэнди переезжает на ферму. Южный акцент, сельскохозяйственная лексика.',
    level: 'medium',
    duration: '3:30',
  },
]

export function getVideoEmbedUrl(youtubeId: string): string {
  return `https://www.youtube.com/embed/${youtubeId}`
}

export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}
