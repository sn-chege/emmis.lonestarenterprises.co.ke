import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: params.id }
    })
    
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    
    const formattedReport = {
      ...report,
      generatedDate: report.createdAt.toISOString(),
      size: report.fileSize
    }
    
    return NextResponse.json(formattedReport)
  } catch (error) {
    console.error('Get report error:', error)
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.report.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 })
  }
}