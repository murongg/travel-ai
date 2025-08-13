import { NextRequest, NextResponse } from 'next/server'
import { TravelGuideService } from '@/lib/services/travel-guide-service'
import { TravelGuide } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const travelGuide: TravelGuide = body

    const { data, error } = await TravelGuideService.createTravelGuide(travelGuide)
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create travel guide', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, message: 'Travel guide created successfully' })
  } catch (error) {
    console.error('Error in POST /api/travel-guides:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const destination = searchParams.get('destination')
    const prompt = searchParams.get('prompt')

    if (destination) {
      // 根据目的地搜索
      const { data, error } = await TravelGuideService.searchTravelGuidesByDestination(destination)
      if (error) {
        return NextResponse.json(
          { error: 'Failed to search travel guides', details: error },
          { status: 500 }
        )
      }
      return NextResponse.json({ data })
    }

    if (prompt) {
      // 根据提示词查询
      const { data, error } = await TravelGuideService.getTravelGuideByPrompt(prompt)
      if (error) {
        return NextResponse.json(
          { error: 'Failed to get travel guide by prompt', details: error },
          { status: 500 }
        )
      }
      return NextResponse.json({ data })
    }

    // 获取所有公开的旅行指南
    const { data, error } = await TravelGuideService.getPublicTravelGuides()
    if (error) {
      return NextResponse.json(
        { error: 'Failed to get public travel guides', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/travel-guides:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
