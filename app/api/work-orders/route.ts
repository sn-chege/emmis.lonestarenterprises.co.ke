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
    const { consumableParts, ...rawData } = data
    
    // Generate work order ID
    const lastWorkOrder = await prisma.workOrder.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    })
    
    let nextNumber = 1
    if (lastWorkOrder) {
      const lastNumber = parseInt(lastWorkOrder.id.replace('WO', ''))
      nextNumber = lastNumber + 1
    }
    
    const workOrderId = `WO${String(nextNumber).padStart(3, '0')}`
    
    // Convert date fields
    const workOrderData = {
      ...rawData,
      id: workOrderId,
      dueDate: rawData.dueDate ? new Date(rawData.dueDate) : new Date(),
      completedDate: rawData.completedDate ? new Date(rawData.completedDate) : null,
      nextServiceDate: rawData.nextServiceDate ? new Date(rawData.nextServiceDate) : null,
    }
    
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
    console.error('Create work order error:', error)
    return NextResponse.json({ 
      error: 'Failed to create work order', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}