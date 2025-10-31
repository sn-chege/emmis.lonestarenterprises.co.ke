import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        assets: true,
        leases: true,
      },
    })
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }
    
    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()
    const customer = await prisma.customer.update({
      where: { id },
      data,
      include: {
        assets: true,
        leases: true,
      },
    })
    return NextResponse.json(customer)
  } catch (error) {
    console.error('Update customer error:', error)
    return NextResponse.json({ 
      error: 'Failed to update customer', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.customer.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    console.error('Delete customer error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete customer', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}