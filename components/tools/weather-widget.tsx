"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, Sun, CloudRain, Loader2, Droplets, Wind, Eye } from "lucide-react"
import type { WeatherInfo } from "@/lib/tools"
import { toolsService } from "@/lib/tools"

export function WeatherWidget() {
  const [location, setLocation] = useState("")
  const [weather, setWeather] = useState<WeatherInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGetWeather = async () => {
    if (!location.trim()) return

    setIsLoading(true)
    try {
      const weatherData = await toolsService.getWeatherInfo(location)
      setWeather(weatherData)
    } catch (error) {
      console.error("Failed to get weather:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "晴天":
        return <Sun className="w-6 h-6 text-yellow-500" />
      case "多云":
        return <Cloud className="w-6 h-6 text-muted-foreground" />
      case "小雨":
      case "雨天":
        return <CloudRain className="w-6 h-6 text-blue-500" />
      default:
        return <Cloud className="w-6 h-6 text-muted-foreground" />
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "short",
      day: "numeric",
      weekday: "short",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="w-5 h-5" />
          天气预报
        </CardTitle>
        <CardDescription>查看目的地天气情况，合理安排行程</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            placeholder="输入城市名称，例如：东京"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleGetWeather()}
            className="flex-1"
          />
          <Button onClick={handleGetWeather} disabled={isLoading || !location.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "查询"}
          </Button>
        </div>

        {weather && (
          <div className="space-y-6">
            {/* Current Weather */}
            <div className="text-center p-6 bg-secondary rounded-lg">
              <h3 className="text-xl font-semibold mb-2">{weather.location}</h3>
              <div className="flex items-center justify-center gap-4 mb-4">
                {getWeatherIcon(weather.current.condition)}
                <div className="text-4xl font-bold">{weather.current.temperature}°C</div>
              </div>
              <div className="text-lg text-muted-foreground mb-4">{weather.current.condition}</div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center gap-1">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>{weather.current.humidity}%</span>
                </div>
                  <div className="flex items-center justify-center gap-1">
                    <Wind className="w-4 h-4 text-muted-foreground" />
                  <span>{weather.current.windSpeed}km/h</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4 text-green-500" />
                  <span>良好</span>
                </div>
              </div>
            </div>

            {/* 7-Day Forecast */}
            <div className="space-y-3">
              <h4 className="font-semibold">7天预报</h4>
              <div className="grid grid-cols-1 gap-2">
                {weather.forecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium w-16">{index === 0 ? "今天" : formatDate(day.date)}</span>
                      {getWeatherIcon(day.condition)}
                      <span className="text-sm text-muted-foreground">{day.condition}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="font-medium">{day.high}°</span>
                        <span className="text-muted-foreground ml-1">{day.low}°</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {day.precipitation}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Tips */}
            <div className="p-4 bg-secondary border rounded-lg">
              <h4 className="font-semibold mb-2">出行建议</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {weather.current.temperature > 25 && <li>• 天气较热，建议穿着轻便透气的衣物，携带防晒用品</li>}
                {weather.current.temperature < 10 && <li>• 天气较冷，建议穿着保暖衣物，注意防寒</li>}
                {weather.forecast.some((day) => day.precipitation > 60) && <li>• 未来几天可能有降雨，建议携带雨具</li>}
                {weather.current.windSpeed > 15 && <li>• 风力较大，户外活动请注意安全</li>}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
