"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DatabaseWarningBanner() {
  const [isMounted, setIsMounted] = useState(false)
  const [isUsingLocalStorage, setIsUsingLocalStorage] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Check if we're using localStorage (no database connection)
    setIsUsingLocalStorage(!process.env.NEXT_PUBLIC_DATABASE_CONNECTED)
  }, [])

  if (!isMounted || !isUsingLocalStorage) {
    return null
  }

  return (
    <Alert className="border-amber-500 bg-amber-50 text-amber-900 rounded-none border-b-2 border-t-0 border-x-0">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="ml-2">
        Application is not connected to a database, using local storage
      </AlertDescription>
    </Alert>
  )
}
