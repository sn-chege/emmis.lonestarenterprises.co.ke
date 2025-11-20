import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const report = await prisma.report.findUnique({
      where: { id }
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
    return NextResponse.json({ 
      error: 'Failed to fetch report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.report.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 })
  }
}