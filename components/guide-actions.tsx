"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Share2, MessageSquare, Star, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GuideActionsProps {
  guideId: string
  title: string
}

export function GuideActions({ guideId, title }: GuideActionsProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [rating, setRating] = useState(0)
  const { toast } = useToast()

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: "查看这个AI生成的旅游攻略",
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
        toast({
          title: "链接已复制",
          description: "攻略链接已复制到剪贴板",
        })
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "链接已复制",
        description: "攻略链接已复制到剪贴板",
      })
    }
  }

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
    toast({
      title: isFavorited ? "已取消收藏" : "已收藏",
      description: isFavorited ? "攻略已从收藏中移除" : "攻略已添加到收藏",
    })
  }

  const handleFeedbackSubmit = () => {
    if (rating === 0) {
      toast({
        title: "请选择评分",
        description: "请为这个攻略打分",
        variant: "destructive",
      })
      return
    }

    // Mock feedback submission
    toast({
      title: "反馈已提交",
      description: "感谢您的宝贵意见！",
    })
    setShowFeedback(false)
    setFeedback("")
    setRating(0)
  }

  const handleDownload = () => {
    // Mock download functionality
    toast({
      title: "开始下载",
      description: "攻略PDF正在生成中...",
    })
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={handleFavorite} variant="outline" className="flex items-center gap-2 bg-transparent">
          <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
          {isFavorited ? "已收藏" : "收藏"}
        </Button>

        <Button onClick={handleShare} variant="outline" className="flex items-center gap-2 bg-transparent">
          <Share2 className="h-4 w-4" />
          分享
        </Button>

        <Button onClick={() => setShowFeedback(!showFeedback)} variant="outline" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          反馈
        </Button>

        <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          下载PDF
        </Button>
      </div>

      {/* Feedback Section */}
      {showFeedback && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">为这个攻略评分</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Star Rating */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="p-1">
                  <Star className={`h-6 w-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">{rating > 0 && `${rating}/5 星`}</span>
            </div>

            {/* Feedback Text */}
            <Textarea
              placeholder="分享您对这个攻略的看法和建议..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-20"
            />

            <div className="flex gap-2">
              <Button onClick={handleFeedbackSubmit} size="sm">
                提交反馈
              </Button>
              <Button onClick={() => setShowFeedback(false)} variant="outline" size="sm">
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
