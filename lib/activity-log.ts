import { prisma } from './db'
import { ActivityAction } from '@prisma/client'

interface ActivityLogData {
  userId: string
  userName: string
  action: ActivityAction
  module: string
  entityType: string
  entityId?: string
  entityName?: string
  description: string
  ipAddress?: string
  userAgent?: string
  metadata?: any
}

export async function logActivity(data: ActivityLogData) {
  try {
    await prisma.activityLog.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

export async function getRecentActivities(userId?: string, limit = 10) {
  const where = userId ? { userId } : {}
  
  return await prisma.activityLog.findMany({
    where,
    orderBy: { createdDate: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          name: true,
          role: true
        }
      }
    }
  })
}