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
import type { Asset } from "@/lib/types"
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

interface AssetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit" | "view"
  asset: Asset | null
  onSave: (asset: Partial<Asset>) => Promise<void>
  onDelete: (assetId: string) => void
}

export function AssetModal({ open, onOpenChange, mode, asset, onSave, onDelete }: AssetModalProps) {
  const { notifyError } = useNotifications()
  const [formData, setFormData] = useState<Partial<Asset>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])

  useEffect(() => {
    if (asset && (mode === "edit" || mode === "view")) {
      const formattedAsset = {
        ...asset,
        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : "",
        warrantyStart: asset.warrantyStart ? new Date(asset.warrantyStart).toISOString().split('T')[0] : "",
        warrantyEnd: asset.warrantyEnd ? new Date(asset.warrantyEnd).toISOString().split('T')[0] : ""
      }
      setFormData(formattedAsset)
    } else {
      setFormData({})
    }
  }, [asset, mode])

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
    if (!formData.make?.trim()) {
      notifyError("Validation Error", "Make is required")
      return
    }
    if (!formData.model?.trim()) {
      notifyError("Validation Error", "Model is required")
      return
    }
    if (!formData.serialNumber?.trim()) {
      notifyError("Validation Error", "Serial Number is required")
      return
    }
    if (!formData.customerId) {
      notifyError("Validation Error", "Customer is required")
      return
    }
    if (!formData.location?.trim()) {
      notifyError("Validation Error", "Location is required")
      return
    }
    if (!formData.condition) {
      notifyError("Validation Error", "Condition is required")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Check for duplicate serial number only when adding new asset
      if (mode === "add") {
        const existingAssets = await api.getAssets()
        const duplicateAsset = existingAssets.find(
          (a: Asset) => a.serialNumber.toLowerCase() === formData.serialNumber?.toLowerCase()
        )
        if (duplicateAsset) {
          notifyError("Validation Error", `Serial number already exists for asset: ${duplicateAsset.make} ${duplicateAsset.model} (${duplicateAsset.id})`)
          return
        }
      }
      
      await onSave(formData)
    } catch (err) {
      notifyError("Error", err instanceof Error ? err.message : 'An error occurred while saving')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (asset) {
      onDelete(asset.id)
      setDeleteDialogOpen(false)
    }
  }

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    if (customer) {
      setFormData({
        ...formData,
        customerId,
        customerName: customer.companyName,
        contactPerson: customer.contactPerson,
        contactPhone: customer.phone,
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
              {mode === "add" && "Add New Equipment"}
              {mode === "edit" && `Edit Equipment: ${asset?.make} ${asset?.model}`}
              {mode === "view" && `Equipment Details - ${asset?.id}`}
            </DialogTitle>
            <DialogDescription>
              {mode === "add" && "Enter the equipment information below"}
              {mode === "edit" && "Update the equipment information"}
              {mode === "view" && "View equipment information and details"}
            </DialogDescription>
          </DialogHeader>

          {isViewMode && asset ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-slate-900">Equipment Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Asset ID:</span>
                    <p className="font-medium">{asset.id}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Category:</span>
                    <p className="font-medium">{asset.category || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Make:</span>
                    <p className="font-medium">{asset.make}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Model:</span>
                    <p className="font-medium">{asset.model}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Serial Number:</span>
                    <p className="font-medium">{asset.serialNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Description:</span>
                    <p className="font-medium">{asset.description || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-slate-900">Customer & Location</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Customer:</span>
                    <p className="font-medium">{asset.customerName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Contact Person:</span>
                    <p className="font-medium">{asset.contactPerson || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Location:</span>
                    <p className="font-medium">{asset.location}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Location Type:</span>
                    <Badge variant="outline" className="capitalize">
                      {asset.locationType}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-slate-600">Location Details:</span>
                    <p className="font-medium">{asset.locationDetails || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-slate-900">Status & Condition</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Condition:</span>
                    <div>
                      <Badge variant="default" className="capitalize">
                        {asset.condition}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Status:</span>
                    <div>
                      <Badge variant="default" className="capitalize">
                        {asset.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-slate-900">Financial Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Purchase Date:</span>
                    <p className="font-medium">{formatDate(asset.purchaseDate)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Purchase Price:</span>
                    <p className="font-medium">{formatCurrency(asset.purchasePrice)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Current Value:</span>
                    <p className="font-medium">{formatCurrency(asset.currentValue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-slate-900">Warranty Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Warranty Provider:</span>
                    <p className="font-medium">{asset.warrantyProvider || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Warranty Period:</span>
                    <p className="font-medium">
                      {asset.warrantyStart && asset.warrantyEnd
                        ? `${formatDate(asset.warrantyStart)} - ${formatDate(asset.warrantyEnd)}`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {asset.repairHistory && asset.repairHistory.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-slate-900">Repair History</h4>
                  <div className="space-y-2">
                    {asset.repairHistory.map((repair, index) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-3 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-slate-900">{repair.description}</p>
                            <p className="text-sm text-slate-600">Technician: {repair.technician}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">{formatCurrency(repair.cost)}</p>
                            <p className="text-xs text-slate-500">{formatDate(repair.date)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {asset.notes && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Notes</h4>
                  <p className="text-slate-700">{asset.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">
                    Make <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="make"
                    value={formData.make || ""}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    required
                    placeholder="Equipment manufacturer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">
                    Model <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="model"
                    value={formData.model || ""}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                    placeholder="Model number/name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">
                    Serial Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber || ""}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    required
                    placeholder="Serial number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category || ""}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Printer">Printer</SelectItem>
                      <SelectItem value="Computer">Computer</SelectItem>
                      <SelectItem value="CNC Machine">CNC Machine</SelectItem>
                      <SelectItem value="Network Equipment">Network Equipment</SelectItem>
                      <SelectItem value="Office Equipment">Office Equipment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the equipment"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input id="contactPerson" value={formData.contactPerson || ""} readOnly placeholder="Auto-filled" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    placeholder="Equipment location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locationType">Location Type</Label>
                  <Select
                    value={formData.locationType || "fixed"}
                    onValueChange={(value: any) => setFormData({ ...formData, locationType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Installation</SelectItem>
                      <SelectItem value="mobile">Mobile Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">
                    Condition <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.condition || ""}
                    onValueChange={(value: any) => setFormData({ ...formData, condition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || "operational"}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="maintenance">Under Maintenance</SelectItem>
                      <SelectItem value="repair">Under Repair</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate || ""}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price (KES)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={formData.purchasePrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchasePrice: Number(e.target.value),
                        currentValue: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warrantyStart">Warranty Start Date</Label>
                  <Input
                    id="warrantyStart"
                    type="date"
                    value={formData.warrantyStart || ""}
                    onChange={(e) => setFormData({ ...formData, warrantyStart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warrantyEnd">Warranty End Date</Label>
                  <Input
                    id="warrantyEnd"
                    type="date"
                    value={formData.warrantyEnd || ""}
                    onChange={(e) => setFormData({ ...formData, warrantyEnd: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warrantyProvider">Warranty Provider</Label>
                <Input
                  id="warrantyProvider"
                  value={formData.warrantyProvider || ""}
                  onChange={(e) => setFormData({ ...formData, warrantyProvider: e.target.value })}
                  placeholder="Company providing warranty"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this equipment..."
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
                <Button variant="default" onClick={() => onOpenChange(false)}>
                  <Save className="w-4 h-4 mr-2" />
                  Edit Equipment
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
                      Add Equipment
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Equipment
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
            <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {asset?.make} {asset?.model}
              </strong>
              ? This action cannot be undone and will remove all equipment information, service history, and related
              records.
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
