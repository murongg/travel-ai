import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Mock token validation
    if (!token.startsWith("mock-jwt-token-")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Extract user ID from mock token
    const userId = token.split("-")[3]

    // Mock user data
    const mockUsers = {
      "1": { id: "1", email: "demo@example.com", name: "Demo User", avatar: "/placeholder.svg?height=40&width=40" },
      "2": { id: "2", email: "john@example.com", name: "John Doe", avatar: "/placeholder.svg?height=40&width=40" },
    }

    const user = mockUsers[userId as keyof typeof mockUsers]

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
