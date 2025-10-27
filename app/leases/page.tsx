"use client"

import { useState } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  FilePlus,
  Search,
  FileText,
  ShieldCheck,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  RefreshCw,
  XCircle,
  FileCheck,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency, formatDate } from "@/lib/utils/format"

type LeaseStatus = "active" | "pending" | "expired" | "terminated"
type PaymentStatus = "current" | "overdue" | "pending"

interface Lease {
  id: string
  equipmentName: string
  serialNo: string
  customerName: string
  startDate: string
  endDate: string
  paymentAmount: number
  paymentFrequency: string
  status: LeaseStatus
  paymentStatus: PaymentStatus
  nextPaymentDate: string
  totalPaid: number
  remainingPayments: number
}

const MOCK_LEASES: Lease[] = [
  {
    id: "LS001",
    equipmentName: "Canon iR-ADV C3530i",
    serialNo: "CN12345ABC",
    customerName: "Acme Manufacturing Ltd",
    startDate: "2023-01-15",
    endDate: "2026-01-15",
    paymentAmount: 12500,
    paymentFrequency: "monthly",
    status: "active",
    paymentStatus: "current",
    nextPaymentDate: "2024-03-15",
    totalPaid: 300000,
    remainingPayments: 12,
  },
  {
    id: "LS002",
    equipmentName: "Haas VF-2",
    serialNo: "HS789XYZ",
    customerName: "TechStart Innovation Inc",
    startDate: "2024-01-10",
    endDate: "2024-07-10",
    paymentAmount: 45000,
    paymentFrequency: "monthly",
    status: "active",
    paymentStatus: "overdue",
    nextPaymentDate: "2024-02-10",
    totalPaid: 45000,
    remainingPayments: 5,
  },
  {
    id: "LS003",
    equipmentName: "Dell Precision 5570",
    serialNo: "DL456DEF",
    customerName: "Global Industries Kenya",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    paymentAmount: 8500,
    paymentFrequency: "monthly",
    status: "active",
    paymentStatus: "pending",
    nextPaymentDate: "2024-03-01",
    totalPaid: 17000,
    remainingPayments: 4,
  },
]

export default function LeasesPage() {
  const [leases] = useState<Lease[]>(MOCK_LEASES)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")

  const filteredLeases = leases.filter((lease) => {
    const matchesSearch =
      lease.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lease.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lease.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || lease.status === statusFilter
    const matchesPayment = paymentFilter === "all" || lease.paymentStatus === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  const getStatusBadge = (status: LeaseStatus) => {
    const variants: Record<LeaseStatus, "default" | "secondary" | "destructive"> = {
      active: "default",
      pending: "secondary",
      expired: "secondary",
      terminated: "destructive",
    }
    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, "default" | "secondary" | "destructive"> = {
      current: "default",
      overdue: "destructive",
      pending: "secondary",
    }
    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  const activeLeases = leases.filter((l) => l.status === "active").length
  const totalRevenue = leases.reduce((sum, l) => sum + l.totalPaid, 0)
  const overduePayments = leases.filter((l) => l.paymentStatus === "overdue").length

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lease Management</h1>
            <p className="text-muted-foreground">Equipment lease agreements, contracts, and SLA management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Contract Templates
            </Button>
            <Button variant="outline">
              <ShieldCheck className="mr-2 h-4 w-4" />
              SLA Management
            </Button>
            <Button>
              <FilePlus className="mr-2 h-4 w-4" />
              Create Lease Agreement
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Leases</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLeases}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overduePayments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Renewals Due</CardTitle>
              <RefreshCw className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lease Agreements</CardTitle>
            <CardDescription>Manage equipment lease agreements and contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lease agreements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lease ID</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Lease Period</TableHead>
                    <TableHead>Payment Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Next Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        No lease agreements found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeases.map((lease) => (
                      <TableRow key={lease.id}>
                        <TableCell className="font-medium">{lease.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{lease.equipmentName}</div>
                            <div className="text-sm text-muted-foreground">{lease.serialNo}</div>
                          </div>
                        </TableCell>
                        <TableCell>{lease.customerName}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(lease.startDate)}</div>
                            <div className="text-muted-foreground">to {formatDate(lease.endDate)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{formatCurrency(lease.paymentAmount)}</div>
                            <div className="text-sm text-muted-foreground">{lease.paymentFrequency}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(lease.status)}</TableCell>
                        <TableCell>{getPaymentStatusBadge(lease.paymentStatus)}</TableCell>
                        <TableCell>{formatDate(lease.nextPaymentDate)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Lease
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Record Payment
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                View Documents
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Renew Lease
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Terminate Lease
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
