import { type NextRequest, NextResponse } from "next/server"
import { travelAgent } from "@/lib/mastra/travel-agent"
import { aiModel } from "@/lib/mastra/common"

export async function POST(request: NextRequest) {
  try {
    const { prompt, guideId, userId, useMastra = true } = await request.json()
    console.log('Received prompt:', prompt)

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    let guide;
    
    // 统一使用合并后的TravelAgent（包含所有Mastra功能）
    console.log('Using unified travel agent with Mastra capabilities')
    guide = await travelAgent.generateTravelGuideFromPrompt(prompt)

    return NextResponse.json({
      success: true,
      guide,
      usedMastra: true, // 现在总是使用包含Mastra功能的统一代理
      enhancedFeatures: {
        aiTools: true,
        progressTracking: true,
        xiaohongshuIntegration: true,
        transportationAnalysis: true,
      },
    })
  } catch (error) {
    console.error("Error generating guide:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}


