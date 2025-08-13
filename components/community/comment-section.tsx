"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle } from "lucide-react"
import type { Comment } from "@/lib/community"
import { communityService } from "@/lib/community"

interface CommentSectionProps {
  guideId: string
}

export function CommentSection({ guideId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [guideId])

  const loadComments = async () => {
    try {
      const data = await communityService.getComments(guideId)
      setComments(data)
    } catch (error) {
      console.error("Failed to load comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const comment = await communityService.addComment(guideId, newComment)
      setComments([comment, ...comments])
      setNewComment("")
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">评论 ({comments.length})</h3>

      {/* Add Comment */}
      <div className="space-y-3">
        <Textarea
          placeholder="分享您的想法和建议..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmitComment} disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? "发布中..." : "发布评论"}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
              <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{comment.author.name}</span>
                <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-2 text-xs ${comment.isLiked ? "text-red-500" : "text-gray-500"}`}
                >
                  <Heart className={`w-3 h-3 mr-1 ${comment.isLiked ? "fill-current" : ""}`} />
                  {comment.likes}
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  回复
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>还没有评论，来发表第一个评论吧！</p>
        </div>
      )}
    </div>
  )
}
