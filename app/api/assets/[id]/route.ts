import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        repairHistory: true,
        maintenanceSchedules: true,
      },
    })
    
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }
    
    return NextResponse.json(asset)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const asset = await prisma.asset.update({
      where: { id: params.id },
      data,
      include: {
        customer: true,
        repairHistory: true,
        maintenanceSchedules: true,
      },
    })
    return NextResponse.json(asset)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.asset.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: 'Asset deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
  }
}