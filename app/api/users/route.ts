import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { logActivity } from '@/lib/activity-log'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        department: true,
        status: true,
        lastLogin: true,
        createdDate: true,
      },
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }
    
    const hashedPassword = await bcrypt.hash(data.password, 10)
    const { password, ...userData } = data
    
    const user = await prisma.user.create({
      data: {
        ...userData,
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        department: true,
        status: true,
        createdDate: true,
      },
    })
    
    // Log activity
    await logActivity({
      userId: 'admin',
      userName: 'System Admin',
      action: 'create',
      module: 'Users',
      entityType: 'User',
      entityId: user.id,
      entityName: user.name,
      description: `Created user: ${user.name}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    })
    
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}