"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function DatabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const response = await fetch('/api/health')
        if (response.ok) {
          setStatus('connected')
        } else {
          setStatus('error')
          setError('Database connection failed')
        }
      } catch (err) {
        setStatus('error')
        setError('Unable to connect to database')
      }
    }

    checkDatabase()
  }, [])

  if (status === 'checking') {
    return (
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-yellow-800">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Checking database connection...</span>
        </div>
      </div>
    )
  }

  if (status === 'connected') {
    return null
  }

  return (
    <div className="bg-red-50 border-b border-red-200 px-4 py-2">
      <div className="flex items-center justify-center gap-2 text-red-800">
        <XCircle className="h-4 w-4" />
        <span className="text-sm">{error}</span>
      </div>
    </div>
  )
}