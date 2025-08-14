import { NextRequest, NextResponse } from 'next/server'
import { TravelGuideService } from '@/lib/services/travel-guide-service'
import { FirebaseTravelGuide } from '@/lib/firebase'

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const { data, error } = await TravelGuideService.getTravelGuideById(id)
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to get travel guide', details: error },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Travel guide not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/travel-guides/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const updates: Partial<FirebaseTravelGuide> = body
    const { id } = await ctx.params
    const { data, error } = await TravelGuideService.updateTravelGuide(id, updates)
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to update travel guide', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, message: 'Travel guide updated successfully' })
  } catch (error) {
    console.error('Error in PUT /api/travel-guides/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const { error } = await TravelGuideService.deleteTravelGuide(id)
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete travel guide', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Travel guide deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/travel-guides/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
