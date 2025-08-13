import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    // Mock voice transcription
    const mockTranscriptions = [
      "我想去日本旅游，大概7天时间，预算在15000元左右，希望能看到樱花和体验传统文化",
      "计划欧洲三国游，法国意大利德国，时间大概10天，喜欢艺术和历史",
      "想要一次海岛度假，泰国或者马尔代夫都可以，主要是放松和潜水",
      "商务出差到新加坡，需要高效的行程安排，重点是交通便利的酒店",
    ]

    const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)]

    // Mock processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return NextResponse.json({
      success: true,
      transcription: {
        text: randomTranscription,
        confidence: 0.95,
        language: "zh-CN",
        duration: audioFile.size / 1000, // Mock duration based on file size
        processedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
