import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        consumableParts: true,
      },
    })
    
    if (!workOrder) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 })
    }
    
    return NextResponse.json(workOrder)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch work order' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()
    const { consumableParts, id: dataId, createdDate, updatedDate, deletedAt, equipmentId, ...workOrderData } = data
    
    // Convert date fields to proper DateTime format
    if (workOrderData.dueDate && typeof workOrderData.dueDate === 'string') {
      workOrderData.dueDate = new Date(workOrderData.dueDate + 'T00:00:00.000Z')
    }
    
    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: {
        ...workOrderData,
        consumableParts: consumableParts ? {
          deleteMany: {},
          create: consumableParts
        } : undefined,
      },
      include: {
        consumableParts: true,
      },
    })
    
    return NextResponse.json(workOrder)
  } catch (error) {
    console.error('Update work order error:', error)
    return NextResponse.json({ 
      error: 'Failed to update work order', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.workOrder.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Work order deleted successfully' })
  } catch (error) {
    console.error('Delete work order error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete work order', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}