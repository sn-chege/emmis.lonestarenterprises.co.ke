import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const lease = await prisma.lease.findUnique({
      where: { id },
      include: {
        customer: true,
        leasePayments: true,
      },
    })
    
    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }
    
    return NextResponse.json(lease)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lease' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()
    const lease = await prisma.lease.update({
      where: { id },
      data,
      include: {
        customer: true,
        leasePayments: true,
      },
    })
    return NextResponse.json(lease)
  } catch (error) {
    console.error('Update lease error:', error)
    return NextResponse.json({ 
      error: 'Failed to update lease', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.lease.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Lease deleted successfully' })
  } catch (error) {
    console.error('Delete lease error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete lease', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}