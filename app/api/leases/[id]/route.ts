import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lease = await prisma.lease.findUnique({
      where: { id: params.id },
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const lease = await prisma.lease.update({
      where: { id: params.id },
      data,
      include: {
        customer: true,
        leasePayments: true,
      },
    })
    return NextResponse.json(lease)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update lease' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.lease.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: 'Lease deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete lease' }, { status: 500 })
  }
}