import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseCSV, validateCSVData, csvToObjects } from '@/lib/csv-import'

const requiredFields = ['id', 'name', 'email']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
    }
    
    const csvText = await file.text()
    const data = parseCSV(csvText)
    
    const validation = validateCSVData(data, requiredFields, 'customers')
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }
    
    const customers = csvToObjects(data)
    const results = { created: 0, updated: 0, errors: [] as string[] }
    
    for (const customer of customers) {
      try {
        await prisma.customer.upsert({
          where: { id: customer.id },
          update: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone || null,
            address: customer.address || null,
            city: customer.city || null,
            state: customer.state || null,
            zipCode: customer.zipCode || null,
            country: customer.country || null,
            contactPerson: customer.contactPerson || null,
            contractStartDate: customer.contractStartDate || null,
            contractEndDate: customer.contractEndDate || null,
            status: customer.status || 'active'
          },
          create: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone || null,
            address: customer.address || null,
            city: customer.city || null,
            state: customer.state || null,
            zipCode: customer.zipCode || null,
            country: customer.country || null,
            contactPerson: customer.contactPerson || null,
            contractStartDate: customer.contractStartDate || null,
            contractEndDate: customer.contractEndDate || null,
            status: customer.status || 'active'
          }
        })
        results.created++
      } catch (error: any) {
        results.errors.push(`Customer ${customer.id}: ${error.message}`)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Import completed. ${results.created} customers processed.`,
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