"use client"

import { useEffect, useState, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MapPin, Calendar, DollarSign, Star, Clock, Utensils, Bed } from "lucide-react"
import { type TravelGuide } from "@/lib/mock-data"
import { BudgetBreakdown } from "@/components/budget-breakdown"
import { TravelMap } from "@/components/travel-map"
import { GuideActions } from "@/components/guide-actions"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { ProgressTracker, useProgressTracking } from "@/components/progress-tracker"

export default function ResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [guide, setGuide] = useState<TravelGuide | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingFromPrompt, setIsGeneratingFromPrompt] = useState(false)
  
  const { progressState, isLoading: isProgressLoading, error: progressError, result, startProgressTracking } = useProgressTracking()

  // 使用AI生成的重要地点数据
  const mapLocations = useMemo(() => {
    if (!guide) return [];
    
    // 优先使用AI生成的mapLocations
    if (guide.mapLocations && guide.mapLocations.length > 0) {
      return guide.mapLocations.map(location => ({
        ...location,
        day: location.day || 1 // 确保day有默认值
      }));
    }
    
    // 如果没有AI生成的地点，回退到从行程中提取
    const locations: Array<{ name: string; type: "attraction" | "restaurant" | "hotel"; day: number }> = [];
    
    guide.itinerary.forEach((dayPlan, index) => {
      const dayNumber = dayPlan.day || (index + 1);
      
      // 提取活动地点作为景点
      dayPlan.activities?.forEach((activity) => {
        if (activity.name && activity.location) {
          locations.push({
            name: activity.name,
            type: "attraction",
            day: dayNumber
          });
        }
      });
      
      // 提取餐厅
      dayPlan.meals?.forEach((meal) => {
        if (meal.name && meal.location) {
          locations.push({
            name: meal.name,
            type: "restaurant", 
            day: dayNumber
          });
        }
      });
    });
    
    return locations;
  }, [guide])

  // 监听进度跟踪结果
  useEffect(() => {
    if (result) {
      setGuide(result);
      setIsLoading(false);
      setIsGeneratingFromPrompt(false);
    }
  }, [result]);

  // 监听进度跟踪错误
  useEffect(() => {
    if (progressError) {
      setIsLoading(false);
      setIsGeneratingFromPrompt(false);
    }
  }, [progressError]);

  useEffect(() => {
    const guideId = searchParams.get("guideId")
    const prompt = searchParams.get("prompt")

    if (guideId) {
      const storedGuide = localStorage.getItem("generatedGuide")
      if (storedGuide) {
        try {
          const parsedGuide = JSON.parse(storedGuide)
          setGuide(parsedGuide)
          setIsLoading(false)
          localStorage.removeItem("generatedGuide")
          return
        } catch (error) {
          console.error("Error parsing stored guide:", error)
        }
      }

      // Fallback to API call if no stored data
      fetchGuideById(guideId)
    } else if (prompt) {
      generateGuideFromPrompt(prompt)
    } else {
      router.push("/")
    }
  }, [searchParams, router])

  const fetchGuideById = async (guideId: string) => {
    try {
      const response = await fetch(`/api/generate?guideId=${guideId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch guide")
      }
      const data = await response.json()
      setGuide(data.guide)
    } catch (error) {
      console.error("Error fetching guide:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateGuideFromPrompt = async (prompt: string) => {
    try {
      setIsGeneratingFromPrompt(true);
      // 使用进度跟踪模式生成指南
      await startProgressTracking(prompt);
    } catch (error) {
      console.error("Error generating guide:", error);
      setIsLoading(false);
      setIsGeneratingFromPrompt(false);
    }
  }

  if (isLoading && !isGeneratingFromPrompt) {
    return <LoadingSkeleton />
  }

  // 如果正在从prompt生成，显示进度跟踪
  if (isGeneratingFromPrompt || (isProgressLoading && !guide)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
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

            {/* 进度跟踪器 */}
            {progressState && (
              <div className="mb-8">
                <ProgressTracker progressState={progressState} />
              </div>
            )}

            {/* 错误显示 */}
            {progressError && (
              <div className="mb-8">
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-sm">!</span>
                      </div>
                      <div>
                        <h3 className="text-red-800 font-medium">生成失败</h3>
                        <p className="text-red-600 text-sm mt-1">{progressError}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => window.location.reload()}
                      className="mt-4"
                      variant="outline"
                    >
                      重新生成
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-lg text-muted-foreground mb-4">攻略生成失败，请重试</p>
          <Button onClick={() => router.push("/")} className="hover:scale-105 transition-transform">
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  // 使用AI生成的预算明细，如果没有则使用默认值
  const budgetBreakdown = guide.budgetBreakdown || [
    { category: "交通费用", amount: 4500, percentage: 30, color: "#3b82f6" },
    { category: "住宿费用", amount: 4200, percentage: 28, color: "#8b5cf6" },
    { category: "餐饮费用", amount: 3600, percentage: 24, color: "#10b981" },
    { category: "门票娱乐", amount: 1800, percentage: 12, color: "#f59e0b" },
    { category: "购物其他", amount: 900, percentage: 6, color: "#ef4444" },
  ]



  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-500">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="hover:bg-secondary transition-colors duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-blue-600 animate-pulse" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                您的专属旅游攻略
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Guide Header */}
          <Card className="animate-in slide-in-from-top-4 duration-700 shadow-lg border-2 border-blue-100">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                    {guide.title}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">{guide.overview}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-1 shrink-0">
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {guide.destination}
                  </Badge>
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {guide.duration}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Highlights */}
              <Card className="animate-in slide-in-from-left-4 duration-700 delay-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="h-4 w-4 text-yellow-500" />
                    行程亮点
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {guide.highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-300 animate-in slide-in-from-left-2"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <span className="text-sm">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Itinerary */}
              <Card className="animate-in slide-in-from-left-4 duration-700 delay-400 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    详细行程
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {guide.itinerary.map((day, index) => (
                    <div
                      key={index}
                      className="space-y-4 animate-in slide-in-from-left-2 duration-500"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg hover:scale-110 transition-transform">
                          {day.day}
                        </div>
                        <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors">{day.title}</h3>
                      </div>

                      {/* Activities */}
                      <div className="ml-11 space-y-3">
                        {day.activities.map((activity, actIndex) => (
                          <div
                            key={actIndex}
                            className="border-l-2 border pl-4 pb-3 hover:border-blue-300 transition-colors group"
                          >
                            <div className="flex items-start gap-3">
                              <Clock className="h-4 w-4 text-muted-foreground mt-1 group-hover:text-blue-500 transition-colors" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-blue-600">{activity.time}</span>
                                  <span className="font-medium group-hover:text-blue-600 transition-colors">
                                    {activity.name}
                                  </span>
                                  <Badge variant="outline" className="text-xs hover:scale-105 transition-transform">
                                    {activity.cost}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1 leading-relaxed">{activity.description}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>📍 {activity.location}</span>
                                  <span>⏱️ {activity.duration}</span>
                                </div>
                                {activity.tips && (
                                  <p className="text-xs text-amber-600 mt-1 bg-amber-50 p-2 rounded">
                                    💡 {activity.tips}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Meals */}
                        {day.meals.map((meal, mealIndex) => (
                          <div
                            key={mealIndex}
                            className="border-l-2 border-green-200 pl-4 pb-3 hover:border-green-400 transition-colors group"
                          >
                            <div className="flex items-start gap-3">
                              <Utensils className="h-4 w-4 text-green-600 mt-1 group-hover:scale-110 transition-transform" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-green-600 capitalize">{meal.type}</span>
                                  <span className="font-medium group-hover:text-green-600 transition-colors">
                                    {meal.name}
                                  </span>
                                  <Badge variant="outline" className="text-xs hover:scale-105 transition-transform">
                                    {meal.cost}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1 leading-relaxed">{meal.description}</p>
                                <span className="text-xs text-muted-foreground">📍 {meal.location}</span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Accommodation */}
                        {day.accommodation && (
                          <div className="border-l-2 border-purple-200 pl-4 pb-3 hover:border-purple-400 transition-colors group">
                            <div className="flex items-start gap-3">
                              <Bed className="h-4 w-4 text-purple-600 mt-1 group-hover:scale-110 transition-transform" />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-purple-600">住宿</span>
                                <span className="font-medium ml-2 group-hover:text-purple-600 transition-colors">
                                  {day.accommodation}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {index < guide.itinerary.length - 1 && <Separator className="my-6" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="animate-in slide-in-from-left-4 duration-700 delay-600 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">💡 旅行贴士</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {guide.tips.map((tip, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors duration-300 animate-in slide-in-from-left-2"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <span className="text-amber-500 mt-1 animate-bounce">💡</span>
                        <span className="text-sm leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Budget Breakdown */}
              <div className="animate-in slide-in-from-right-4 duration-700 delay-300">
                <BudgetBreakdown totalBudget={guide.budget} breakdown={budgetBreakdown} />
              </div>

              {/* Travel Map */}
              <div className="animate-in slide-in-from-right-4 duration-700 delay-500">
                <TravelMap locations={mapLocations} destination={guide.destination} />
              </div>

              {/* Guide Actions */}
              <div className="animate-in slide-in-from-right-4 duration-700 delay-700">
                <GuideActions guideId={guide.id} title={guide.title} />
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-center gap-4 animate-in slide-in-from-bottom-4 duration-700 delay-900">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="hover:scale-105 transition-transform hover:bg-blue-50"
            >
              生成新攻略
            </Button>
            <Button
              onClick={() => window.print()}
              className="hover:scale-105 transition-transform bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              打印攻略
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
