"use client"

import { useState, useMemo, useEffect } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, FilterX, Download, Eye, Edit, UserPlus, CheckCircle } from "lucide-react"
import { api } from "@/lib/api"
import type { WorkOrder } from "@/lib/types"
import { formatDate } from "@/lib/utils/format"
import { WorkOrderModal } from "@/components/work-orders/work-order-modal"
import { useNotifications } from "@/components/notification-provider"
import { DataTable } from "@/components/ui/data-table"
import { useTableExport } from "@/hooks/use-table-export"

export default function WorkOrdersPage() {
  const { notifySuccess, notifyError, notifyDelete } = useNotifications()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add")
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      const matchesSearch =
        searchTerm === "" ||
        wo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.technicianName?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === "all" || wo.type === typeFilter
      const matchesStatus = statusFilter === "all" || wo.status === statusFilter
      const matchesPriority = priorityFilter === "all" || wo.priority === priorityFilter

      return matchesSearch && matchesType && matchesStatus && matchesPriority
    })
  }, [workOrders, searchTerm, typeFilter, statusFilter, priorityFilter])

  const workOrderColumns = [
    { accessorKey: "id", header: "Work Order #" },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "equipmentName", header: "Equipment" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "priority", header: "Priority" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "technicianName", header: "Technician" },
    { accessorKey: "dueDate", header: "Due Date" },
  ]

  const { exportToExcel } = useTableExport(filteredWorkOrders, workOrderColumns, "Work Orders")

  const clearFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setStatusFilter("all")
    setPriorityFilter("all")
  }

  const handleAddWorkOrder = () => {
    setModalMode("add")
    setSelectedWorkOrder(null)
    setModalOpen(true)
  }

  const handleViewWorkOrder = (workOrder: WorkOrder) => {
    setModalMode("view")
    setSelectedWorkOrder(workOrder)
    setModalOpen(true)
  }

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    setModalMode("edit")
    setSelectedWorkOrder(workOrder)
    setModalOpen(true)
  }

  const handleSaveWorkOrder = async (workOrderData: Partial<WorkOrder>) => {
    try {
      if (modalMode === "add") {
        const newWorkOrder = await api.createWorkOrder({
          id: `WO${String(workOrders.length + 1).padStart(3, "0")}`,
          status: "open",
          priority: "medium",
          serviceType: "scheduled",
          estimatedCost: 0,
          ...workOrderData,
        })
        setWorkOrders([...workOrders, newWorkOrder])
        notifySuccess("Work Order Created", `Work order ${newWorkOrder.id} has been created successfully.`)
        setModalOpen(false)
      } else if (modalMode === "edit" && selectedWorkOrder) {
        const updatedWorkOrder = await api.updateWorkOrder(selectedWorkOrder.id, workOrderData)
        setWorkOrders(workOrders.map((wo) => (wo.id === selectedWorkOrder.id ? updatedWorkOrder : wo)))
        notifySuccess("Work Order Updated", `Work order ${updatedWorkOrder.id} has been updated successfully.`)
        setModalOpen(false)
      }
    } catch (error) {
      // Error will be handled by the modal's notification system
      throw error
    }
  }

  const handleDeleteWorkOrder = async (workOrderId: string) => {
    try {
      await api.deleteWorkOrder(workOrderId)
      setWorkOrders(workOrders.filter((wo) => wo.id !== workOrderId))
      notifyDelete("Work Order Deleted", `Work order ${workOrderId} has been deleted successfully.`)
      setModalOpen(false)
    } catch (error) {
      notifyError("Error", "Failed to delete work order")
    }
  }

  const handleExportToExcel = () => {
    exportToExcel()
    notifySuccess("Export Started", "Exporting work order data to Excel...")
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "low":
        return "secondary"
      case "medium":
        return "default"
      case "high":
        return "secondary"
      case "critical":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open":
        return "secondary"
      case "assigned":
        return "default"
      case "in-progress":
        return "default"
      case "completed":
        return "default"
      case "cancelled":
        return "outline"
      default:
        return "outline"
    }
  }

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const data = await api.getWorkOrders()
        setWorkOrders(data)
      } catch (error) {
        notifyError("Error", "Failed to load work orders")
      } finally {
        setLoading(false)
      }
    }
    fetchWorkOrders()
  }, [])

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="text-center">Loading work orders...</div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Work Orders</h1>
            <p className="text-slate-600 mt-1">Manage service and repair work orders</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExportToExcel}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleAddWorkOrder}>
              <Plus className="w-4 h-4 mr-2" />
              Create Work Order
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search work orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={clearFilters}>
                <FilterX className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <DataTable 
              columns={[
                { accessorKey: "id", header: "Work Order #" },
                { 
                  accessorKey: "customerName", 
                  header: "Customer",
                  cell: ({ row }) => (
                    <div>
                      <div className="font-medium text-slate-900">{row.getValue("customerName")}</div>
                      <div className="text-sm text-slate-600">{row.original.contactPerson}</div>
                    </div>
                  )
                },
                { 
                  accessorKey: "equipmentName", 
                  header: "Equipment",
                  cell: ({ row }) => (
                    <div>
                      <div className="font-medium text-slate-900">{row.getValue("equipmentName")}</div>
                      <div className="text-sm text-slate-600">SN: {row.original.serialNo}</div>
                      <div className="text-xs text-slate-500">{row.original.location}</div>
                    </div>
                  )
                },
                { 
                  accessorKey: "type", 
                  header: "Type",
                  cell: ({ row }) => (
                    <Badge variant="outline" className="capitalize">
                      {row.getValue("type")}
                    </Badge>
                  )
                },
                { 
                  accessorKey: "priority", 
                  header: "Priority",
                  cell: ({ row }) => (
                    <Badge variant={getPriorityBadgeVariant(row.getValue("priority"))} className="capitalize">
                      {row.getValue("priority")}
                    </Badge>
                  )
                },
                { 
                  accessorKey: "status", 
                  header: "Status",
                  cell: ({ row }) => (
                    <Badge variant={getStatusBadgeVariant(row.getValue("status"))} className="capitalize">
                      {row.getValue("status").replace("-", " ")}
                    </Badge>
                  )
                },
                { 
                  accessorKey: "technicianName", 
                  header: "Technician",
                  cell: ({ row }) => (
                    <div>
                      {row.getValue("technicianName") ? (
                        <>
                          <div className="font-medium text-slate-900">{row.getValue("technicianName")}</div>
                          <div className="text-xs text-slate-500">{row.original.supervisorName}</div>
                        </>
                      ) : (
                        <span className="text-slate-500 text-sm">Unassigned</span>
                      )}
                    </div>
                  )
                },
                { 
                  accessorKey: "dueDate", 
                  header: "Due Date",
                  cell: ({ row }) => (
                    <div className="text-sm text-slate-900">{formatDate(row.getValue("dueDate"))}</div>
                  )
                },
                {
                  id: "actions",
                  header: "Actions",
                  cell: ({ row }) => {
                    const workOrder = row.original
                    return (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewWorkOrder(workOrder)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditWorkOrder(workOrder)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!workOrder.technicianName && (
                          <Button variant="ghost" size="sm">
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        )}
                        {workOrder.status !== "completed" && (
                          <Button variant="ghost" size="sm">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )
                  }
                }
              ]}
              data={filteredWorkOrders}
              searchKey="customerName"
              searchPlaceholder="Search work orders..."
              title="Work Orders"
            />
          </CardContent>
        </Card>
      </div>

      <WorkOrderModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        workOrder={selectedWorkOrder}
        onSave={handleSaveWorkOrder}
        onDelete={handleDeleteWorkOrder}
      />
    </ProtectedLayout>
  )
}
