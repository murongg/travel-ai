import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Mock comments data
    const mockComments = [
      {
        id: "comment-1",
        content: "非常详细的攻略！去年按照这个路线走的，樱花真的很美，特别是千鸟渊的夜樱。",
        author: {
          id: "user-2",
          name: "樱花迷小美",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        likes: 12,
        createdAt: "2024-03-16T08:20:00Z",
        replies: [
          {
            id: "reply-1",
            content: "同感！千鸟渊的夜樱确实震撼，建议大家一定要去看看。",
            author: {
              id: "user-3",
              name: "东京通阿强",
              avatar: "/placeholder.svg?height=32&width=32",
            },
            likes: 3,
            createdAt: "2024-03-16T10:15:00Z",
          },
        ],
      },
      {
        id: "comment-2",
        content: "请问楼主，4月中旬去还能看到樱花吗？计划4月15日左右出发。",
        author: {
          id: "user-4",
          name: "计划中的旅行者",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        likes: 5,
        createdAt: "2024-03-17T14:30:00Z",
        replies: [],
      },
      {
        id: "comment-3",
        content: "预算很合理，住宿推荐也很实用。已经收藏了，准备明年樱花季去！",
        author: {
          id: "user-5",
          name: "预算旅行家",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        likes: 8,
        createdAt: "2024-03-18T09:45:00Z",
        replies: [],
      },
    ]

    return NextResponse.json({
      success: true,
      comments: mockComments,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, parentId } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Mock comment creation
    const newComment = {
      id: `comment-${Date.now()}`,
      content,
      author: {
        id: "user-current",
        name: "Current User",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      likes: 0,
      createdAt: new Date().toISOString(),
      replies: [],
      parentId: parentId || null,
    }

    return NextResponse.json({
      success: true,
      comment: newComment,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
