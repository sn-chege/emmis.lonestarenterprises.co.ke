"use client"

import { createContext, useContext } from "react"
import { useNotification } from "@/hooks/use-notification"
import { Notification } from "@/components/ui/notification"

const NotificationContext = createContext<ReturnType<typeof useNotification> | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const notification = useNotification()

  return (
    <NotificationContext.Provider value={notification}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] space-y-2 p-4">
        {notification.notifications.map((notif) => (
          <Notification
            key={notif.id}
            id={notif.id}
            type={notif.type}
            title={notif.title}
            description={notif.description}
            duration={notif.duration}
            onClose={notification.removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}