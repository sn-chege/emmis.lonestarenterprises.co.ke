#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const MIGRATIONS_DIR = 'prisma/migrations'
const MIGRATION_LOCK_FILE = 'prisma/migration_lock.toml'

interface MigrationInfo {
  name: string
  timestamp: string
  applied: boolean
}

class MigrationManager {
  private migrationsDir: string
  private lockFile: string

  constructor() {
    this.migrationsDir = MIGRATIONS_DIR
    this.lockFile = MIGRATION_LOCK_FILE
    this.ensureDirectories()
  }

  private ensureDirectories() {
    if (!existsSync(this.migrationsDir)) {
      mkdirSync(this.migrationsDir, { recursive: true })
    }
  }

  async createMigration(name: string) {
    try {
      console.log(`Creating migration: ${name}`)
      execSync(`npx prisma migrate dev --name ${name}`, { stdio: 'inherit' })
      console.log(`Migration ${name} created successfully`)
    } catch (error) {
      console.error(`Failed to create migration: ${error}`)
      process.exit(1)
    }
  }

  async applyMigrations() {
    try {
      console.log('Applying migrations...')
      execSync('npx prisma migrate deploy', { stdio: 'inherit' })
      console.log('Migrations applied successfully')
    } catch (error) {
      console.error(`Failed to apply migrations: ${error}`)
      process.exit(1)
    }
  }

  async rollbackMigration() {
    try {
      console.log('Rolling back last migration...')
      execSync('npx prisma migrate reset --force', { stdio: 'inherit' })
      console.log('Migration rolled back successfully')
    } catch (error) {
      console.error(`Failed to rollback migration: ${error}`)
      process.exit(1)
    }
  }

  async generateClient() {
    try {
      console.log('Generating Prisma client...')
      execSync('npx prisma generate', { stdio: 'inherit' })
      console.log('Prisma client generated successfully')
    } catch (error) {
      console.error(`Failed to generate client: ${error}`)
      process.exit(1)
    }
  }

  async status() {
    try {
      console.log('Migration status:')
      execSync('npx prisma migrate status', { stdio: 'inherit' })
    } catch (error) {
      console.error(`Failed to get migration status: ${error}`)
      process.exit(1)
    }
  }

  async seed() {
    try {
      console.log('Seeding database...')
      execSync('npx tsx scripts/seed.ts', { stdio: 'inherit' })
      console.log('Database seeded successfully')
    } catch (error) {
      console.error(`Failed to seed database: ${error}`)
      process.exit(1)
    }
  }
}

async function main() {
  const manager = new MigrationManager()
  const command = process.argv[2]
  const migrationName = process.argv[3]

  switch (command) {
    case 'create':
      if (!migrationName) {
        console.error('Please provide a migration name')
        process.exit(1)
      }
      await manager.createMigration(migrationName)
      break
    
    case 'apply':
      await manager.applyMigrations()
      break
    
    case 'rollback':
      await manager.rollbackMigration()
      break
    
    case 'generate':
      await manager.generateClient()
      break
    
    case 'status':
      await manager.status()
      break
    
    case 'seed':
      await manager.seed()
      break
    
    default:
      console.log(`
Usage: tsx scripts/migrate.ts <command> [options]

Commands:
  create <name>    Create a new migration
  apply           Apply pending migrations
  rollback        Rollback the last migration
  generate        Generate Prisma client
  status          Show migration status
  seed            Seed the database

Examples:
  tsx scripts/migrate.ts create add_user_table
  tsx scripts/migrate.ts apply
  tsx scripts/migrate.ts rollback
  tsx scripts/migrate.ts status
      `)
      process.exit(1)
  }
}

main().catch(console.error)