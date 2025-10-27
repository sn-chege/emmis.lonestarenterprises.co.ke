import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: params.id },
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const { consumableParts, ...workOrderData } = data
    
    const workOrder = await prisma.workOrder.update({
      where: { id: params.id },
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
    return NextResponse.json({ error: 'Failed to update work order' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.workOrder.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: 'Work order deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete work order' }, { status: 500 })
  }
}