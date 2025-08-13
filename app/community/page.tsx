"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GuideCard } from "@/components/community/guide-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus } from "lucide-react"
import type { CommunityGuide } from "@/lib/community"
import { communityService } from "@/lib/community"

export default function CommunityPage() {
  const router = useRouter()
  const [guides, setGuides] = useState<CommunityGuide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("全部")
  const [sortBy, setSortBy] = useState("最新")
  const [categories, setCategories] = useState<string[]>(["全部"])
  const [error, setError] = useState<string | null>(null)

  const sortOptions = ["最新", "最热", "评分最高", "浏览最多"]

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadGuides()
  }, [category, sortBy])

  const loadCategories = async () => {
    try {
      const data = await communityService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error("Failed to load categories:", error)
      // Use fallback categories
      setCategories(["全部", "日本", "欧洲", "东南亚", "美洲", "大洋洲", "其他"])
    }
  }

  const loadGuides = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await communityService.getGuides(1, category, sortBy)
      setGuides(data)
    } catch (error) {
      console.error("Failed to load guides:", error)
      setError("加载攻略失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/community/guides?search=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&sortBy=${encodeURIComponent(sortBy)}`,
        )
        if (response.ok) {
          const data = await response.json()
          setGuides(data.guides)
        } else {
          throw new Error("Search failed")
        }
      } catch (error) {
        console.error("Search failed:", error)
        setError("搜索失败，请稍后重试")
      } finally {
        setIsLoading(false)
      }
    } else {
      loadGuides()
    }
  }

  const handleViewGuide = (guide: CommunityGuide) => {
    router.push(`/community/${guide.id}`)
  }

  const handleLikeGuide = async (guideId: string) => {
    try {
      await communityService.likeGuide(guideId)
      setGuides((prev) =>
        prev.map((guide) =>
          guide.id === guideId
            ? {
                ...guide,
                isLiked: !guide.isLiked,
                likes: guide.likes + (guide.isLiked ? -1 : 1),
              }
            : guide,
        ),
      )
    } catch (error) {
      console.error("Failed to like guide:", error)
    }
  }

  const handleSaveGuide = async (guideId: string) => {
    try {
      await communityService.saveGuide(guideId)
      setGuides((prev) => prev.map((guide) => (guide.id === guideId ? { ...guide, isSaved: !guide.isSaved } : guide)))
    } catch (error) {
      console.error("Failed to save guide:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              攻略社区
            </h1>
            <p className="text-muted-foreground">发现和分享精彩的旅行攻略</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            发布攻略
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="搜索攻略..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={loadGuides} variant="outline">
              重新加载
            </Button>
          </div>
        )}

        {/* Guides Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  onView={handleViewGuide}
                  onLike={handleLikeGuide}
                  onSave={handleSaveGuide}
                />
              ))}
            </div>
          )
        )}

        {!isLoading && !error && guides.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Filter className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">没有找到匹配的攻略</h3>
            <p className="text-muted-foreground">尝试调整搜索条件或选择其他分类</p>
          </div>
        )}
      </div>
    </div>
  )
}
