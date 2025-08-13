import { NextResponse } from "next/server"

export async function GET() {
  try {
    const templates = [
      {
        id: "family-trip",
        title: "亲子游",
        description: "适合全家出行的温馨路线",
        category: "家庭",
        duration: "5-7天",
        difficulty: "简单",
        image: "/placeholder.svg?height=200&width=300",
        tags: ["亲子", "轻松", "安全"],
        prompt: "为一家四口（包含两个8-12岁的孩子）规划一次亲子友好的旅行，重点关注安全、教育意义和家庭娱乐活动",
      },
      {
        id: "honeymoon",
        title: "蜜月旅行",
        description: "浪漫二人世界的完美假期",
        category: "浪漫",
        duration: "7-10天",
        difficulty: "中等",
        image: "/placeholder.svg?height=200&width=300",
        tags: ["浪漫", "奢华", "私密"],
        prompt: "为新婚夫妇设计一次浪漫的蜜月旅行，包含私密的住宿、浪漫的用餐体验和难忘的情侣活动",
      },
      {
        id: "business-trip",
        title: "商务出差",
        description: "高效便捷的商务旅行安排",
        category: "商务",
        duration: "2-5天",
        difficulty: "简单",
        image: "/placeholder.svg?height=200&width=300",
        tags: ["高效", "便捷", "商务"],
        prompt: "安排一次高效的商务出差行程，重点关注交通便利、商务设施完善的住宿和高效的时间安排",
      },
      {
        id: "backpacker",
        title: "背包客",
        description: "经济实惠的自由行体验",
        category: "冒险",
        duration: "10-30天",
        difficulty: "困难",
        image: "/placeholder.svg?height=200&width=300",
        tags: ["经济", "自由", "冒险"],
        prompt: "为预算有限的背包客设计一次深度旅行体验，重点关注经济住宿、当地交通和authentic的文化体验",
      },
    ]

    return NextResponse.json({
      success: true,
      templates,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
