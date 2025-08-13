"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, Trash2, Wifi, WifiOff, HardDrive } from "lucide-react"
import type { OfflineGuide } from "@/lib/offline"
import { offlineService } from "@/lib/offline"

export function OfflineManager() {
  const [offlineGuides, setOfflineGuides] = useState<OfflineGuide[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [totalSize, setTotalSize] = useState(0)

  useEffect(() => {
    loadOfflineGuides()
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const loadOfflineGuides = async () => {
    try {
      const guides = await offlineService.getOfflineGuides()
      const size = await offlineService.getTotalOfflineSize()
      setOfflineGuides(guides)
      setTotalSize(size)
    } catch (error) {
      console.error("Failed to load offline guides:", error)
    }
  }

  const handleDeleteGuide = async (guideId: string) => {
    try {
      await offlineService.deleteOfflineGuide(guideId)
      await loadOfflineGuides()
    } catch (error) {
      console.error("Failed to delete offline guide:", error)
    }
  }

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="w-5 h-5" />
          离线管理
          <Badge variant={isOnline ? "default" : "secondary"} className="ml-2">
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                在线
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                离线
              </>
            )}
          </Badge>
        </CardTitle>
        <CardDescription>管理已下载的攻略，离线时也能查看</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Storage Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">存储使用情况</span>
            <span className="text-sm text-gray-600">{formatSize(totalSize)}</span>
          </div>
          <Progress value={Math.min((totalSize / (10 * 1024 * 1024)) * 100, 100)} className="h-2" />
          <div className="text-xs text-gray-500 mt-1">已使用 {formatSize(totalSize)} / 10 MB</div>
        </div>

        {/* Offline Status */}
        {!isOnline && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800">
              <WifiOff className="w-4 h-4" />
              <span className="font-medium">离线模式</span>
            </div>
            <p className="text-sm text-orange-700 mt-1">您当前处于离线状态，只能查看已下载的攻略</p>
          </div>
        )}

        {/* Offline Guides List */}
        <div className="space-y-4">
          <h3 className="font-semibold">已下载的攻略 ({offlineGuides.length})</h3>

          {offlineGuides.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>还没有下载任何攻略</p>
              <p className="text-sm">在攻略页面点击下载按钮即可离线保存</p>
            </div>
          ) : (
            <div className="space-y-3">
              {offlineGuides.map((guide) => (
                <div key={guide.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{guide.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span>下载时间: {formatDate(guide.downloadedAt)}</span>
                      <span>大小: {formatSize(guide.size)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      查看
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteGuide(guide.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">离线使用提示</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 在有网络时下载攻略，离线时也能查看完整内容</li>
            <li>• 定期清理不需要的离线攻略以节省存储空间</li>
            <li>• 离线模式下无法生成新攻略或同步最新数据</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
