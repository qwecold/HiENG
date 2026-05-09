interface Window {
  SpeechRecognition: any
  webkitSpeechRecognition: any
}

export const speak = (text: string, lang: string = 'en-US'): void => {
  if (!window.speechSynthesis) {
    console.warn('Speech synthesis not supported')
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = 0.9
  utterance.pitch = 1

  window.speechSynthesis.speak(utterance)
}

export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export const cancelSpeech = (): void => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

export const startListening = (
  onResult: (transcript: string) => void,
  lang: string = 'en-US'
): (() => void) | null => {
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    console.warn('Speech recognition not supported')
    return null
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()

  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = lang

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript
    onResult(transcript.trim())
  }

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error)
  }

  recognition.start()

  return () => {
    recognition.stop()
  }
}

export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && (
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  )
}