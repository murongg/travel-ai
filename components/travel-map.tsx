import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Loader2 } from "lucide-react"
import { Map, Marker } from 'react-amap'
import { useEffect, useState } from 'react'
import { amapService, LocationResult } from '@/lib/services/amap-service'

interface MapLocation {
  name: string
  type: "attraction" | "restaurant" | "hotel"
  day: number
  description?: string
  coordinates?: [number, number] // [lng, lat]
}

interface TravelMapProps {
  locations: MapLocation[]
  destination: string
}

interface EnhancedMapLocation extends MapLocation {
  resolvedCoordinates?: [number, number];
  geocodingStatus?: 'pending' | 'success' | 'failed';
}

export function TravelMap({ locations, destination }: TravelMapProps) {
  const [enhancedLocations, setEnhancedLocations] = useState<EnhancedMapLocation[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([116.397428, 39.90923]);
  const [isGeocoding, setIsGeocoding] = useState(true);
  const getTypeColor = (type: string) => {
    switch (type) {
      case "attraction":
        return "bg-blue-100 text-blue-800"
      case "restaurant":
        return "bg-green-100 text-green-800"
      case "hotel":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    const iconClass = `w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm`;
    
    switch (type) {
      case "attraction":
        return (
          <div className={`${iconClass} bg-blue-500`}>
            景
          </div>
        )
      case "restaurant":
        return (
          <div className={`${iconClass} bg-red-500`}>
            餐
          </div>
        )
      case "hotel":
        return (
          <div className={`${iconClass} bg-green-500`}>
            住
          </div>
        )
      default:
        return (
          <div className={`${iconClass} bg-gray-500`}>
            📍
          </div>
        )
    }
  }

  // 地理编码处理
  useEffect(() => {
    const processLocations = async () => {
      if (!locations.length) {
        setIsGeocoding(false);
        return;
      }

      setIsGeocoding(true);
      
      try {
        // 1. 获取目的地中心坐标
        const cityCenter = await amapService.getCityCenter(destination);
        if (cityCenter) {
          setMapCenter(cityCenter);
        }

        // 2. 处理地点坐标
        const enhanced: EnhancedMapLocation[] = [];
        
        for (const location of locations) {
          const enhancedLocation: EnhancedMapLocation = {
            ...location,
            geocodingStatus: 'pending'
          };

          // 如果已有坐标，直接使用
          if (location.coordinates) {
            enhancedLocation.resolvedCoordinates = location.coordinates;
            enhancedLocation.geocodingStatus = 'success';
          } else {
            // 尝试地理编码获取坐标
            try {
              const result = await amapService.smartGeocode(location.name, destination);
              if (result) {
                enhancedLocation.resolvedCoordinates = result.coordinates;
                enhancedLocation.geocodingStatus = 'success';
              } else {
                enhancedLocation.geocodingStatus = 'failed';
              }
            } catch (error) {
              console.error(`地理编码失败: ${location.name}`, error);
              enhancedLocation.geocodingStatus = 'failed';
            }
          }

          enhanced.push(enhancedLocation);
        }

        setEnhancedLocations(enhanced);
      } catch (error) {
        console.error('地图处理失败:', error);
      } finally {
        setIsGeocoding(false);
      }
    };

    processLocations();
  }, [locations, destination]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-blue-600" />
          行程地图
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 高德地图 */}
        <div className="rounded-lg overflow-hidden mb-4 border border-gray-200" style={{ height: '320px' }}>
          {isGeocoding ? (
            <div className="bg-gray-100 h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p className="text-sm">正在解析地点坐标...</p>
              </div>
            </div>
          ) : (
            <Map
              amapkey={process.env.NEXT_PUBLIC_AMAP_KEY || 'your_amap_key_here'}
              version="2.0"
              center={mapCenter}
              zoom={12}
            >
              {enhancedLocations
                .filter(location => location.resolvedCoordinates)
                .map((location, index) => (
                  <Marker
                    key={index}
                    position={location.resolvedCoordinates!}
                    title={location.name}
                    render={() => (
                      <div className="relative">
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white ${
                            location.type === 'attraction' 
                              ? 'bg-blue-500' 
                              : location.type === 'restaurant' 
                              ? 'bg-red-500' 
                              : 'bg-green-500'
                          }`}
                        >
                          {location.type === 'attraction' 
                            ? '景' 
                            : location.type === 'restaurant' 
                            ? '餐' 
                            : '住'}
                        </div>
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-current" 
                             style={{ 
                               color: location.type === 'attraction' 
                                 ? '#3b82f6' 
                                 : location.type === 'restaurant' 
                                 ? '#ef4444' 
                                 : '#22c55e'
                             }}>
                        </div>
                      </div>
                    )}
                  />
                ))}
            </Map>
          )}
        </div>

        {/* Location list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm text-gray-700">重要地点</h4>
            <div className="text-xs text-gray-500">
              {enhancedLocations.filter(l => l.geocodingStatus === 'success').length}/{enhancedLocations.length} 已定位
            </div>
          </div>
          {enhancedLocations.map((location, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">{getTypeIcon(location.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{location.name}</span>
                    {location.geocodingStatus === 'pending' && (
                      <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                    )}
                    {location.geocodingStatus === 'success' && (
                      <MapPin className="h-3 w-3 text-green-500" />
                    )}
                    {location.geocodingStatus === 'failed' && (
                      <MapPin className="h-3 w-3 text-red-400" />
                    )}
                  </div>
                  {location.description && (
                    <p className="text-xs text-gray-600 mt-1">{location.description}</p>
                  )}
                  {location.resolvedCoordinates && (
                    <p className="text-xs text-gray-500 mt-1">
                      坐标: {location.resolvedCoordinates[0].toFixed(6)}, {location.resolvedCoordinates[1].toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  第{location.day}天
                </Badge>
                <Badge className={`text-xs ${getTypeColor(location.type)}`}>
                  {location.type === "attraction" ? "景点" : location.type === "restaurant" ? "餐厅" : "酒店"}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* 地图图例 */}
        {enhancedLocations.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-800 text-sm mb-3">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">图例</span>
            </div>
            <div className="flex items-center justify-around text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                  景
                </div>
                <span className="text-gray-600">景点</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs">
                  餐
                </div>
                <span className="text-gray-600">餐厅</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">
                  住
                </div>
                <span className="text-gray-600">酒店</span>
              </div>
            </div>
          </div>
        )}

        {/* 地理编码统计 */}
        {enhancedLocations.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800 text-sm mb-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">地图信息</span>
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              <div className="flex justify-between">
                <span>目的地中心:</span>
                <span>{destination}</span>
              </div>
              <div className="flex justify-between">
                <span>成功定位:</span>
                <span>{enhancedLocations.filter(l => l.geocodingStatus === 'success').length} 个地点</span>
              </div>
              <div className="flex justify-between">
                <span>定位失败:</span>
                <span>{enhancedLocations.filter(l => l.geocodingStatus === 'failed').length} 个地点</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
