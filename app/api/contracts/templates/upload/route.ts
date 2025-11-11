import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

function generateTemplateId(num: number): string {
  return `TMP${num.toString().padStart(3, '0')}`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    if (!file || !name) {
      return NextResponse.json({ error: 'File and name are required' }, { status: 400 })
    }

    // Generate next template ID
    const lastTemplate = await prisma.contractTemplate.findFirst({
      where: { id: { startsWith: 'TMP' } },
      orderBy: { id: 'desc' }
    })
    
    const nextNum = lastTemplate ? parseInt(lastTemplate.id.slice(3)) + 1 : 1
    const templateId = generateTemplateId(nextNum)

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'templates')
    await mkdir(uploadDir, { recursive: true })

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${templateId}_${file.name}`
    const filePath = path.join(uploadDir, fileName)
    
    await writeFile(filePath, buffer)

    // Save to database
    const template = await prisma.contractTemplate.create({
      data: {
        id: templateId,
        name: name,
        description: description || '',
        type: 'UPLOADED',
        size: `${(file.size / 1024).toFixed(0)} KB`,
        version: '1.0',
        author: 'System',
        tags: JSON.stringify([]),
        elements: JSON.stringify([]),
        folderPath: `/uploads/templates/${fileName}`,
        status: 'active'
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload template' }, { status: 500 })
  }
}