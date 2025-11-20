"use client"

import type { UserRole, User } from "./types"

// Mock users for demo
const DEMO_USERS = {
  "admin45@emmis.com": {
    id: "1",
    email: "admin45@emmis.com",
    password: "qwertyhudra45678911",
    name: "Admin User",
    role: "admin" as UserRole,
  },
  "supervisor@emmis.com": {
    id: "2",
    email: "supervisor@emmis.com",
    password: "qwertyhudra45678911",
    name: "Supervisor User",
    role: "supervisor" as UserRole,
  },
  "technician@emmis.com": {
    id: "3",
    email: "technician@emmis.com",
    password: "qwertyhudra45678911",
    name: "Technician User",
    role: "technician" as UserRole,
  },
}

function getNext6AM(): number {
  const now = new Date()
  const next6AM = new Date()
  next6AM.setHours(6, 0, 0, 0)
  
  if (now.getHours() >= 6) {
    next6AM.setDate(next6AM.getDate() + 1)
  }
  
  return next6AM.getTime()
}

export function login(email: string, password: string): User | null {
  const user = DEMO_USERS[email as keyof typeof DEMO_USERS]
  if (user && user.password === password) {
    const { password: _, ...userWithoutPassword } = user
    const sessionData = {
      user: userWithoutPassword,
      expiresAt: getNext6AM()
    }
    localStorage.setItem("emmis_session", JSON.stringify(sessionData))
    return userWithoutPassword
  }
  return null
}

export function logout() {
  localStorage.removeItem("emmis_session")
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const sessionStr = localStorage.getItem("emmis_session")
  if (!sessionStr) return null
  
  const session = JSON.parse(sessionStr)
  if (Date.now() > session.expiresAt) {
    localStorage.removeItem("emmis_session")
    return null
  }
  
  return session.user
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

export function checkSessionExpiry(): boolean {
  if (typeof window === "undefined") return false
  const sessionStr = localStorage.getItem("emmis_session")
  if (!sessionStr) return false
  
  const session = JSON.parse(sessionStr)
  if (Date.now() > session.expiresAt) {
    localStorage.removeItem("emmis_session")
    return true
  }
  
  return false
}
