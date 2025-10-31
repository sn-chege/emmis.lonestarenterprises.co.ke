"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MaintenanceModal } from "@/components/maintenance/maintenance-modal"
import { TemplatesModal } from "@/components/maintenance/templates-modal"
import { api } from "@/lib/api"
import type { MaintenanceRecord, MaintenanceTemplate } from "@/lib/types"
import { formatDate } from "@/lib/utils/format"
import { Wrench, FileText, Search, Eye, Edit, Trash2, Play, CheckCircle, Calendar, FileBarChart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ProtectedLayout } from "@/components/protected-layout"

export default function MaintenancePage() {
  const { toast } = useToast()
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([])
  const [templates, setTemplates] = useState<MaintenanceTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRecord | null>(null)
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | "complete" | "reschedule">("add")

  const filteredMaintenance = useMemo(() => {
    return maintenance.filter((m) => {
      const matchesSearch =
        m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === "all" || m.type === typeFilter
      const matchesStatus = statusFilter === "all" || m.status === statusFilter
      const matchesPriority = priorityFilter === "all" || m.priority === priorityFilter
      return matchesSearch && matchesType && matchesStatus && matchesPriority
    })
  }, [maintenance, searchTerm, typeFilter, statusFilter, priorityFilter])

  const handleAdd = () => {
    setSelectedMaintenance(null)
    setModalMode("add")
    setModalOpen(true)
  }

  const handleEdit = (m: MaintenanceRecord) => {
    setSelectedMaintenance(m)
    setModalMode("edit")
    setModalOpen(true)
  }

  const handleView = (m: MaintenanceRecord) => {
    setSelectedMaintenance(m)
    setModalMode("view")
    setModalOpen(true)
  }

  const handleComplete = (m: MaintenanceRecord) => {
    setSelectedMaintenance(m)
    setModalMode("complete")
    setModalOpen(true)
  }

  const handleReschedule = (m: MaintenanceRecord) => {
    setSelectedMaintenance(m)
    setModalMode("reschedule")
    setModalOpen(true)
  }

  const handleStart = async (id: string) => {
    try {
      const updatedMaintenance = await api.updateMaintenanceSchedule(id, { status: "inProgress" })
      setMaintenance((prev) => prev.map((m) => (m.id === id ? updatedMaintenance : m)))
      toast({
        title: "Maintenance Started",
        description: "Maintenance task has been started successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start maintenance",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    const m = maintenance.find((item) => item.id === id)
    if (m?.status === "inProgress") {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete maintenance that is in progress.",
        variant: "destructive",
      })
      return
    }
    if (confirm("Are you sure you want to delete this maintenance record?")) {
      try {
        await api.deleteMaintenanceSchedule(id)
        setMaintenance((prev) => prev.filter((m) => m.id !== id))
        toast({
          title: "Maintenance Deleted",
          description: "Maintenance record has been deleted successfully.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete maintenance record",
          variant: "destructive",
        })
      }
    }
  }

  const handleSave = async (data: MaintenanceRecord) => {
    try {
      if (modalMode === "add") {
        const newMaintenance = await api.createMaintenanceSchedule({
          id: `MNT${String(maintenance.length + 1).padStart(3, "0")}`,
          ...data,
        })
        setMaintenance((prev) => [...prev, newMaintenance])
        toast({
          title: "Maintenance Scheduled",
          description: "Maintenance has been scheduled successfully.",
        })
      } else if (modalMode === "edit" || modalMode === "complete" || modalMode === "reschedule") {
        const updatedMaintenance = await api.updateMaintenanceSchedule(data.id, data)
        setMaintenance((prev) => prev.map((m) => (m.id === data.id ? updatedMaintenance : m)))
        toast({
          title: "Maintenance Updated",
          description: "Maintenance has been updated successfully.",
        })
      }
      setModalOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save maintenance",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "outline",
      "inProgress": "default",
      completed: "secondary",
      overdue: "destructive",
      cancelled: "secondary",
    }
    return variants[status] || "default"
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "secondary",
      medium: "outline",
      high: "default",
      critical: "destructive",
    }
    return variants[priority] || "default"
  }

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      service: "default",
      repair: "destructive",
      preventive: "secondary",
      emergency: "destructive",
    }
    return variants[type] || "default"
  }

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const data = await api.getMaintenanceSchedules()
        setMaintenance(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load maintenance schedules",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchMaintenance()
  }, [])

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="text-center">Loading maintenance schedules...</div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance Management</h1>
            <p className="text-muted-foreground mt-2">Schedule, track and manage equipment maintenance activities</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setTemplatesModalOpen(true)}>
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </Button>
            <Button onClick={handleAdd}>
              <Wrench className="mr-2 h-4 w-4" />
              Schedule Maintenance
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Find and filter maintenance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search maintenance..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Records ({filteredMaintenance.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaintenance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No maintenance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMaintenance.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{m.equipmentName}</div>
                            <div className="text-sm text-muted-foreground">{m.serialNo}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeBadge(m.type)}>{m.type}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(m.scheduledDate)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(m.status)}>{m.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadge(m.priority)}>{m.priority}</Badge>
                        </TableCell>
                        <TableCell>{m.technicianName || "Unassigned"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleView(m)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {m.status === "scheduled" && (
                              <Button variant="ghost" size="icon" onClick={() => handleStart(m.id)}>
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {(m.status === "scheduled" || m.status === "overdue") && (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(m)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleReschedule(m)}>
                                  <Calendar className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {m.status === "inProgress" && (
                              <Button variant="ghost" size="icon" onClick={() => handleComplete(m)}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {m.status === "completed" && (
                              <Button variant="ghost" size="icon" onClick={() => handleView(m)}>
                                <FileBarChart className="h-4 w-4" />
                              </Button>
                            )}
                            {m.status !== "inProgress" && (
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}>
                                <Trash2 className="h-4 w-4" />
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

        <MaintenanceModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          maintenance={selectedMaintenance}
          onSave={handleSave}
        />

        <TemplatesModal
          open={templatesModalOpen}
          onOpenChange={setTemplatesModalOpen}
          templates={templates}
          onTemplatesChange={setTemplates}
        />
      </div>
    </ProtectedLayout>
  )
}
