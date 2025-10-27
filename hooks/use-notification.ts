"use client"

import { useState, useCallback } from "react"

export interface NotificationData {
  id: string
  type: "success" | "error" | "delete"
  title: string
  description: string
  duration?: number
}

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  const addNotification = useCallback((notification: Omit<NotificationData, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications((prev) => [...prev, { ...notification, id }])
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const notifySuccess = useCallback((title: string, description: string) => {
    addNotification({ type: "success", title, description })
  }, [addNotification])

  const notifyError = useCallback((title: string, description: string) => {
    addNotification({ type: "error", title, description })
  }, [addNotification])

  const notifyDelete = useCallback((title: string, description: string) => {
    addNotification({ type: "delete", title, description })
  }, [addNotification])

  return {
    notifications,
    removeNotification,
    notifySuccess,
    notifyError,
    notifyDelete,
  }
}