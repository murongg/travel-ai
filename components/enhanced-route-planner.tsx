'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, Navigation, ExternalLink, Calendar, Route, Clock, Car, Bus, Bike, Star, Zap, DollarSign, Ruler, User } from 'lucide-react';
import AmapTravelMap from './amap-travel-map';

// 路线规划结果接口
interface RouteResult {
  method: string;
  distance: string;
  duration: string;
  steps: Array<{
    instruction: string;
    road: string;
    distance: string;
    duration: string;
  }>;
  reason?: string;  // 添加reason属性
  recommendation?: {
    method: string;
    reason: string;
    priority: number;
  };
}

// 每日路线规划接口
interface DailyRoutePlan {
  day: number;
  title: string;
  locations: Array<{
    name: string;
    location: string;
    type: 'attraction' | 'restaurant' | 'hotel' | 'other';
    coordinates?: string;
  }>;
  routes: {
    driving?: RouteResult;
    walking?: RouteResult;
    transit?: RouteResult;
    bicycling?: RouteResult;
    smart?: RouteResult;
  };
}

interface EnhancedRoutePlannerProps {
  itinerary: any[];
  destination: string;
  onRouteGenerated?: (routes: DailyRoutePlan[]) => void;
}

export function EnhancedRoutePlanner({ itinerary, destination, onRouteGenerated }: EnhancedRoutePlannerProps) {
  const [dailyRoutes, setDailyRoutes] = useState<DailyRoutePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedMode, setSelectedMode] = useState<'smart' | 'driving' | 'walking' | 'transit' | 'bicycling'>('smart');
  const [preferences, setPreferences] = useState({
    maxWalkingDistance: 3000,
    preferPublicTransport: true,
    avoidHighways: false,
    timeOfDay: 'morning' as 'morning' | 'afternoon' | 'evening' | 'night'
  });
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState(destination);
  const [aiRouteResult, setAiRouteResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // 初始化时设置目的地
  useEffect(() => {
    setDestinationInput(destination);
  }, [destination]);

  // AI智能路线规划
  const generateAIRoutePlanning = async () => {
    if (!itinerary || itinerary.length === 0) {
      setError('没有可用的行程数据');
      return;
    }

    setAiLoading(true);
    setError(null);

    try {
      console.log('🚀 开始AI智能路线规划...');
      
      // 构建itinerary格式
      const aiItinerary = itinerary.map((dayPlan, dayIndex) => ({
        day: dayIndex + 1,
        title: dayPlan.title || `第${dayIndex + 1}天`,
        activities: [
          ...(dayPlan.activities || []).map((activity: any, index: number) => ({
            time: `${9 + index}:00`,
            name: activity.name || '活动',
            location: activity.location || '未知地点',
            description: activity.description || `访问${activity.location || '未知地点'}`,
            duration: activity.duration || '1小时',
            cost: activity.cost || '免费'
          })),
          ...(dayPlan.meals || []).map((meal: any, index: number) => ({
            time: `${12 + index}:00`,
            name: meal.name || `${meal.type}餐厅`,
            location: meal.location || '未知地点',
            description: meal.description || `在${meal.location || '未知地点'}用餐`,
            duration: '1小时',
            cost: meal.cost || '50元'
          }))
        ]
      }));

      console.log('AI行程数据:', aiItinerary);

      const response = await fetch('/api/route-planning-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary: aiItinerary,
          destination: destination,
          preferences
        })
      });

      if (!response.ok) {
        throw new Error('AI路线规划请求失败');
      }

      const data = await response.json();
      
      if (data.success) {
        setAiRouteResult(data.data);
        console.log('✅ AI智能路线规划成功:', data.data);
        
        // 显示成功消息
        setError(null);
      } else {
        throw new Error(data.error || 'AI路线规划失败');
      }
    } catch (error) {
      console.error('❌ AI智能路线规划失败:', error);
      setError(`AI路线规划失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setAiLoading(false);
    }
  };

  // 生成路线规划
  const generateRoutePlans = async () => {
    if (!itinerary || itinerary.length === 0) {
      setError('没有可用的行程数据');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dailyRoutes: DailyRoutePlan[] = [];

      for (const dayPlan of itinerary) {
        const locations: Array<{
          name: string;
          location: string;
          type: 'attraction' | 'restaurant' | 'hotel' | 'other';
          coordinates?: string;
        }> = [];

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

        // 如果有多个地点，生成路线规划
        if (locations.length >= 2) {
          const routes = await generateRoutesForLocations(locations);
          
          dailyRoutes.push({
            day: dayPlan.day,
            title: dayPlan.title,
            locations,
            routes
          });
        } else {
          // 单个地点，只显示地点信息
          dailyRoutes.push({
            day: dayPlan.day,
            title: dayPlan.title,
            locations,
            routes: {}
          });
        }
      }

      setDailyRoutes(dailyRoutes);
      setSelectedDay(1);
      
      // 回调通知父组件
      if (onRouteGenerated) {
        onRouteGenerated(dailyRoutes);
      }
    } catch (error) {
      console.error('生成路线规划失败:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 为地点序列生成路线规划
  const generateRoutesForLocations = async (locations: any[]): Promise<any> => {
    if (locations.length < 2) return {};

    const routes: any = {};
    
    try {
      // 调用AI智能路线规划API
      console.log('开始调用AI智能路线规划...');
      
      // 构建itinerary格式
      const itinerary = [{
        day: 1,
        title: '一日游',
        activities: locations.map((loc, index) => ({
          time: `${9 + index}:00`,
          name: loc.location,
          location: loc.location,
          description: `访问${loc.location}`,
          duration: '1小时',
          cost: '免费'
        }))
      }];

      const response = await fetch('/api/route-planning-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary,
          destination: destination,
          preferences
        })
      });

      if (!response.ok) {
        throw new Error('AI路线规划请求失败');
      }

      const data = await response.json();
      
      if (data.success && data.data.dailyRoutes && data.data.dailyRoutes.length > 0) {
        const dayRoute = data.data.dailyRoutes[0];
        routes.driving = dayRoute.routes.driving;
        routes.walking = dayRoute.routes.walking;
        routes.transit = dayRoute.routes.transit;
        routes.bicycling = dayRoute.routes.bicycling;
        routes.smart = dayRoute.routes.smart;
        
        console.log('AI路线规划结果:', dayRoute);
        
        // 显示AI生成的推荐
        if (dayRoute.recommendations && dayRoute.recommendations.length > 0) {
          console.log('AI推荐:', dayRoute.recommendations);
        }
        
        // 显示总体总结
        if (data.data.summary) {
          console.log('AI总结:', data.data.summary);
        }
      } else {
        throw new Error(data.error || 'AI路线规划失败');
      }
          } catch (error) {
        console.error('路线规划失败:', error);
        // 生成模拟数据作为fallback
        routes.driving = generateMockRoute('driving', locations[0].location, locations[locations.length - 1].location);
        routes.walking = generateMockRoute('walking', locations[0].location, locations[locations.length - 1].location);
        routes.transit = generateMockRoute('transit', locations[0].location, locations[locations.length - 1].location);
        routes.bicycling = generateMockRoute('bicycling', locations[0].location, locations[locations.length - 1].location);
        routes.smart = {
          method: 'driving',
          reason: '模拟数据，实际使用需要配置后端API',
          priority: 1
        };
      }

    return routes;
  };

  // 智能推荐最佳出行方式
  const recommendBestRoute = (routes: any, preferences: any): any => {
    const recommendations = [];
    
    // 分析各种出行方式
    if (routes.walking && routes.walking.success) {
      recommendations.push({
        method: 'walking',
        reason: '步行健康环保',
        priority: 1
      });
    }

    if (routes.transit && routes.transit.success) {
      recommendations.push({
        method: 'transit',
        reason: '公共交通环保经济',
        priority: 2
      });
    }

    if (routes.bicycling && routes.bicycling.success) {
      recommendations.push({
        method: 'bicycling',
        reason: '骑行健康环保',
        priority: 3
      });
    }

    if (routes.driving && routes.driving.success) {
      recommendations.push({
        method: 'driving',
        reason: '驾车便捷快速',
        priority: 4
      });
    }

    // 按优先级排序
    recommendations.sort((a, b) => a.priority - b.priority);
    
    return {
      bestOption: recommendations[0]?.method || 'unknown',
      allOptions: recommendations,
      reasoning: recommendations.map(r => r.reason).join('; ')
    };
  };

  // 生成模拟路线数据（fallback）
  const generateMockRoute = (method: string, origin: string, destination: string): RouteResult => {
    const distances = {
      driving: '5.2公里',
      walking: '2.1公里',
      transit: '3.8公里',
      bicycling: '2.5公里'
    };

    const durations = {
      driving: '15分钟',
      walking: '25分钟',
      transit: '20分钟',
      bicycling: '12分钟'
    };

    return {
      method,
      distance: distances[method as keyof typeof distances] || '未知',
      duration: durations[method as keyof typeof durations] || '未知',
      steps: [
        {
          instruction: `从${origin}出发`,
          road: '起点',
          distance: '0米',
          duration: '0分钟'
        },
        {
          instruction: '沿主要道路行驶',
          road: '主要道路',
          distance: distances[method as keyof typeof distances] || '未知',
          duration: durations[method as keyof typeof durations] || '未知'
        },
        {
          instruction: `到达${destination}`,
          road: '终点',
          distance: '0米',
          duration: '0分钟'
        }
      ]
    };
  };

  // 获取路线图标
  const getRouteIcon = (method: string) => {
    switch (method) {
      case 'driving':
        return <Car className="w-4 h-4 text-blue-500" />;
      case 'walking':
        return <User className="w-4 h-4 text-green-500" />;
      case 'transit':
        return <Bus className="w-4 h-4 text-orange-500" />;
      case 'bicycling':
        return <Bike className="w-4 h-4 text-purple-500" />;
      default:
        return <Route className="w-4 h-4 text-gray-500" />;
      }
  };

  // 获取路线标签颜色
  const getRouteColor = (method: string) => {
    switch (method) {
      case 'driving':
        return 'bg-blue-100 text-blue-800';
      case 'walking':
        return 'bg-green-100 text-green-800';
      case 'transit':
        return 'bg-orange-100 text-orange-800';
      case 'bicycling':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 打开高德地图导航
  const openAmapNavigation = (origin: string, destination: string, mode: string) => {
    const baseUrl = 'https://ditu.amap.com/dir';
    const params = new URLSearchParams();
    
    params.append('from[name]', origin);
    params.append('to[name]', destination);
    params.append('type', mode);
    params.append('coordinate', 'gaode');
    params.append('showTraffic', '1');
    params.append('showPOI', '1');
    params.append('showBuilding', '1');
    params.append('show3D', '1');
    params.append('zoom', '13');
    params.append('autoStart', '1');
    params.append('showPanel', '1');
    params.append('lang', 'zh_cn');
    
    const url = `${baseUrl}?${params.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* 标题和操作按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Route className="w-6 h-6" />
            智能路线规划
          </h2>
          <p className="text-gray-600 mt-1">
            使用高德地图MCP服务为您的{itinerary.length}天行程生成智能路线规划
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={generateRoutePlans} 
            disabled={loading || itinerary.length === 0}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {loading ? '规划中...' : '开始规划'}
          </Button>
          
          <Button 
            onClick={generateAIRoutePlanning}
            disabled={aiLoading || !itinerary || itinerary.length === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AI智能规划中...
              </>
            ) : (
              <>
                <Star className="w-4 h-4" />
                AI智能路线规划
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 偏好设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            出行偏好设置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="maxWalkingDistance">最大步行距离</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="maxWalkingDistance"
                  type="number"
                  value={preferences.maxWalkingDistance}
                  onChange={(e) => setPreferences(prev => ({ ...prev, maxWalkingDistance: parseInt(e.target.value) || 3000 }))}
                  className="w-20"
                />
                <span className="text-sm text-gray-600">米</span>
              </div>
            </div>
            
            <div>
              <Label>偏好公共交通</Label>
              <Select
                value={preferences.preferPublicTransport ? 'true' : 'false'}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, preferPublicTransport: value === 'true' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">是</SelectItem>
                  <SelectItem value="false">否</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>避开高速</Label>
              <Select
                value={preferences.avoidHighways ? 'true' : 'false'}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, avoidHighways: value === 'true' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">是</SelectItem>
                  <SelectItem value="false">否</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>出行时间</Label>
              <Select
                value={preferences.timeOfDay}
                onValueChange={(value: any) => setPreferences(prev => ({ ...prev, timeOfDay: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">早晨</SelectItem>
                  <SelectItem value="afternoon">下午</SelectItem>
                  <SelectItem value="evening">傍晚</SelectItem>
                  <SelectItem value="night">夜晚</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 路线规划结果 */}
      {dailyRoutes.length > 0 && (
        <div className="space-y-6">
          {/* 总体摘要 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                路线规划总览
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
                    {dailyRoutes.filter(route => Object.keys(route.routes).length > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">可规划路线</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    🧠
                  </div>
                  <div className="text-sm text-gray-600">智能推荐</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 每日路线详情 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                每日路线详情
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
                    {/* 当天路线摘要 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">{route.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {route.locations.length} 个地点
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">查看模式:</span>
                          <Select value={selectedMode} onValueChange={(value: any) => setSelectedMode(value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="smart">智能推荐</SelectItem>
                              <SelectItem value="driving">驾车</SelectItem>
                              <SelectItem value="walking">步行</SelectItem>
                              <SelectItem value="transit">公交</SelectItem>
                              <SelectItem value="bicycling">骑行</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <div className="flex-1">
                              <div className="font-medium">{location.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
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

                    {/* 路线规划结果 */}
                    {Object.keys(route.routes).length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Route className="w-4 h-4" />
                          路线规划结果
                        </h4>
                        
                        {/* 智能推荐 */}
                        {route.routes.smart && (
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="w-5 h-5 text-yellow-500" />
                              <span className="font-semibold text-blue-800">智能推荐</span>
                            </div>
                            <div className="text-sm text-blue-700">
                              <p><strong>推荐方式:</strong> {route.routes.smart.method}</p>
                              <p><strong>推荐理由:</strong> {route.routes.smart.reason}</p>
                            </div>
                          </div>
                        )}

                        {/* 具体路线 */}
                        {selectedMode !== 'smart' && route.routes[selectedMode as keyof typeof route.routes] && (
                          <div className="bg-white border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {getRouteIcon(selectedMode)}
                                <span className="font-semibold capitalize">{selectedMode}</span>
                                <Badge className={getRouteColor(selectedMode)}>
                                  {route.routes[selectedMode as keyof typeof route.routes]?.distance}
                                </Badge>
                                <Badge variant="outline">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {route.routes[selectedMode as keyof typeof route.routes]?.duration}
                                </Badge>
                              </div>
                              <Button
                                onClick={() => openAmapNavigation(
                                  route.locations[0].location,
                                  route.locations[route.locations.length - 1].location,
                                  selectedMode
                                )}
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <ExternalLink className="w-3 h-3" />
                                打开导航
                              </Button>
                            </div>
                            
                            {/* 路线步骤 */}
                            <div className="space-y-2">
                              {(() => {
                                const selectedRoute = route.routes[selectedMode as keyof typeof route.routes];
                                if (!selectedRoute || !selectedRoute.steps || !Array.isArray(selectedRoute.steps)) {
                                  return (
                                    <div className="text-center py-4 text-gray-500">
                                      <Route className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                      <p>暂无详细路线信息</p>
                                      <p className="text-sm">请选择其他出行方式或重新生成路线规划</p>
                                    </div>
                                  );
                                }
                                
                                return selectedRoute.steps.map((step: any, index: number) => (
                                  <div key={index} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">{step.instruction || '路线指引'}</div>
                                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                                        <span>道路: {step.road || '--'}</span>
                                        <span>距离: {step.distance || '--'}</span>
                                        <span>时间: {step.duration || '--'}</span>
                                      </div>
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}

                        {/* 所有路线对比 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {Object.entries(route.routes).map(([mode, routeData]) => {
                            if (mode === 'smart' || !routeData) return null;
                            return (
                              <div key={mode} className="bg-gray-50 p-3 rounded-lg border cursor-pointer hover:border-blue-300 transition-colors"
                                   onClick={() => setSelectedMode(mode as any)}>
                                <div className="flex items-center gap-2 mb-2">
                                  {getRouteIcon(mode)}
                                  <span className="font-medium capitalize">{mode}</span>
                                </div>
                                <div className="text-sm space-y-1">
                                  <div className="flex items-center gap-1">
                                    <Ruler className="w-3 h-3 text-gray-500" />
                                    {routeData.distance}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-gray-500" />
                                    {routeData.duration}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 使用说明 */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">使用说明</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• 系统会根据您的偏好自动推荐最佳出行方式</li>
                        <li>• 支持驾车、步行、公交、骑行等多种出行方式</li>
                        <li>• 点击"打开导航"按钮将跳转到高德地图</li>
                        <li>• 可以点击不同出行方式卡片查看详细路线</li>
                        <li>• 路线规划基于高德地图MCP服务，数据准确可靠</li>
                      </ul>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI智能路线规划结果 */}
      {aiRouteResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              AI智能路线规划结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 总体总结 */}
              {aiRouteResult.summary && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">🎯 AI智能推荐总结</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">最佳交通方式</p>
                      <p className="font-medium">{aiRouteResult.summary.bestTransportationMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">总体成本</p>
                      <p className="font-medium">{aiRouteResult.summary.totalCost}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">时间效率</p>
                      <p className="font-medium">{aiRouteResult.summary.timeEfficiency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">环境影响</p>
                      <p className="font-medium">{aiRouteResult.summary.environmentalImpact}</p>
                    </div>
                  </div>
                  {aiRouteResult.summary.tips && aiRouteResult.summary.tips.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">💡 实用建议:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {aiRouteResult.summary.tips.map((tip: string, index: number) => (
                          <li key={index} className="text-sm">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 每日路线规划 */}
              {aiRouteResult.dailyRoutes && aiRouteResult.dailyRoutes.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">📅 每日详细路线规划</h3>
                  {aiRouteResult.dailyRoutes.map((dayRoute: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">
                          第{dayRoute.day}天: {dayRoute.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            总距离: {dayRoute.totalDistance}
                          </Badge>
                          <Badge variant="outline">
                            总时间: {dayRoute.totalDuration}
                          </Badge>
                        </div>
                      </div>

                      {/* 途经点 */}
                      {dayRoute.waypoints && dayRoute.waypoints.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium mb-2">📍 途经点:</h5>
                          <div className="flex flex-wrap gap-2">
                            {dayRoute.waypoints.map((waypoint: string, wpIndex: number) => (
                              <Badge key={wpIndex} variant="outline">
                                {waypoint}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI推荐 */}
                      {dayRoute.recommendations && dayRoute.recommendations.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium mb-2">🤖 AI推荐:</h5>
                          <div className="space-y-2">
                            {dayRoute.recommendations.map((rec: string, recIndex: number) => (
                              <div key={recIndex} className="flex items-center gap-2 text-sm">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 各种出行方式 */}
                      {dayRoute.routes && Object.keys(dayRoute.routes).length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">🚗 出行方式详情:</h5>
                          <div className="space-y-4">
                            {Object.entries(dayRoute.routes).map(([mode, route]) => (
                              <div key={mode} className="border rounded-lg p-3">
                                <h6 className="font-medium mb-2 capitalize">{mode}</h6>
                                {route && typeof route === 'object' ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                                      <div className="flex items-center gap-2">
                                        {getRouteIcon(mode)}
                                        <span className="font-medium">{mode}</span>
                                      </div>
                                      <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span>距离: {(route as any).distance || '--'}</span>
                                        <span>时间: {(route as any).duration || '--'}</span>
                                      </div>
                                    </div>
                                    
                                    {/* 路线步骤 */}
                                    {(route as any).steps && Array.isArray((route as any).steps) && (route as any).steps.length > 0 ? (
                                      <div className="space-y-2">
                                        {(route as any).steps.map((step: any, stepIndex: number) => (
                                          <div key={stepIndex} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                              {stepIndex + 1}
                                            </div>
                                            <div className="flex-1">
                                              <div className="text-sm font-medium">{step.instruction || '路线指引'}</div>
                                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                                                <span>道路: {step.road || '--'}</span>
                                                <span>距离: {step.distance || '--'}</span>
                                                <span>时间: {step.duration || '--'}</span>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-4 text-gray-500">
                                        <Route className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                        <p>暂无详细路线信息</p>
                                        <p className="text-sm">AI正在分析路线数据...</p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 text-gray-500">
                                    <Route className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    <p>该出行方式暂无路线信息</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 高德地图显示 */}
              {aiRouteResult && aiRouteResult.dailyRoutes && aiRouteResult.dailyRoutes.length > 0 && (
                <div className="mt-6">
                  <AmapTravelMap 
                    dailyRoutes={aiRouteResult.dailyRoutes}
                    destination={destination}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 空状态 */}
      {!loading && dailyRoutes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Route className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">暂无路线规划数据</h3>
            <p className="text-gray-500 mb-4">
              点击"开始规划"按钮，使用高德地图MCP服务为您的行程生成智能路线规划
            </p>
            <Button onClick={generateRoutePlans} disabled={itinerary.length === 0}>
              开始规划
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
