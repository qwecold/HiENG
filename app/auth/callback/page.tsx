'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const [message, setMessage] = useState('Завершаем вход...')

  useEffect(() => {
    const handleCallback = async () => {
      const { searchParams } = new URL(window.location.href)
      const code = searchParams.get('code')
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          window.location.href = basePath + '/' || '/'
          return
        }
        setMessage('Ошибка входа: ' + error.message)
      } else {
        setMessage('Ошибка: код авторизации не найден')
      }

      setTimeout(() => {
        window.location.href = basePath + '/' || '/'
      }, 3000)
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">{message}</div>
    </div>
  )
}
