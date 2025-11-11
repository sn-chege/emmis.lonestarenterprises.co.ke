"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Share2, Printer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/format"
import { DataTable } from "@/components/ui/data-table"

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
      const response = await fetch(`/api/reports/${id}`)
      if (response.ok) {
        const data = await response.json()
        setReport(data)
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
            <div className="prose max-w-none">
              {report.content ? (
                <div dangerouslySetInnerHTML={{ __html: report.content }} />
              ) : (
                <ReportContent type={report.type} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}

function ReportContent({ type }: { type: string }) {
  const equipmentData = [
    { id: "AST001", name: "Generator Set A", status: "Active", location: "Site A" },
    { id: "AST002", name: "Pump Unit B", status: "Maintenance", location: "Site B" },
    { id: "AST003", name: "Compressor C", status: "Active", location: "Site C" },
    { id: "AST004", name: "Air Compressor D", status: "Active", location: "Site D" },
    { id: "AST005", name: "Hydraulic Press E", status: "Inactive", location: "Site E" },
  ]

  const equipmentColumns = [
    { accessorKey: "id", header: "Asset ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "location", header: "Location" },
  ]

  const getReportContent = () => {
    switch (type.toLowerCase()) {
      case 'equipment reports':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Equipment Inventory Report</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-semibold">Total Assets</h3>
                <p className="text-2xl font-bold text-blue-600">247</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <h3 className="font-semibold">Active Assets</h3>
                <p className="text-2xl font-bold text-green-600">198</p>
              </div>
            </div>
            <DataTable 
              columns={equipmentColumns} 
              data={equipmentData} 
              searchKey="name"
              searchPlaceholder="Search equipment..."
            />
          </div>
        )
      case 'work order reports':
        const workOrderData = [
          { id: "WO001", asset: "Generator Set A", status: "Open", priority: "High" },
          { id: "WO002", asset: "Pump Unit B", status: "In Progress", priority: "Medium" },
          { id: "WO003", asset: "Compressor C", status: "Completed", priority: "Low" },
          { id: "WO004", asset: "Air Compressor D", status: "Open", priority: "Medium" },
          { id: "WO005", asset: "Hydraulic Press E", status: "In Progress", priority: "High" },
        ]
        
        const workOrderColumns = [
          { accessorKey: "id", header: "Work Order" },
          { accessorKey: "asset", header: "Asset" },
          { accessorKey: "status", header: "Status" },
          { accessorKey: "priority", header: "Priority" },
        ]
        
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Work Order Summary Report</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-4 rounded">
                <h3 className="font-semibold">Open Orders</h3>
                <p className="text-2xl font-bold text-yellow-600">23</p>
              </div>
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-semibold">In Progress</h3>
                <p className="text-2xl font-bold text-blue-600">15</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <h3 className="font-semibold">Completed</h3>
                <p className="text-2xl font-bold text-green-600">142</p>
              </div>
            </div>
            <DataTable 
              columns={workOrderColumns} 
              data={workOrderData} 
              searchKey="asset"
              searchPlaceholder="Search work orders..."
            />
          </div>
        )
      case 'financial & lease reports':
        const leaseData = [
          { customer: "ABC Corp", amount: "KES 45,000", status: "Active", nextPayment: "2024-03-15" },
          { customer: "XYZ Ltd", amount: "KES 32,000", status: "Active", nextPayment: "2024-03-20" },
          { customer: "DEF Inc", amount: "KES 28,500", status: "Overdue", nextPayment: "2024-02-28" },
          { customer: "GHI Corp", amount: "KES 52,000", status: "Active", nextPayment: "2024-03-25" },
          { customer: "JKL Ltd", amount: "KES 38,000", status: "Pending", nextPayment: "2024-03-30" },
        ]
        
        const leaseColumns = [
          { accessorKey: "customer", header: "Customer" },
          { accessorKey: "amount", header: "Lease Amount" },
          { accessorKey: "status", header: "Status" },
          { accessorKey: "nextPayment", header: "Next Payment" },
        ]
        
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Financial & Lease Analysis Report</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded">
                <h3 className="font-semibold">Monthly Revenue</h3>
                <p className="text-2xl font-bold text-green-600">KES 2,450,000</p>
              </div>
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-semibold">Active Leases</h3>
                <p className="text-2xl font-bold text-blue-600">89</p>
              </div>
            </div>
            <DataTable 
              columns={leaseColumns} 
              data={leaseData} 
              searchKey="customer"
              searchPlaceholder="Search customers..."
            />
          </div>
        )
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{type} Report</h2>
            <div className="bg-gray-50 p-8 rounded text-center">
              <p className="text-gray-600">Report content for {type} will be displayed here.</p>
              <p className="text-sm text-gray-500 mt-2">This is a sample report view.</p>
            </div>
          </div>
        )
    }
  }

  return getReportContent()
}