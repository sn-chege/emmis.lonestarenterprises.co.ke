import { promises as fs } from 'fs'
import path from 'path'

const SLA_DIR = path.join(process.cwd(), 'sla-agreements')

export interface SLAMetadata {
  id: string
  name: string
  description: string
  customerId: string
  customerName: string
  serviceLevel: 'basic' | 'standard' | 'premium' | 'enterprise'
  responseTime: string
  resolutionTime: string
  availability: string
  penalties: string
  startDate: string
  endDate: string
  status: 'active' | 'inactive' | 'expired' | 'pending'
  createdDate: string
  lastModified: string
  terms: SLATerm[]
}

export interface SLATerm {
  id: string
  category: string
  metric: string
  target: string
  measurement: string
  penalty: string
}

export class SLAManager {
  static async generateSLAId(): Promise<string> {
    await this.ensureSLADir()
    const existing = await fs.readdir(SLA_DIR)
    const slaDirs = existing.filter(dir => dir.match(/^SLA\d{3}$/))
    const numbers = slaDirs.map(dir => parseInt(dir.slice(3)))
    const nextNumber = Math.max(0, ...numbers) + 1
    return `SLA${nextNumber.toString().padStart(3, '0')}`
  }

  static async ensureSLADir(): Promise<void> {
    try {
      await fs.access(SLA_DIR)
    } catch {
      await fs.mkdir(SLA_DIR, { recursive: true })
    }
  }

  static async createSLA(metadata: Omit<SLAMetadata, 'id' | 'createdDate' | 'lastModified'>): Promise<string> {
    const id = await this.generateSLAId()
    const slaDir = path.join(SLA_DIR, id)
    
    await fs.mkdir(slaDir, { recursive: true })
    
    const fullMetadata: SLAMetadata = {
      ...metadata,
      id,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    
    await fs.writeFile(
      path.join(slaDir, 'metadata.json'),
      JSON.stringify(fullMetadata, null, 2)
    )
    
    return id
  }

  static async getSLA(id: string): Promise<SLAMetadata | null> {
    try {
      const slaDir = path.join(SLA_DIR, id)
      const metadataPath = path.join(slaDir, 'metadata.json')
      const data = await fs.readFile(metadataPath, 'utf-8')
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  static async updateSLA(id: string, updates: Partial<SLAMetadata>): Promise<void> {
    const existing = await this.getSLA(id)
    if (!existing) throw new Error('SLA not found')
    
    const updated = {
      ...existing,
      ...updates,
      lastModified: new Date().toISOString()
    }
    
    const slaDir = path.join(SLA_DIR, id)
    await fs.writeFile(
      path.join(slaDir, 'metadata.json'),
      JSON.stringify(updated, null, 2)
    )
  }

  static async getAllSLAs(): Promise<SLAMetadata[]> {
    await this.ensureSLADir()
    const dirs = await fs.readdir(SLA_DIR)
    const slas: SLAMetadata[] = []
    
    for (const dir of dirs) {
      if (dir.match(/^SLA\d{3}$/)) {
        const sla = await this.getSLA(dir)
        if (sla) slas.push(sla)
      }
    }
    
    return slas.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
  }

  static async deleteSLA(id: string): Promise<void> {
    const slaDir = path.join(SLA_DIR, id)
    await fs.rm(slaDir, { recursive: true, force: true })
  }
}