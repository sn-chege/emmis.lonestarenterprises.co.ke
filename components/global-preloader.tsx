"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Wrench, Cog } from "lucide-react"

export function GlobalPreloader() {
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 bg-blue-600 flex items-center justify-center">
            <Wrench className="w-10 h-10 text-white" />
          </div>
          <Cog className="absolute -top-2 -right-2 w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900">EMMIS</h2>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
