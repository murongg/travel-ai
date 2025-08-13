export interface CommunityGuide {
  id: string
  title: string
  destination: string
  duration: string
  author: {
    id: string
    name: string
    avatar: string
    level: string
  }
  createdAt: Date
  updatedAt: Date
  likes: number
  comments: number
  views: number
  rating: number
  tags: string[]
  thumbnail: string
  summary: string
  isLiked?: boolean
  isSaved?: boolean
}

export interface Comment {
  id: string
  guideId: string
  author: {
    id: string
    name: string
    avatar: string
  }
  content: string
  createdAt: Date
  likes: number
  replies?: Comment[]
  isLiked?: boolean
}

export const communityService = {
  getGuides: async (page = 1, category = "全部", sortBy = "最新"): Promise<CommunityGuide[]> => {
    try {
      const response = await fetch(
        `/api/community/guides?page=${page}&category=${encodeURIComponent(category)}&sortBy=${encodeURIComponent(sortBy)}`,
      )
      if (!response.ok) {
        throw new Error("Failed to fetch guides")
      }
      const data = await response.json()
      return data.guides
    } catch (error) {
      console.error("Error fetching guides:", error)
      throw error
    }
  },

  getGuideById: async (id: string): Promise<CommunityGuide | null> => {
    try {
      const response = await fetch(`/api/community/guides/${id}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error("Failed to fetch guide")
      }
      const data = await response.json()
      return data.guide
    } catch (error) {
      console.error("Error fetching guide:", error)
      throw error
    }
  },

  getComments: async (guideId: string): Promise<Comment[]> => {
    try {
      const response = await fetch(`/api/community/guides/${guideId}/comments`)
      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }
      const data = await response.json()
      return data.comments
    } catch (error) {
      console.error("Error fetching comments:", error)
      throw error
    }
  },

  likeGuide: async (guideId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/community/guides/${guideId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      })
      if (!response.ok) {
        throw new Error("Failed to like guide")
      }
    } catch (error) {
      console.error("Error liking guide:", error)
      throw error
    }
  },

  saveGuide: async (guideId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/community/guides/${guideId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      })
      if (!response.ok) {
        throw new Error("Failed to save guide")
      }
    } catch (error) {
      console.error("Error saving guide:", error)
      throw error
    }
  },

  addComment: async (guideId: string, content: string): Promise<Comment> => {
    try {
      const response = await fetch(`/api/community/guides/${guideId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ content }),
      })
      if (!response.ok) {
        throw new Error("Failed to add comment")
      }
      const data = await response.json()
      return data.comment
    } catch (error) {
      console.error("Error adding comment:", error)
      throw error
    }
  },

  getCategories: async (): Promise<string[]> => {
    try {
      const response = await fetch("/api/community/categories")
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      const data = await response.json()
      return data.categories
    } catch (error) {
      console.error("Error fetching categories:", error)
      return ["全部", "日本", "欧洲", "东南亚", "美洲", "大洋洲", "其他"]
    }
  },
}

// Helper function to get auth headers
function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}
