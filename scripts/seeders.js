const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

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

  console.log('✅ Database seeded successfully!')
  console.log(`Created ${users.count} users`)
  console.log(`Created ${customers.count} customers`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })