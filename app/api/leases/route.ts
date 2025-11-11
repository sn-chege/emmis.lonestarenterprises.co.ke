import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const leases = await prisma.lease.findMany({
      include: {
        customer: true,
        leasePayments: true,
      },
    })
    return NextResponse.json(leases)
  } catch (error) {
    console.error('Leases API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch leases', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Generate auto ID
    const lastLease = await prisma.lease.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    })
    
    const nextNumber = lastLease 
      ? parseInt(lastLease.id.replace('LSE', '')) + 1 
      : 1
    const id = `LSE${nextNumber.toString().padStart(3, '0')}`
    
    // Convert date strings to Date objects
    const leaseData = {
      ...data,
      id,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      nextPaymentDate: new Date(data.nextPaymentDate),
    }
    
    const lease = await prisma.lease.create({
      data: leaseData,
      include: {
        customer: true,
        leasePayments: true,
      },
    })
    return NextResponse.json(lease, { status: 201 })
  } catch (error) {
    console.error('Create lease error:', error)
    return NextResponse.json({ 
      error: 'Failed to create lease', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}