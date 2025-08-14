'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, Navigation, ExternalLink, Calendar } from 'lucide-react';

// 导航地点接口
interface NavigationLocation {
  name: string;
  location: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'other';
}

// 每日导航计划接口
interface DailyNavigationPlan {
  day: number;
  title: string;
  locations: NavigationLocation[];
  navigationUrl: string;
}

interface RoutePlannerProps {
  itinerary: any[];
  destination: string;
  onRouteGenerated?: (routes: DailyNavigationPlan[]) => void;
}

export function RoutePlanner({ itinerary, destination, onRouteGenerated }: RoutePlannerProps) {
  const [dailyRoutes, setDailyRoutes] = useState<DailyNavigationPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [navigationMode, setNavigationMode] = useState<'car' | 'walk' | 'transit' | 'bike'>('car');
  const [navigationPreference, setNavigationPreference] = useState<'0' | '1' | '2'>('0');

  // 生成导航链接
  const generateNavigationLinks = () => {
    if (!itinerary || itinerary.length === 0) {
      setError('没有可用的行程数据');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 为每一天生成导航链接
      const dailyRoutes: DailyNavigationPlan[] = itinerary.map(dayPlan => {
        const locations: NavigationLocation[] = [];
        
        // 收集所有地点
        if (dayPlan.activities) {
          dayPlan.activities.forEach((activity: any) => {
            if (activity.location) {
              locations.push({
                name: activity.name || '活动',
                location: activity.location,
                type: 'attraction' as const
              });
            }
          });
        }

        if (dayPlan.meals) {
          dayPlan.meals.forEach((meal: any) => {
            if (meal.location) {
              locations.push({
                name: meal.name || `${meal.type}餐厅`,
                location: meal.location,
                type: 'restaurant' as const
              });
            }
          });
        }

        if (dayPlan.accommodation) {
          locations.push({
            name: dayPlan.accommodation,
            location: dayPlan.accommodation,
            type: 'hotel' as const
          });
        }

        return {
          day: dayPlan.day,
          title: dayPlan.title,
          locations,
          navigationUrl: generateAmapNavigationUrl(locations, destination)
        };
      });

      setDailyRoutes(dailyRoutes);
      setSelectedDay(1);
      
      // 回调通知父组件
      if (onRouteGenerated) {
        onRouteGenerated(dailyRoutes);
      }
    } catch (error) {
      console.error('生成导航链接失败:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 生成高德地图导航链接
  const generateAmapNavigationUrl = (locations: NavigationLocation[], city: string): string => {
    if (locations.length === 0) return '';
    
    // 使用更强大的 ditu.amap.com/dir 格式
    const baseUrl = 'https://ditu.amap.com/dir';
    const params = new URLSearchParams();
    
    // 设置起点（城市中心）
    params.append('from[name]', city);
    params.append('from[id]', 'citycenter');
    params.append('from[adcode]', ''); // 可以留空，让高德地图自动识别
    
    // 设置终点（最后一个地点）
    const lastLocation = locations[locations.length - 1];
    params.append('to[name]', lastLocation.location);
    params.append('to[id]', 'destination');
    
    // 设置途经点（如果有多个地点）
    if (locations.length > 2) {
      const waypoints = locations.slice(0, -1);
      waypoints.forEach((loc, index) => {
        params.append(`waypoint[${index}][name]`, loc.location);
        params.append(`waypoint[${index}][id]`, `waypoint_${index}`);
      });
    }
    
    // 设置导航模式
    params.append('type', navigationMode);
    
    // 设置策略
    params.append('policy', navigationPreference);
    
    // 设置坐标系（高德坐标系）
    params.append('coordinate', 'gaode');
    
    // 设置是否显示路况
    params.append('showTraffic', '1');
    
    // 设置是否显示POI
    params.append('showPOI', '1');
    
    // 设置是否显示建筑物
    params.append('showBuilding', '1');
    
    // 设置是否显示卫星图层
    params.append('showSatellite', '0');
    
    // 设置是否显示3D视图
    params.append('show3D', '1');
    
    // 设置缩放级别
    params.append('zoom', '13');
    
    // 设置是否自动开始导航
    params.append('autoStart', '1');
    
    // 设置是否显示导航面板
    params.append('showPanel', '1');
    
    // 设置导航语言（中文）
    params.append('lang', 'zh_cn');
    
    return `${baseUrl}?${params.toString()}`;
  };

  // 获取地点类型图标
  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'attraction':
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'restaurant':
        return <MapPin className="w-4 h-4 text-orange-500" />;
      case 'hotel':
        return <MapPin className="w-4 h-4 text-green-500" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-500" />;
    }
  };

  // 获取地点类型标签颜色
  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'attraction':
        return 'bg-blue-100 text-blue-800';
      case 'restaurant':
        return 'bg-orange-100 text-orange-800';
      case 'hotel':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 跳转到高德地图导航
  const openAmapNavigation = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* 标题和操作按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="w-6 h-6" />
            高德地图导航
          </h2>
          <p className="text-gray-600 mt-1">
            为您的{itinerary.length}天行程生成高德地图导航链接
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* 导航模式选择 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">导航模式:</span>
            <select
              value={navigationMode}
              onChange={(e) => setNavigationMode(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="car">🚗 驾车</option>
              <option value="walk">🚶 步行</option>
              <option value="transit">🚌 公交</option>
              <option value="bike">🚲 骑行</option>
            </select>
          </div>
          
          {/* 导航偏好选择 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">导航偏好:</span>
            <select
              value={navigationPreference}
              onChange={(e) => setNavigationPreference(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="0">⚡ 速度最快</option>
              <option value="1">💰 费用最低</option>
              <option value="2">📏 距离最短</option>
            </select>
          </div>
          
          <Button 
            onClick={generateNavigationLinks} 
            disabled={loading || itinerary.length === 0}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {loading ? '生成中...' : '生成导航'}
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 导航结果 */}
      {dailyRoutes.length > 0 && (
        <div className="space-y-6">
          {/* 总体摘要 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                行程导航总览
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {dailyRoutes.length}
                  </div>
                  <div className="text-sm text-gray-600">行程天数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dailyRoutes.reduce((total, route) => total + route.locations.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">总地点数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {dailyRoutes.filter(route => route.navigationUrl).length}
                  </div>
                  <div className="text-sm text-gray-600">可用导航</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    🗺️
                  </div>
                  <div className="text-sm text-gray-600">高德地图</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 每日导航详情 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                每日导航详情
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value))}>
                <TabsList className="grid w-full grid-cols-5">
                  {dailyRoutes.map((route) => (
                    <TabsTrigger key={route.day} value={route.day.toString()}>
                      第{route.day}天
                    </TabsTrigger>
                  ))}
                </TabsList>

                {dailyRoutes.map((route) => (
                  <TabsContent key={route.day} value={route.day.toString()} className="space-y-4">
                    {/* 当天导航摘要 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">{route.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {route.locations.length} 个地点
                        </div>
                        <Button
                          onClick={() => openAmapNavigation(route.navigationUrl)}
                          className="flex items-center gap-2"
                          disabled={!route.navigationUrl}
                        >
                          <ExternalLink className="w-4 h-4" />
                          打开高德地图导航
                        </Button>
                      </div>
                    </div>

                    {/* 地点列表 */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        途经地点 ({route.locations.length})
                      </h4>
                      <div className="space-y-2">
                        {route.locations.map((location, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                            {getLocationIcon(location.type)}
                            <div className="flex-1">
                              <div className="font-medium">{location.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className={getLocationTypeColor(location.type)}>
                                  {location.type === 'attraction' ? '景点' : 
                                   location.type === 'restaurant' ? '餐厅' : 
                                   location.type === 'hotel' ? '住宿' : '其他'}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  第{index + 1}站
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {location.location}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 导航说明 */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">导航说明</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• 点击"打开高德地图导航"按钮将跳转到高德地图网页版</li>
                        <li>• 系统会自动设置起点为{destination}，终点为最后一个地点</li>
                        <li>• 中间地点将作为途经点，优化行驶路线</li>
                        <li>• 支持驾车、步行、公交、骑行等多种导航模式</li>
                        <li>• 可选择速度最快、费用最低、距离最短等导航偏好</li>
                        <li>• 自动显示路况、POI、建筑物等信息</li>
                        <li>• 支持3D视图和自动开始导航</li>
                      </ul>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 空状态 */}
      {!loading && dailyRoutes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Navigation className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">暂无导航数据</h3>
            <p className="text-gray-500 mb-4">
              点击"生成导航"按钮，为您的行程生成高德地图导航链接
            </p>
            <Button onClick={generateNavigationLinks} disabled={itinerary.length === 0}>
              开始生成
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
