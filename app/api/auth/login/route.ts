import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

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
    
    const { passwordHash, ...userWithoutPassword } = user
    
    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Login successful'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Login failed: ' +   error }, { status: 500 })
  }
}