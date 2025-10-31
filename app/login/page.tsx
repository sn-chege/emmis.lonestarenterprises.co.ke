"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"
import { Wrench, AlertCircle, Cog, Users, TrendingUp, Shield } from "lucide-react"
import { DatabaseStatus } from "@/components/database-status"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await api.login(email, password)
      if (result.user) {
        // Store user in localStorage for now
        localStorage.setItem('emmis_user', JSON.stringify(result.user))
        router.push("/dashboard")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role: "admin" | "supervisor" | "technician") => {
    const demos = {
      admin: { email: "admin45@emmis.com", password: "qwertyhudra45678911" },
      supervisor: { email: "supervisor@emmis.com", password: "qwertyhudra45678911" },
      technician: { email: "technician@emmis.com", password: "qwertyhudra45678911" },
    }
    setEmail(demos[role].email)
    setPassword(demos[role].password)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DatabaseStatus />
      <div className="flex-1 flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 bg-blue-600 flex items-center justify-center">
              <Wrench className="w-7 h-7 text-white" />
              <Cog className="absolute -top-1 -right-1 w-5 h-5 text-blue-600 bg-white rounded-full p-0.5" />
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Sign in</h1>
            <p className="text-gray-600">Access your equipment management dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin45@emmis.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <button type="button" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="space-y-3 pt-4 border-t">
            <p className="text-sm text-gray-600 text-center">Quick access demo accounts:</p>
            <div className="grid grid-cols-3 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fillDemo("admin")} className="h-9">
                Admin
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => fillDemo("supervisor")} className="h-9">
                Supervisor
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => fillDemo("technician")} className="h-9">
                Technician
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold leading-tight">
                Welcome to
                <br />
                EMMIS Platform
              </h2>
              <p className="text-lg text-gray-300 max-w-md">
                Streamline your equipment maintenance operations with our comprehensive management system. Track assets,
                manage work orders, and optimize maintenance schedules all in one place.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center border-2 border-gray-900">
                  <Users className="w-6 h-6" />
                </div>
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center border-2 border-gray-900">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center border-2 border-gray-900">
                  <Shield className="w-6 h-6" />
                </div>
              </div>
              <p className="text-gray-300">Trusted by maintenance teams worldwide</p>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-1">
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm text-gray-400">Assets Tracked</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">98%</p>
                <p className="text-sm text-gray-400">Uptime Rate</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-sm text-gray-400">Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
