"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Navigation, MapPin, Compass } from "lucide-react"

interface ARLocation {
  id: string
  name: string
  distance: number
  direction: number
  type: "attraction" | "restaurant" | "hotel" | "transport"
}

export function ARNavigation() {
  const [isARActive, setIsARActive] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [locations, setLocations] = useState<ARLocation[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    checkARSupport()
    getCurrentLocation()
  }, [])

  const checkARSupport = () => {
    const hasCamera = navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    const hasGeolocation = navigator.geolocation
    setIsSupported(hasCamera && hasGeolocation)
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          loadNearbyLocations(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          console.error("Failed to get location:", error)
        },
      )
    }
  }

  const loadNearbyLocations = (lat: number, lng: number) => {
    // Mock nearby locations
    const mockLocations: ARLocation[] = [
      {
        id: "1",
        name: "东京塔",
        distance: 0.5,
        direction: 45,
        type: "attraction",
      },
      {
        id: "2",
        name: "拉面店",
        distance: 0.2,
        direction: 120,
        type: "restaurant",
      },
      {
        id: "3",
        name: "地铁站",
        distance: 0.1,
        direction: 270,
        type: "transport",
      },
      {
        id: "4",
        name: "酒店",
        distance: 0.8,
        direction: 180,
        type: "hotel",
      },
    ]
    setLocations(mockLocations)
  }

  const startAR = async () => {
    if (!isSupported) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsARActive(true)
        startARRendering()
      }
    } catch (error) {
      console.error("Failed to start camera:", error)
      setIsSupported(false)
    }
  }

  const stopAR = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsARActive(false)
  }

  const startARRendering = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const render = () => {
      if (!isARActive) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Draw AR overlays
      locations.forEach((location) => {
        drawLocationOverlay(ctx, location, canvas.width, canvas.height)
      })

      requestAnimationFrame(render)
    }

    render()
  }

  const drawLocationOverlay = (ctx: CanvasRenderingContext2D, location: ARLocation, width: number, height: number) => {
    // Calculate position based on direction (simplified)
    const x = (location.direction / 360) * width
    const y = height * 0.3 + Math.sin(Date.now() * 0.001) * 20

    // Draw location marker
    ctx.fillStyle = getLocationColor(location.type)
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, 2 * Math.PI)
    ctx.fill()

    // Draw location info
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    ctx.fillRect(x - 60, y - 40, 120, 30)

    ctx.fillStyle = "white"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.fillText(location.name, x, y - 25)
    ctx.fillText(`${location.distance}km`, x, y - 12)
  }

  const getLocationColor = (type: string) => {
    switch (type) {
      case "attraction":
        return "#3B82F6"
      case "restaurant":
        return "#EF4444"
      case "hotel":
        return "#10B981"
      case "transport":
        return "#F59E0B"
      default:
        return "#6B7280"
    }
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "attraction":
        return <MapPin className="w-4 h-4" />
      case "restaurant":
        return <MapPin className="w-4 h-4" />
      case "hotel":
        return <MapPin className="w-4 h-4" />
      case "transport":
        return <Navigation className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            AR导航
          </CardTitle>
          <CardDescription>增强现实导航功能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>您的设备不支持AR导航功能</p>
            <p className="text-sm mt-1">需要摄像头和位置权限</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="w-5 h-5" />
          AR导航
          {isARActive && (
            <Badge variant="default" className="animate-pulse">
              AR活跃
            </Badge>
          )}
        </CardTitle>
        <CardDescription>通过摄像头查看周围景点和设施</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isARActive ? (
          <div className="space-y-4">
            <Button onClick={startAR} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              启动AR导航
            </Button>

            {locations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">附近地点</h4>
                {locations.map((location) => (
                  <div key={location.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      {getLocationIcon(location.type)}
                      <span className="text-sm font-medium">{location.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{location.distance}km</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video ref={videoRef} className="w-full h-64 object-cover rounded-lg" playsInline muted />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            </div>

            <div className="flex gap-2">
              <Button onClick={stopAR} variant="destructive" className="flex-1">
                停止AR
              </Button>
              <Button variant="outline" onClick={() => getCurrentLocation()}>
                <Navigation className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-3 bg-secondary rounded-lg text-sm text-muted-foreground">
              <p>💡 使用提示：</p>
              <ul className="mt-1 space-y-1">
                <li>• 将摄像头对准周围环境</li>
                <li>• 屏幕上会显示附近景点和设施</li>
                <li>• 点击标记获取更多信息</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
