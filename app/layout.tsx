import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { GlobalPreloader } from "@/components/global-preloader"
import { NotificationProvider } from "@/components/notification-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EMMIS - Equipment Maintenance Management System",
  description: "Comprehensive equipment maintenance management platform",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <GlobalPreloader />
        <NotificationProvider>
          {children}
        </NotificationProvider>
        <Analytics />
      </body>
    </html>
  )
}
