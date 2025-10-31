"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  Wrench,
  FileText,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { getCurrentUser, logout } from "@/lib/auth"
import { useState, useEffect } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Assets", href: "/assets", icon: Package },
  { name: "Work Orders", href: "/work-orders", icon: ClipboardList },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Leases", href: "/leases", icon: FileText },
  { name: "Reports", href: "/reports", icon: FileBarChart },
  { name: "Users", href: "/users", icon: Settings, adminOnly: true },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const user = getCurrentUser()
  const [collapsed, setCollapsed] = useState(() => {
    // Start collapsed on mobile
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768
    }
    return false
  })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const filteredNav = navigation.filter((item) => !item.adminOnly || user?.role === "admin")

  // Mobile top bar
  if (isMobile && collapsed) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">EMMIS</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          className="text-white hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-slate-900 text-white transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        "md:relative",
        isMobile && !collapsed ? "fixed inset-0 z-50" : "relative"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">EMMIS</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-slate-800"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800",
                  isActive && "bg-slate-800 text-white",
                  collapsed && "justify-center",
                )}
                onClick={() => router.push(item.href)}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Button>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-slate-800">
        {!collapsed && user && (
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-blue-600">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800",
            collapsed && "justify-center",
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}
