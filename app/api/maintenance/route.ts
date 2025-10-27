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
    const { maintenanceParts, ...maintenanceData } = data
    
    const maintenance = await prisma.maintenanceSchedule.create({
      data: {
        ...maintenanceData,
        maintenanceParts: maintenanceParts ? {
          create: maintenanceParts
        } : undefined,
      },
      include: {
        equipment: true,
        maintenanceParts: true,
      },
    })
    
    return NextResponse.json(maintenance, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create maintenance schedule' }, { status: 500 })
  }
}