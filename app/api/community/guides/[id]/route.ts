import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Mock detailed guide data
    const mockGuide = {
      id,
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
        bio: "资深旅行博主，专注亚洲旅行攻略分享",
      },
      stats: {
        views: 1250,
        likes: 89,
        comments: 23,
        saves: 45,
      },
      tags: ["樱花", "东京", "春季", "摄影"],
      images: [
        "/placeholder.svg?height=400&width=600",
        "/placeholder.svg?height=400&width=600",
        "/placeholder.svg?height=400&width=600",
      ],
      content: {
        highlights: ["上野公园樱花盛开", "新宿御苑赏樱野餐", "千鸟渊夜樱观赏", "目黑川樱花隧道"],
        itinerary: [
          {
            day: 1,
            title: "抵达东京 - 上野公园初体验",
            activities: [
              {
                time: "10:00",
                type: "transport",
                title: "抵达成田机场",
                description: "乘坐京成电铁前往上野",
              },
              {
                time: "14:00",
                type: "activity",
                title: "上野公园赏樱",
                description: "东京最著名的赏樱地点，约1000株樱花树",
              },
              {
                time: "18:00",
                type: "dining",
                title: "上野居酒屋",
                description: "体验地道的日式居酒屋文化",
              },
            ],
          },
        ],
        tips: [
          "樱花季为3月下旬至5月上旬，4月初为最佳观赏期",
          "建议早上前往热门景点避开人群",
          "准备野餐垫和便当享受花见文化",
          "下载樱花预报APP实时了解开花情况",
        ],
      },
      createdAt: "2024-03-15T10:30:00Z",
      updatedAt: "2024-03-15T10:30:00Z",
    }

    return NextResponse.json({
      success: true,
      guide: mockGuide,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
