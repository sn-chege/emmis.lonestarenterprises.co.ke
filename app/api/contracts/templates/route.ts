import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateTemplateId(num: number): string {
  return `TMP${num.toString().padStart(3, '0')}`
}

export async function GET() {
  try {
    const templates = await prisma.contractTemplate.findMany({
      where: { deletedAt: null },
      orderBy: { lastModified: 'desc' }
    })
    return NextResponse.json(templates)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Generate next template ID
    const lastTemplate = await prisma.contractTemplate.findFirst({
      where: { id: { startsWith: 'TMP' } },
      orderBy: { id: 'desc' }
    })
    
    const nextNum = lastTemplate ? parseInt(lastTemplate.id.slice(3)) + 1 : 1
    const templateId = generateTemplateId(nextNum)
    
    const template = await prisma.contractTemplate.create({
      data: {
        id: templateId,
        name: data.name,
        description: data.description || '',
        type: data.type || 'CUSTOM',
        size: data.size || '0 KB',
        version: '1.0',
        author: 'System',
        tags: JSON.stringify(data.tags || []),
        elements: JSON.stringify(data.elements || []),
        folderPath: `templates/${templateId}`,
        status: 'active'
      }
    })
    
    return NextResponse.json(template)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}