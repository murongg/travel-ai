"use client"

import { OfflineManager } from "@/components/enhanced/offline-manager"
import { VoiceInput } from "@/components/enhanced/voice-input"
import { ARNavigation } from "@/components/enhanced/ar-navigation"
import { LanguageSelector } from "@/components/enhanced/language-selector"

export default function EnhancedFeaturesPage() {
  const handleVoiceTranscript = (text: string) => {
    console.log("Voice transcript:", text)
    // In a real app, this would be used to fill form fields or trigger actions
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              技术增强功能
            </h1>
            <p className="text-gray-600">体验最新的AI和AR技术，让旅行更智能</p>
          </div>
          <LanguageSelector />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Voice Input */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">语音输入</h2>
            <VoiceInput onTranscript={handleVoiceTranscript} placeholder="说出您的旅行需求，AI将为您生成攻略" />
          </div>

          {/* Offline Manager */}
          <OfflineManager />

          {/* AR Navigation */}
          <ARNavigation />

          {/* Feature Showcase */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">功能特色</h2>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-medium mb-2">🌐 多语言支持</h3>
                <p className="text-sm text-gray-600">支持中文、英文、日文、韩文等7种语言，全球旅行无障碍</p>
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-medium mb-2">🎤 智能语音识别</h3>
                <p className="text-sm text-gray-600">说出旅行需求，AI自动转换为文字并生成个性化攻略</p>
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-medium mb-2">📱 离线模式</h3>
                <p className="text-sm text-gray-600">下载攻略到本地，无网络环境下也能查看完整内容</p>
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-medium mb-2">🔍 AR实景导航</h3>
                <p className="text-sm text-gray-600">通过摄像头实时显示周围景点信息，沉浸式导航体验</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <h3 className="font-medium mb-2">🚀 即将推出</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AI实时翻译对话</li>
                <li>• 智能行程优化建议</li>
                <li>• 社交化协作规划</li>
                <li>• 个性化推荐引擎</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
