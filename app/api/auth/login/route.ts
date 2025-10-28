import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { logActivity } from '@/lib/activity-log'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })
    
    // Log login activity
    await logActivity({
      userId: user.id,
      userName: user.name,
      action: 'login',
      module: 'Authentication',
      entityType: 'User',
      entityId: user.id,
      entityName: user.name,
      description: `User ${user.name} logged in`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || undefined
    })
    
    const { passwordHash, ...userWithoutPassword } = user
    
    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Login successful'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Login failed: ' +     error }, { status: 500 })
  }
}