"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Users, ClipboardList, Wrench, AlertTriangle, TrendingUp, Plus, FileText } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Equipment",
      value: "248",
      change: "+12%",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Customers",
      value: "89",
      change: "+5%",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Open Work Orders",
      value: "34",
      change: "-8%",
      icon: ClipboardList,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Scheduled Maintenance",
      value: "18",
      change: "+3%",
      icon: Wrench,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
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

  const recentActivity = [
    {
      id: 1,
      action: "Work Order Completed",
      description: "WO-2024-156 - Printer repair at XYZ Ltd",
      user: "John Doe",
      time: "30 mins ago",
    },
    {
      id: 2,
      action: "New Customer Added",
      description: "Tech Solutions Inc. - 5 equipment registered",
      user: "Sarah Smith",
      time: "2 hours ago",
    },
    {
      id: 3,
      action: "Maintenance Completed",
      description: "Preventive maintenance on 3 copiers",
      user: "Mike Johnson",
      time: "4 hours ago",
    },
  ]

  const quickActions = [
    { label: "New Work Order", icon: Plus, href: "/work-orders" },
    { label: "Add Customer", icon: Users, href: "/customers" },
    { label: "Register Asset", icon: Package, href: "/assets" },
    { label: "Schedule Maintenance", icon: Wrench, href: "/maintenance" },
  ]

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                      <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {stat.change} from last month
                      </p>
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
            <CardContent className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Button key={action.label} variant="outline" className="w-full justify-start gap-3 bg-transparent">
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </Button>
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
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b border-slate-200 last:border-0 last:pb-0"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{activity.action}</h4>
                    <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
