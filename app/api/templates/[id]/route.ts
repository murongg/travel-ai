import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const templates = {
      "family-trip": {
        id: "family-trip",
        title: "亲子游",
        description: "适合全家出行的温馨路线",
        category: "家庭",
        duration: "5-7天",
        difficulty: "简单",
        image: "/placeholder.svg?height=200&width=300",
        tags: ["亲子", "轻松", "安全"],
        prompt: "为一家四口（包含两个8-12岁的孩子）规划一次亲子友好的旅行，重点关注安全、教育意义和家庭娱乐活动",
        features: ["儿童友好的景点推荐", "安全的住宿环境", "教育意义的活动安排", "家庭套餐优惠信息"],
      },
      honeymoon: {
        id: "honeymoon",
        title: "蜜月旅行",
        description: "浪漫二人世界的完美假期",
        category: "浪漫",
        duration: "7-10天",
        difficulty: "中等",
        image: "/placeholder.svg?height=200&width=300",
        tags: ["浪漫", "奢华", "私密"],
        prompt: "为新婚夫妇设计一次浪漫的蜜月旅行，包含私密的住宿、浪漫的用餐体验和难忘的情侣活动",
        features: ["浪漫的住宿环境", "私密的用餐体验", "情侣专属活动", "蜜月特别服务"],
      },
    }

    const template = templates[id as keyof typeof templates]

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      template,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
