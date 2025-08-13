import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, from, to } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Mock translation data
    const mockTranslations = {
      "zh-CN": {
        "en-US": {
          我想去日本旅游: "I want to travel to Japan",
          请问洗手间在哪里: "Where is the restroom?",
          多少钱: "How much does it cost?",
          谢谢: "Thank you",
        },
        "ja-JP": {
          我想去日本旅游: "日本に旅行に行きたいです",
          请问洗手间在哪里: "トイレはどこですか？",
          多少钱: "いくらですか？",
          谢谢: "ありがとうございます",
        },
      },
      "en-US": {
        "zh-CN": {
          "I want to travel to Japan": "我想去日本旅游",
          "Where is the restroom?": "请问洗手间在哪里？",
          "How much does it cost?": "多少钱？",
          "Thank you": "谢谢",
        },
      },
    }

    const fromLang = from || "zh-CN"
    const toLang = to || "en-US"

    // Get translation or use mock
    const translation =
      mockTranslations[fromLang as keyof typeof mockTranslations]?.[
        toLang as keyof (typeof mockTranslations)["zh-CN"]
      ]?.[text as keyof (typeof mockTranslations)["zh-CN"]["en-US"]] || `[Translated: ${text}]`

    return NextResponse.json({
      success: true,
      translation: {
        originalText: text,
        translatedText: translation,
        fromLanguage: fromLang,
        toLanguage: toLang,
        confidence: 0.92,
        translatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
