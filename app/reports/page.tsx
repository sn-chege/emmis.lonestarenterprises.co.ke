"use client"

import type React from "react"

import { useState } from "react"
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
  Plus,
  FileBarChart,
  Wrench,
  Users,
  DollarSign,
  Package,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/format"

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
  const [reports] = useState<GeneratedReport[]>(MOCK_REPORTS)

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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Custom Report Builder
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">Generated this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipment Uptime</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.5%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4 hrs</div>
              <p className="text-xs text-muted-foreground">-0.5 hrs improvement</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES 485K</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
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
                  <ul className="mb-4 space-y-2 text-sm">
                    {reportType.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Generated Date</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No reports generated yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{formatDate(report.generatedDate)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{report.format}</Badge>
                        </TableCell>
                        <TableCell>{report.size}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" title="View Report">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Download Report">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Share Report">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Delete Report">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}