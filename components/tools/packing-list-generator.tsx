"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, Download } from "lucide-react"
import type { PackingList, PackingItem } from "@/lib/tools"
import { toolsService } from "@/lib/tools"

export function PackingListGenerator() {
  const [destination, setDestination] = useState("")
  const [season, setSeason] = useState("")
  const [duration, setDuration] = useState("")
  const [tripType, setTripType] = useState("")
  const [packingList, setPackingList] = useState<PackingList | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!destination || !season || !duration || !tripType) return

    setIsLoading(true)
    try {
      const list = await toolsService.generatePackingList(destination, season, Number.parseInt(duration), tripType)
      setPackingList(list)
    } catch (error) {
      console.error("Failed to generate packing list:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleItemPacked = (itemId: string) => {
    if (!packingList) return

    const updatedItems = packingList.items.map((item) =>
      item.id === itemId ? { ...item, packed: !item.packed } : item,
    )
    setPackingList({ ...packingList, items: updatedItems })
  }

  const getPackedCount = () => {
    if (!packingList) return { packed: 0, total: 0 }
    const packed = packingList.items.filter((item) => item.packed).length
    const total = packingList.items.length
    return { packed, total }
  }

  const groupedItems = packingList?.items.reduce(
    (groups, item) => {
      const category = item.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
      return groups
    },
    {} as Record<string, PackingItem[]>,
  )

  const categoryNames: Record<string, string> = {
    clothing: "服装",
    toiletries: "洗漱用品",
    electronics: "电子设备",
    documents: "证件文件",
    other: "其他物品",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          打包清单生成器
        </CardTitle>
        <CardDescription>根据目的地和旅行类型生成个性化打包清单</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="destination">目的地</Label>
            <Input
              id="destination"
              placeholder="例如：东京"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="season">季节</Label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger>
                <SelectValue placeholder="选择季节" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="春季">春季</SelectItem>
                <SelectItem value="夏季">夏季</SelectItem>
                <SelectItem value="秋季">秋季</SelectItem>
                <SelectItem value="冬季">冬季</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">旅行天数</Label>
            <Input
              id="duration"
              type="number"
              placeholder="例如：7"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tripType">旅行类型</Label>
            <Select value={tripType} onValueChange={setTripType}>
              <SelectTrigger>
                <SelectValue placeholder="选择旅行类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="热带海滩">热带海滩</SelectItem>
                <SelectItem value="城市观光">城市观光</SelectItem>
                <SelectItem value="山地徒步">山地徒步</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isLoading || !destination || !season || !duration || !tripType}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            "生成打包清单"
          )}
        </Button>

        {packingList && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {packingList.destination} - {packingList.tripType}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {getPackedCount().packed}/{getPackedCount().total} 已打包
                </Badge>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {groupedItems &&
                Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium text-sm text-foreground uppercase tracking-wide">
                      {categoryNames[category] || category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center space-x-2 p-2 rounded border ${
                            item.packed ? "bg-secondary" : "bg-card"
                          }`}
                        >
                          <Checkbox
                            id={item.id}
                            checked={item.packed}
                            onCheckedChange={() => toggleItemPacked(item.id)}
                          />
                          <label
                            htmlFor={item.id}
                            className={`flex-1 text-sm cursor-pointer ${
                              item.packed ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {item.name}
                            {item.essential && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                必需
                              </Badge>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
