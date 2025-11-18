import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseCSV, validateCSVData, csvToObjects } from '@/lib/csv-import'

const requiredFields = ['id', 'name', 'customerId']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
    }
    
    const csvText = await file.text()
    const data = parseCSV(csvText)
    
    const validation = validateCSVData(data, requiredFields, 'assets')
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }
    
    const assets = csvToObjects(data)
    const results = { created: 0, errors: [] as string[] }
    
    for (const asset of assets) {
      try {
        await prisma.asset.upsert({
          where: { id: asset.id },
          update: {
            name: asset.name,
            description: asset.description || null,
            serialNumber: asset.serialNumber || null,
            model: asset.model || null,
            manufacturer: asset.manufacturer || null,
            purchaseDate: asset.purchaseDate || null,
            warrantyExpiry: asset.warrantyExpiry || null,
            location: asset.location || null,
            status: asset.status || 'active',
            customerId: asset.customerId
          },
          create: {
            id: asset.id,
            name: asset.name,
            description: asset.description || null,
            serialNumber: asset.serialNumber || null,
            model: asset.model || null,
            manufacturer: asset.manufacturer || null,
            purchaseDate: asset.purchaseDate || null,
            warrantyExpiry: asset.warrantyExpiry || null,
            location: asset.location || null,
            status: asset.status || 'active',
            customerId: asset.customerId
          }
        })
        results.created++
      } catch (error: any) {
        results.errors.push(`Asset ${asset.id}: ${error.message}`)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Import completed. ${results.created} assets processed.`,
      errors: results.errors
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Import failed',
      errors: [error.message]
    }, { status: 500 })
  }
}