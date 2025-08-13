"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CommentSection } from "@/components/community/comment-section"
import { ArrowLeft, Heart, Bookmark, Share2, Eye, Star, Calendar, Clock } from "lucide-react"
import type { CommunityGuide } from "@/lib/community"
import { communityService } from "@/lib/community"

export default function GuideDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [guide, setGuide] = useState<CommunityGuide | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      loadGuide(params.id as string)
    }
  }, [params.id])

  const loadGuide = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await communityService.getGuideById(id)
      if (data) {
        setGuide(data)
        setIsLiked(data.isLiked || false)
        setIsSaved(data.isSaved || false)
      } else {
        setError("攻略不存在")
      }
    } catch (error) {
      console.error("Failed to load guide:", error)
      setError("加载攻略失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!guide) return
    try {
      await communityService.likeGuide(guide.id)
      setIsLiked(!isLiked)
      setGuide({ ...guide, likes: guide.likes + (isLiked ? -1 : 1), isLiked: !isLiked })
    } catch (error) {
      console.error("Failed to like guide:", error)
    }
  }

  const handleSave = async () => {
    if (!guide) return
    try {
      await communityService.saveGuide(guide.id)
      setIsSaved(!isSaved)
      setGuide({ ...guide, isSaved: !isSaved })
    } catch (error) {
      console.error("Failed to save guide:", error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: guide?.title,
        text: guide?.summary,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // Could show a toast notification here
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const getUserInitial = (name: string): string => {
    return name ? name.charAt(0).toUpperCase() : "U"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="aspect-video bg-muted rounded-lg mb-8"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {error === "攻略不存在" ? "攻略不存在" : "加载失败"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {error === "攻略不存在" ? "您访问的攻略可能已被删除或不存在" : "无法加载攻略内容，请稍后重试"}
            </p>
            <div className="space-x-4">
              <Button onClick={() => router.push("/community")}>返回社区</Button>
              {error !== "攻略不存在" && (
                <Button variant="outline" onClick={() => loadGuide(params.id as string)}>
                  重新加载
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="aspect-video overflow-hidden rounded-lg">
              <img
                src={guide.thumbnail || "/placeholder.svg?height=400&width=600"}
                alt={guide.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title and Meta */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground">{guide.title}</h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{guide.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{guide.views} 浏览</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(guide.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{guide.duration}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {guide.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="prose max-w-none">
              <p className="text-lg text-foreground leading-relaxed">{guide.summary}</p>
              {/* In a real app, this would be the full guide content */}
              <div className="mt-8 p-6 bg-card rounded-lg border">
                <h3 className="text-xl font-semibold mb-4">详细行程</h3>
                <p className="text-muted-foreground">
                  这里会显示完整的攻略内容，包括详细的行程安排、景点介绍、美食推荐、住宿建议等信息...
                </p>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-card rounded-lg p-6 border">
              <CommentSection guideId={guide.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Card */}
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={guide.author.avatar || "/placeholder.svg?height=48&width=48"}
                    alt={guide.author.name}
                  />
                  <AvatarFallback>{getUserInitial(guide.author.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{guide.author.name}</h3>
                  <p className="text-sm text-muted-foreground">{guide.author.level}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                关注作者
              </Button>
            </div>

            {/* Actions */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">操作</h3>
              <div className="space-y-3">
                <Button variant={isLiked ? "default" : "outline"} className="w-full justify-start" onClick={handleLike}>
                  <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                  {isLiked ? "已点赞" : "点赞"} ({guide.likes})
                </Button>
                <Button variant={isSaved ? "default" : "outline"} className="w-full justify-start" onClick={handleSave}>
                  <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "已收藏" : "收藏"}
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  分享
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">统计信息</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">浏览量</span>
                  <span className="font-medium">{guide.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">点赞数</span>
                  <span className="font-medium">{guide.likes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">评论数</span>
                  <span className="font-medium">{guide.comments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">发布时间</span>
                  <span className="font-medium">{formatDate(guide.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
