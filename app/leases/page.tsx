"use client"

import { useState, useEffect } from "react"
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
import { LeaseModal } from "@/components/leases/lease-modal"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { api } from "@/lib/api"
import { useNotifications } from "@/components/notification-provider"
import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"

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

export default function LeasesPage() {
  const { notifySuccess, notifyError, notifyDelete } = useNotifications()
  const [leases, setLeases] = useState<Lease[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add")
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [leaseToDelete, setLeaseToDelete] = useState<Lease | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
  const totalRevenue = 0 // leases.reduce((sum, l) => sum + l.totalPaid, 0)
  const overduePayments = leases.filter((l) => l.paymentStatus === "overdue").length

  const handleAddLease = () => {
    setModalMode("add")
    setSelectedLease(null)
    setModalOpen(true)
  }

  const handleViewLease = (lease: Lease) => {
    setModalMode("view")
    setSelectedLease(lease)
    setModalOpen(true)
  }

  const handleEditLease = (lease: Lease) => {
    setModalMode("edit")
    setSelectedLease(lease)
    setModalOpen(true)
  }

  const handleDeleteLease = (lease: Lease) => {
    setLeaseToDelete(lease)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteLease = async () => {
    if (!leaseToDelete) return
    
    setIsDeleting(true)
    try {
      await api.deleteLease(leaseToDelete.id)
      setLeases(prevLeases => prevLeases.filter((l) => l.id !== leaseToDelete.id))
      notifyDelete("Lease Deleted", `Lease ${leaseToDelete.id} has been deleted successfully.`)
      setDeleteDialogOpen(false)
      setLeaseToDelete(null)
    } catch (error) {
      console.error('Delete lease error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete lease'
      notifyError("Delete Failed", errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveLease = async (leaseData: Partial<Lease>) => {
    try {
      if (modalMode === "add") {
        const newLease = await api.createLease(leaseData)
        setLeases(prevLeases => [...prevLeases, newLease])
        notifySuccess("Lease Added", "Lease has been added successfully.")
      } else if (modalMode === "edit" && selectedLease) {
        const updatedLease = await api.updateLease(selectedLease.id, leaseData)
        setLeases(prevLeases => prevLeases.map((l) => (l.id === selectedLease.id ? updatedLease : l)))
        notifySuccess("Lease Updated", "Lease has been updated successfully.")
      }
      setModalOpen(false)
    } catch (error) {
      console.error('Save lease error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save lease'
      notifyError("Save Failed", errorMessage)
      throw error
    }
  }

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const data = await api.getLeases()
        setLeases(data)
      } catch (error) {
        notifyError("Error", "Failed to load leases")
      } finally {
        setLoading(false)
      }
    }
    fetchLeases()
  }, [])

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="text-center">Loading leases...</div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lease Management</h1>
            <p className="text-muted-foreground">Equipment lease agreements, contracts, and SLA management</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/leases/contract-templates">
              <Button variant="outline" className="w-full sm:w-auto">
                <FileText className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Contract Templates</span>
                <span className="sm:hidden">Templates</span>
              </Button>
            </Link>
            <Link href="/leases/sla-management">
              <Button variant="outline" className="w-full sm:w-auto">
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">SLA Management</span>
                <span className="sm:hidden">SLA</span>
              </Button>
            </Link>
            <Button className="w-full sm:w-auto" onClick={handleAddLease}>
              <FilePlus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Create Lease Agreement</span>
              <span className="sm:hidden">Add Lease</span>
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
              <div className="text-2xl font-bold">_ _ _</div>
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

            <DataTable 
              columns={[
                { accessorKey: "id", header: "Lease ID" },
                { 
                  accessorKey: "equipmentName", 
                  header: "Equipment",
                  cell: ({ row }) => (
                    <div>
                      <div className="font-medium">{row.getValue("equipmentName")}</div>
                      <div className="text-sm text-muted-foreground">{row.original.serialNo}</div>
                    </div>
                  )
                },
                { accessorKey: "customerName", header: "Customer" },
                { 
                  accessorKey: "startDate", 
                  header: "Lease Period",
                  cell: ({ row }) => (
                    <div className="text-sm">
                      <div>{formatDate(row.getValue("startDate"))}</div>
                      <div className="text-muted-foreground">to {formatDate(row.original.endDate)}</div>
                    </div>
                  )
                },
                { 
                  accessorKey: "paymentAmount", 
                  header: "Payment Amount",
                  cell: ({ row }) => (
                    <div>
                      <div className="font-medium">{formatCurrency(row.getValue("paymentAmount"))}</div>
                      <div className="text-sm text-muted-foreground">{row.original.paymentFrequency}</div>
                    </div>
                  )
                },
                { 
                  accessorKey: "status", 
                  header: "Status",
                  cell: ({ row }) => getStatusBadge(row.getValue("status"))
                },
                { 
                  accessorKey: "paymentStatus", 
                  header: "Payment Status",
                  cell: ({ row }) => getPaymentStatusBadge(row.getValue("paymentStatus"))
                },
                { 
                  accessorKey: "nextPaymentDate", 
                  header: "Next Payment",
                  cell: ({ row }) => formatDate(row.getValue("nextPaymentDate"))
                },
                {
                  id: "actions",
                  header: "Actions",
                  cell: ({ row }) => {
                    const lease = row.original
                    return (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewLease(lease)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditLease(lease)}>
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
                          <DropdownMenuItem onClick={() => handleDeleteLease(lease)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Terminate Lease
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  }
                }
              ]}
              data={filteredLeases}
              searchKey="equipmentName"
              searchPlaceholder="Search lease agreements..."
              title="Leases"
            />
          </CardContent>
        </Card>

        <LeaseModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          lease={selectedLease}
          onSave={handleSaveLease}
        />

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Lease"
          description={`Are you sure you want to delete lease ${leaseToDelete?.id}? This action cannot be undone and will permanently remove the lease agreement and all related payment records.`}
          onConfirm={confirmDeleteLease}
          isLoading={isDeleting}
        />
      </div>
    </ProtectedLayout>
  )
}
