import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // 检查数据库连接
    const { data, error } = await supabase
      .from('travel_guides')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Database connection failed', 
          details: error.message 
        },
        { status: 500 }
      )
    }

    // 获取旅行指南总数
    const { count, error: countError } = await supabase
      .from('travel_guides')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      return NextResponse.json(
        { 
          status: 'warning', 
          message: 'Database connected but count query failed', 
          details: countError.message 
        },
        { status: 200 }
      )
    }

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
