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
  "supervisor45@emmis.com": {
    id: "2",
    email: "supervisor45@emmis.com",
    password: "qwertyhudra45678911",
    name: "Supervisor User",
    role: "supervisor" as UserRole,
  },
  "tech45@emmis.com": {
    id: "3",
    email: "tech45@emmis.com",
    password: "qwertyhudra45678911",
    name: "Technician User",
    role: "technician" as UserRole,
  },
}

export function login(email: string, password: string): User | null {
  const user = DEMO_USERS[email as keyof typeof DEMO_USERS]
  if (user && user.password === password) {
    const { password: _, ...userWithoutPassword } = user
    localStorage.setItem("emmis_user", JSON.stringify(userWithoutPassword))
    return userWithoutPassword
  }
  return null
}

export function logout() {
  localStorage.removeItem("emmis_user")
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("emmis_user")
  return userStr ? JSON.parse(userStr) : null
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}
