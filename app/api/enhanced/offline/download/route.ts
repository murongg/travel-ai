import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guideId, format } = await request.json()

    if (!guideId) {
      return NextResponse.json({ error: "Guide ID is required" }, { status: 400 })
    }

    // Mock offline package generation
    const offlinePackage = {
      id: `offline-${Date.now()}`,
      guideId,
      format: format || "json",
      size: "2.5MB",
      downloadUrl: `/api/enhanced/offline/files/${guideId}.${format || "json"}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      createdAt: new Date().toISOString(),
      includes: ["完整攻略内容", "离线地图数据", "重要联系方式", "紧急信息", "交通信息"],
    }

    return NextResponse.json({
      success: true,
      package: offlinePackage,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
