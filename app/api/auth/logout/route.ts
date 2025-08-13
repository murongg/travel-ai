import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // In a real app, you might invalidate the token here
    // For mock purposes, we just return success

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
