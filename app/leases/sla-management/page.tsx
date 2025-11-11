"use client"

import { useState, useEffect } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SLAModal } from "@/components/leases/sla-modal"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { useNotifications } from "@/components/notification-provider"
import {
  ArrowLeft,
  ShieldCheck,
  Plus,
  Edit,
  Eye,
  Trash2,
  Clock,
  Target,
  Calendar,
} from "lucide-react"
import Link from "next/link"

interface SLAData {
  id: string
  name: string
  description: string
  customerId: string
  customerName: string
  serviceLevel: 'basic' | 'standard' | 'premium' | 'enterprise'
  responseTime: string
  resolutionTime: string
  availability: string
  penalties: string
  startDate: string
  endDate: string
  status: 'active' | 'inactive' | 'expired' | 'pending'
  createdDate: string
  lastModified: string
  terms: any[]
}

export default function SLAManagementPage() {
  const { notifySuccess, notifyError, notifyDelete } = useNotifications()
  const [slas, setSlas] = useState<SLAData[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add")
  const [selectedSLA, setSelectedSLA] = useState<SLAData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [slaToDelete, setSlaToDelete] = useState<SLAData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchSLAs = async () => {
      try {
        console.log('Fetching SLAs from /api/sla')
        const response = await fetch('/api/sla')
        console.log('Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('SLA data received:', data)
          setSlas(data)
        } else {
          const errorText = await response.text()
          console.error('API error:', response.status, errorText)
          setSlas([])
        }
      } catch (error) {
        console.error('Failed to fetch SLAs:', error)
        setSlas([])
      } finally {
        setLoading(false)
      }
    }
    fetchSLAs()
  }, [])

  const getServiceLevelBadge = (level: string) => {
    const variants = {
      basic: "secondary",
      standard: "default", 
      premium: "default",
      enterprise: "default"
    } as const
    return <Badge variant={variants[level as keyof typeof variants]}>{level.charAt(0).toUpperCase() + level.slice(1)}</Badge>
  }

  const handleAdd = () => {
    setModalMode("add")
    setSelectedSLA(null)
    setModalOpen(true)
  }

  const handleEdit = (sla: SLAData) => {
    setModalMode("edit")
    setSelectedSLA(sla)
    setModalOpen(true)
  }

  const handleView = (sla: SLAData) => {
    setModalMode("view")
    setSelectedSLA(sla)
    setModalOpen(true)
  }

  const handleDelete = (sla: SLAData) => {
    setSlaToDelete(sla)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!slaToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/sla/${slaToDelete.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete SLA')
      
      setSlas(prev => prev.filter(s => s.id !== slaToDelete.id))
      notifyDelete("SLA Deleted", `SLA ${slaToDelete.id} has been deleted successfully.`)
      setDeleteDialogOpen(false)
      setSlaToDelete(null)
    } catch (error) {
      console.error('Delete SLA error:', error)
      notifyError("Delete Failed", error instanceof Error ? error.message : 'Failed to delete SLA')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSave = async (data: Partial<SLAData>) => {
    try {
      if (modalMode === "add") {
        const response = await fetch('/api/sla', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        if (!response.ok) throw new Error('Failed to create SLA')
        const newSLA = await response.json()
        
        setSlas(prev => [newSLA, ...prev])
        notifySuccess("SLA Created", `SLA "${data.name}" has been created successfully.`)
      } else if (modalMode === "edit" && selectedSLA) {
        const response = await fetch(`/api/sla/${selectedSLA.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        if (!response.ok) throw new Error('Failed to update SLA')
        const updatedSLA = await response.json()
        
        setSlas(prev => prev.map(s => s.id === selectedSLA.id ? updatedSLA : s))
        notifySuccess("SLA Updated", `SLA "${data.name}" has been updated successfully.`)
      }
    } catch (error) {
      console.error('Save SLA error:', error)
      notifyError("Save Failed", error instanceof Error ? error.message : 'Failed to save SLA')
      throw error
    }
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="text-center">Loading SLA templates...</div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/leases">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">SLA Management</h1>
              <p className="text-muted-foreground">Service Level Agreement templates and definitions</p>
            </div>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Create SLA Template
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
              <ShieldCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{slas.filter(s => s.status === 'active').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24h</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Uptime</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.6%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coverage Types</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>SLA Templates</CardTitle>
            <CardDescription>Predefined service level agreement templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SLA Name</TableHead>
                    <TableHead>Service Level</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Resolution Time</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slas.map((sla) => (
                    <TableRow key={sla.id}>
                      <TableCell className="font-medium">{sla.name}</TableCell>
                      <TableCell>{getServiceLevelBadge(sla.serviceLevel)}</TableCell>
                      <TableCell>{sla.responseTime}</TableCell>
                      <TableCell>{sla.resolutionTime}</TableCell>
                      <TableCell>{sla.availability}</TableCell>
                      <TableCell>
                        <Badge variant={sla.status === 'active' ? "default" : "secondary"}>
                          {sla.status.charAt(0).toUpperCase() + sla.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleView(sla)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(sla)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(sla)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <SLAModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          sla={selectedSLA}
          onSave={handleSave}
        />

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete SLA"
          description={`Are you sure you want to delete SLA "${slaToDelete?.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
        />
      </div>
    </ProtectedLayout>
  )
}