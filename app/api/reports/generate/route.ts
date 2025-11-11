import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateReportId(num: number): string {
  return `RPT${num.toString().padStart(3, '0')}`
}

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json()
    
    const lastReport = await prisma.report.findFirst({
      where: { id: { startsWith: 'RPT' } },
      orderBy: { id: 'desc' }
    })
    
    const nextNum = lastReport ? parseInt(lastReport.id.slice(3)) + 1 : 1
    const reportId = generateReportId(nextNum)
    
    // Generate report name based on type
    const reportNames: Record<string, string> = {
      'Equipment Reports': 'Equipment Inventory & Utilization Report',
      'Work Order Reports': 'Work Order Analytics Report',
      'Service Maintenance Reports': 'Service Maintenance Summary',
      'Repair Maintenance Reports': 'Repair History & Analysis',
      'Customer Reports': 'Customer Account Summary',
      'Financial & Lease Reports': 'Financial & Lease Analytics'
    }
    
    const report = await prisma.report.create({
      data: {
        id: reportId,
        name: reportNames[type] || `${type} Report`,
        type: type,
        format: 'PDF',
        fileSize: `${Math.floor(Math.random() * 3000 + 500)} KB`,
        status: 'completed',
        generatedBy: 'System'
      }
    })
    
    return NextResponse.json(report)
  } catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}