"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  FileText,
  BarChart3,
  TrendingUp,
  Download,
  Eye,
  Share2,
  Trash2,
  FileBarChart,
  Wrench,
  Users,
  DollarSign,
  Package,
  Calendar,
  Clock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/format"
import { useNotifications } from "@/components/notification-provider"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"

interface ReportType {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  features: string[]
}

interface GeneratedReport {
  id: string
  name: string
  type: string
  generatedDate: string
  format: string
  size: string
  status: "completed" | "processing" | "failed"
}

const REPORT_TYPES: ReportType[] = [
  {
    id: "equipment",
    name: "Equipment Reports",
    description: "Asset inventory, utilization, and depreciation reports",
    icon: <Package className="h-6 w-6" />,
    features: ["Asset inventory", "Utilization rates", "Depreciation analysis", "Warranty tracking"],
  },
  {
    id: "workorders",
    name: "Work Order Reports",
    description: "Service and repair work order analytics",
    icon: <Wrench className="h-6 w-6" />,
    features: ["Work order status", "Completion rates", "Technician performance", "Response times"],
  },
  {
    id: "service",
    name: "Service Maintenance Reports",
    description: "Scheduled service and preventive maintenance tracking",
    icon: <FileBarChart className="h-6 w-6" />,
    features: ["Service schedules", "Completion tracking", "Parts usage", "Cost analysis"],
  },
  {
    id: "repair",
    name: "Repair Maintenance Reports",
    description: "Repair history and breakdown analysis",
    icon: <TrendingUp className="h-6 w-6" />,
    features: ["Repair frequency", "Downtime analysis", "Cost tracking", "Failure patterns"],
  },
  {
    id: "customer",
    name: "Customer Reports",
    description: "Customer accounts and equipment assignments",
    icon: <Users className="h-6 w-6" />,
    features: ["Customer list", "Equipment assignments", "Contract status", "Payment history"],
  },
  {
    id: "financial",
    name: "Financial & Lease Reports",
    description: "Revenue, payments, and lease agreement analytics",
    icon: <DollarSign className="h-6 w-6" />,
    features: ["Revenue analysis", "Payment tracking", "Lease status", "Financial forecasting"],
  },
]

const MOCK_REPORTS: GeneratedReport[] = [
  {
    id: "RPT001",
    name: "Monthly Equipment Utilization Report",
    type: "Equipment",
    generatedDate: "2024-02-15",
    format: "PDF",
    size: "2.4 MB",
    status: "completed",
  },
  {
    id: "RPT002",
    name: "Q1 2024 Work Order Summary",
    type: "Work Orders",
    generatedDate: "2024-02-14",
    format: "Excel",
    size: "1.8 MB",
    status: "completed",
  },
  {
    id: "RPT003",
    name: "Customer Payment Status Report",
    type: "Financial",
    generatedDate: "2024-02-13",
    format: "PDF",
    size: "956 KB",
    status: "completed",
  },
  {
    id: "RPT004",
    name: "Maintenance Cost Analysis",
    type: "Service",
    generatedDate: "2024-02-12",
    format: "Excel",
    size: "3.2 MB",
    status: "completed",
  },
]

export default function ReportsPage() {
  const router = useRouter()
  const { notifySuccess, notifyError, notifyDelete } = useNotifications()
  const [reports, setReports] = useState<GeneratedReport[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalReports: 0,
    totalAssets: 0,
    activeWorkOrders: 0,
    monthlyRevenue: 0
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<GeneratedReport | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchReports()
    fetchStats()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      } else {
        setReports(MOCK_REPORTS)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      setReports(MOCK_REPORTS)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [assetsRes, workOrdersRes, leasesRes] = await Promise.all([
        fetch('/api/assets'),
        fetch('/api/work-orders'),
        fetch('/api/leases')
      ])
      
      const assets = assetsRes.ok ? await assetsRes.json() : []
      const workOrders = workOrdersRes.ok ? await workOrdersRes.json() : []
      const leases = leasesRes.ok ? await leasesRes.json() : []
      
      const activeWorkOrders = workOrders.filter((wo: any) => wo.status === 'open' || wo.status === 'inProgress').length
      const monthlyRevenue = leases.reduce((sum: number, lease: any) => sum + parseFloat(lease.paymentAmount || 0), 0)
      
      setStats({
        totalReports: reports.length,
        totalAssets: assets.length,
        activeWorkOrders,
        monthlyRevenue
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleDeleteReport = async () => {
    if (!reportToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/reports/${reportToDelete.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete report')
      
      setReports(prev => prev.filter(r => r.id !== reportToDelete.id))
      notifyDelete("Report Deleted", `Report "${reportToDelete.name}" has been deleted successfully.`)
    } catch (error) {
      console.error('Delete report error:', error)
      notifyError("Delete Failed", error instanceof Error ? error.message : 'Failed to delete report')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setReportToDelete(null)
    }
  }

  const viewReport = (reportTypeId: string) => {
    router.push(`/reports/view/${reportTypeId}`)
  }

  const getStatusBadge = (status: GeneratedReport["status"]) => {
    const variants: Record<GeneratedReport["status"], "default" | "secondary" | "destructive"> = {
      completed: "default",
      processing: "secondary",
      failed: "destructive",
    }
    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Generate comprehensive reports and analyze system data</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReports}</div>
              <p className="text-xs text-muted-foreground">Generated reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssets}</div>
              <p className="text-xs text-muted-foreground">Equipment tracked</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
              <Wrench className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeWorkOrders}</div>
              <p className="text-xs text-muted-foreground">Pending completion</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From active leases</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold">Report Types</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {REPORT_TYPES.map((reportType) => (
              <Card key={reportType.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">{reportType.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{reportType.name}</CardTitle>
                        <CardDescription className="mt-1">{reportType.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => viewReport(reportType.id)}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>View and manage generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={[
                { accessorKey: "name", header: "Report Name" },
                { accessorKey: "type", header: "Type" },
                { 
                  accessorKey: "generatedDate", 
                  header: "Generated Date",
                  cell: ({ row }) => formatDate(row.getValue("generatedDate"))
                },
                { 
                  accessorKey: "format", 
                  header: "Format",
                  cell: ({ row }) => <Badge variant="outline">{row.getValue("format")}</Badge>
                },
                { accessorKey: "size", header: "Size" },
                { 
                  accessorKey: "status", 
                  header: "Status",
                  cell: ({ row }) => getStatusBadge(row.getValue("status"))
                },
                {
                  id: "actions",
                  header: "Actions",
                  cell: ({ row }) => {
                    const report = row.original
                    return (
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="View Report"
                          onClick={() => router.push(`/reports/view/${report.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Download Report">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Share Report">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Delete Report"
                          onClick={() => {
                            setReportToDelete(report)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )
                  }
                }
              ]}
              data={reports}
              searchKey="name"
              searchPlaceholder="Search reports..."
              title="Reports"
            />
          </CardContent>
        </Card>

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Report"
          description={`Are you sure you want to delete report "${reportToDelete?.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteReport}
          isLoading={isDeleting}
        />
      </div>
    </ProtectedLayout>
  )
}