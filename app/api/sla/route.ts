import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateSLAId(num: number): string {
  return `SLA${num.toString().padStart(3, '0')}`
}

export async function GET() {
  try {
    console.log('SLA API: Attempting to fetch SLAs')
    console.log('Prisma client available:', !!prisma)
    console.log('SlaTemplate model available:', !!prisma.slaTemplate)
    
    const slas = await prisma.slaTemplate.findMany({
      where: { deletedAt: null },
      orderBy: { lastModified: 'desc' }
    })
    console.log('SLA API: Found', slas.length, 'SLAs')
    return NextResponse.json(slas)
  } catch (error) {
    console.error('SLA API Error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json({ error: 'Failed to fetch SLAs', details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Generate next SLA ID
    const lastSLA = await prisma.slaTemplate.findFirst({
      where: { id: { startsWith: 'SLA' } },
      orderBy: { id: 'desc' }
    })
    
    const nextNum = lastSLA ? parseInt(lastSLA.id.slice(3)) + 1 : 1
    const slaId = generateSLAId(nextNum)
    
    const sla = await prisma.slaTemplate.create({
      data: {
        id: slaId,
        name: data.name,
        description: data.description || '',
        customerId: data.customerId,
        customerName: data.customerName,
        serviceLevel: data.serviceLevel,
        responseTime: data.responseTime,
        resolutionTime: data.resolutionTime,
        availability: data.availability,
        penalties: data.penalties,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || 'pending',
        terms: JSON.stringify(data.terms || []),
        folderPath: `sla-agreements/${slaId}`
      }
    })
    
    return NextResponse.json(sla)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create SLA' }, { status: 500 })
  }
}