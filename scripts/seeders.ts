import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { backupDatabase } from './backup-db'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')
  
  // Create backup before seeding
  try {
    await backupDatabase()
  } catch (error) {
    console.warn('⚠️ Backup failed, continuing with seeding:', error.message)
  }

  // Clear existing data
  await prisma.workOrder.deleteMany()
  await prisma.maintenanceSchedule.deleteMany()
  await prisma.lease.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  // Seed Users
  const hashedPassword = await bcrypt.hash('qwertyhudra45678911', 10)
  
  const users = await prisma.user.createMany({
    data: [
      {
        id: 'USR001',
        name: 'Admin User',
        email: 'admin45@emmis.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        department: 'Administration'
      },
      {
        id: 'USR002',
        name: 'John Supervisor',
        email: 'supervisor@emmis.com',
        password: hashedPassword,
        role: 'supervisor',
        status: 'active',
        department: 'Operations'
      },
      {
        id: 'USR003',
        name: 'Mike Technician',
        email: 'technician@emmis.com',
        password: hashedPassword,
        role: 'technician',
        status: 'active',
        department: 'Maintenance'
      }
    ]
  })

  // Seed Customers
  const customers = await prisma.customer.createMany({
    data: [
      {
        id: 'CUST001',
        companyName: 'TechCorp Solutions',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@techcorp.co.ke',
        phone: '+254 700 123 456',
        address: 'Westlands, Nairobi',
        industry: 'Technology',
        status: 'Active',
        contractStatus: 'Active',
        paymentStatus: 'Current',
        monthlyAmount: 25000,
        totalEquipment: 8,
        established: '2018'
      },
      {
        id: 'CUST002',
        companyName: 'Manufacturing Ltd',
        contactPerson: 'David Kimani',
        email: 'david@manufacturing.co.ke',
        phone: '+254 700 234 567',
        address: 'Industrial Area, Nairobi',
        industry: 'Manufacturing',
        status: 'Active',
        contractStatus: 'Active',
        paymentStatus: 'Current',
        monthlyAmount: 45000,
        totalEquipment: 12,
        established: '2015'
      },
      {
        id: 'CUST003',
        companyName: 'HealthCare Plus',
        contactPerson: 'Dr. Mary Wanjiku',
        email: 'mary@healthcare.co.ke',
        phone: '+254 700 345 678',
        address: 'Kilimani, Nairobi',
        industry: 'Healthcare',
        status: 'Active',
        contractStatus: 'Renewal Due',
        paymentStatus: 'Current',
        monthlyAmount: 35000,
        totalEquipment: 6,
        established: '2020'
      },
      {
        id: 'CUST004',
        companyName: 'EduTech Institute',
        contactPerson: 'Prof. James Mwangi',
        email: 'james@edutech.co.ke',
        phone: '+254 700 456 789',
        address: 'Karen, Nairobi',
        industry: 'Education',
        status: 'Active',
        contractStatus: 'Active',
        paymentStatus: 'Overdue',
        monthlyAmount: 18000,
        totalEquipment: 15,
        established: '2019'
      },
      {
        id: 'CUST005',
        companyName: 'Logistics Express',
        contactPerson: 'Grace Mutua',
        email: 'grace@logistics.co.ke',
        phone: '+254 700 567 890',
        address: 'Embakasi, Nairobi',
        industry: 'Logistics & Transport',
        status: 'Inactive',
        contractStatus: 'Expired',
        paymentStatus: 'Pending',
        monthlyAmount: 22000,
        totalEquipment: 4,
        established: '2017'
      }
    ]
  })

  // Seed Assets
  const assets = await prisma.asset.createMany({
    data: [
      {
        id: 'AST001',
        make: 'HP',
        model: 'LaserJet Pro 400',
        serialNumber: 'HP001234567',
        category: 'Printer',
        customerId: 'CUST001',
        customerName: 'TechCorp Solutions',
        contactPerson: 'Sarah Johnson',
        location: 'Office Floor 2',
        locationType: 'fixed',
        condition: 'good',
        status: 'operational',
        purchasePrice: 45000,
        currentValue: 35000,
        purchaseDate: '2023-01-15'
      },
      {
        id: 'AST002',
        make: 'Canon',
        model: 'imageRUNNER 2530i',
        serialNumber: 'CN987654321',
        category: 'Printer',
        customerId: 'CUST002',
        customerName: 'Manufacturing Ltd',
        contactPerson: 'David Kimani',
        location: 'Production Floor',
        locationType: 'fixed',
        condition: 'good',
        status: 'operational',
        purchasePrice: 85000,
        currentValue: 65000,
        purchaseDate: '2022-08-20'
      },
      {
        id: 'AST003',
        make: 'Dell',
        model: 'OptiPlex 7090',
        serialNumber: 'DL456789123',
        category: 'Computer',
        customerId: 'CUST003',
        customerName: 'HealthCare Plus',
        contactPerson: 'Dr. Mary Wanjiku',
        location: 'Reception Desk',
        locationType: 'fixed',
        condition: 'new',
        status: 'operational',
        purchasePrice: 65000,
        currentValue: 60000,
        purchaseDate: '2024-03-10'
      },
      {
        id: 'AST004',
        make: 'Epson',
        model: 'EcoTank L3250',
        serialNumber: 'EP789123456',
        category: 'Printer',
        customerId: 'CUST004',
        customerName: 'EduTech Institute',
        contactPerson: 'Prof. James Mwangi',
        location: 'Computer Lab',
        locationType: 'fixed',
        condition: 'damaged',
        status: 'repair',
        purchasePrice: 25000,
        currentValue: 15000,
        purchaseDate: '2023-06-05'
      },
      {
        id: 'AST005',
        make: 'Brother',
        model: 'MFC-L2750DW',
        serialNumber: 'BR321654987',
        category: 'Printer',
        customerId: 'CUST005',
        customerName: 'Logistics Express',
        contactPerson: 'Grace Mutua',
        location: 'Admin Office',
        locationType: 'fixed',
        condition: 'poor',
        status: 'retired',
        purchasePrice: 35000,
        currentValue: 8000,
        purchaseDate: '2021-11-12'
      }
    ]
  })

  // Seed Work Orders
  const workOrders = await prisma.workOrder.createMany({
    data: [
      {
        id: 'WO001',
        customerName: 'TechCorp Solutions',
        contactPerson: 'Sarah Johnson',
        contactPhone: '+254 700 123 456',
        equipmentName: 'HP LaserJet Pro 400',
        serialNo: 'HP001234567',
        location: 'Office Floor 2',
        type: 'service',
        serviceType: 'scheduled',
        priority: 'medium',
        status: 'completed',
        description: 'Routine maintenance and cleaning',
        technicianName: 'Mike Technician',
        supervisorName: 'John Supervisor',
        estimatedCost: 5000,
        actualCost: 4500,
        dueDate: '2024-01-15',
        createdDate: '2024-01-10'
      },
      {
        id: 'WO002',
        customerName: 'Manufacturing Ltd',
        contactPerson: 'David Kimani',
        contactPhone: '+254 700 234 567',
        equipmentName: 'Canon imageRUNNER 2530i',
        serialNo: 'CN987654321',
        location: 'Production Floor',
        type: 'repair',
        serviceType: 'unscheduled',
        priority: 'high',
        status: 'in-progress',
        description: 'Paper jam issue and toner replacement',
        faultDescription: 'Frequent paper jams and poor print quality',
        technicianName: 'Mike Technician',
        estimatedCost: 8000,
        dueDate: '2024-01-20',
        createdDate: '2024-01-18'
      },
      {
        id: 'WO003',
        customerName: 'HealthCare Plus',
        contactPerson: 'Dr. Mary Wanjiku',
        contactPhone: '+254 700 345 678',
        equipmentName: 'Dell OptiPlex 7090',
        serialNo: 'DL456789123',
        location: 'Reception Desk',
        type: 'service',
        serviceType: 'scheduled',
        priority: 'low',
        status: 'assigned',
        description: 'Software updates and system optimization',
        technicianName: 'Mike Technician',
        estimatedCost: 3000,
        dueDate: '2024-01-25',
        createdDate: '2024-01-22'
      },
      {
        id: 'WO004',
        customerName: 'EduTech Institute',
        contactPerson: 'Prof. James Mwangi',
        contactPhone: '+254 700 456 789',
        equipmentName: 'Epson EcoTank L3250',
        serialNo: 'EP789123456',
        location: 'Computer Lab',
        type: 'repair',
        serviceType: 'unscheduled',
        priority: 'critical',
        status: 'open',
        description: 'Printer head replacement and calibration',
        faultDescription: 'Print head damaged, no output',
        estimatedCost: 12000,
        dueDate: '2024-01-30',
        createdDate: '2024-01-28'
      },
      {
        id: 'WO005',
        customerName: 'Logistics Express',
        contactPerson: 'Grace Mutua',
        contactPhone: '+254 700 567 890',
        equipmentName: 'Brother MFC-L2750DW',
        serialNo: 'BR321654987',
        location: 'Admin Office',
        type: 'service',
        serviceType: 'scheduled',
        priority: 'medium',
        status: 'cancelled',
        description: 'Final service before retirement',
        estimatedCost: 2000,
        dueDate: '2024-02-01',
        createdDate: '2024-01-25'
      }
    ]
  })

  // Seed Maintenance Schedules
  const maintenance = await prisma.maintenanceSchedule.createMany({
    data: [
      {
        id: 'MAINT001',
        assetId: 'AST001',
        equipmentName: 'HP LaserJet Pro 400',
        customerName: 'TechCorp Solutions',
        maintenanceType: 'preventive',
        frequency: 'quarterly',
        nextDueDate: '2024-04-15',
        lastServiceDate: '2024-01-15',
        status: 'scheduled',
        estimatedCost: 5000,
        notes: 'Regular cleaning and toner check'
      },
      {
        id: 'MAINT002',
        assetId: 'AST002',
        equipmentName: 'Canon imageRUNNER 2530i',
        customerName: 'Manufacturing Ltd',
        maintenanceType: 'corrective',
        frequency: 'monthly',
        nextDueDate: '2024-02-20',
        lastServiceDate: '2024-01-20',
        status: 'overdue',
        estimatedCost: 8000,
        notes: 'Heavy usage requires frequent maintenance'
      },
      {
        id: 'MAINT003',
        assetId: 'AST003',
        equipmentName: 'Dell OptiPlex 7090',
        customerName: 'HealthCare Plus',
        maintenanceType: 'preventive',
        frequency: 'semi-annual',
        nextDueDate: '2024-09-10',
        lastServiceDate: '2024-03-10',
        status: 'scheduled',
        estimatedCost: 3000,
        notes: 'Software updates and hardware check'
      },
      {
        id: 'MAINT004',
        assetId: 'AST004',
        equipmentName: 'Epson EcoTank L3250',
        customerName: 'EduTech Institute',
        maintenanceType: 'corrective',
        frequency: 'as-needed',
        nextDueDate: '2024-02-05',
        status: 'in-progress',
        estimatedCost: 12000,
        notes: 'Repair work in progress'
      },
      {
        id: 'MAINT005',
        assetId: 'AST005',
        equipmentName: 'Brother MFC-L2750DW',
        customerName: 'Logistics Express',
        maintenanceType: 'preventive',
        frequency: 'annual',
        nextDueDate: '2024-11-12',
        lastServiceDate: '2023-11-12',
        status: 'cancelled',
        estimatedCost: 2000,
        notes: 'Equipment scheduled for retirement'
      }
    ]
  })

  // Seed Leases
  const leases = await prisma.lease.createMany({
    data: [
      {
        id: 'LEASE001',
        customerId: 'CUST001',
        customerName: 'TechCorp Solutions',
        equipmentDetails: '8 HP Printers and Dell Computers',
        leaseAmount: 25000,
        startDate: '2023-01-01',
        endDate: '2025-12-31',
        status: 'active',
        paymentFrequency: 'monthly',
        totalPaid: 300000,
        outstandingAmount: 0
      },
      {
        id: 'LEASE002',
        customerId: 'CUST002',
        customerName: 'Manufacturing Ltd',
        equipmentDetails: '12 Industrial Printers and Scanners',
        leaseAmount: 45000,
        startDate: '2022-06-01',
        endDate: '2025-05-31',
        status: 'active',
        paymentFrequency: 'monthly',
        totalPaid: 810000,
        outstandingAmount: 0
      },
      {
        id: 'LEASE003',
        customerId: 'CUST003',
        customerName: 'HealthCare Plus',
        equipmentDetails: '6 Medical Office Printers',
        leaseAmount: 35000,
        startDate: '2023-03-01',
        endDate: '2026-02-28',
        status: 'active',
        paymentFrequency: 'monthly',
        totalPaid: 350000,
        outstandingAmount: 0
      },
      {
        id: 'LEASE004',
        customerId: 'CUST004',
        customerName: 'EduTech Institute',
        equipmentDetails: '15 Educational Printers and Computers',
        leaseAmount: 18000,
        startDate: '2023-09-01',
        endDate: '2025-08-31',
        status: 'overdue',
        paymentFrequency: 'monthly',
        totalPaid: 72000,
        outstandingAmount: 36000
      },
      {
        id: 'LEASE005',
        customerId: 'CUST005',
        customerName: 'Logistics Express',
        equipmentDetails: '4 Office Printers',
        leaseAmount: 22000,
        startDate: '2022-01-01',
        endDate: '2023-12-31',
        status: 'expired',
        paymentFrequency: 'monthly',
        totalPaid: 528000,
        outstandingAmount: 44000
      }
    ]
  })

  console.log('✅ Database seeded successfully!')
  console.log(`Created ${users.count} users`)
  console.log(`Created ${customers.count} customers`)
  console.log(`Created ${assets.count} assets`)
  console.log(`Created ${workOrders.count} work orders`)
  console.log(`Created ${maintenance.count} maintenance schedules`)
  console.log(`Created ${leases.count} leases`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })