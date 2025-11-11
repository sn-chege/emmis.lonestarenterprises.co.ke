import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateReportId(num: number): string {
  return `RPT${num.toString().padStart(3, '0')}`
}

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { generatedDate: 'desc' }
    })
    return NextResponse.json(reports)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const lastReport = await prisma.report.findFirst({
      where: { id: { startsWith: 'RPT' } },
      orderBy: { id: 'desc' }
    })
    
    const nextNum = lastReport ? parseInt(lastReport.id.slice(3)) + 1 : 1
    const reportId = generateReportId(nextNum)
    
    const report = await prisma.report.create({
      data: {
        id: reportId,
        name: data.name,
        type: data.type,
        format: data.format || 'PDF',
        fileSize: data.fileSize || '0 KB',
        filePath: data.filePath,
        status: 'completed',
        generatedBy: data.generatedBy || 'System'
      }
    })
    
    return NextResponse.json(report)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }
}