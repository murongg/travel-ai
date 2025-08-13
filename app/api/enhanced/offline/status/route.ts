import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock offline status
    const offlineStatus = {
      isOnline: true,
      lastSync: new Date().toISOString(),
      downloadedGuides: [
        {
          id: "guide-1",
          title: "东京樱花季完美攻略",
          downloadedAt: "2024-03-15T10:30:00Z",
          size: "2.5MB",
          status: "ready",
        },
        {
          id: "guide-2",
          title: "巴黎文艺复兴之旅",
          downloadedAt: "2024-03-10T14:20:00Z",
          size: "3.1MB",
          status: "ready",
        },
      ],
      storageUsed: "5.6MB",
      storageLimit: "100MB",
    }

    return NextResponse.json({
      success: true,
      status: offlineStatus,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
