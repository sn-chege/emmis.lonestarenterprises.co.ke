"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertTriangle, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NotificationProps {
  id: string
  type: "success" | "error" | "delete"
  title: string
  description: string
  duration?: number
  onClose: (id: string) => void
}

export function Notification({ id, type, title, description, duration = 5000, onClose }: NotificationProps) {
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100))
        if (newProgress <= 0) {
          setIsVisible(false)
          setTimeout(() => onClose(id), 300)
          return 0
        }
        return newProgress
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPaused, duration, id, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(id), 300)
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case "delete":
        return <Trash2 className="w-5 h-5 text-red-600" />
    }
  }

  const getColors = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      case "delete":
        return "bg-red-50 border-red-200 text-red-800"
    }
  }

  const getProgressColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      case "delete":
        return "bg-red-500"
    }
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 w-96 border rounded-lg shadow-lg transition-all duration-300 z-50",
        getColors(),
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-sm opacity-90 mt-1">{description}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-current opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="h-1 bg-black/10 rounded-b-lg overflow-hidden">
        <div
          className={cn("h-full transition-all duration-100", getProgressColor())}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}