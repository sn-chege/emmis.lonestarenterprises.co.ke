import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseCSV, validateCSVData, csvToObjects } from '@/lib/csv-import'
import bcrypt from 'bcryptjs'

const requiredFields = ['id', 'name', 'email', 'role']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
    }
    
    const csvText = await file.text()
    const data = parseCSV(csvText)
    
    const validation = validateCSVData(data, requiredFields, 'users')
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }
    
    const users = csvToObjects(data)
    const results = { created: 0, errors: [] as string[] }
    
    for (const user of users) {
      try {
        const hashedPassword = await bcrypt.hash('defaultpassword123', 10)
        
        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || null,
            department: user.department || null,
            status: user.status || 'active'
          },
          create: {
            id: user.id,
            name: user.name,
            email: user.email,
            password: hashedPassword,
            role: user.role,
            phone: user.phone || null,
            department: user.department || null,
            status: user.status || 'active'
          }
        })
        results.created++
      } catch (error: any) {
        results.errors.push(`User ${user.id}: ${error.message}`)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Import completed. ${results.created} users processed. Default password: defaultpassword123`,
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