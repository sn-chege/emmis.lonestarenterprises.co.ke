import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const maintenance = await prisma.maintenanceSchedule.findUnique({
      where: { id },
      include: {
        equipment: true,
        maintenanceParts: true,
      },
    })
    
    if (!maintenance) {
      return NextResponse.json({ error: 'Maintenance schedule not found' }, { status: 404 })
    }
    
    return NextResponse.json(maintenance)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch maintenance schedule' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()
    const { maintenanceParts, id: dataId, createdDate, updatedDate, deletedAt, equipment, equipmentId, equipmentName, serialNo, customerId, customerName, technicianId, technicianName, consumableParts, ...maintenanceData } = data
    
    // Convert date fields to proper DateTime format
    if (maintenanceData.scheduledDate && typeof maintenanceData.scheduledDate === 'string') {
      maintenanceData.scheduledDate = new Date(maintenanceData.scheduledDate + 'T00:00:00.000Z')
    }
    if (maintenanceData.completedDate !== undefined) {
      if (maintenanceData.completedDate === '' || maintenanceData.completedDate === null) {
        maintenanceData.completedDate = null
      } else if (typeof maintenanceData.completedDate === 'string') {
        maintenanceData.completedDate = new Date(maintenanceData.completedDate + 'T00:00:00.000Z')
      }
    }
    
    const maintenance = await prisma.maintenanceSchedule.update({
      where: { id },
      data: {
        ...maintenanceData,
        maintenanceParts: maintenanceParts ? {
          deleteMany: {},
          create: maintenanceParts
        } : undefined,
      },
      include: {
        equipment: true,
        maintenanceParts: true,
      },
    })
    
    return NextResponse.json(maintenance)
  } catch (error) {
    console.error('Update maintenance error:', error)
    return NextResponse.json({ 
      error: 'Failed to update maintenance schedule', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.maintenanceSchedule.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Maintenance schedule deleted successfully' })
  } catch (error) {
    console.error('Delete maintenance error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete maintenance schedule', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}