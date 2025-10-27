import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const workOrders = await prisma.workOrder.findMany({
      include: {
        consumableParts: true,
      },
    })
    return NextResponse.json(workOrders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch work orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { consumableParts, ...workOrderData } = data
    
    const workOrder = await prisma.workOrder.create({
      data: {
        ...workOrderData,
        consumableParts: consumableParts ? {
          create: consumableParts
        } : undefined,
      },
      include: {
        consumableParts: true,
      },
    })
    
    return NextResponse.json(workOrder, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create work order' }, { status: 500 })
  }
}