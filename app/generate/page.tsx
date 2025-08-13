"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { ProgressTracker, useProgressTracking } from "@/components/progress-tracker"

function GenerateContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const prompt = useMemo(() => searchParams.get("prompt") || "", [searchParams])

  const { progressState, isLoading, error, result, startProgressTracking } = useProgressTracking()
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!prompt) {
      router.push("/")
      return
    }
    if (!started) {
      setStarted(true)
      startProgressTracking(prompt).catch(() => {})
    }
  }, [prompt, started, startProgressTracking, router])

  useEffect(() => {
    // 优先从保存步骤中获取ID
    const savedStep = progressState?.steps.find((s) => s.id === "save-database" && s.status === "completed")
    const savedId = (savedStep as any)?.result?.id
    if (savedId) {
      router.push(`/result/${savedId}`)
    }
  }, [progressState, router])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">正在生成您的专属旅行指南</h1>
              <p className="text-muted-foreground">请稍候，AI正在为您精心规划...</p>
            </div>
          </div>

          {progressState && (
            <div className="mb-8">
              <ProgressTracker progressState={progressState} />
            </div>
          )}

          {error && (
            <div className="mb-8">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm">!</span>
                    </div>
                    <div>
                      <h3 className="text-red-800 font-medium">生成失败</h3>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                  <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
                    重新生成
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 生成完成但未能获取ID时的提示 */}
          {progressState?.isComplete && !error && !progressState.steps.find((s) => s.id === "save-database" && (s as any).result?.id) && (
            <div className="text-center text-muted-foreground">
              生成完成，但未获取到ID。请返回首页重试。
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>}>
      <GenerateContent />
    </Suspense>
  )
}


