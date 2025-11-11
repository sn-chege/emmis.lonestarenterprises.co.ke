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
import type { Customer } from "@/lib/types"
import { formatCurrency } from "@/lib/utils/format"
import { Trash2, Save, UserPlus } from "lucide-react"
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
import { useNotifications } from "@/components/notification-provider"

interface CustomerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit" | "view"
  customer: Customer | null
  onSave: (customer: Partial<Customer>) => Promise<void>
  onDelete: (customerId: string) => void
}

export function CustomerModal({ open, onOpenChange, mode, customer, onSave, onDelete }: CustomerModalProps) {
  const { notifyError } = useNotifications()
  const [formData, setFormData] = useState<Partial<Customer>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (customer && (mode === "edit" || mode === "view")) {
      setFormData(customer)
    } else {
      setFormData({})
    }
  }, [customer, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.companyName?.trim()) {
      notifyError("Validation Error", "Company Name is required")
      return
    }
    if (!formData.contactPerson?.trim()) {
      notifyError("Validation Error", "Contact Person is required")
      return
    }
    if (!formData.email?.trim()) {
      notifyError("Validation Error", "Email Address is required")
      return
    }
    if (!formData.phone?.trim()) {
      notifyError("Validation Error", "Phone Number is required")
      return
    }
    if (!formData.address?.trim()) {
      notifyError("Validation Error", "Address is required")
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
    if (customer) {
      onDelete(customer.id)
      setDeleteDialogOpen(false)
    }
  }

  const isViewMode = mode === "view"

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "add" && "Add New Customer"}
              {mode === "edit" && `Edit Customer: ${customer?.companyName}`}
              {mode === "view" && `Customer Details - ${customer?.id}`}
            </DialogTitle>
            <DialogDescription>
              {mode === "add" && "Enter the customer information below"}
              {mode === "edit" && "Update the customer information"}
              {mode === "view" && "View customer information and details"}
            </DialogDescription>
          </DialogHeader>

          {isViewMode && customer ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-slate-900">Company Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Company:</span>
                    <p className="font-medium">{customer.companyName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Industry:</span>
                    <p className="font-medium">{customer.industry || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Established:</span>
                    <p className="font-medium">{customer.established || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Status:</span>
                    <Badge variant="default">{customer.status}</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-slate-900">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Contact Person:</span>
                    <p className="font-medium">{customer.contactPerson}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Title:</span>
                    <p className="font-medium">{customer.title || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Email:</span>
                    <p className="font-medium">{customer.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Phone:</span>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-slate-600">Address:</span>
                    <p className="font-medium">{customer.address}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-slate-900">Contract & Payment</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Contract Status:</span>
                    <div>
                      <Badge variant="default">{customer.contractStatus}</Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Payment Status:</span>
                    <div>
                      <Badge
                        variant={
                          customer.paymentStatus === "Current"
                            ? "default"
                            : customer.paymentStatus === "Overdue"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {customer.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Monthly Amount:</span>
                    <p className="font-medium">{formatCurrency(customer.monthlyAmount)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Total Equipment:</span>
                    <p className="font-medium">{customer.totalEquipment} units</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-slate-600">Equipment Details:</span>
                    <p className="font-medium">{customer.equipmentDetails || "No equipment"}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName || ""}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                    placeholder="Company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={formData.industry || ""}
                    onValueChange={(value) => setFormData({ ...formData, industry: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Logistics & Transport">Logistics & Transport</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">
                    Contact Person <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson || ""}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                    placeholder="Primary contact person"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Job title"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="email@company.co.ke"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyAmount">Monthly Amount (KES)</Label>
                  <Input
                    id="monthlyAmount"
                    type="number"
                    value={formData.monthlyAmount || ""}
                    onChange={(e) => setFormData({ ...formData, monthlyAmount: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="established">Established Year</Label>
                  <Input
                    id="established"
                    value={formData.established || ""}
                    onChange={(e) => setFormData({ ...formData, established: e.target.value })}
                    placeholder="2020"
                  />
                </div>
              </div>

              {mode === "edit" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status || ""}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractStatus">Contract Status</Label>
                    <Select
                      value={formData.contractStatus || ""}
                      onValueChange={(value: any) => setFormData({ ...formData, contractStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Renewal Due">Renewal Due</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  placeholder="Complete address"
                  rows={3}
                />
              </div>
            </form>
          )}

          <DialogFooter>
            {isViewMode ? (
              <>
                <Button variant="secondary" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button variant="default" onClick={() => customer && onOpenChange(false)}>
                  <Save className="w-4 h-4 mr-2" />
                  Edit Customer
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
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Customer
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Customer
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
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{customer?.companyName}</strong>? This action cannot be undone and
              will remove all customer information, contract history, and equipment assignments.
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
