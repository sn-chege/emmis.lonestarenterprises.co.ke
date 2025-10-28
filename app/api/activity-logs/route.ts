import { NextRequest, NextResponse } from 'next/server'
import { getRecentActivities } from '@/lib/activity-log'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')

    const activities = await getRecentActivities(
      userId || undefined,
      limit
    )

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    )
  }
}