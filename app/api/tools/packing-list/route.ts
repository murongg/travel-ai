import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { destination, season, duration, tripType } = await request.json()

    if (!destination || !season || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Mock packing list generation based on parameters
    const baseItems = {
      clothing: [
        { name: "内衣裤", quantity: Math.ceil(duration * 1.2), category: "必需品" },
        { name: "袜子", quantity: Math.ceil(duration * 1.2), category: "必需品" },
        { name: "睡衣", quantity: 2, category: "必需品" },
      ],
      toiletries: [
        { name: "牙刷牙膏", quantity: 1, category: "必需品" },
        { name: "洗发水", quantity: 1, category: "必需品" },
        { name: "沐浴露", quantity: 1, category: "必需品" },
        { name: "护肤品", quantity: 1, category: "必需品" },
      ],
      electronics: [
        { name: "手机充电器", quantity: 1, category: "必需品" },
        { name: "相机", quantity: 1, category: "推荐" },
        { name: "充电宝", quantity: 1, category: "推荐" },
      ],
      documents: [
        { name: "护照", quantity: 1, category: "必需品" },
        { name: "签证", quantity: 1, category: "必需品" },
        { name: "机票", quantity: 1, category: "必需品" },
        { name: "酒店预订单", quantity: 1, category: "必需品" },
      ],
    }

    // Season-specific items
    const seasonalItems = {
      spring: [
        { name: "轻薄外套", quantity: 2, category: "服装" },
        { name: "长袖衬衫", quantity: 3, category: "服装" },
        { name: "牛仔裤", quantity: 2, category: "服装" },
      ],
      summer: [
        { name: "短袖T恤", quantity: Math.ceil(duration * 0.8), category: "服装" },
        { name: "短裤", quantity: 3, category: "服装" },
        { name: "防晒霜", quantity: 1, category: "必需品" },
        { name: "太阳镜", quantity: 1, category: "推荐" },
        { name: "帽子", quantity: 1, category: "推荐" },
      ],
      autumn: [
        { name: "毛衣", quantity: 2, category: "服装" },
        { name: "外套", quantity: 1, category: "服装" },
        { name: "长裤", quantity: 3, category: "服装" },
      ],
      winter: [
        { name: "羽绒服", quantity: 1, category: "服装" },
        { name: "毛衣", quantity: 3, category: "服装" },
        { name: "保暖内衣", quantity: 2, category: "服装" },
        { name: "手套", quantity: 1, category: "必需品" },
        { name: "围巾", quantity: 1, category: "必需品" },
      ],
    }

    // Trip type specific items
    const tripTypeItems = {
      business: [
        { name: "西装", quantity: 2, category: "服装" },
        { name: "正装鞋", quantity: 1, category: "服装" },
        { name: "领带", quantity: 3, category: "服装" },
        { name: "笔记本电脑", quantity: 1, category: "必需品" },
      ],
      leisure: [
        { name: "休闲鞋", quantity: 2, category: "服装" },
        { name: "运动鞋", quantity: 1, category: "服装" },
        { name: "休闲装", quantity: Math.ceil(duration * 0.6), category: "服装" },
      ],
      adventure: [
        { name: "登山鞋", quantity: 1, category: "必需品" },
        { name: "冲锋衣", quantity: 1, category: "必需品" },
        { name: "背包", quantity: 1, category: "必需品" },
        { name: "头灯", quantity: 1, category: "推荐" },
      ],
    }

    // Combine all items
    const packingList = {
      ...baseItems,
      seasonal: seasonalItems[season as keyof typeof seasonalItems] || [],
      tripSpecific: tripTypeItems[tripType as keyof typeof tripTypeItems] || [],
    }

    return NextResponse.json({
      success: true,
      packingList,
      summary: {
        destination,
        season,
        duration,
        tripType,
        totalItems: Object.values(packingList).flat().length,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
