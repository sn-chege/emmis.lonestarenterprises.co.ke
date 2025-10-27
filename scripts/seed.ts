import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default admin user
  const adminPassword = await bcrypt.hash('qwertyhudra45678911', 10)
  
  await prisma.user.upsert({
    where: { email: 'admin45@emmis.com' },
    update: {},
    create: {
      id: 'USR001',
      email: 'admin45@emmis.com',
      passwordHash: adminPassword,
      name: 'System Administrator',
      role: 'admin',
      status: 'active',
    },
  })

  // Create system settings
  const settings = [
    { key: 'app_name', value: 'EMMIS', description: 'Application Name' },
    { key: 'app_version', value: '1.0.0', description: 'Application Version' },
    { key: 'currency', value: 'KES', description: 'Default Currency' },
    { key: 'date_format', value: 'YYYY-MM-DD', description: 'Default Date Format' },
    { key: 'timezone', value: 'Africa/Nairobi', description: 'Default Timezone' },
  ]

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { settingKey: setting.key },
      update: {},
      create: {
        settingKey: setting.key,
        settingValue: setting.value,
        description: setting.description,
      },
    })
  }

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })