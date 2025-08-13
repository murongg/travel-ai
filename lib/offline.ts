export interface OfflineGuide {
  id: string
  title: string
  content: any
  downloadedAt: Date
  size: number
}

export const offlineService = {
  downloadGuide: async (guideId: string, guideData: any): Promise<void> => {
    try {
      const response = await fetch("/api/enhanced/offline/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ guideId, guideData }),
      })

      if (!response.ok) {
        throw new Error("Failed to register offline download")
      }

      const offlineGuide: OfflineGuide = {
        id: guideId,
        title: guideData.title || "未命名攻略",
        content: guideData,
        downloadedAt: new Date(),
        size: JSON.stringify(guideData).length,
      }

      const existingGuides = await offlineService.getOfflineGuides()
      const updatedGuides = [...existingGuides.filter((g) => g.id !== guideId), offlineGuide]

      localStorage.setItem("offline-guides", JSON.stringify(updatedGuides))

      // Register service worker for offline functionality
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/sw.js")
        } catch (error) {
          console.warn("Service worker registration failed:", error)
        }
      }
    } catch (error) {
      console.error("Failed to download guide:", error)
      throw error
    }
  },

  getOfflineGuides: async (): Promise<OfflineGuide[]> => {
    try {
      if (navigator.onLine) {
        try {
          const response = await fetch("/api/enhanced/offline/status", {
            headers: getAuthHeaders(),
          })
          if (response.ok) {
            const data = await response.json()
            if (data.guides) {
              localStorage.setItem("offline-guides", JSON.stringify(data.guides))
              return data.guides.map((g: any) => ({
                ...g,
                downloadedAt: new Date(g.downloadedAt),
              }))
            }
          }
        } catch (error) {
          console.warn("Failed to sync offline guides from API:", error)
        }
      }

      // Fallback to localStorage
      const guides = localStorage.getItem("offline-guides")
      return guides
        ? JSON.parse(guides).map((g: any) => ({
            ...g,
            downloadedAt: new Date(g.downloadedAt),
          }))
        : []
    } catch (error) {
      console.error("Failed to load offline guides:", error)
      return []
    }
  },

  getOfflineGuide: async (guideId: string): Promise<OfflineGuide | null> => {
    try {
      const guides = await offlineService.getOfflineGuides()
      return guides.find((g) => g.id === guideId) || null
    } catch (error) {
      console.error("Failed to get offline guide:", error)
      return null
    }
  },

  deleteOfflineGuide: async (guideId: string): Promise<void> => {
    try {
      if (navigator.onLine) {
        try {
          await fetch(`/api/enhanced/offline/download`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
            body: JSON.stringify({ guideId }),
          })
        } catch (error) {
          console.warn("Failed to unregister offline guide from API:", error)
        }
      }

      const guides = await offlineService.getOfflineGuides()
      const updatedGuides = guides.filter((g) => g.id !== guideId)
      localStorage.setItem("offline-guides", JSON.stringify(updatedGuides))
    } catch (error) {
      console.error("Failed to delete offline guide:", error)
      throw error
    }
  },

  isOnline: (): boolean => {
    return navigator.onLine
  },

  getTotalOfflineSize: async (): Promise<number> => {
    const guides = await offlineService.getOfflineGuides()
    return guides.reduce((total, guide) => total + guide.size, 0)
  },
}

// Helper function to get auth headers
function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}
