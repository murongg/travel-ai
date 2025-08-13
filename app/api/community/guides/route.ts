import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const sort = searchParams.get("sort") || "latest"

    // Mock community guides data
    const mockGuides = [
      {
        id: "community-1",
        title: "东京樱花季完美攻略",
        description: "详细的东京樱花观赏指南，包含最佳观赏地点和时间",
        destination: "东京, 日本",
        duration: "5天4夜",
        budget: "¥12,000",
        category: "自然风光",
        author: {
          id: "user-1",
          name: "旅行达人小王",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        stats: {
          views: 1250,
          likes: 89,
          comments: 23,
          saves: 45,
        },
        tags: ["樱花", "东京", "春季", "摄影"],
        image: "/placeholder.svg?height=200&width=300",
        createdAt: "2024-03-15T10:30:00Z",
        updatedAt: "2024-03-15T10:30:00Z",
      },
      {
        id: "community-2",
        title: "巴黎文艺复兴之旅",
        description: "探索巴黎的艺术与文化，从卢浮宫到蒙马特高地",
        destination: "巴黎, 法国",
        duration: "7天6夜",
        budget: "€2,800",
        category: "文化艺术",
        author: {
          id: "user-2",
          name: "艺术爱好者Lisa",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        stats: {
          views: 980,
          likes: 67,
          comments: 18,
          saves: 32,
        },
        tags: ["巴黎", "艺术", "博物馆", "文化"],
        image: "/placeholder.svg?height=200&width=300",
        createdAt: "2024-03-10T14:20:00Z",
        updatedAt: "2024-03-10T14:20:00Z",
      },
      {
        id: "community-3",
        title: "泰国海岛跳岛游",
        description: "普吉岛、甲米、苏梅岛完美海岛度假攻略",
        destination: "泰国",
        duration: "10天9夜",
        budget: "¥8,500",
        category: "海岛度假",
        author: {
          id: "user-3",
          name: "海岛控阿明",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        stats: {
          views: 2100,
          likes: 156,
          comments: 42,
          saves: 78,
        },
        tags: ["泰国", "海岛", "潜水", "度假"],
        image: "/placeholder.svg?height=200&width=300",
        createdAt: "2024-03-08T09:15:00Z",
        updatedAt: "2024-03-08T09:15:00Z",
      },
    ]

    // Filter by category if specified
    let filteredGuides = mockGuides
    if (category && category !== "all") {
      filteredGuides = mockGuides.filter((guide) => guide.category === category)
    }

    // Sort guides
    switch (sort) {
      case "popular":
        filteredGuides.sort((a, b) => b.stats.likes - a.stats.likes)
        break
      case "views":
        filteredGuides.sort((a, b) => b.stats.views - a.stats.views)
        break
      case "latest":
      default:
        filteredGuides.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedGuides = filteredGuides.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      guides: paginatedGuides,
      pagination: {
        page,
        limit,
        total: filteredGuides.length,
        totalPages: Math.ceil(filteredGuides.length / limit),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const guideData = await request.json()

    // Mock guide creation
    const newGuide = {
      id: `community-${Date.now()}`,
      ...guideData,
      author: {
        id: "user-1",
        name: "Current User",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      stats: {
        views: 0,
        likes: 0,
        comments: 0,
        saves: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      guide: newGuide,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
