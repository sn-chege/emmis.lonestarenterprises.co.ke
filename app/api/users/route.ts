import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { logActivity } from '@/lib/activity-log'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const showDeleted = searchParams.get('showDeleted') === 'true'
    
    const users = await prisma.user.findMany({
      where: {
        deletedAt: showDeleted ? { not: null } : null
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
        lastLogin: true,
        createdDate: true,
        deletedAt: true,
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
    
    // Generate auto ID
    const lastUser = await prisma.user.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    })
    
    const nextNumber = lastUser 
      ? parseInt(lastUser.id.replace('USR', '')) + 1 
      : 1
    const id = `USR${nextNumber.toString().padStart(3, '0')}`
    
    const hashedPassword = await bcrypt.hash(data.password, 10)
    const { password, ...userData } = data
    
    const user = await prisma.user.create({
      data: {
        ...userData,
        id,
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
        supervisorId: true,
        supervisorName: true,
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
    return NextResponse.json({ 
      error: 'Failed to create user', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}