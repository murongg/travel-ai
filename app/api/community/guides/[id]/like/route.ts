import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Mock like/unlike logic
    const isLiked = Math.random() > 0.5 // Random for demo
    const newLikeCount = Math.floor(Math.random() * 200) + 50

    return NextResponse.json({
      success: true,
      liked: !isLiked,
      likeCount: newLikeCount,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
