'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Route, Info, Eye, EyeOff } from 'lucide-react';

interface LocationDetail {
  name: string;
  coordinate: string;
  address: any;
  index: number;
}

interface DailyRoute {
  day: number;
  title: string;
  locations: string[];
  coordinates: string[];
  locationDetails: LocationDetail[];
  waypoints: string[];
  totalDistance: string;
  totalDuration: string;
  recommendations: string[];
}

interface AmapTravelMapProps {
  dailyRoutes: DailyRoute[];
  destination: string;
}

declare global {
  interface Window {
    AMap: any;
  }
}

export default function AmapTravelMap({ dailyRoutes, destination }: AmapTravelMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationDetail | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // 每天的颜色配置
  const dayColors = ['#3366FF', '#FF6633', '#33CC66', '#9966FF', '#FF9933', '#66CCFF'];

  // 加载高德地图脚本
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${process.env.NEXT_PUBLIC_AMAP_KEY || 'your_amap_key'}`;
    script.async = true;
    script.charset = 'utf-8';
    script.onload = () => {
      setMapLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || dailyRoutes.length === 0) return;
    
    console.log('🗺️ 开始初始化地图...');
    console.log('📊 dailyRoutes 数据结构:', JSON.stringify(dailyRoutes, null, 2));
    
    try {
      // 创建地图实例 - 使用3D视图
      const map = new window.AMap.Map(mapRef.current, {
        zoom: 12,
        center: [120.151299, 30.258106], // 默认杭州中心
        viewMode: '3D',
        pitch: 30,
        mapStyle: 'amap://styles/normal'
      });

      mapInstanceRef.current = map;

      // 添加地图控件
      map.addControl(new window.AMap.Scale());
      map.addControl(new window.AMap.ToolBar());
      map.addControl(new window.AMap.MapType());
      map.addControl(new window.AMap.ControlBar());

      // 渲染路线
      renderRoutes(map);

      // 添加图例
      if (showLegend) {
        addLegend(map);

        // 调整地图视野以显示所有标记
        if (markersRef.current.length > 0) {
          map.setFitView(markersRef.current);
        }
      }

    } catch (error) {
      console.error('地图初始化失败:', error);
    }
  }, [mapLoaded, dailyRoutes, showLegend]);

  // 渲染路线
  const renderRoutes = (map: any) => {
    if (!map || dailyRoutes.length === 0) return;

    console.log('开始渲染路线，dailyRoutes:', dailyRoutes);

    // 清除之前的标记和路线
    clearMap();

    dailyRoutes.forEach((dayRoute, dayIndex) => {
      // 检查是否有有效的坐标信息
      const hasValidCoordinates = dayRoute.locationDetails && 
        dayRoute.locationDetails.some(location => location.coordinate && location.coordinate.trim() !== '');
      
      if (!hasValidCoordinates) {
        console.log(`第${dayRoute.day}天没有有效坐标信息，跳过渲染`);
        return;
      }

      // 为每个地点创建标记和路线
      addMarkersAndPath(map, dayRoute, dayColors[dayIndex % dayColors.length], dayIndex);
    });
  };

  // 添加标记和路线
  const addMarkersAndPath = (map: any, dayRoute: DailyRoute, color: string, dayIndex: number) => {
    const markers: any[] = [];
    const path: [number, number][] = [];

    console.log(`📍 处理第${dayRoute.day}天路线，地点数量: ${dayRoute.locationDetails?.length || 0}`);

    // 创建标记
    dayRoute.locationDetails?.forEach((location, locationIndex) => {
      console.log(`📍 处理地点 ${locationIndex + 1}: ${location.name}, 坐标: ${location.coordinate}`);
      
      if (!location.coordinate || location.coordinate.trim() === '') {
        console.warn(`⚠️ 地点 ${location.name} 没有坐标信息，跳过`);
        return;
      }

      const [lng, lat] = location.coordinate.split(',').map(Number);
      if (isNaN(lng) || isNaN(lat)) {
        console.warn(`⚠️ 地点 ${location.name} 坐标格式无效: ${location.coordinate}`);
        return;
      }

      console.log(`✅ 地点 ${location.name} 坐标有效: [${lng}, ${lat}]`);
      path.push([lng, lat]);

      // 创建标记
      const marker = new window.AMap.Marker({
        position: [lng, lat],
        title: location.name,
        map: map,
        anchor: 'bottom-center',
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(24, 24),
          image: `https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-${dayIndex + 1}.png`,
          imageSize: new window.AMap.Size(24, 24)
        })
      });

      // 信息窗体
      const infoWindow = new window.AMap.InfoWindow({
        content: `
          <div style="padding:10px;font-size:14px;color:${color}">
            <b>第${dayRoute.day}天: ${dayRoute.title}</b><br/>
            <b>${location.name}</b><br/>
            ${location.address?.city || ''} ${location.address?.district || ''}<br/>
            坐标: ${location.coordinate}
          </div>
        `,
        offset: new window.AMap.Pixel(0, -30),
        autoMove: true,
        closeWhenClickMap: true
      });

      // 添加点击事件
      marker.on('click', () => {
        setSelectedLocation(location);
        infoWindow.open(map, marker.getPosition());
      });

      markers.push(marker);
      markersRef.current.push(marker);
    });

    // 创建路线
    if (path.length > 1) {
      const polyline = new window.AMap.Polyline({
        path: path,
        isOutline: true,
        outlineColor: '#ffffff',
        borderWeight: 2,
        strokeColor: color,
        strokeWeight: 5,
        strokeStyle: 'solid',
        strokeOpacity: 0.9,
        zIndex: 50,
        map: map
      });

      polylinesRef.current.push(polyline);
      console.log(`✅ 第${dayRoute.day}天路线已绘制，颜色: ${color}, 路径点数: ${path.length}`);
    } else if (path.length === 1) {
      console.log(`📍 第${dayRoute.day}天只有一个地点，无需绘制路线`);
    } else {
      console.warn(`⚠️ 第${dayRoute.day}天没有有效坐标点`);
    }
  };

  // 添加图例
  const addLegend = (map: any) => {
    if (!mapRef.current) return;

    // 移除旧的图例
    const oldLegend = mapRef.current.querySelector('.map-legend');
    if (oldLegend) {
      oldLegend.remove();
    }

    // 创建新图例
    const legend = document.createElement('div');
    legend.className = 'map-legend';
    legend.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.9);
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      min-width: 200px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    let html = '<div style="font-weight:bold;margin-bottom:10px;color:#333;">🗺️ 行程路线</div>';

    dailyRoutes.forEach((dayRoute, i) => {
      const color = dayColors[i % dayColors.length];
      html += `
        <div style="margin:8px 0;display:flex;align-items:center;">
          <span style="display:inline-block;width:20px;height:4px;background:${color};margin-right:8px;border-radius:2px;"></span>
          <span style="font-size:13px;color:#555;">第${dayRoute.day}天: ${dayRoute.title}</span>
        </div>
      `;
    });

    legend.innerHTML = html;
    mapRef.current.appendChild(legend);
  };

  // 清除地图
  const clearMap = () => {
    if (mapInstanceRef.current) {
      markersRef.current.forEach(marker => {
        mapInstanceRef.current.remove(marker);
      });
      polylinesRef.current.forEach(polyline => {
        mapInstanceRef.current.remove(polyline);
      });
    }
    markersRef.current = [];
    polylinesRef.current = [];
  };

  // 跳转到高德地图导航
  const navigateToAmap = (location: LocationDetail) => {
    if (!location.coordinate) return;
    
    const [lng, lat] = location.coordinate.split(',');
    const url = `https://uri.amap.com/navigation?to=${lng},${lat},${location.name}&mode=car&policy=1&src=mypage&coordinate=gaode&callnative=0`;
    window.open(url, '_blank');
  };

  // 跳转到高德地图路线规划
  const planRouteInAmap = (dayRoute: DailyRoute) => {
    if (dayRoute.coordinates.length < 2) return;
    
    const coordinates = dayRoute.coordinates
      .filter(coord => coord)
      .map(coord => coord.split(',').join(','))
      .join(';');
    
    const url = `https://uri.amap.com/route?from=&to=&waypoints=${coordinates}&mode=car&policy=1&src=mypage&coordinate=gaode&callnative=0`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              3D行程地图
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowLegend(!showLegend)}
                className="flex items-center gap-2"
              >
                {showLegend ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {showLegend ? '隐藏图例' : '显示图例'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 地图容器 */}
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg border-2 border-gray-200 relative"
            style={{ minHeight: '500px' }}
          />
          
          {/* 地图加载提示 */}
          {!mapLoaded && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">正在加载3D地图...</p>
              </div>
            </div>
          )}

          {/* 地点信息 */}
          {selectedLocation && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-lg">{selectedLocation.name}</h4>
                  <p className="text-gray-600 text-sm">
                    {selectedLocation.address?.city} {selectedLocation.address?.district}
                  </p>
                  <p className="text-gray-500 text-xs">坐标: {selectedLocation.coordinate}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigateToAmap(selectedLocation)}
                  className="flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  导航
                </Button>
              </div>
            </div>
          )}

          {/* 每日路线信息 */}
          <div className="mt-4 space-y-3">
            {dailyRoutes.map((dayRoute, dayIndex) => (
              <div key={dayRoute.day} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      style={{ 
                        backgroundColor: dayColors[dayIndex % dayColors.length] + '20', 
                        color: dayColors[dayIndex % dayColors.length],
                        borderColor: dayColors[dayIndex % dayColors.length]
                      }}
                    >
                      第{dayRoute.day}天
                    </Badge>
                    <span className="font-medium">{dayRoute.title}</span>
                  </div>
                  {dayRoute.coordinates && dayRoute.coordinates.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => planRouteInAmap(dayRoute)}
                      className="flex items-center gap-2"
                    >
                      <Route className="h-4 w-4" />
                      路线规划
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {dayRoute.locationDetails && dayRoute.locationDetails.map((location, locationIndex) => (
                    <div
                      key={locationIndex}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => setSelectedLocation(location)}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: dayColors[dayIndex % dayColors.length] }}
                      />
                      <span className="text-sm">{location.name}</span>
                      {location.coordinate && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToAmap(location);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Navigation className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {dayRoute.recommendations && dayRoute.recommendations.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Info className="h-4 w-4" />
                      <span>建议:</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dayRoute.recommendations.map((rec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {rec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
