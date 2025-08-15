import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Loader2 } from "lucide-react"
import { useEffect, useState } from 'react'
import { amapService } from '@/lib/services/amap-service'
import dynamic from 'next/dynamic';
import { Activity, Meal } from "@/lib/mock-data"

// 动态导入地图组件以避免SSR问题
const Map = dynamic(() => import('@uiw/react-amap').then(mod => mod.Map), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">地图加载中...</div>
});
const Marker = dynamic(() => import('@uiw/react-amap').then(mod => mod.Marker), {
  ssr: false
});
const Polyline = dynamic(() => import('@uiw/react-amap').then(mod => mod.Polyline), {
  ssr: false
});
const APILoader = dynamic(() => import('@uiw/react-amap').then(mod => mod.APILoader), {
  ssr: false
});


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
  dailyLocations: Array<{ day: number; locations: (Activity | Meal)[] }>
}

interface EnhancedMapLocation extends MapLocation {
  resolvedCoordinates?: [number, number];
  geocodingStatus?: 'pending' | 'success' | 'failed';
}

export function TravelMap({ locations, destination, dailyLocations }: TravelMapProps) {
  const [enhancedLocations, setEnhancedLocations] = useState<EnhancedMapLocation[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([116.397428, 39.90923]);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [isGeocoding, setIsGeocoding] = useState(true);
  
  // 为每天分配不同的颜色
  const dayColors = [
    '#3366FF', // 蓝色 - 第1天
    '#FF6633', // 橙色 - 第2天
    '#33CC66', // 绿色 - 第3天
    '#9966FF', // 紫色 - 第4天
    '#FF6B6B', // 红色 - 第5天
    '#4ECDC4', // 青色 - 第6天
    '#45B7D1', // 蓝色 - 第7天
    '#96CEB4', // 绿色 - 第8天
    '#FFEAA7', // 黄色 - 第9天
    '#DDA0DD'  // 紫色 - 第10天
  ];

  // 生成每天的行程描述
  const generateDayDescription = (day: number, locations: Activity[]) => {
    if (!locations || locations.length === 0) {
      return `第${day}天: 待安排`;
    }
    
    const locationNames = locations.map(loc => loc.name).join('、');
    return `第${day}天: ${locationNames}`;
  };

  // 按天分组地点
  const getLocationsByDay = () => {
    const dayGroups: { [key: number]: MapLocation[] } = {};
    
    locations.forEach(location => {
      if (location.day && location.coordinates) {
        if (!dayGroups[location.day]) {
          dayGroups[location.day] = [];
        }
        dayGroups[location.day].push(location);
      }
    });
    
    return dayGroups;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "attraction":
        return "bg-blue-100 text-blue-800"
      case "restaurant":
        return "bg-green-100 text-green-800"
      case "hotel":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-muted text-foreground"
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

  const addLegend = (dailyLocations: Array<{ day: number; locations: Activity[] }>) => {
    dailyLocations.forEach(day => {
      day.locations.forEach(location => {
        console.log('location', location)
      })
    })
  }

  // 处理地点坐标（现在由AI接口直接提供）
  useEffect(() => {
    const processLocations = async () => {
      if (!locations.length) {
        setIsGeocoding(false);
        return;
      }

      setIsGeocoding(true);

      try {
        // 1. 计算地图中心点坐标
        let centerCoordinates = mapCenter;
        const locationsWithCoords = locations.filter(loc => loc.coordinates);

        // 直接获取目标城市的中心坐标作为地图中心
        const cityCenter = await amapService.getCityCenter(destination);
        if (cityCenter) {
          centerCoordinates = cityCenter;
          console.log('使用城市中心作为地图中心:', cityCenter);

          // 根据地点数量智能设置缩放级别
          let zoom = 12; // 默认缩放级别
          if (locationsWithCoords.length > 10) zoom = 10;      // 很多地点，缩小视野
          else if (locationsWithCoords.length > 5) zoom = 11;  // 较多地点
          else if (locationsWithCoords.length > 2) zoom = 12;  // 中等数量
          else zoom = 13;                                       // 少量地点，放大视野

          setMapZoom(zoom);

          console.log('地图中心设置完成:', {
            目标城市: destination,
            城市中心坐标: centerCoordinates,
            地点数量: locationsWithCoords.length,
            智能缩放级别: zoom
          });
        } else {
          console.warn(`无法获取城市中心坐标: ${destination}`);
        }

        // 更新地图中心点
        setMapCenter(centerCoordinates);

        // 2. 直接使用AI提供的坐标
        const enhanced: EnhancedMapLocation[] = locations.map(location => ({
          ...location,
          geocodingStatus: location.coordinates ? 'success' : 'failed' as const,
          resolvedCoordinates: location.coordinates
        }));

        setEnhancedLocations(enhanced);

        // 调试信息
        console.log('TravelMap处理结果:', {
          totalLocations: enhanced.length,
          locationsWithCoords: enhanced.filter(l => l.resolvedCoordinates).length,
          mapCenter: centerCoordinates,
          enhanced: enhanced
        });

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
          <Navigation className="h-5 w-5 text-primary" />
          行程地图
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 高德地图 */}
        <div className="rounded-lg overflow-hidden mb-4 border" style={{ height: '320px' }}>
          {isGeocoding ? (
            <div className="bg-muted h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p className="text-sm">正在解析地点坐标...</p>
              </div>
            </div>
          ) : (
            <div className="relative h-full">
              <APILoader akey={process.env.NEXT_PUBLIC_AMAP_KEY || 'placeholder_key_for_react_amap'}>
                <Map style={{ height: '100%' }}
                  center={mapCenter as any}
                  zoom={mapZoom}
                >
                  {/* 渲染每天的路线 */}
                  {Object.entries(getLocationsByDay()).map(([dayStr, dayLocations], dayIndex) => {
                    const day = parseInt(dayStr);
                    const dayColor = dayColors[dayIndex % dayColors.length];
                    const path = dayLocations.map(loc => loc.coordinates!);
                    
                    return (
                      <div key={`day-${day}`}>
                        {/* 绘制路线 */}
                        {path.length > 1 && (
                          <Polyline
                            path={path as any}
                            strokeColor={dayColor}
                            strokeWeight={5}
                            strokeStyle="solid"
                            strokeOpacity={0.9}
                            zIndex={50}
                          />
                        )}
                        
                        {/* 渲染当天的标记点 */}
                        {dayLocations.map((location, index) => (
                          <Marker
                            key={`day-${day}-marker-${index}`}
                            position={location.coordinates as any}
                          >
                            <div className="relative">
                              {getTypeIcon(location.type)}
                              {/* 添加天数标识 */}
                              <div 
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs font-bold flex items-center justify-center"
                                style={{ backgroundColor: dayColor }}
                              >
                                {day}
                              </div>
                            </div>
                          </Marker>
                        ))}
                      </div>
                    );
                  })}
                  
                  {/* 原有的标记点渲染（兼容性） */}
                  {enhancedLocations
                    .filter(location => location.resolvedCoordinates && !location.day)
                    .map((location, index) => {
                      console.log(`渲染Marker ${index}:`, location.name, location.resolvedCoordinates);

                      // 确保坐标格式正确
                      if (!location.resolvedCoordinates || !Array.isArray(location.resolvedCoordinates) || location.resolvedCoordinates.length !== 2) {
                        console.warn(`无效的坐标数据 ${index}:`, location.resolvedCoordinates);
                        return null;
                      }

                      const position: [number, number] = [location.resolvedCoordinates[0], location.resolvedCoordinates[1]];
                      console.log(`Marker位置 ${index}:`, position);

                      return (
                        <Marker
                          key={`marker-${index}`}
                          position={position as any}
                        >
                          {getTypeIcon(location.type)}
                        </Marker>
                      );
                    })}
                </Map>
              </APILoader>



              {/* API密钥提示 */}
              {(!process.env.NEXT_PUBLIC_AMAP_KEY || process.env.NEXT_PUBLIC_AMAP_KEY === 'placeholder_key_for_react_amap') && (
                <div className="absolute top-2 left-2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-xs">
                  ⚠️ 需要配置真实的高德地图API密钥才能显示地图和标记
                </div>
              )}
            </div>
          )}
        </div>



        {/* Location list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm text-foreground">重要地点</h4>
            <div className="text-xs text-muted-foreground">
              {enhancedLocations.filter(l => l.resolvedCoordinates).length}/{enhancedLocations.length} 已定位
            </div>
          </div>
          {enhancedLocations.map((location, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">{getTypeIcon(location.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{location.name}</span>
                    {location.resolvedCoordinates ? (
                      <MapPin className="h-3 w-3 text-green-500" />
                    ) : (
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  {location.description && (
                    <p className="text-xs text-muted-foreground mt-1">{location.description}</p>
                  )}
                  {location.resolvedCoordinates && (
                    <p className="text-xs text-muted-foreground mt-1">
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
          <div className="mt-4 p-3 bg-muted rounded-lg border">
            <div className="flex items-center gap-2 text-foreground text-sm mb-3">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">图例</span>
            </div>
            <div className="space-y-3">
              {/* 地点类型图例 */}
              <div className="flex items-center justify-around text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                    景
                  </div>
                  <span className="text-muted-foreground">景点</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs">
                    餐
                  </div>
                  <span className="text-muted-foreground">餐厅</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">
                    住
                  </div>
                  <span className="text-muted-foreground">酒店</span>
                </div>
              </div>
              
              {/* 路线颜色图例 */}
              {Object.keys(getLocationsByDay()).length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-muted-foreground mb-2 text-center">路线颜色</div>
                  <div className="flex items-center justify-around">
                    {Object.keys(getLocationsByDay()).slice(0, 4).map((dayStr, index) => {
                      const day = parseInt(dayStr);
                      const dayColor = dayColors[index % dayColors.length];
                      return (
                        <div key={day} className="flex items-center gap-1">
                          <div 
                            className="w-3 h-2 rounded-full"
                            style={{ backgroundColor: dayColor }}
                          />
                          <span className="text-xs text-muted-foreground">第{day}天</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        

        {/* 地图统计 */}
        {enhancedLocations.length > 0 && (
          <div className="mt-3 p-3 bg-secondary rounded-lg border">
            <div className="flex items-center gap-2 text-foreground text-sm mb-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">地图信息</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>目的地:</span>
                <span>{destination}</span>
              </div>
              <div className="flex justify-between">
                <span>已定位地点:</span>
                <span>{enhancedLocations.filter(l => l.resolvedCoordinates).length} 个</span>
              </div>
              <div className="flex justify-between">
                <span>总地点数:</span>
                <span>{enhancedLocations.length} 个</span>
              </div>
              <div className="flex justify-between">
                <span>城市中心:</span>
                <span>{mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>缩放级别:</span>
                <span>{mapZoom}</span>
              </div>
              <div className="flex justify-between">
                <span>中心来源:</span>
                <span>高德地图城市API</span>
              </div>
              <div className="flex justify-between">
                <span>数据来源:</span>
                <span>AI智能生成</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
