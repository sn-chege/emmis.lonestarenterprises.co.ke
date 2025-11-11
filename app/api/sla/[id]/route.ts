import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sla = await prisma.slaTemplate.findFirst({
      where: { id: params.id, deletedAt: null }
    })
    
    if (!sla) {
      return NextResponse.json({ error: 'SLA not found' }, { status: 404 })
    }
    
    return NextResponse.json(sla)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch SLA' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    
    const sla = await prisma.slaTemplate.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        customerId: data.customerId,
        customerName: data.customerName,
        serviceLevel: data.serviceLevel,
        responseTime: data.responseTime,
        resolutionTime: data.resolutionTime,
        availability: data.availability,
        penalties: data.penalties,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status,
        terms: JSON.stringify(data.terms || []),
        lastModified: new Date()
      }
    })
    
    return NextResponse.json(sla)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update SLA' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.slaTemplate.update({
      where: { id: params.id },
      data: { deletedAt: new Date() }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete SLA' }, { status: 500 })
  }
}