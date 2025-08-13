import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Mock registration validation
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Mock check for existing user
    const existingEmails = ["demo@example.com", "john@example.com"]
    if (existingEmails.includes(email)) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Mock user creation
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      avatar: "/placeholder.svg?height=40&width=40",
      createdAt: new Date().toISOString(),
    }

    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`

    return NextResponse.json({
      success: true,
      user: newUser,
      token,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
