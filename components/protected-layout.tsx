"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, checkSessionExpiry } from "@/lib/auth"
import { AppSidebar } from "./app-sidebar"
import { DatabaseWarningBanner } from "./database-warning-banner"

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuth, setIsAuth] = useState<boolean | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const authStatus = isAuthenticated()
    setIsAuth(authStatus)

    if (!authStatus) {
      router.push("/login")
      return
    }

    // Check session expiry every minute
    const interval = setInterval(() => {
      if (checkSessionExpiry()) {
        router.push("/login")
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [router])

  if (!isMounted || isAuth === null) {
    return null
  }

  if (!isAuth) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50 md:pt-0 pt-16">
        <DatabaseWarningBanner />
        {children}
      </main>
    </div>
  )
}
