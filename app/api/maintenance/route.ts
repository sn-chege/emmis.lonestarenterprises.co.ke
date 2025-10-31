import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const maintenance = await prisma.maintenanceSchedule.findMany({
      include: {
        equipment: true,
        maintenanceParts: true,
      },
    })
    return NextResponse.json(maintenance)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch maintenance schedules' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { consumableParts, maintenanceParts, ...rawData } = data
    
    // Generate maintenance ID
    const lastMaintenance = await prisma.maintenanceSchedule.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    })
    
    let nextNumber = 1
    if (lastMaintenance) {
      const lastNumber = parseInt(lastMaintenance.id.replace('MT', ''))
      nextNumber = lastNumber + 1
    }
    
    const maintenanceId = `MT${String(nextNumber).padStart(3, '0')}`
    
    // Convert date fields
    const maintenanceData = {
      ...rawData,
      id: maintenanceId,
      scheduledDate: rawData.scheduledDate ? new Date(rawData.scheduledDate) : new Date(),
      completedDate: rawData.completedDate ? new Date(rawData.completedDate) : null,
      createdDate: rawData.createdDate ? new Date(rawData.createdDate) : new Date(),
      updatedDate: new Date(),
    }
    
    // Use consumableParts if provided, otherwise maintenanceParts
    const parts = consumableParts || maintenanceParts
    
    const maintenance = await prisma.maintenanceSchedule.create({
      data: {
        ...maintenanceData,
        maintenanceParts: parts ? {
          create: parts
        } : undefined,
      },
      include: {
        equipment: true,
        maintenanceParts: true,
      },
    })
    
    return NextResponse.json(maintenance, { status: 201 })
  } catch (error) {
    console.error('Create maintenance error:', error)
    return NextResponse.json({ 
      error: 'Failed to create maintenance schedule', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}