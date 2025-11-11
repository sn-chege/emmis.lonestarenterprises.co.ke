"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { User, UserRole, UserStatus } from "@/lib/types"
import { formatDate } from "@/lib/utils/format"
import { useNotifications } from "@/components/notification-provider"
import { api } from "@/lib/api"

interface UserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit" | "view"
  user: User | null
  onSave: (user: Partial<User>) => Promise<void>
}

export function UserModal({ open, onOpenChange, mode, user, onSave }: UserModalProps) {
  const { notifyError } = useNotifications()
  const [formData, setFormData] = useState<Partial<User & { password?: string }>>({
    name: "",
    email: "",
    phone: "",
    role: "technician",
    department: "",
    status: "active",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [supervisors, setSupervisors] = useState<User[]>([])
  
  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  useEffect(() => {
    if (user && (mode === "edit" || mode === "view")) {
      setFormData(user)
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "technician",
        department: "",
        status: "active",
        password: "",
      })
    }
  }, [user, mode, open])

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const users = await api.getUsers()
        setSupervisors(users.filter(u => u.role === 'supervisor'))
      } catch (error) {
        console.error('Failed to fetch supervisors:', error)
      }
    }
    if (open) {
      fetchSupervisors()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode !== "view") {
      // Validate required fields
      if (!formData.name?.trim()) {
        notifyError("Validation Error", "Full Name is required")
        return
      }
      if (!formData.email?.trim()) {
        notifyError("Validation Error", "Email is required")
        return
      }
      if (!formData.role) {
        notifyError("Validation Error", "Role is required")
        return
      }
      if (!formData.status) {
        notifyError("Validation Error", "Status is required")
        return
      }
      if (mode === "add" && !formData.password?.trim()) {
        notifyError("Validation Error", "Password is required for new users")
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
  }

  const isViewMode = mode === "view"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" && "Add New User"}
            {mode === "edit" && "Edit User"}
            {mode === "view" && "User Details"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" && "Create a new user account"}
            {mode === "edit" && "Update user information"}
            {mode === "view" && "View user information"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {mode === "view" && user && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>User ID</Label>
                  <div className="text-sm font-medium">{user.id}</div>
                </div>
                <div className="space-y-2">
                  <Label>Created Date</Label>
                  <div className="text-sm">{formatDate(user.createdDate)}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isViewMode}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isViewMode}
                  required
                />
              </div>
            </div>

            {(mode === "add" || mode === "edit") && (
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={mode === "add"}
                  placeholder={mode === "edit" ? "Leave blank to keep current password" : "Enter password"}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isViewMode}
                  placeholder="+254 700 000 000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department || ""}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={isViewMode}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                {isViewMode ? (
                  <div className="flex items-center h-10">
                    <Badge
                      className={
                        formData.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : formData.role === "supervisor"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }
                    >
                      {formData.role?.charAt(0).toUpperCase() + formData.role?.slice(1)}
                    </Badge>
                  </div>
                ) : (
                  <Select
                    value={formData.role}
                    onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                {isViewMode ? (
                  <div className="flex items-center h-10">
                    <Badge
                      variant={
                        formData.status === "active"
                          ? "default"
                          : formData.status === "inactive"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1)}
                    </Badge>
                  </div>
                ) : (
                  <Select
                    value={formData.status}
                    onValueChange={(value: UserStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {formData.role === "technician" && (
              <div className="space-y-2">
                <Label htmlFor="supervisorId">Supervisor</Label>
                {isViewMode ? (
                  <div className="text-sm">{formData.supervisorName || "Not assigned"}</div>
                ) : (
                  <Select
                    value={formData.supervisorId || ""}
                    onValueChange={(value) => {
                      const supervisor = supervisors.find(s => s.id === value)
                      setFormData({ 
                        ...formData, 
                        supervisorId: value || undefined,
                        supervisorName: supervisor?.name || undefined
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      {supervisors.map((supervisor) => (
                        <SelectItem key={supervisor.id} value={supervisor.id}>
                          {supervisor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {mode === "view" && user?.lastLogin && (
              <div className="space-y-2">
                <Label>Last Login</Label>
                <div className="text-sm">{formatDate(user.lastLogin)}</div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {isViewMode ? "Close" : "Cancel"}
            </Button>
            {!isViewMode && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "add" ? "Add User" : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
