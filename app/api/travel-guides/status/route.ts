import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    // 检查数据库连接
    const adminDb = getFirebaseAdminDb()
    if (!adminDb) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Firebase admin not available. Please check server configuration.'
        },
        { status: 500 }
      )
    }

    // 测试数据库连接
    const testQuery = adminDb.collection('travel_guides').limit(1)
    const testSnapshot = await testQuery.get()

    if (!testSnapshot) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Database connection failed'
        },
        { status: 500 }
      )
    }

    // 获取旅行指南总数
    const countSnapshot = await adminDb.collection('travel_guides').count().get()
    const count = countSnapshot.data().count

    return NextResponse.json({
      status: 'success',
      message: 'Database connected successfully',
      totalGuides: count || 0,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error checking database status:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
