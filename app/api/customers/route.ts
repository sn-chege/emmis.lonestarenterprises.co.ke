import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const showDeleted = searchParams.get('showDeleted') === 'true'
    
    const customers = await prisma.customer.findMany({
      where: {
        deletedAt: showDeleted ? { not: null } : null
      },
      include: {
        assets: true,
        leases: true,
      },
    })
    return NextResponse.json(customers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Generate unique customer ID
    const lastCustomer = await prisma.customer.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    })
    
    let nextNumber = 1
    if (lastCustomer) {
      const lastNumber = parseInt(lastCustomer.id.replace('CUST', ''))
      nextNumber = lastNumber + 1
    }
    
    const customerId = `CUST${String(nextNumber).padStart(3, '0')}`
    
    // Convert date fields and add generated ID
    const cleanData = {
      ...data,
      id: customerId,
      contractExpiry: data.contractExpiry ? new Date(data.contractExpiry) : null,
    }
    
    const customer = await prisma.customer.create({
      data: cleanData,
      include: {
        assets: true,
        leases: true,
      },
    })
    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json({ 
      error: 'Failed to create customer', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}