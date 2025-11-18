import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const template = await prisma.contractTemplate.findFirst({
      where: { id: params.id, deletedAt: null }
    })
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    
    return NextResponse.json(template)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    
    const template = await prisma.contractTemplate.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        elements: JSON.stringify(data.elements || []),
        tags: JSON.stringify(data.tags || []),
        lastModified: new Date()
      }
    })
    
    return NextResponse.json(template)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.contractTemplate.update({
      where: { id: params.id },
      data: { deletedAt: new Date() }
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete template error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete template',
      details: error.message,
      code: error.code 
    }, { status: 500 })
  }
}