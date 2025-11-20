"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { WorkOrder } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { Trash2, Save, Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { api } from "@/lib/api"
import { useNotifications } from "@/components/notification-provider"

interface WorkOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit" | "view"
  workOrder: WorkOrder | null
  onSave: (workOrder: Partial<WorkOrder>) => Promise<void>
  onDelete: (workOrderId: string) => void
  resetForm?: boolean
}

export function WorkOrderModal({ open, onOpenChange, mode, workOrder, onSave, onDelete, resetForm }: WorkOrderModalProps) {
  const { notifyError } = useNotifications()
  const [formData, setFormData] = useState<Partial<WorkOrder>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [supervisors, setSupervisors] = useState<any[]>([])

  useEffect(() => {
    if (workOrder && (mode === "edit" || mode === "view")) {
      const formattedWorkOrder = {
        ...workOrder,
        dueDate: workOrder.dueDate ? new Date(workOrder.dueDate).toISOString().split('T')[0] : ""
      }
      setFormData(formattedWorkOrder)
    } else {
      setFormData({ type: "service", serviceType: "scheduled", priority: "medium" })
    }
  }, [workOrder, mode])

  // Reset form on successful insert
  useEffect(() => {
    if (resetForm && mode === "add") {
      setFormData({ type: "service", serviceType: "scheduled", priority: "medium" })
    }
  }, [resetForm, mode])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersData, assetsData, usersData] = await Promise.all([
          api.getCustomers(),
          api.getAssets(),
          api.getUsers()
        ])
        setCustomers(customersData)
        setAssets(assetsData)
        setTechnicians(usersData.filter((user: any) => user.role === 'technician'))
        setSupervisors(usersData.filter((user: any) => user.role === 'supervisor'))
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    if (open) {
      fetchData()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.customerName) {
      notifyError("Validation Error", "Customer is required")
      return
    }
    if (!formData.equipmentName) {
      notifyError("Validation Error", "Equipment is required")
      return
    }
    if (!formData.type) {
      notifyError("Validation Error", "Maintenance Type is required")
      return
    }
    if (!formData.description?.trim()) {
      notifyError("Validation Error", "Work Description is required")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await onSave(formData)
    } catch (err) {
      notifyError("Error", err instanceof Error ? err.message : 'An error occurred while saving')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (workOrder) {
      onDelete(workOrder.id)
      setDeleteDialogOpen(false)
    }
  }

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    if (customer) {
      setFormData({
        ...formData,
        customerId: customerId,
        customerName: customer.companyName,
        contactPerson: customer.contactPerson,
        contactPhone: customer.phone,
      })
    }
  }

  const handleEquipmentChange = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId)
    if (asset) {
      setFormData({
        ...formData,
        equipmentId: assetId,
        equipmentName: `${asset.make} ${asset.model}`,
        equipmentMake: asset.make,
        equipmentModel: asset.model,
        serialNo: asset.serialNumber,
        location: asset.location,
      })
    }
  }

  const isViewMode = mode === "view"

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "add" && "Create New Work Order"}
              {mode === "edit" && `Edit Work Order: ${workOrder?.id}`}
              {mode === "view" && `Work Order Details - ${workOrder?.id}`}
            </DialogTitle>
            <DialogDescription>
              {mode === "add" && "Enter the work order information below"}
              {mode === "edit" && "Update the work order information"}
              {mode === "view" && "View work order information and details"}
            </DialogDescription>
          </DialogHeader>

          {isViewMode && workOrder ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-slate-900">Work Order Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Work Order #:</span>
                    <p className="font-medium">{workOrder.id}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Type:</span>
                    <Badge variant="outline" className="capitalize">
                      {workOrder.type}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Priority:</span>
                    <Badge variant="default" className="capitalize">
                      {workOrder.priority}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Status:</span>
                    <Badge variant="default" className="capitalize">
                      {workOrder.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Created Date:</span>
                    <p className="font-medium">{formatDate(workOrder.createdDate)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Due Date:</span>
                    <p className="font-medium">{formatDate(workOrder.dueDate)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-slate-900">Customer & Equipment</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Customer:</span>
                    <p className="font-medium">{workOrder.customerName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Contact Person:</span>
                    <p className="font-medium">{workOrder.contactPerson}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Equipment:</span>
                    <p className="font-medium">{workOrder.equipmentName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Serial Number:</span>
                    <p className="font-medium">{workOrder.serialNo}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-slate-600">Location:</span>
                    <p className="font-medium">{workOrder.location}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-slate-900">Assignment</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Technician:</span>
                    <p className="font-medium">{workOrder.technicianName || "Unassigned"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Supervisor:</span>
                    <p className="font-medium">{workOrder.supervisorName || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-slate-900">Work Description</h4>
                <p className="text-slate-700">{workOrder.description}</p>
                {workOrder.faultDescription && (
                  <div className="mt-3">
                    <span className="text-sm font-medium text-slate-600">Fault Description:</span>
                    <p className="text-slate-700 mt-1">{workOrder.faultDescription}</p>
                  </div>
                )}
                {workOrder.workCarriedOut && (
                  <div className="mt-3">
                    <span className="text-sm font-medium text-slate-600">Work Carried Out:</span>
                    <p className="text-slate-700 mt-1">{workOrder.workCarriedOut}</p>
                  </div>
                )}
              </div>

              {workOrder.consumableParts && workOrder.consumableParts.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-slate-900">Consumable Parts</h4>
                  <div className="space-y-2">
                    {workOrder.consumableParts.map((part, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium text-slate-900">{part.name}</p>
                          <p className="text-sm text-slate-600">Quantity: {part.quantity}</p>
                        </div>
                        <p className="font-semibold text-slate-900">{formatCurrency(part.cost)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-slate-900">Cost Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Estimated Cost:</span>
                    <p className="font-medium">{formatCurrency(workOrder.estimatedCost)}</p>
                  </div>
                  {workOrder.actualCost && (
                    <div>
                      <span className="text-sm text-slate-600">Actual Cost:</span>
                      <p className="font-medium">{formatCurrency(workOrder.actualCost)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">
                    Customer <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.customerId || ""} onValueChange={(value) => handleCustomerChange(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input id="contactPerson" value={formData.contactPerson || ""} readOnly placeholder="Auto-filled" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipmentId">
                    Equipment <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.equipmentId || ""} onValueChange={(value) => handleEquipmentChange(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.make} {asset.model} - {asset.serialNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={formData.location || ""} readOnly placeholder="Auto-filled" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Maintenance Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type || ""}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Service Maintenance</SelectItem>
                      <SelectItem value="repair">Repair Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select
                    value={formData.serviceType || "scheduled"}
                    onValueChange={(value: any) => setFormData({ ...formData, serviceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="unscheduled">Unscheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority || "medium"}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate || ""}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="technicianName">Assigned Technician</Label>
                  <Select
                    value={formData.technicianName || ""}
                    onValueChange={(value) => {
                      if (value === "unassigned") {
                        setFormData({ ...formData, technicianName: "" })
                      } else {
                        const technician = technicians.find(t => t.name === value)
                        setFormData({ ...formData, technicianName: technician ? technician.name : "" })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {technicians.map((technician) => (
                        <SelectItem key={technician.id} value={technician.name}>
                          {technician.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supervisorName">Supervisor</Label>
                  <Select
                    value={formData.supervisorName || ""}
                    onValueChange={(value) => {
                      if (value === "none") {
                        setFormData({ ...formData, supervisorName: "" })
                      } else {
                        const supervisor = supervisors.find(s => s.name === value)
                        setFormData({ ...formData, supervisorName: supervisor ? supervisor.name : "" })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No supervisor</SelectItem>
                      {supervisors.map((supervisor) => (
                        <SelectItem key={supervisor.id} value={supervisor.name}>
                          {supervisor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Work Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Describe the work to be performed..."
                  rows={3}
                />
              </div>

              {formData.type === "repair" && (
                <div className="space-y-2">
                  <Label htmlFor="faultDescription">Fault Description</Label>
                  <Textarea
                    id="faultDescription"
                    value={formData.faultDescription || ""}
                    onChange={(e) => setFormData({ ...formData, faultDescription: e.target.value })}
                    placeholder="Describe the defects or faults reported by the customer..."
                    rows={3}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedCost">Estimated Cost (KES)</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    value={formData.estimatedCost || ""}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                {formData.type === "service" && (
                  <div className="space-y-2">
                    <Label htmlFor="pageCount">Current Page Count</Label>
                    <Input
                      id="pageCount"
                      type="number"
                      value={formData.pageCount || ""}
                      onChange={(e) => setFormData({ ...formData, pageCount: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                )}
              </div>
            </form>
          )}

          <DialogFooter>
            {isViewMode ? (
              <>
                <Button variant="secondary" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button variant="default" onClick={() => onOpenChange(false)}>
                  <Save className="w-4 h-4 mr-2" />
                  Edit Work Order
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                {mode === "edit" && (
                  <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
                <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Saving..."
                  ) : mode === "add" ? (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Work Order
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Work Order
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Work Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete work order <strong>{workOrder?.id}</strong>? This action cannot be undone
              and will remove all work order information and history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
