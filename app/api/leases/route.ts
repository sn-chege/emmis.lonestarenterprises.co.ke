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
    return NextResponse.json({ error: 'Failed to fetch leases' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const lease = await prisma.lease.create({
      data,
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