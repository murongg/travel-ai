import { NextResponse } from "next/server"

export async function GET() {
  try {
    const categories = [
      { id: "all", name: "全部", count: 156 },
      { id: "自然风光", name: "自然风光", count: 45 },
      { id: "文化艺术", name: "文化艺术", count: 32 },
      { id: "海岛度假", name: "海岛度假", count: 28 },
      { id: "城市探索", name: "城市探索", count: 38 },
      { id: "美食之旅", name: "美食之旅", count: 13 },
    ]

    return NextResponse.json({
      success: true,
      categories,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
