import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supportedLanguages = [
      { code: "zh-CN", name: "中文（简体）", nativeName: "中文" },
      { code: "zh-TW", name: "中文（繁体）", nativeName: "中文" },
      { code: "en-US", name: "English", nativeName: "English" },
      { code: "ja-JP", name: "日本语", nativeName: "日本語" },
      { code: "ko-KR", name: "한국어", nativeName: "한국어" },
      { code: "fr-FR", name: "Français", nativeName: "Français" },
      { code: "de-DE", name: "Deutsch", nativeName: "Deutsch" },
      { code: "es-ES", name: "Español", nativeName: "Español" },
      { code: "it-IT", name: "Italiano", nativeName: "Italiano" },
      { code: "pt-PT", name: "Português", nativeName: "Português" },
      { code: "ru-RU", name: "Русский", nativeName: "Русский" },
      { code: "th-TH", name: "ไทย", nativeName: "ไทย" },
    ]

    return NextResponse.json({
      success: true,
      languages: supportedLanguages,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
