export type UserRole = "admin" | "supervisor" | "technician"

export type UserStatus = "active" | "inactive" | "suspended"



export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  phone?: string
  department?: string
  status: UserStatus
  lastLogin?: string
  createdDate: string
  // Technician-specific fields
  specialization?: string
  experience?: number
  supervisorId?: string
  supervisorName?: string
  hireDate?: string
}

export type CustomerStatus = "Active" | "Inactive" | "Pending" | "Suspended"
export type ContractStatus = "Active" | "Expired" | "Renewal Due" | "Pending"
export type PaymentStatus = "Current" | "Overdue" | "Pending" | "N/A"

export interface Customer {
  id: string
  companyName: string
  industry?: string
  established?: string
  contactPerson: string
  title?: string
  email: string
  phone: string
  address: string
  location?: string
  status: CustomerStatus
  contractStatus: ContractStatus
  paymentStatus: PaymentStatus
  monthlyAmount: number
  totalEquipment: number
  contractExpiry?: string
  equipmentDetails?: string
  technician?: string
  supervisor?: string
}

export type AssetCondition = "new" | "good" | "damaged" | "poor"
export type AssetStatus = "operational" | "maintenance" | "repair" | "retired"
export type LocationType = "fixed" | "mobile"

export interface RepairHistory {
  date: string
  description: string
  cost: number
  technician: string
}

export interface Asset {
  id: string
  make: string
  model: string
  serialNumber: string
  category?: string
  description?: string
  customerId: string
  customerName: string
  contactPerson?: string
  contactPhone?: string
  location: string
  locationDetails?: string
  locationType: LocationType
  condition: AssetCondition
  status: AssetStatus
  purchaseDate?: string
  purchasePrice: number
  currentValue: number
  warrantyStart?: string
  warrantyEnd?: string
  warrantyProvider?: string
  lastServiceDate?: string
  nextServiceDate?: string
  photoUrl?: string | null
  repairHistory: RepairHistory[]
  notes?: string
}

export type WorkOrderType = "service" | "repair"
export type WorkOrderStatus = "open" | "assigned" | "in-progress" | "completed" | "cancelled"
export type WorkOrderPriority = "low" | "medium" | "high" | "critical"
export type ServiceType = "scheduled" | "unscheduled"

export interface ConsumablePart {
  name: string
  quantity: number
  cost: number
}

export interface WorkOrder {
  id: string
  customerName: string
  contactPerson: string
  contactPhone: string
  equipmentName: string
  equipmentMake: string
  equipmentModel: string
  serialNo: string
  location: string
  type: WorkOrderType
  serviceType: ServiceType
  priority: WorkOrderPriority
  status: WorkOrderStatus
  technicianName?: string | null
  supervisorName?: string | null
  dueDate: string
  createdDate: string
  completedDate?: string
  description: string
  faultDescription?: string
  workCarriedOut?: string
  consumableParts?: ConsumablePart[]
  pageCount?: number
  nextServiceDate?: string | null
  estimatedCost: number
  actualCost?: number
  cancelReason?: string
}

export type MaintenanceType = "service" | "repair" | "preventive" | "emergency"
export type MaintenanceStatus = "scheduled" | "in-progress" | "completed" | "overdue" | "cancelled"
export type MaintenancePriority = "low" | "medium" | "high" | "critical"

export interface MaintenanceRecord {
  id: string
  equipmentId: string
  equipmentName: string
  serialNo: string
  customerId?: string
  customerName?: string
  type: MaintenanceType
  serviceType: ServiceType
  description: string
  faultDescription?: string
  scheduledDate: string
  status: MaintenanceStatus
  priority: MaintenancePriority
  technicianId?: string | null
  technicianName?: string | null
  pageCount?: number | null
  estimatedDuration?: number | null
  actualDuration?: number | null
  createdDate: string
  completedDate?: string | null
  workCarriedOut?: string | null
  consumableParts: string[]
  notes?: string | null
}

export interface MaintenanceTemplate {
  id: string
  name: string
  description: string
  type: MaintenanceType
  estimatedDuration: number
  checklist: string[]
  notes?: string
}


