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
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { api } from "@/lib/api"
import { useNotifications } from "@/components/notification-provider"

interface Lease {
  id: string
  equipmentName: string
  serialNo: string
  customerId: string
  customerName: string
  startDate: string
  endDate: string
  paymentAmount: number
  paymentFrequency: string
  status: string
  paymentStatus: string
  nextPaymentDate: string
  totalPaid: number
  remainingPayments: number
  contractTerms?: string
  notes?: string
}

interface LeaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit" | "view"
  lease: Lease | null
  onSave: (lease: Partial<Lease>) => Promise<void>
}

export function LeaseModal({ open, onOpenChange, mode, lease, onSave }: LeaseModalProps) {
  const { notifyError } = useNotifications()
  const [formData, setFormData] = useState<Partial<Lease>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])

  useEffect(() => {
    if (lease && (mode === "edit" || mode === "view")) {
      const formattedLease = {
        ...lease,
        startDate: lease.startDate ? new Date(lease.startDate).toISOString().split('T')[0] : "",
        endDate: lease.endDate ? new Date(lease.endDate).toISOString().split('T')[0] : "",
        nextPaymentDate: lease.nextPaymentDate ? new Date(lease.nextPaymentDate).toISOString().split('T')[0] : ""
      }
      setFormData(formattedLease)
    } else if (mode === "add") {
      setFormData({
        paymentFrequency: "monthly",
        status: "pending",
        paymentStatus: "pending",
        totalPaid: 0,
        remainingPayments: 0,
      })
    }
  }, [lease, mode])

  // Reset form data when modal is closed
  useEffect(() => {
    if (!open) {
      setFormData({})
      setIsSubmitting(false)
    }
  }, [open])

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await api.getCustomers()
        setCustomers(data)
      } catch (error) {
        console.error('Failed to fetch customers:', error)
      }
    }
    if (open) {
      fetchCustomers()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.equipmentName?.trim()) {
      notifyError("Validation Error", "Equipment Name is required")
      return
    }
    if (!formData.serialNo?.trim()) {
      notifyError("Validation Error", "Serial Number is required")
      return
    }
    if (!formData.customerId) {
      notifyError("Validation Error", "Customer is required")
      return
    }
    if (!formData.startDate) {
      notifyError("Validation Error", "Start Date is required")
      return
    }
    if (!formData.endDate) {
      notifyError("Validation Error", "End Date is required")
      return
    }
    if (!formData.paymentAmount || formData.paymentAmount <= 0) {
      notifyError("Validation Error", "Payment Amount is required and must be greater than 0")
      return
    }
    if (!formData.nextPaymentDate) {
      notifyError("Validation Error", "Next Payment Date is required")
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

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    if (customer) {
      setFormData({
        ...formData,
        customerId,
        customerName: customer.companyName,
      })
    }
  }

  const isViewMode = mode === "view"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" && "Create New Lease Agreement"}
            {mode === "edit" && `Edit Lease: ${lease?.id}`}
            {mode === "view" && `Lease Details - ${lease?.id}`}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" && "Enter the lease agreement information below"}
            {mode === "edit" && "Update the lease agreement information"}
            {mode === "view" && "View lease agreement information and details"}
          </DialogDescription>
        </DialogHeader>

        {isViewMode && lease ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-slate-900">Lease Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-600">Lease ID:</span>
                  <p className="font-medium">{lease.id}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Status:</span>
                  <Badge variant="default">{lease.status}</Badge>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Equipment:</span>
                  <p className="font-medium">{lease.equipmentName}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Serial Number:</span>
                  <p className="font-medium">{lease.serialNo}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Customer:</span>
                  <p className="font-medium">{lease.customerName}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Payment Status:</span>
                  <Badge variant="default">{lease.paymentStatus}</Badge>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-slate-900">Lease Period</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-600">Start Date:</span>
                  <p className="font-medium">{formatDate(lease.startDate)}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">End Date:</span>
                  <p className="font-medium">{formatDate(lease.endDate)}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-slate-900">Payment Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-600">Payment Amount:</span>
                  <p className="font-medium">{formatCurrency(lease.paymentAmount)}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Frequency:</span>
                  <p className="font-medium">{lease.paymentFrequency}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Total Paid:</span>
                  <p className="font-medium">{formatCurrency(lease.totalPaid)}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Remaining Payments:</span>
                  <p className="font-medium">{lease.remainingPayments}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-slate-600">Next Payment Date:</span>
                  <p className="font-medium">{formatDate(lease.nextPaymentDate)}</p>
                </div>
              </div>
            </div>

            {lease.contractTerms && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">Contract Terms</h4>
                <p className="text-slate-700">{lease.contractTerms}</p>
              </div>
            )}

            {lease.notes && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">Notes</h4>
                <p className="text-slate-700">{lease.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipmentName">
                  Equipment Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="equipmentName"
                  value={formData.equipmentName || ""}
                  onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                  required
                  placeholder="Equipment name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNo">
                  Serial Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="serialNo"
                  value={formData.serialNo || ""}
                  onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                  required
                  placeholder="Serial number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerId">
                Customer <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.customerId || ""} onValueChange={handleCustomerChange}>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate || ""}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate || ""}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">
                  Payment Amount (KES) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={formData.paymentAmount || ""}
                  onChange={(e) => setFormData({ ...formData, paymentAmount: Number(e.target.value) })}
                  required
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentFrequency">Payment Frequency</Label>
                <Select
                  value={formData.paymentFrequency || "monthly"}
                  onValueChange={(value) => setFormData({ ...formData, paymentFrequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nextPaymentDate">
                  Next Payment Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nextPaymentDate"
                  type="date"
                  value={formData.nextPaymentDate || ""}
                  onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remainingPayments">Remaining Payments</Label>
                <Input
                  id="remainingPayments"
                  type="number"
                  value={formData.remainingPayments || ""}
                  onChange={(e) => setFormData({ ...formData, remainingPayments: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>

            {mode === "edit" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || ""}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select
                    value={formData.paymentStatus || ""}
                    onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="contractTerms">Contract Terms</Label>
              <Textarea
                id="contractTerms"
                value={formData.contractTerms || ""}
                onChange={(e) => setFormData({ ...formData, contractTerms: e.target.value })}
                placeholder="Contract terms and conditions..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </form>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isViewMode ? "Close" : "Cancel"}
          </Button>
          {!isViewMode && (
            <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "add" ? "Create Lease" : "Update Lease"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}