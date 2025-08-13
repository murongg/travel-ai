"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TemplateCard } from "@/components/template-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { travelTemplates, templateCategories, type TravelTemplate } from "@/lib/templates"

export default function TemplatesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("全部")
  const [filteredTemplates, setFilteredTemplates] = useState<TravelTemplate[]>([])
  const [allTemplates, setAllTemplates] = useState<TravelTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    filterTemplates(searchQuery, selectedCategory)
  }, [allTemplates, searchQuery, selectedCategory])

  const loadTemplates = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/templates")
      if (!response.ok) {
        throw new Error("Failed to load templates")
      }
      const data = await response.json()
      setAllTemplates(data.templates)
    } catch (error) {
      console.error("Failed to load templates:", error)
      setError("加载模板失败，使用本地模板")
      setAllTemplates(travelTemplates)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const filterTemplates = (query: string, category: string) => {
    let filtered = allTemplates

    if (category !== "全部") {
      filtered = filtered.filter((template) => template.category === category)
    }

    if (query) {
      filtered = filtered.filter(
        (template) =>
          template.title.toLowerCase().includes(query.toLowerCase()) ||
          template.description.toLowerCase().includes(query.toLowerCase()) ||
          template.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
      )
    }

    setFilteredTemplates(filtered)
  }

  const handleUseTemplate = async (template: TravelTemplate) => {
    try {
      const response = await fetch(`/api/templates/${template.id}`)
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("selectedTemplate", JSON.stringify(data.template))
      } else {
        // Fallback to local template data
        localStorage.setItem("selectedTemplate", JSON.stringify(template))
      }
    } catch (error) {
      console.error("Failed to fetch template details:", error)
      // Fallback to local template data
      localStorage.setItem("selectedTemplate", JSON.stringify(template))
    }

    router.push("/?template=" + template.id)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              攻略模板库
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">选择适合您的旅行模板，快速生成个性化攻略</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            攻略模板库
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">选择适合您的旅行模板，快速生成个性化攻略</p>
          {error && <p className="text-orange-600 text-sm mt-2">{error}</p>}
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索模板..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {templateCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category)}
                className="text-sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} onUse={handleUseTemplate} />
          ))}
        </div>

        {filteredTemplates.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到匹配的模板</h3>
            <p className="text-gray-600">尝试调整搜索条件或选择其他分类</p>
          </div>
        )}
      </div>
    </div>
  )
}
