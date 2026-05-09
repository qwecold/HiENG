import { Smile, Image } from 'lucide-react'
import { useState, useRef } from 'react'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onGifSelect: (gifUrl: string, gifTitle: string) => void
}

const POPULAR_EMOJIS = [
  '😀', '😂', '🥰', '😎', '🤔', '😭', '😡', '👏', '🔥', '💯',
  '😍', '🤣', '😘', '🙌', '👍', '💀', '🙄', '😏', '🤷', '💩',
  '🎉', '❤️', '✨', '👀', '🚀', '💪', '🤮', '🥺', '😤', '💅',
  '🌚', '🌝', '💀', '👁️👄👁️', '🗿', '😳', '🤡', '🙃', '😬', '🫠',
]

const GIFS = [
  { url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif', title: 'Cool' },
  { url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', title: 'Shocked' },
  { url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', title: 'Laughing' },
  { url: 'https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif', title: 'Love' },
  { url: 'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.gif', title: 'Mind Blown' },
  { url: 'https://media.giphy.com/media/26BRyO7jOq8mW2dBy/giphy.gif', title: 'Party' },
  { url: 'https://media.giphy.com/media/3o7abL06uKBs9XMfW0/giphy.gif', title: 'Cringe' },
  { url: 'https://media.giphy.com/media/26AHPxxnSw1L9T1rW/giphy.gif', title: 'Dance' },
  { url: 'https://media.giphy.com/media/l0Ex6MURA0C97l3gI/giphy.gif', title: 'Yeet' },
  { url: 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif', title: 'Vibe' },
]

export function EmojiPicker({ onSelect, onGifSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'emojis' | 'gifs'>('emojis')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        onGifSelect(url, 'Image')
      }
      reader.readAsDataURL(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        type="button"
      >
        <Smile className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="absolute bottom-full left-0 mb-2 w-72 bg-card border border-border rounded-lg shadow-lg z-50">
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('emojis')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'emojis'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Emojis
        </button>
        <button
          onClick={() => setActiveTab('gifs')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'gifs'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          GIFs & Images
        </button>
      </div>

      <div className="p-3 max-h-64 overflow-y-auto">
        {activeTab === 'emojis' ? (
          <div className="grid grid-cols-8 gap-1">
            {POPULAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji)
                  setIsOpen(false)
                }}
                className="text-2xl hover:bg-muted rounded p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {GIFS.map((gif, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onGifSelect(gif.url, gif.title)
                  setIsOpen(false)
                }}
                className="rounded overflow-hidden hover:opacity-80 transition-opacity"
              >
                <img src={gif.url} alt={gif.title} className="w-full h-24 object-cover" />
              </button>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded p-4 flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Image className="w-6 h-6 mb-1" />
              <span className="text-xs">Upload</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}
      </div>

      <button
        onClick={() => setIsOpen(false)}
        className="w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground border-t border-border"
      >
        Close
      </button>
    </div>
  )
}
