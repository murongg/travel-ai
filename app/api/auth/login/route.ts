import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Mock authentication logic
    const mockUsers = [
      {
        id: "1",
        email: "demo@example.com",
        password: "password123",
        name: "Demo User",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "2",
        email: "john@example.com",
        password: "password123",
        name: "John Doe",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ]

    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Mock JWT token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      token,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
