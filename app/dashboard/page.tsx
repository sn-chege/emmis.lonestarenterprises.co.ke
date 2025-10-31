"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Users, ClipboardList, Wrench, AlertTriangle, TrendingUp, Plus, FileText, Calendar, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"
import { getDashboardStats, api } from "@/lib/api"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    users: 0,
    customers: 0,
    assets: 0,
    workOrders: 0,
    maintenance: 0,
    leases: 0,
    activeWorkOrders: 0,
    overdueWorkOrders: 0,
    activeMaintenance: 0,
    activeLeases: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardStats, activities] = await Promise.all([
          getDashboardStats(),
          api.getActivityLogs(undefined, 5)
        ])
        setStats(dashboardStats)
        setRecentActivity(activities)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    {
      title: "Total Users",
      value: stats.users.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Customers",
      value: stats.customers.toString(),
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Assets",
      value: stats.assets.toString(),
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Active Work Orders",
      value: stats.activeWorkOrders.toString(),
      icon: ClipboardList,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Overdue Work Orders",
      value: stats.overdueWorkOrders.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Active Maintenance",
      value: stats.activeMaintenance.toString(),
      icon: Wrench,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Active Leases",
      value: stats.activeLeases.toString(),
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Total Leases",
      value: stats.leases.toString(),
      icon: Calendar,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
  ]

  const alerts = [
    {
      id: 1,
      type: "critical",
      title: "Equipment Overdue for Service",
      description: "Printer HP-2045 at ABC Corp is 15 days overdue",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "warning",
      title: "Low Inventory Alert",
      description: "Toner cartridges stock below minimum level",
      time: "5 hours ago",
    },
    {
      id: 3,
      type: "info",
      title: "Maintenance Scheduled",
      description: "5 equipment scheduled for maintenance tomorrow",
      time: "1 day ago",
    },
  ]



  const quickActions = [
    { label: "New Work Order", icon: ClipboardList, href: "/work-orders" },
    { label: "Add Customer", icon: Users, href: "/customers" },
    { label: "Register Asset", icon: Package, href: "/assets" },
    { label: "Schedule Maintenance", icon: Wrench, href: "/maintenance" },
    { label: "Create Lease", icon: DollarSign, href: "/leases" },
    { label: "Manage Users", icon: Users, href: "/users" },
  ]

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="w-full sm:w-auto">
            <Button onClick={() => router.push('/reports')} className="w-full sm:w-auto">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold mt-2">{loading ? '...' : stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      alert.type === "critical"
                        ? "bg-red-500"
                        : alert.type === "warning"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900">{alert.title}</h4>
                      <Badge
                        variant={
                          alert.type === "critical" ? "destructive" : alert.type === "warning" ? "default" : "secondary"
                        }
                      >
                        {alert.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{alert.description}</p>
                    <p className="text-xs text-slate-400 mt-2">{alert.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.label} href={action.href}>
                    <Button variant="outline" className="w-full justify-start gap-3 bg-transparent">
                      <Icon className="w-4 h-4" />
                      {action.label}
                    </Button>
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-slate-500">Loading activities...</div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-4 text-slate-500">No recent activities</div>
              ) : (
                recentActivity.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b border-slate-200 last:border-0 last:pb-0"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <ClipboardList className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{activity.action} {activity.entityType}</h4>
                      <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {activity.userName} • {new Date(activity.createdDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
