"use client"

import { useState, useEffect } from "react"
import { Globe } from "lucide-react"
import { getIPInfo } from "@/lib/ip-info"

interface IPLocationProps {
  ip: string
}

export function IPLocation({ ip }: IPLocationProps) {
  const [info, setInfo] = useState<{ country?: string; countryCode?: string; error?: boolean } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIPInfo = async () => {
      try {
        const result = await getIPInfo(ip)
        setInfo(result)
      } catch (error) {
        setInfo({ error: true })
      } finally {
        setLoading(false)
      }
    }

    fetchIPInfo()
  }, [ip])

  if (loading) {
    return (
      <span className="ml-2 px-2 py-1 bg-slate-100 rounded text-xs font-mono">
        {ip}
      </span>
    )
  }

  return (
    <span className="ml-2 px-2 py-1 bg-slate-100 rounded text-xs font-mono inline-flex items-center gap-1">
      <Globe className="w-3 h-3" />
      {ip}
      {info && !info.error && info.country && (
        <span className="text-slate-600">• {info.country}</span>
      )}
    </span>
  )
}