import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

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
    const hashedPassword = await bcrypt.hash(data.password, 10)
    
    const user = await prisma.user.create({
      data: {
        ...data,
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
    
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}