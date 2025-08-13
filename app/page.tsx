"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Clock, Users, Zap, Globe, Heart } from "lucide-react"
 

export default function HomePage() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [useProgressMode, setUseProgressMode] = useState(true)
  const router = useRouter()
  
  

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const templateId = urlParams.get("template")

    if (templateId) {
      const savedTemplate = localStorage.getItem("selectedTemplate")
      if (savedTemplate) {
        const template = JSON.parse(savedTemplate)
        // Fill prompt with template-based text
        const templatePrompt = template.prompt
          .replace("{destination}", "您的目的地")
          .replace("{duration}", template.duration)
        setPrompt(templatePrompt)
        localStorage.removeItem("selectedTemplate")
      }
    }
  }, [])

  

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    // 跳转到生成页，展示进度
    router.push(`/generate?prompt=${encodeURIComponent(prompt.trim())}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              智能生成
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                专属旅游攻略
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              只需描述你的旅行需求，AI将为你生成详细的旅游路书和攻略，让每一次旅行都成为难忘的回忆
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>AI智能生成</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4 text-blue-500" />
                <span>全球目的地</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span>个性化定制</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Sparkles,
                title: "智能推荐",
                description: "基于AI算法，为你推荐最适合的景点和路线",
                color: "text-purple-600",
                bgColor: "bg-purple-50",
                borderColor: "border-purple-200",
              },
              {
                icon: Clock,
                title: "时间规划",
                description: "合理安排行程时间，让你的旅行更加充实",
                color: "text-green-600",
                bgColor: "bg-green-50",
                borderColor: "border-green-200",
              },
              {
                icon: Users,
                title: "个性定制",
                description: "根据人数、预算、兴趣定制专属旅游方案",
                color: "text-orange-600",
                bgColor: "bg-orange-50",
                borderColor: "border-orange-200",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 ${feature.borderColor} ${feature.bgColor} dark:bg-card dark:border-border animate-in fade-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardHeader className="text-center">
                  <feature.icon
                    className={`h-12 w-12 ${feature.color} dark:text-primary mx-auto mb-2 transition-transform duration-300 group-hover:scale-110`}
                  />
                  <CardTitle className="group-hover:text-foreground transition-colors">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Input Section */}
          <Card className="max-w-2xl mx-auto shadow-xl border-2 border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-600">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                开始规划你的旅行
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                详细描述你的旅行需求，包括目的地、时间、预算、兴趣等，AI将为你量身定制完美的旅行方案
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative">
                <Textarea
                  placeholder="例如：我想去日本旅游7天，预算15000元，喜欢文化古迹和美食，希望体验传统文化，住宿要求舒适，不喜欢太累的行程..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-32 resize-none border focus:border-primary transition-colors duration-300 text-base leading-relaxed"
                />
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">{prompt.length}/500</div>
              </div>

              {/* 进度模式选择 */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="progressMode"
                    checked={useProgressMode}
                    onChange={(e) => setUseProgressMode(e.target.checked)}
                    className="w-4 h-4 text-primary border rounded focus:ring-primary"
                  />
                  <label htmlFor="progressMode" className="text-sm font-medium text-foreground">
                    启用实时进度跟踪
                  </label>
                </div>
                <div className="text-xs text-muted-foreground">
                  {useProgressMode ? "可查看详细生成步骤" : "快速生成模式"}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none shadow-lg hover:shadow-xl"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                    正在生成攻略...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                    生成专属旅游攻略
                  </>
                )}
              </Button>
            </CardContent>
          </Card>


          {/* Example Prompts */}
          <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-800">
            <p className="text-sm text-muted-foreground mb-6 font-medium">✨ 试试这些热门示例，快速开始你的旅行规划：</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { text: "三亚5天度假，预算8000元", emoji: "🏖️" },
                { text: "北京文化之旅，3天2夜", emoji: "🏛️" },
                { text: "西藏自驾游15天攻略", emoji: "🏔️" },
                { text: "欧洲蜜月旅行2周", emoji: "💕" },
                { text: "东南亚背包游1个月", emoji: "🎒" },
                { text: "新疆深度游10天", emoji: "🐪" },
              ].map((example, index) => (
                <Button
                  key={example.text}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(example.text)}
                  className="text-sm hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-105 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="mr-1 group-hover:animate-bounce">{example.emoji}</span>
                  {example.text}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000">
            {[
              { number: "10,000+", label: "生成攻略", icon: "📋" },
              { number: "50+", label: "热门目的地", icon: "🌍" },
              { number: "98%", label: "用户满意度", icon: "⭐" },
              { number: "24/7", label: "智能服务", icon: "🤖" },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-2xl mb-1 group-hover:animate-bounce">{stat.icon}</div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
