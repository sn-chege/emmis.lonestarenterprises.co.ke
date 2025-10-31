"use client"

import { useState, useMemo, useEffect } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, FilterX, Download, Eye, Edit, Package, FileText } from "lucide-react"
import { api } from "@/lib/api"
import type { Customer } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { CustomerModal } from "@/components/customers/customer-modal"
import { useNotifications } from "@/components/notification-provider"

export default function CustomersPage() {
  const { notifySuccess, notifyError, notifyDelete } = useNotifications()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [contractFilter, setContractFilter] = useState<string>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        searchTerm === "" ||
        customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || customer.status === statusFilter
      const matchesPayment = paymentFilter === "all" || customer.paymentStatus === paymentFilter
      const matchesContract = contractFilter === "all" || customer.contractStatus === contractFilter

      return matchesSearch && matchesStatus && matchesPayment && matchesContract
    })
  }, [customers, searchTerm, statusFilter, paymentFilter, contractFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPaymentFilter("all")
    setContractFilter("all")
  }

  const handleAddCustomer = () => {
    setModalMode("add")
    setSelectedCustomer(null)
    setModalOpen(true)
  }

  const handleViewCustomer = (customer: Customer) => {
    setModalMode("view")
    setSelectedCustomer(customer)
    setModalOpen(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setModalMode("edit")
    setSelectedCustomer(customer)
    setModalOpen(true)
  }

  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    try {
      if (modalMode === "add") {
        const newCustomer = await api.createCustomer({
          id: `CUST${String(customers.length + 1).padStart(3, "0")}`,
          status: "Active",
          contractStatus: "Pending",
          paymentStatus: "NA",
          monthlyAmount: 0,
          totalEquipment: 0,
          ...customerData,
        })
        setCustomers([...customers, newCustomer])
        notifySuccess("Customer Added", `${newCustomer.companyName} has been added successfully.`)
        setModalOpen(false)
      } else if (modalMode === "edit" && selectedCustomer) {
        const updatedCustomer = await api.updateCustomer(selectedCustomer.id, customerData)
        setCustomers(customers.map((c) => (c.id === selectedCustomer.id ? updatedCustomer : c)))
        notifySuccess("Customer Updated", `${updatedCustomer.companyName} has been updated successfully.`)
        setModalOpen(false)
      }
    } catch (error) {
      // Error will be handled by the modal's notification system
      throw error
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const customer = customers.find((c) => c.id === customerId)
      await api.deleteCustomer(customerId)
      setCustomers(customers.filter((c) => c.id !== customerId))
      notifyDelete("Customer Deleted", `${customer?.companyName} has been deleted successfully.`)
      setModalOpen(false)
    } catch (error) {
      notifyError("Error", "Failed to delete customer")
    }
  }

  const exportToExcel = () => {
    notifySuccess("Export Started", "Exporting customer data to Excel...")
  }

  const getPaymentBadgeVariant = (status: string) => {
    switch (status) {
      case "Current":
        return "default"
      case "Overdue":
        return "destructive"
      case "Pending":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getContractBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Expired":
        return "destructive"
      case "Renewal Due":
        return "secondary"
      default:
        return "outline"
    }
  }

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await api.getCustomers()
        setCustomers(data)
      } catch (error) {
        notifyError("Error", "Failed to load customers")
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="text-center">Loading customers...</div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Customer Management</h1>
            <p className="text-slate-600 mt-1">Manage your customers and their equipment</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => notifySuccess("Import Started", "Import customers functionality coming soon...")}>
              <Download className="w-4 h-4 mr-2 rotate-180" />
              Import
            </Button>
            <Button onClick={handleAddCustomer}>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
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
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Payment</label>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="Current">Current</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
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
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Company Details</TableHead>
                    <TableHead>Contact Information</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Contract Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-semibold">{customer.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-semibold text-slate-900">{customer.companyName}</div>
                            <div className="text-sm text-slate-600">
                              {customer.industry} • Est. {customer.established}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900">{customer.contactPerson}</div>
                            <div className="text-sm text-slate-600">{customer.email}</div>
                            <div className="text-sm text-slate-600">{customer.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-semibold text-slate-900">{customer.totalEquipment} Equipment</div>
                            <div className="text-sm text-slate-600">{customer.equipmentDetails}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={getContractBadgeVariant(customer.contractStatus)}>
                              {customer.contractStatus}
                            </Badge>
                            <div className="text-xs text-slate-600">Expires {formatDate(customer.contractExpiry)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={getPaymentBadgeVariant(customer.paymentStatus)}>
                              {customer.paymentStatus}
                            </Badge>
                            <div className="text-xs text-slate-600">{formatCurrency(customer.monthlyAmount)}/month</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewCustomer(customer)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Package className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <FileText className="w-4 h-4" />
                            </Button>
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
      </div>

      <CustomerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        customer={selectedCustomer}
        onSave={handleSaveCustomer}
        onDelete={handleDeleteCustomer}
      />
    </ProtectedLayout>
  )
}
