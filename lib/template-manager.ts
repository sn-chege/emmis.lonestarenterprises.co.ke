import { promises as fs } from 'fs'
import path from 'path'

const TEMPLATES_DIR = path.join(process.cwd(), 'templates')

export interface TemplateMetadata {
  id: string
  name: string
  description: string
  type: 'PDF' | 'DOCX' | 'CUSTOM'
  size: string
  createdDate: string
  lastModified: string
  version: string
  author: string
  tags: string[]
  elements: TemplateElement[]
}

export interface TemplateElement {
  id: string
  type: 'text' | 'image' | 'signature' | 'date' | 'rectangle' | 'line'
  x: number
  y: number
  width: number
  height: number
  content?: string
  style?: Record<string, any>
}

export class TemplateManager {
  static async generateTemplateId(): Promise<string> {
    await this.ensureTemplatesDir()
    const existing = await fs.readdir(TEMPLATES_DIR)
    const templateDirs = existing.filter(dir => dir.match(/^TMP\d{3}$/))
    const numbers = templateDirs.map(dir => parseInt(dir.slice(3)))
    const nextNumber = Math.max(0, ...numbers) + 1
    return `TMP${nextNumber.toString().padStart(3, '0')}`
  }

  static async ensureTemplatesDir(): Promise<void> {
    try {
      await fs.access(TEMPLATES_DIR)
    } catch {
      await fs.mkdir(TEMPLATES_DIR, { recursive: true })
    }
  }

  static async createTemplate(metadata: Omit<TemplateMetadata, 'id' | 'createdDate' | 'lastModified'>): Promise<string> {
    const id = await this.generateTemplateId()
    const templateDir = path.join(TEMPLATES_DIR, id)
    
    await fs.mkdir(templateDir, { recursive: true })
    
    const fullMetadata: TemplateMetadata = {
      ...metadata,
      id,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    
    await fs.writeFile(
      path.join(templateDir, 'metadata.json'),
      JSON.stringify(fullMetadata, null, 2)
    )
    
    return id
  }

  static async getTemplate(id: string): Promise<TemplateMetadata | null> {
    try {
      const templateDir = path.join(TEMPLATES_DIR, id)
      const metadataPath = path.join(templateDir, 'metadata.json')
      const data = await fs.readFile(metadataPath, 'utf-8')
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  static async updateTemplate(id: string, updates: Partial<TemplateMetadata>): Promise<void> {
    const existing = await this.getTemplate(id)
    if (!existing) throw new Error('Template not found')
    
    const updated = {
      ...existing,
      ...updates,
      lastModified: new Date().toISOString()
    }
    
    const templateDir = path.join(TEMPLATES_DIR, id)
    await fs.writeFile(
      path.join(templateDir, 'metadata.json'),
      JSON.stringify(updated, null, 2)
    )
  }

  static async getAllTemplates(): Promise<TemplateMetadata[]> {
    await this.ensureTemplatesDir()
    const dirs = await fs.readdir(TEMPLATES_DIR)
    const templates: TemplateMetadata[] = []
    
    for (const dir of dirs) {
      if (dir.match(/^TMP\d{3}$/)) {
        const template = await this.getTemplate(dir)
        if (template) templates.push(template)
      }
    }
    
    return templates.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
  }

  static async deleteTemplate(id: string): Promise<void> {
    const templateDir = path.join(TEMPLATES_DIR, id)
    await fs.rm(templateDir, { recursive: true, force: true })
  }

  static async saveTemplateFile(id: string, filename: string, data: Buffer): Promise<void> {
    const templateDir = path.join(TEMPLATES_DIR, id)
    await fs.writeFile(path.join(templateDir, filename), data)
  }
}