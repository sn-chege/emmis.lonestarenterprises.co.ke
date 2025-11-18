import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseCSV, validateCSVData, csvToObjects } from '@/lib/csv-import'

const requiredFields = ['id', 'title', 'assetId']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
    }
    
    const csvText = await file.text()
    const data = parseCSV(csvText)
    
    const validation = validateCSVData(data, requiredFields, 'work-orders')
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }
    
    const workOrders = csvToObjects(data)
    const results = { created: 0, errors: [] as string[] }
    
    for (const workOrder of workOrders) {
      try {
        await prisma.workOrder.upsert({
          where: { id: workOrder.id },
          update: {
            title: workOrder.title,
            description: workOrder.description || null,
            priority: workOrder.priority || 'medium',
            status: workOrder.status || 'pending',
            assetId: workOrder.assetId,
            assignedTo: workOrder.assignedTo || null,
            requestedBy: workOrder.requestedBy || null,
            scheduledDate: workOrder.scheduledDate || null,
            completedDate: workOrder.completedDate || null
          },
          create: {
            id: workOrder.id,
            title: workOrder.title,
            description: workOrder.description || null,
            priority: workOrder.priority || 'medium',
            status: workOrder.status || 'pending',
            assetId: workOrder.assetId,
            assignedTo: workOrder.assignedTo || null,
            requestedBy: workOrder.requestedBy || null,
            scheduledDate: workOrder.scheduledDate || null,
            completedDate: workOrder.completedDate || null
          }
        })
        results.created++
      } catch (error: any) {
        results.errors.push(`Work Order ${workOrder.id}: ${error.message}`)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Import completed. ${results.created} work orders processed.`,
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