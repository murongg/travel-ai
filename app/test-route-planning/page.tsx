'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RoutePlanner } from '@/components/route-planner';

export default function TestRoutePlanningPage() {
  const [destination, setDestination] = useState('北京');
  const [itinerary, setItinerary] = useState([
    {
      day: 1,
      title: '第一天 - 故宫天安门',
      destination: '北京',
      activities: [
        {
          time: '09:00',
          name: '天安门广场',
          description: '参观天安门广场，观看升旗仪式',
          location: '天安门广场',
          duration: '2小时',
          cost: '免费'
        },
        {
          time: '11:00',
          name: '故宫博物院',
          description: '游览故宫，了解明清历史',
          location: '故宫博物院',
          duration: '3小时',
          cost: '¥60'
        }
      ],
      meals: [
        {
          type: 'lunch',
          name: '全聚德烤鸭',
          location: '全聚德烤鸭店',
          cost: '¥200',
          description: '品尝正宗北京烤鸭'
        }
      ],
      accommodation: '北京饭店'
    },
    {
      day: 2,
      title: '第二天 - 长城颐和园',
      destination: '北京',
      activities: [
        {
          time: '08:00',
          name: '八达岭长城',
          description: '登长城，感受万里长城的气势',
          location: '八达岭长城',
          duration: '4小时',
          cost: '¥120'
        },
        {
          time: '14:00',
          name: '颐和园',
          description: '游览颐和园，欣赏皇家园林',
          location: '颐和园',
          duration: '3小时',
          cost: '¥60'
        }
      ],
      meals: [
        {
          type: 'lunch',
          name: '农家院',
          location: '长城脚下农家院',
          cost: '¥80',
          description: '品尝农家菜'
        }
      ],
      accommodation: '北京饭店'
    }
  ]);
  const [dailyRoutes, setDailyRoutes] = useState<any[]>([]);

  const handleRouteGenerated = (routes: any[]) => {
    setDailyRoutes(routes);
    console.log('导航链接生成结果:', routes);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">高德地图导航功能测试</h1>
          <p className="text-gray-600">测试高德地图导航链接生成功能</p>
        </div>

        {/* 测试数据配置 */}
        <Card>
          <CardHeader>
            <CardTitle>测试数据配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="destination">目的地城市</Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="输入目的地城市"
              />
            </div>
            <div className="text-sm text-gray-600">
              <p>当前测试行程：{itinerary.length}天</p>
              <p>第1天：天安门广场 → 故宫博物院 → 全聚德烤鸭 → 北京饭店</p>
              <p>第2天：八达岭长城 → 颐和园 → 农家院 → 北京饭店</p>
            </div>
            

          </CardContent>
        </Card>

        {/* 路径规划组件 */}
        <RoutePlanner
          itinerary={itinerary}
          destination={destination}
          onRouteGenerated={handleRouteGenerated}
        />



        {/* 导航链接信息 */}
        {dailyRoutes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>导航链接信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyRoutes.map((route, index) => (
                  <div key={index} className="border p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">第{route.day}天: {route.title}</h4>
                    <div className="text-sm text-gray-600 mb-2">
                      地点数量: {route.locations.length}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      导航链接: <a href={route.navigationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{route.navigationUrl}</a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
