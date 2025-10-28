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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode !== "view") {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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

            {mode === "view" && user?.lastLogin && (
              <div className="space-y-2">
                <Label>Last Login</Label>
                <div className="text-sm">{formatDate(user.lastLogin)}</div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
