"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Share2, Printer, TrendingUp, Package, Wrench, Users, DollarSign, FileBarChart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/format"
import { DataTable } from "@/components/ui/data-table"
import { api } from "@/lib/api"

interface ReportData {
  id: string
  name: string
  type: string
  generatedDate: string
  format: string
  size: string
  status: "completed" | "processing" | "failed"
  content: any
}

export default function ReportViewPage() {
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchReport(params.id as string)
    }
  }, [params.id])

  const fetchReport = async (id: string) => {
    try {
      // Handle report type IDs directly
      const reportTypes: Record<string, any> = {
        equipment: { id, name: "Equipment Reports", type: "Equipment", generatedDate: new Date().toISOString(), format: "Dashboard", size: "Live Data", status: "completed" },
        workorders: { id, name: "Work Order Reports", type: "Work Orders", generatedDate: new Date().toISOString(), format: "Dashboard", size: "Live Data", status: "completed" },
        service: { id, name: "Service Maintenance Reports", type: "Service", generatedDate: new Date().toISOString(), format: "Dashboard", size: "Live Data", status: "completed" },
        repair: { id, name: "Repair Maintenance Reports", type: "Repair", generatedDate: new Date().toISOString(), format: "Dashboard", size: "Live Data", status: "completed" },
        customer: { id, name: "Customer Reports", type: "Customer", generatedDate: new Date().toISOString(), format: "Dashboard", size: "Live Data", status: "completed" },
        financial: { id, name: "Financial & Lease Reports", type: "Financial", generatedDate: new Date().toISOString(), format: "Dashboard", size: "Live Data", status: "completed" }
      }
      
      if (reportTypes[id]) {
        setReport(reportTypes[id])
      }
    } catch (error) {
      console.error('Failed to fetch report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (!report) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Report Not Found</h1>
            <Button onClick={() => router.push('/reports')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Button>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/reports')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{report.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">{report.type}</Badge>
                <span className="text-sm text-muted-foreground">
                  Generated on {formatDate(report.generatedDate)}
                </span>
                <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                  {report.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Content</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportContent type={params.id as string} />
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}

function ReportContent({ type }: { type: string }) {
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [type])

  const fetchReportData = async () => {
    try {
      const [assets, workOrders, maintenance, customers, leases] = await Promise.all([
        api.getAssets().catch(() => []),
        api.getWorkOrders().catch(() => []),
        api.getMaintenanceSchedules().catch(() => []),
        api.getCustomers().catch(() => []),
        api.getLeases().catch(() => [])
      ])
      setData({ assets, workOrders, maintenance, customers, leases })
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  }

  const getReportContent = () => {
    switch (type.toLowerCase()) {
      case 'equipment':
        const totalAssets = data.assets?.length || 0
        const activeAssets = data.assets?.filter((a: any) => a.operationalStatus === 'operational').length || 0
        const maintenanceAssets = data.assets?.filter((a: any) => a.operationalStatus === 'maintenance').length || 0
        const repairAssets = data.assets?.filter((a: any) => a.operationalStatus === 'repair').length || 0
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Assets</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{totalAssets}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Operational</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{activeAssets}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Maintenance</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{maintenanceAssets}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Repair</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{repairAssets}</div></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle>Asset Inventory</CardTitle></CardHeader><CardContent><DataTable columns={[{accessorKey:"id",header:"Asset ID"},{accessorKey:"make",header:"Make"},{accessorKey:"model",header:"Model"},{accessorKey:"customerName",header:"Customer"},{accessorKey:"operationalStatus",header:"Status"}]} data={data.assets || []} searchKey="make" /></CardContent></Card>
          </div>
        )
        
      case 'workorders':
        const totalWO = data.workOrders?.length || 0
        const openWO = data.workOrders?.filter((w: any) => w.status === 'open').length || 0
        const inProgressWO = data.workOrders?.filter((w: any) => w.status === 'inProgress').length || 0
        const completedWO = data.workOrders?.filter((w: any) => w.status === 'completed').length || 0
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Orders</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{totalWO}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Open</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{openWO}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">In Progress</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{inProgressWO}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Completed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{completedWO}</div></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle>Work Orders</CardTitle></CardHeader><CardContent><DataTable columns={[{accessorKey:"id",header:"Work Order"},{accessorKey:"customerName",header:"Customer"},{accessorKey:"equipmentName",header:"Equipment"},{accessorKey:"status",header:"Status"},{accessorKey:"priority",header:"Priority"}]} data={data.workOrders || []} searchKey="customerName" /></CardContent></Card>
          </div>
        )
        
      case 'service':
        const serviceMaintenance = data.maintenance?.filter((m: any) => m.type === 'service') || []
        const scheduledService = serviceMaintenance.filter((m: any) => m.status === 'scheduled').length
        const completedService = serviceMaintenance.filter((m: any) => m.status === 'completed').length
        const overdueService = serviceMaintenance.filter((m: any) => m.status === 'overdue').length
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Service</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{serviceMaintenance.length}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Scheduled</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{scheduledService}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Completed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{completedService}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Overdue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{overdueService}</div></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle>Service Maintenance</CardTitle></CardHeader><CardContent><DataTable columns={[{accessorKey:"id",header:"ID"},{accessorKey:"equipmentName",header:"Equipment"},{accessorKey:"scheduledDate",header:"Scheduled Date"},{accessorKey:"status",header:"Status"},{accessorKey:"technicianName",header:"Technician"}]} data={serviceMaintenance} searchKey="equipmentName" /></CardContent></Card>
          </div>
        )
        
      case 'repair':
        const repairMaintenance = data.maintenance?.filter((m: any) => m.type === 'repair') || []
        const scheduledRepair = repairMaintenance.filter((m: any) => m.status === 'scheduled').length
        const completedRepair = repairMaintenance.filter((m: any) => m.status === 'completed').length
        const overdueRepair = repairMaintenance.filter((m: any) => m.status === 'overdue').length
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Repairs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{repairMaintenance.length}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Scheduled</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{scheduledRepair}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Completed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{completedRepair}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Overdue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{overdueRepair}</div></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle>Repair Maintenance</CardTitle></CardHeader><CardContent><DataTable columns={[{accessorKey:"id",header:"ID"},{accessorKey:"equipmentName",header:"Equipment"},{accessorKey:"scheduledDate",header:"Scheduled Date"},{accessorKey:"status",header:"Status"},{accessorKey:"priority",header:"Priority"}]} data={repairMaintenance} searchKey="equipmentName" /></CardContent></Card>
          </div>
        )
        
      case 'customer':
        const totalCustomers = data.customers?.length || 0
        const activeCustomers = data.customers?.filter((c: any) => c.status === 'Active').length || 0
        const inactiveCustomers = data.customers?.filter((c: any) => c.status === 'Inactive').length || 0
        const pendingCustomers = data.customers?.filter((c: any) => c.status === 'Pending').length || 0
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Customers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{totalCustomers}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{activeCustomers}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Inactive</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-gray-600">{inactiveCustomers}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{pendingCustomers}</div></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle>Customer Overview</CardTitle></CardHeader><CardContent><DataTable columns={[{accessorKey:"id",header:"Customer ID"},{accessorKey:"companyName",header:"Company"},{accessorKey:"contactPerson",header:"Contact"},{accessorKey:"status",header:"Status"},{accessorKey:"contractStatus",header:"Contract"}]} data={data.customers || []} searchKey="companyName" /></CardContent></Card>
          </div>
        )
        
      case 'financial':
        const totalLeases = data.leases?.length || 0
        const activeLeases = data.leases?.filter((l: any) => l.status === 'active').length || 0
        const totalRevenue = data.leases?.reduce((sum: number, l: any) => sum + parseFloat(l.paymentAmount || 0), 0) || 0
        const overduePayments = data.leases?.filter((l: any) => l.paymentStatus === 'overdue').length || 0
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Leases</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{totalLeases}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Active Leases</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{activeLeases}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">KES {totalRevenue.toLocaleString()}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Overdue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{overduePayments}</div></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle>Lease Overview</CardTitle></CardHeader><CardContent><DataTable columns={[{accessorKey:"id",header:"Lease ID"},{accessorKey:"customerName",header:"Customer"},{accessorKey:"equipmentName",header:"Equipment"},{accessorKey:"paymentAmount",header:"Amount"},{accessorKey:"status",header:"Status"}]} data={data.leases || []} searchKey="customerName" /></CardContent></Card>
          </div>
        )
        
      default:
        return <div className="text-center p-8"><p>Report type not found</p></div>
    }
  }

  return getReportContent()
}