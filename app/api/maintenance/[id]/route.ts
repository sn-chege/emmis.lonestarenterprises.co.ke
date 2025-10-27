import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const maintenance = await prisma.maintenanceSchedule.findUnique({
      where: { id: params.id },
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const { maintenanceParts, ...maintenanceData } = data
    
    const maintenance = await prisma.maintenanceSchedule.update({
      where: { id: params.id },
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
    return NextResponse.json({ error: 'Failed to update maintenance schedule' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.maintenanceSchedule.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: 'Maintenance schedule deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete maintenance schedule' }, { status: 500 })
  }
}