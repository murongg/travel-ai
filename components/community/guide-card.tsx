"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Eye, Star, Bookmark, Share2 } from "lucide-react"
import type { CommunityGuide } from "@/lib/community"
import { communityService } from "@/lib/community"

interface GuideCardProps {
  guide: CommunityGuide
  onView?: (guide: CommunityGuide) => void
}

export function GuideCard({ guide, onView }: GuideCardProps) {
  const [isLiked, setIsLiked] = useState(guide.isLiked || false)
  const [isSaved, setIsSaved] = useState(guide.isSaved || false)
  const [likes, setLikes] = useState(guide.likes)

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await communityService.likeGuide(guide.id)
      setIsLiked(!isLiked)
      setLikes(likes + (isLiked ? -1 : 1))
    } catch (error) {
      console.error("Failed to like guide:", error)
    }
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await communityService.saveGuide(guide.id)
      setIsSaved(!isSaved)
    } catch (error) {
      console.error("Failed to save guide:", error)
    }
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: guide.title,
        text: guide.summary,
        url: window.location.origin + `/community/${guide.id}`,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/community/${guide.id}`)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => onView?.(guide)}>
      <div className="aspect-video overflow-hidden rounded-t-lg">
        <img
          src={guide.thumbnail || "/placeholder.svg"}
          alt={guide.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title and Rating */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
              {guide.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{guide.rating}</span>
              </div>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{guide.destination}</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{guide.duration}</span>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm text-gray-600 line-clamp-2">{guide.summary}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {guide.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {guide.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{guide.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Author */}
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={guide.author.avatar || "/placeholder.svg"} alt={guide.author.name} />
              <AvatarFallback>{guide.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{guide.author.name}</p>
              <p className="text-xs text-gray-500">{guide.author.level}</p>
            </div>
            <span className="text-xs text-gray-500">{formatDate(guide.createdAt)}</span>
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{guide.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{guide.comments}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`h-8 px-2 ${isLiked ? "text-red-500" : "text-gray-500"}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                <span className="ml-1 text-xs">{likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className={`h-8 px-2 ${isSaved ? "text-blue-500" : "text-gray-500"}`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare} className="h-8 px-2 text-gray-500">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
