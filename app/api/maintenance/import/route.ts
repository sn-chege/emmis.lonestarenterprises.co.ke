import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
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
    
    const validation = validateCSVData(data, requiredFields, 'maintenance')
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }
    
    const maintenanceItems = csvToObjects(data)
    const results = { created: 0, errors: [] as string[] }
    
    for (const maintenance of maintenanceItems) {
      try {
        await prisma.maintenance.upsert({
          where: { id: maintenance.id },
          update: {
            title: maintenance.title,
            description: maintenance.description || null,
            assetId: maintenance.assetId,
            scheduledDate: maintenance.scheduledDate || null,
            frequency: maintenance.frequency || null,
            priority: maintenance.priority || 'medium',
            assignedTo: maintenance.assignedTo || null,
            status: maintenance.status || 'scheduled',
            estimatedDuration: maintenance.estimatedDuration || null
          },
          create: {
            id: maintenance.id,
            title: maintenance.title,
            description: maintenance.description || null,
            assetId: maintenance.assetId,
            scheduledDate: maintenance.scheduledDate || null,
            frequency: maintenance.frequency || null,
            priority: maintenance.priority || 'medium',
            assignedTo: maintenance.assignedTo || null,
            status: maintenance.status || 'scheduled',
            estimatedDuration: maintenance.estimatedDuration || null
          }
        })
        results.created++
      } catch (error: any) {
        results.errors.push(`Maintenance ${maintenance.id}: ${error.message}`)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Import completed. ${results.created} maintenance items processed.`,
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