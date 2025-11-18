"use client"

import { useState, useMemo, useEffect } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, FilterX, Download, Eye, Edit, Wrench, History } from "lucide-react"
import { api } from "@/lib/api"
import type { Asset } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { AssetModal } from "@/components/assets/asset-modal"
import { useNotifications } from "@/components/notification-provider"
import { DataTable } from "@/components/ui/data-table"
import { useTableExport } from "@/hooks/use-table-export"
import { CSVImportModal } from "@/components/ui/csv-import-modal"

export default function AssetsPage() {
  const { notifySuccess, notifyError, notifyDelete } = useNotifications()
  const [assets, setAssets] = useState<Asset[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [customerFilter, setCustomerFilter] = useState<string>("all")
  const [conditionFilter, setConditionFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add")
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        searchTerm === "" ||
        asset.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.customerName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCustomer = customerFilter === "all" || asset.customerId === customerFilter
      const matchesCondition = conditionFilter === "all" || asset.conditionStatus === conditionFilter
      const matchesStatus = statusFilter === "all" || asset.operationalStatus === statusFilter

      return matchesSearch && matchesCustomer && matchesCondition && matchesStatus
    })
  }, [assets, searchTerm, customerFilter, conditionFilter, statusFilter])

  const assetColumns = [
    { accessorKey: "id", header: "Asset ID" },
    { accessorKey: "make", header: "Make" },
    { accessorKey: "model", header: "Model" },
    { accessorKey: "serialNumber", header: "Serial Number" },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "conditionStatus", header: "Condition" },
    { accessorKey: "operationalStatus", header: "Status" },
    { accessorKey: "currentValue", header: "Current Value" },
  ]

  const { exportToExcel } = useTableExport(filteredAssets, assetColumns, "Assets")

  const clearFilters = () => {
    setSearchTerm("")
    setCustomerFilter("all")
    setConditionFilter("all")
    setStatusFilter("all")
  }

  const handleAddAsset = () => {
    setModalMode("add")
    setSelectedAsset(null)
    setModalOpen(true)
  }

  const handleViewAsset = (asset: Asset) => {
    setModalMode("view")
    setSelectedAsset(asset)
    setModalOpen(true)
  }

  const handleEditAsset = (asset: Asset) => {
    setModalMode("edit")
    setSelectedAsset(asset)
    setModalOpen(true)
  }

  const handleSaveAsset = async (assetData: Partial<Asset>) => {
    try {
      if (modalMode === "add") {
        const newAsset = await api.createAsset({
          id: `AST${String(assets.length + 1).padStart(3, "0")}`,
          conditionStatus: "good",
          operationalStatus: "operational",
          locationType: "fixed",
          purchasePrice: 0,
          currentValue: 0,
          ...assetData,
        })
        setAssets([...assets, newAsset])
        notifySuccess("Asset Added", `${newAsset.make} ${newAsset.model} has been added successfully.`)
        setModalOpen(false)
      } else if (modalMode === "edit" && selectedAsset) {
        const updatedAsset = await api.updateAsset(selectedAsset.id, assetData)
        setAssets(assets.map((a) => (a.id === selectedAsset.id ? updatedAsset : a)))
        notifySuccess("Asset Updated", `${updatedAsset.make} ${updatedAsset.model} has been updated successfully.`)
        setModalOpen(false)
      }
    } catch (error) {
      // Error will be handled by the modal's notification system
      throw error
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    try {
      const asset = assets.find((a) => a.id === assetId)
      await api.deleteAsset(assetId)
      setAssets(assets.filter((a) => a.id !== assetId))
      notifyDelete("Asset Deleted", `${asset?.make} ${asset?.model} has been deleted successfully.`)
      setModalOpen(false)
    } catch (error) {
      notifyError("Error", "Failed to delete asset")
    }
  }

  const handleExportToExcel = () => {
    exportToExcel()
    notifySuccess("Export Started", "Exporting asset data to Excel...")
  }

  const handleImport = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/assets/import', {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    
    if (result.success) {
      const assetsData = await api.getAssets()
      setAssets(assetsData)
      notifySuccess("Import Completed", result.message)
    }
    
    return result
  }

  const getConditionBadgeVariant = (condition: string) => {
    switch (condition) {
      case "new":
        return "default"
      case "good":
        return "default"
      case "damaged":
        return "secondary"
      case "poor":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "operational":
        return "default"
      case "maintenance":
        return "secondary"
      case "repair":
        return "destructive"
      case "retired":
        return "outline"
      default:
        return "outline"
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsData, customersData] = await Promise.all([
          api.getAssets(),
          api.getCustomers()
        ])
        setAssets(assetsData)
        setCustomers(customersData)
      } catch (error) {
        notifyError("Error", "Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="text-center">Loading assets...</div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Assets & Equipment</h1>
            <p className="text-slate-600 mt-1">Manage and track all equipment and assets</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExportToExcel}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => setImportModalOpen(true)}>
              <Download className="w-4 h-4 mr-2 rotate-180" />
              Import
            </Button>
            <Button onClick={handleAddAsset}>
              <Plus className="w-4 h-4 mr-2" />
              Add Equipment
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Customer</label>
                <Select value={customerFilter} onValueChange={setCustomerFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Condition</label>
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={clearFilters}>
                <FilterX className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <DataTable 
              columns={[
                { accessorKey: "id", header: "Asset ID" },
                { 
                  accessorKey: "make", 
                  header: "Equipment Details",
                  cell: ({ row }) => (
                    <div>
                      <div className="font-semibold text-slate-900">
                        {row.getValue("make")} {row.original.model}
                      </div>
                      <div className="text-sm text-slate-600">{row.original.category}</div>
                      <div className="text-xs text-slate-500">SN: {row.original.serialNumber}</div>
                    </div>
                  )
                },
                { 
                  accessorKey: "customerName", 
                  header: "Customer",
                  cell: ({ row }) => (
                    <div>
                      <div className="font-medium text-slate-900">{row.getValue("customerName")}</div>
                      <div className="text-sm text-slate-600">{row.original.contactPerson}</div>
                    </div>
                  )
                },
                { 
                  accessorKey: "location", 
                  header: "Location",
                  cell: ({ row }) => (
                    <div>
                      <div className="font-medium text-slate-900">{row.getValue("location")}</div>
                      <div className="text-sm text-slate-600">{row.original.locationDetails}</div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {row.original.locationType}
                      </Badge>
                    </div>
                  )
                },
                { 
                  accessorKey: "conditionStatus", 
                  header: "Condition",
                  cell: ({ row }) => (
                    <Badge variant={getConditionBadgeVariant(row.getValue("conditionStatus"))} className="capitalize">
                      {row.getValue("conditionStatus")}
                    </Badge>
                  )
                },
                { 
                  accessorKey: "operationalStatus", 
                  header: "Status",
                  cell: ({ row }) => (
                    <Badge variant={getStatusBadgeVariant(row.getValue("operationalStatus"))} className="capitalize">
                      {row.getValue("operationalStatus")}
                    </Badge>
                  )
                },
                { 
                  accessorKey: "currentValue", 
                  header: "Value",
                  cell: ({ row }) => (
                    <div>
                      <div className="font-semibold text-slate-900">{formatCurrency(row.getValue("currentValue"))}</div>
                      <div className="text-xs text-slate-500">
                        Purchase: {formatCurrency(row.original.purchasePrice)}
                      </div>
                    </div>
                  )
                },
                { 
                  accessorKey: "warrantyEnd", 
                  header: "Warranty",
                  cell: ({ row }) => (
                    <div className="text-sm">
                      {row.getValue("warrantyEnd") ? (
                        <>
                          <div className="text-slate-900">Until {formatDate(row.getValue("warrantyEnd"))}</div>
                          <div className="text-xs text-slate-500">{row.original.warrantyProvider}</div>
                        </>
                      ) : (
                        <span className="text-slate-500">No warranty</span>
                      )}
                    </div>
                  )
                },
                {
                  id: "actions",
                  header: "Actions",
                  cell: ({ row }) => {
                    const asset = row.original
                    return (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewAsset(asset)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditAsset(asset)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Wrench className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <History className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  }
                }
              ]}
              data={filteredAssets}
              searchKey="make"
              searchPlaceholder="Search equipment..."
              title="Assets"
            />
          </CardContent>
        </Card>
      </div>

      <AssetModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        asset={selectedAsset}
        onSave={handleSaveAsset}
        onDelete={handleDeleteAsset}
      />

      <CSVImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        entityType="assets"
        onImport={handleImport}
      />
    </ProtectedLayout>
  )
}
