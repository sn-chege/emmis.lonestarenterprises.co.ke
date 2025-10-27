import { exec } from 'child_process'
import { promisify } from 'util'
import { mkdir } from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

async function backupDatabase() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not found in environment variables')
  }

  // Parse DATABASE_URL
  const url = new URL(databaseUrl)
  const host = url.hostname
  const port = url.port || '3306'
  const username = url.username
  const password = url.password
  const database = url.pathname.slice(1)

  // Create backup directory
  const backupDir = path.join(process.cwd(), 'db_backups')
  await mkdir(backupDir, { recursive: true })

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `backup_${database}_${timestamp}.sql`
  const filepath = path.join(backupDir, filename)

  // Create mysqldump command
  const command = `mysqldump -h ${host} -P ${port} -u ${username} -p${password} ${database} > "${filepath}"`

  try {
    console.log('🔄 Creating database backup...')
    await execAsync(command)
    console.log(`✅ Database backup created: ${filepath}`)
    return filepath
  } catch (error) {
    console.error('❌ Backup failed:', error)
    throw error
  }
}

export { backupDatabase }

// Run if called directly
if (require.main === module) {
  backupDatabase().catch(console.error)
}