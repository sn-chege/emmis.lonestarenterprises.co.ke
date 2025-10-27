"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { MaintenanceRecord } from "@/lib/types"
import { MOCK_ASSETS } from "@/lib/mock-data"
import { formatDate } from "@/lib/utils/format"

interface MaintenanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit" | "view" | "complete" | "reschedule"
  maintenance: MaintenanceRecord | null
  onSave: (data: MaintenanceRecord) => void
}

const TECHNICIANS = [
  { id: "USR003", name: "John Smith" },
  { id: "USR004", name: "Mike Johnson" },
  { id: "USR005", name: "Sarah Wilson" },
]

export function MaintenanceModal({ open, onOpenChange, mode, maintenance, onSave }: MaintenanceModalProps) {
  const [formData, setFormData] = useState<Partial<MaintenanceRecord>>({})
  const [showFaultField, setShowFaultField] = useState(false)

  useEffect(() => {
    if (maintenance) {
      setFormData(maintenance)
      setShowFaultField(maintenance.type === "repair" || maintenance.type === "emergency")
    } else {
      setFormData({
        type: "service",
        serviceType: "scheduled",
        priority: "medium",
        status: "scheduled",
        consumableParts: [],
      })
      setShowFaultField(false)
    }
  }, [maintenance, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === "complete") {
      onSave({
        ...formData,
        status: "completed",
        completedDate: formData.completedDate || new Date().toISOString().split("T")[0],
      } as MaintenanceRecord)
    } else if (mode === "reschedule") {
      onSave({
        ...formData,
        scheduledDate: formData.scheduledDate!,
      } as MaintenanceRecord)
    } else {
      const newId = mode === "add" ? `MT${String(Date.now()).slice(-3)}` : formData.id
      const asset = MOCK_ASSETS.find((a) => a.id === formData.equipmentId)

      onSave({
        ...formData,
        id: newId!,
        equipmentName: asset?.make + " " + asset?.model || "",
        serialNo: asset?.serialNumber || "",
        customerId: asset?.customerId,
        customerName: asset?.customerName,
        createdDate: formData.createdDate || new Date().toISOString().split("T")[0],
      } as MaintenanceRecord)
    }
  }

  const handleTypeChange = (type: string) => {
    setFormData({ ...formData, type: type as any })
    setShowFaultField(type === "repair" || type === "emergency")
  }

  if (mode === "view") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Maintenance Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">ID</Label>
                <p className="font-medium">{maintenance?.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Equipment</Label>
                <p className="font-medium">{maintenance?.equipmentName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Serial Number</Label>
                <p className="font-medium">{maintenance?.serialNo}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <Badge>{maintenance?.type}</Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <Badge>{maintenance?.status}</Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Priority</Label>
                <Badge>{maintenance?.priority}</Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Scheduled Date</Label>
                <p className="font-medium">{formatDate(maintenance?.scheduledDate)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Technician</Label>
                <p className="font-medium">{maintenance?.technicianName || "Unassigned"}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="mt-1 rounded-md bg-muted p-3">{maintenance?.description}</p>
            </div>
            {maintenance?.faultDescription && (
              <div>
                <Label className="text-muted-foreground">Fault Description</Label>
                <p className="mt-1 rounded-md bg-muted p-3">{maintenance.faultDescription}</p>
              </div>
            )}
            {maintenance?.workCarriedOut && (
              <div>
                <Label className="text-muted-foreground">Work Carried Out</Label>
                <p className="mt-1 rounded-md bg-muted p-3">{maintenance.workCarriedOut}</p>
              </div>
            )}
            {maintenance?.consumableParts && maintenance.consumableParts.length > 0 && (
              <div>
                <Label className="text-muted-foreground">Parts Used</Label>
                <p className="mt-1">{maintenance.consumableParts.join(", ")}</p>
              </div>
            )}
            {maintenance?.estimatedDuration && (
              <div>
                <Label className="text-muted-foreground">Estimated Duration</Label>
                <p className="font-medium">{maintenance.estimatedDuration} hours</p>
              </div>
            )}
            {maintenance?.actualDuration && (
              <div>
                <Label className="text-muted-foreground">Actual Duration</Label>
                <p className="font-medium">{maintenance.actualDuration} hours</p>
              </div>
            )}
            {maintenance?.completedDate && (
              <div>
                <Label className="text-muted-foreground">Completed Date</Label>
                <p className="font-medium">{formatDate(maintenance.completedDate)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  if (mode === "complete") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Maintenance</DialogTitle>
            <DialogDescription>Record completion details for this maintenance task</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="completedDate">Completion Date</Label>
                <Input
                  id="completedDate"
                  type="date"
                  value={formData.completedDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualDuration">Actual Duration (hours)</Label>
                <Input
                  id="actualDuration"
                  type="number"
                  step="0.5"
                  value={formData.actualDuration || ""}
                  onChange={(e) => setFormData({ ...formData, actualDuration: Number.parseFloat(e.target.value) })}
                  placeholder="Actual time spent"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workCarriedOut">Work Carried Out *</Label>
              <Textarea
                id="workCarriedOut"
                value={formData.workCarriedOut || ""}
                onChange={(e) => setFormData({ ...formData, workCarriedOut: e.target.value })}
                placeholder="Describe the work performed..."
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumableParts">Consumable Parts Used</Label>
              <Input
                id="consumableParts"
                value={formData.consumableParts?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consumableParts: e.target.value
                      .split(",")
                      .map((p) => p.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="List parts (separate with commas)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Completion Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional observations..."
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Complete Maintenance</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  if (mode === "reschedule") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Maintenance</DialogTitle>
            <DialogDescription>Update the scheduled date and priority</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Scheduled Date</Label>
              <Input value={formatDate(maintenance?.scheduledDate)} disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newScheduledDate">New Scheduled Date *</Label>
                <Input
                  id="newScheduledDate"
                  type="date"
                  value={formData.scheduledDate || ""}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">New Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="technicianId">Reassign Technician</Label>
              <Select
                value={formData.technicianId || ""}
                onValueChange={(value) => {
                  const tech = TECHNICIANS.find((t) => t.id === value)
                  setFormData({
                    ...formData,
                    technicianId: value || null,
                    technicianName: tech?.name || null,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Keep current assignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Keep current assignment</SelectItem>
                  {TECHNICIANS.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Reschedule Maintenance</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Schedule Maintenance" : "Edit Maintenance"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Schedule a new maintenance task" : "Update maintenance task details"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equipmentId">Equipment *</Label>
              <Select
                value={formData.equipmentId}
                onValueChange={(value) => setFormData({ ...formData, equipmentId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_ASSETS.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.make} {asset.model} ({asset.serialNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Maintenance Type *</Label>
              <Select value={formData.type} onValueChange={handleTypeChange} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                required
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
              <Label htmlFor="technicianId">Assigned Technician</Label>
              <Select
                value={formData.technicianId || ""}
                onValueChange={(value) => {
                  const tech = TECHNICIANS.find((t) => t.id === value)
                  setFormData({
                    ...formData,
                    technicianId: value || null,
                    technicianName: tech?.name || null,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {TECHNICIANS.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date *</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate || ""}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Estimated Duration (hours)</Label>
              <Input
                id="estimatedDuration"
                type="number"
                step="0.5"
                value={formData.estimatedDuration || ""}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: Number.parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>
          {showFaultField && (
            <div className="space-y-2">
              <Label htmlFor="faultDescription">Fault Description</Label>
              <Textarea
                id="faultDescription"
                value={formData.faultDescription || ""}
                onChange={(e) => setFormData({ ...formData, faultDescription: e.target.value })}
                rows={2}
              />
            </div>
          )}
          {!showFaultField && (
            <div className="space-y-2">
              <Label htmlFor="pageCount">Current Page Count</Label>
              <Input
                id="pageCount"
                type="number"
                value={formData.pageCount || ""}
                onChange={(e) => setFormData({ ...formData, pageCount: Number.parseInt(e.target.value) })}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{mode === "add" ? "Schedule Maintenance" : "Update Maintenance"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
