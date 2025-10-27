"use client"

import { useState, useMemo } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, FilterX, Download, Eye, Edit, UserPlus, CheckCircle } from "lucide-react"
import { MOCK_WORK_ORDERS } from "@/lib/mock-data"
import type { WorkOrder } from "@/lib/types"
import { formatDate } from "@/lib/utils/format"
import { WorkOrderModal } from "@/components/work-orders/work-order-modal"
import { useToast } from "@/hooks/use-toast"

export default function WorkOrdersPage() {
  const { toast } = useToast()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(MOCK_WORK_ORDERS)
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

  const handleSaveWorkOrder = (workOrderData: Partial<WorkOrder>) => {
    if (modalMode === "add") {
      const newWorkOrder: WorkOrder = {
        id: `WO${String(workOrders.length + 1).padStart(3, "0")}`,
        status: "open",
        priority: "medium",
        serviceType: "scheduled",
        createdDate: new Date().toISOString().split("T")[0],
        estimatedCost: 0,
        ...workOrderData,
      } as WorkOrder

      setWorkOrders([...workOrders, newWorkOrder])
      toast({
        title: "Work Order Created",
        description: `Work order ${newWorkOrder.id} has been created successfully.`,
      })
    } else if (modalMode === "edit" && selectedWorkOrder) {
      setWorkOrders(workOrders.map((wo) => (wo.id === selectedWorkOrder.id ? { ...wo, ...workOrderData } : wo)))
      toast({
        title: "Work Order Updated",
        description: `Work order ${selectedWorkOrder.id} has been updated successfully.`,
      })
    }
    setModalOpen(false)
  }

  const handleDeleteWorkOrder = (workOrderId: string) => {
    setWorkOrders(workOrders.filter((wo) => wo.id !== workOrderId))
    toast({
      title: "Work Order Deleted",
      description: `Work order ${workOrderId} has been deleted successfully.`,
      variant: "destructive",
    })
    setModalOpen(false)
  }

  const exportToExcel = () => {
    toast({
      title: "Export Started",
      description: "Exporting work order data to Excel...",
    })
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

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Work Orders</h1>
            <p className="text-slate-600 mt-1">Manage service and repair work orders</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportToExcel}>
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
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No work orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWorkOrders.map((workOrder) => (
                      <TableRow key={workOrder.id}>
                        <TableCell className="font-semibold">{workOrder.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900">{workOrder.customerName}</div>
                            <div className="text-sm text-slate-600">{workOrder.contactPerson}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900">{workOrder.equipmentName}</div>
                            <div className="text-sm text-slate-600">SN: {workOrder.serialNo}</div>
                            <div className="text-xs text-slate-500">{workOrder.location}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {workOrder.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadgeVariant(workOrder.priority)} className="capitalize">
                            {workOrder.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(workOrder.status)} className="capitalize">
                            {workOrder.status.replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            {workOrder.technicianName ? (
                              <>
                                <div className="font-medium text-slate-900">{workOrder.technicianName}</div>
                                <div className="text-xs text-slate-500">{workOrder.supervisorName}</div>
                              </>
                            ) : (
                              <span className="text-slate-500 text-sm">Unassigned</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-900">{formatDate(workOrder.dueDate)}</div>
                        </TableCell>
                        <TableCell>
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
