"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, DollarSign, MapPin } from "lucide-react"
import type { TravelTemplate } from "@/lib/templates"

interface TemplateCardProps {
  template: TravelTemplate
  onUse: (template: TravelTemplate) => void
}

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-muted text-foreground"
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "简单"
      case "medium":
        return "中等"
      case "hard":
        return "困难"
      default:
        return "未知"
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-video overflow-hidden rounded-t-lg">
        <img
          src={template.image || "/placeholder.svg"}
          alt={template.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{template.title}</CardTitle>
            <CardDescription className="mt-1">{template.description}</CardDescription>
          </div>
          <Badge className={getDifficultyColor(template.difficulty)}>{getDifficultyText(template.difficulty)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{template.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>{template.budget}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{template.category}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">特色功能：</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {template.features.slice(0, 2).map((feature) => (
                <li key={feature} className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <Button onClick={() => onUse(template)} className="w-full mt-4">
            使用此模板
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
