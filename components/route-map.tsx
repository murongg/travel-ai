'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Navigation, Route, Car, Bus, Train } from 'lucide-react';
import { DailyRoutePlan, RouteWaypoint } from '@/lib/services/amap-service-server';

interface RouteMapProps {
  dailyRoutes: DailyRoutePlan[];
  destination: string;
  height?: string;
}

declare global {
  interface Window {
    AMap: any;
  }
}

export function RouteMap({ dailyRoutes, destination, height = '500px' }: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [transportMode, setTransportMode] = useState<'driving' | 'walking' | 'transit'>('driving');

  // 加载高德地图
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.AMap) {
      const script = document.createElement('script');
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${process.env.NEXT_PUBLIC_AMAP_KEY}`;
      script.async = true;
      script.onload = () => {
        setMapLoaded(true);
        initializeMap();
      };
      document.head.appendChild(script);
    } else if (window.AMap) {
      setMapLoaded(true);
      initializeMap();
    }

    return () => {
      // 清理地图实例
      if (mapRef.current) {
        mapRef.current.destroy();
      }
    };
  }, []);

  // 初始化地图
  const initializeMap = () => {
    if (!mapContainerRef.current || !window.AMap) return;

    try {
      // 创建地图实例
      mapRef.current = new window.AMap.Map(mapContainerRef.current, {
        zoom: 12,
        center: [116.397428, 39.90923], // 默认北京
        mapStyle: 'amap://styles/normal',
        features: ['bg', 'road', 'building'],
        viewMode: '3D'
      });

      // 添加地图控件
      mapRef.current.addControl(new window.AMap.ToolBar());
      mapRef.current.addControl(new window.AMap.Scale());

      // 设置地图中心到目的地
      if (dailyRoutes.length > 0) {
        centerMapOnDestination();
      }
    } catch (error) {
      console.error('地图初始化失败:', error);
    }
  };

  // 将地图中心设置到目的地
  const centerMapOnDestination = () => {
    if (!mapRef.current || dailyRoutes.length === 0) return;

    try {
      // 获取第一个有效的地点坐标
      const firstRoute = dailyRoutes[0];
      if (firstRoute.waypoints.length > 0) {
        const firstWaypoint = firstRoute.waypoints[0];
        if (firstWaypoint.location) {
          const [lng, lat] = firstWaypoint.location.split(',').map(Number);
          mapRef.current.setCenter([lng, lat]);
          mapRef.current.setZoom(13);
        }
      }
    } catch (error) {
      console.error('设置地图中心失败:', error);
    }
  };

  // 清除地图上的标记和路径
  const clearMap = () => {
    if (mapRef.current) {
      // 清除标记
      markersRef.current.forEach(marker => {
        mapRef.current.remove(marker);
      });
      markersRef.current = [];

      // 清除路径线
      polylinesRef.current.forEach(polyline => {
        mapRef.current.remove(polyline);
      });
      polylinesRef.current = [];
    }
  };

  // 在地图上绘制路径
  const drawRoute = (route: DailyRoutePlan) => {
    if (!mapRef.current) return;

    clearMap();

    try {
      const waypoints = route.waypoints;
      if (waypoints.length < 2) return;

      // 添加标记点
      waypoints.forEach((waypoint, index) => {
        if (waypoint.location) {
          const [lng, lat] = waypoint.location.split(',').map(Number);
          
          // 创建标记
          const marker = new window.AMap.Marker({
            position: [lng, lat],
            title: waypoint.name,
            icon: createMarkerIcon(waypoint.type, index + 1),
            offset: new window.AMap.Pixel(-10, -20)
          });

          // 添加信息窗体
          const infoWindow = new window.AMap.InfoWindow({
            content: createInfoWindowContent(waypoint, index + 1),
            offset: new window.AMap.Pixel(0, -30)
          });

          marker.on('click', () => {
            infoWindow.open(mapRef.current, marker.getPosition());
          });

          mapRef.current.add(marker);
          markersRef.current.push(marker);
        }
      });

      // 绘制路径线
      if (route.route && route.route.steps.length > 0) {
        const path: [number, number][] = [];
        
        // 从路径步骤中提取坐标点
        route.route.steps.forEach(step => {
          if (step.polyline) {
            const coordinates = step.polyline.split(';');
            coordinates.forEach(coord => {
              const [lng, lat] = coord.split(',').map(Number);
              path.push([lng, lat]);
            });
          }
        });

        if (path.length > 0) {
          const polyline = new window.AMap.Polyline({
            path: path,
            strokeColor: '#3366FF',
            strokeWeight: 6,
            strokeOpacity: 0.8,
            strokeStyle: 'solid'
          });

          mapRef.current.add(polyline);
          polylinesRef.current.push(polyline);

          // 调整地图视野以包含所有标记和路径
          const bounds = new window.AMap.Bounds();
          path.forEach(coord => bounds.extend(coord));
          waypoints.forEach(waypoint => {
            if (waypoint.location) {
              const [lng, lat] = waypoint.location.split(',').map(Number);
              bounds.extend([lng, lat]);
            }
          });
          
          mapRef.current.setBounds(bounds, {
            padding: [50, 50, 50, 50]
          });
        }
      }
    } catch (error) {
      console.error('绘制路径失败:', error);
    }
  };

  // 创建标记图标
  const createMarkerIcon = (type: string, order: number) => {
    const colors = {
      attraction: '#3B82F6',
      restaurant: '#F59E0B',
      hotel: '#10B981',
      other: '#6B7280'
    };

    const color = colors[type as keyof typeof colors] || colors.other;
    
    return new window.AMap.Icon({
      size: new window.AMap.Size(32, 32),
      image: createSVGIcon(color, order),
      imageSize: new window.AMap.Size(32, 32)
    });
  };

  // 创建SVG图标
  const createSVGIcon = (color: string, order: number) => {
    const svg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${order}</text>
      </svg>
    `;
    
    return 'data:image/svg+xml;base64,' + btoa(svg);
  };

  // 创建信息窗体内容
  const createInfoWindowContent = (waypoint: RouteWaypoint, order: number) => {
    const typeLabels = {
      attraction: '景点',
      restaurant: '餐厅',
      hotel: '住宿',
      other: '地点'
    };

    return `
      <div style="padding: 10px; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #1F2937;">${waypoint.name}</h4>
        <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 12px;">
          类型: ${typeLabels[waypoint.type as keyof typeof typeLabels]}
        </p>
        <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 12px;">
          顺序: 第${order}站
        </p>
        ${waypoint.estimatedDuration > 0 ? 
          `<p style="margin: 0; color: #6B7280; font-size: 12px;">
            预计停留: ${waypoint.estimatedDuration}分钟
          </p>` : ''
        }
      </div>
    `;
  };

  // 切换交通方式
  const handleTransportModeChange = (mode: 'driving' | 'walking' | 'transit') => {
    setTransportMode(mode);
    // 这里可以根据交通方式重新计算路径
    // 目前只是UI切换，实际路径重新计算需要调用API
  };

  // 当选择的日期改变时重新绘制路径
  useEffect(() => {
    if (mapLoaded && dailyRoutes.length > 0) {
      const selectedRoute = dailyRoutes.find(route => route.day === selectedDay);
      if (selectedRoute) {
        drawRoute(selectedRoute);
      }
    }
  }, [selectedDay, mapLoaded, dailyRoutes]);

  // 当路径数据改变时重新绘制
  useEffect(() => {
    if (mapLoaded && dailyRoutes.length > 0) {
      const selectedRoute = dailyRoutes.find(route => route.day === selectedDay);
      if (selectedRoute) {
        drawRoute(selectedRoute);
      }
    }
  }, [dailyRoutes, mapLoaded]);

  if (!mapLoaded) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>正在加载地图...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          路径地图
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant={transportMode === 'driving' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTransportModeChange('driving')}
            className="flex items-center gap-1"
          >
            <Car className="w-4 h-4" />
            驾车
          </Button>
          <Button
            variant={transportMode === 'walking' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTransportModeChange('walking')}
            className="flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M13 17h-1v-4h-1m1-4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
            </svg>
            步行
          </Button>
          <Button
            variant={transportMode === 'transit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTransportModeChange('transit')}
            className="flex items-center gap-1"
          >
            <Bus className="w-4 h-4" />
            公交
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {dailyRoutes.length > 0 ? (
          <div className="space-y-4">
            {/* 日期选择器 */}
            <Tabs value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value))}>
              <TabsList className="grid w-full grid-cols-5">
                {dailyRoutes.map((route) => (
                  <TabsTrigger key={route.day} value={route.day.toString()}>
                    第{route.day}天
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* 地图容器 */}
            <div 
              ref={mapContainerRef} 
              style={{ 
                height, 
                width: '100%',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}
            />

            {/* 当前日期路径信息 */}
            {(() => {
              const selectedRoute = dailyRoutes.find(route => route.day === selectedDay);
              if (!selectedRoute) return null;

              return (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">{selectedRoute.title}</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">
                        {(selectedRoute.totalDistance / 1000).toFixed(1)}km
                      </div>
                      <div className="text-gray-600">总距离</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">
                        {Math.round(selectedRoute.totalDuration / 60)}分钟
                      </div>
                      <div className="text-gray-600">总时间</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-orange-600">
                        ¥{selectedRoute.totalCost.toFixed(2)}
                      </div>
                      <div className="text-gray-600">总费用</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>暂无路径数据，请先生成路径规划</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
