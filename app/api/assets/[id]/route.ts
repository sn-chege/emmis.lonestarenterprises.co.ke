import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const asset = await prisma.asset.findUnique({
      where: { id },
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()
    const asset = await prisma.asset.update({
      where: { id },
      data,
      include: {
        customer: true,
        repairHistory: true,
        maintenanceSchedules: true,
      },
    })
    return NextResponse.json(asset)
  } catch (error) {
    console.error('Update asset error:', error)
    return NextResponse.json({ 
      error: 'Failed to update asset', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.asset.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Asset deleted successfully' })
  } catch (error) {
    console.error('Delete asset error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete asset', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}