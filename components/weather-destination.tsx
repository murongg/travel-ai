"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, Sun, CloudRain, Loader2, Droplets, Wind, Eye, MapPin } from "lucide-react"
import type { WeatherInfo } from "@/lib/tools"
import { toolsService } from "@/lib/tools"

interface WeatherDestinationProps {
  destination: string
  itinerary?: any[] // 行程信息，用于提取天数
  weatherInfo?: any // 从数据库读取的天气信息
}

export function WeatherDestination({ destination, itinerary, weatherInfo }: WeatherDestinationProps) {
  const [weather, setWeather] = useState<WeatherInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('weather_info', weatherInfo)
    if (weatherInfo && Object.keys(weatherInfo).length > 0) {
      // 如果已经有天气信息，直接使用
      setWeather(weatherInfo)
      setIsLoading(false)
    } else if (destination) {
      // 如果没有天气信息，则获取
      fetchWeather()
    }
  }, [destination, weatherInfo])

  const fetchWeather = async () => {
    if (!destination.trim()) return

    setIsLoading(true)
    setError(null)
    
    try {
      // 计算行程天数
      let duration = 1;
      if (itinerary && Array.isArray(itinerary) && itinerary.length > 0) {
        duration = itinerary.length;
      }
      
      // 获取天气信息，传递行程天数
      const weatherData = await toolsService.getWeatherInfo(destination, undefined, duration)
      setWeather(weatherData)
    } catch (error) {
      console.error("Failed to get weather:", error)
      setError("获取天气信息失败")
    } finally {
      setIsLoading(false)
    }
  }

  const getWeatherIcon = (condition: string) => {
    if (!condition) return <Cloud className="w-6 h-6 text-muted-foreground" />
    
    if (condition.includes('晴')) {
      return <Sun className="w-6 h-6 text-yellow-500" />
    } else if (condition.includes('多云') || condition.includes('阴')) {
      return <Cloud className="w-6 h-6 text-muted-foreground" />
    } else if (condition.includes('雨') || condition.includes('阵雨')) {
      return <CloudRain className="w-6 h-6 text-blue-500" />
    } else if (condition.includes('雪')) {
      return <CloudRain className="w-6 h-6 text-blue-300" />
    } else if (condition.includes('雾') || condition.includes('霾')) {
      return <Cloud className="w-6 h-6 text-gray-400" />
    } else {
      return <Cloud className="w-6 h-6 text-muted-foreground" />
    }
  }

  if (isLoading) {
    return (
      <Card className="animate-in slide-in-from-right-4 duration-700 delay-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-blue-600" />
            {destination}天气
          </CardTitle>
          <CardDescription>正在获取天气信息...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="animate-in slide-in-from-right-4 duration-700 delay-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-blue-600" />
            {destination}天气
          </CardTitle>
          <CardDescription>天气信息获取失败</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <button
            onClick={fetchWeather}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            重试
          </button>
        </CardContent>
      </Card>
    )
  }

  if (!weather) {
    return null
  }

  return (
    <Card className="animate-in slide-in-from-right-4 duration-700 delay-100 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-blue-600" />
          {destination}天气
        </CardTitle>
        <CardDescription>实时天气信息</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
          <div className="flex items-center justify-center gap-3 mb-3">
            {getWeatherIcon(weather.current.condition)}
            <div className="text-3xl font-bold text-blue-600">{weather.current.temperature}°C</div>
          </div>
          <div className="text-lg font-medium text-gray-700 mb-3">{weather.current.condition}</div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex flex-col items-center gap-1">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-600">湿度</span>
              <span className="font-medium">{weather.current.humidity}%</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Wind className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-600">风力</span>
              <span className="font-medium">{weather.current.windSpeed}级</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Eye className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-600">风向</span>
              <span className="font-medium">{weather.current.windDirection}</span>
            </div>
          </div>
          
          {weather.current.reportTime && (
            <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
              更新时间：{weather.current.reportTime}
            </div>
          )}
        </div>

        {/* 3-Day Forecast */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-700">3天预报</h4>
          <div className="space-y-2">
                            {weather.forecast.slice(0, 3).map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-12 text-gray-700">{day.readableDate}</span>
                      {getWeatherIcon(day.dayWeather)}
                      <div className="text-xs text-gray-600">
                        <div>{day.dayWeather}</div>
                        <div>转{day.nightWeather}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">
                        {day.dayTemp}° ~ {day.nightTemp}°
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {day.week}
                      </Badge>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Weather Advice */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-semibold text-sm text-amber-800 mb-2">💡 出行建议</h4>
          <div className="text-xs text-amber-700 leading-relaxed max-h-32 overflow-y-auto">
            {weather.advice}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
