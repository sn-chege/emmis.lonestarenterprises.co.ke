import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        customer: true,
        repairHistory: true,
        maintenanceSchedules: true,
      },
    })
    return NextResponse.json(assets)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Asset creation data:', data)
    
    // Validate required fields
    if (!data.make || !data.model || !data.serialNumber) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        details: 'Make, model, and serial number are required' 
      }, { status: 400 })
    }
    
    // Generate unique asset ID
    const lastAsset = await prisma.asset.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    })
    
    let nextNumber = 1
    if (lastAsset) {
      const lastNumber = parseInt(lastAsset.id.replace('AST', ''))
      nextNumber = lastNumber + 1
    }
    
    const assetId = `AST${String(nextNumber).padStart(3, '0')}`
    
    // Clean up the data - remove fields that don't exist in schema and convert dates
    const { status, condition, ...rawData } = data
    console.log('Cleaned data before processing:', rawData)
    
    // Convert date strings to Date objects and add generated ID
    const cleanData = {
      ...rawData,
      id: assetId,
      purchaseDate: rawData.purchaseDate ? new Date(rawData.purchaseDate) : null,
      warrantyStart: rawData.warrantyStart ? new Date(rawData.warrantyStart) : null,
      warrantyEnd: rawData.warrantyEnd ? new Date(rawData.warrantyEnd) : null,
      lastServiceDate: rawData.lastServiceDate ? new Date(rawData.lastServiceDate) : null,
      nextServiceDate: rawData.nextServiceDate ? new Date(rawData.nextServiceDate) : null,
    }
    
    const asset = await prisma.asset.create({
      data: cleanData,
      include: {
        customer: true,
        repairHistory: true,
        maintenanceSchedules: true,
      },
    })
    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error('Asset creation error:', error)
    
    let errorMessage = 'Failed to create asset'
    if (error instanceof Error && error.message.includes('assets_serial_number_key')) {
      errorMessage = `Asset with serial number already exists. Please use a different serial number.`
    }
    
    return NextResponse.json({ 
      error: errorMessage, 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}