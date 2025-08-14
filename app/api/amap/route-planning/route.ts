import { NextRequest, NextResponse } from 'next/server';
import { amapServiceServer, DailyRoutePlan } from '@/lib/services/amap-service-server';

/**
 * 路径规划API
 * 支持单次路径规划和每日行程路径规划
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type) {
      return NextResponse.json(
        { error: '缺少必要参数: type' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'single':
        return await handleSingleRoutePlanning(data);
      case 'daily':
        return await handleDailyRoutePlanning(data);
      case 'multiDay':
        return await handleMultiDayRoutePlanning(data);
      default:
        return NextResponse.json(
          { error: '不支持的路径规划类型' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('路径规划API错误:', error);
    
    // 提供更详细的错误信息
    let errorMessage = '服务器内部错误';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('API密钥未配置')) {
        errorMessage = '高德地图API密钥未配置';
        statusCode = 500;
      } else if (error.message.includes('地理编码失败')) {
        errorMessage = '地点识别失败，请检查地点名称';
        statusCode = 400;
      } else if (error.message.includes('路径规划失败')) {
        errorMessage = '路径规划失败，请检查起点和终点';
        statusCode = 400;
      } else if (error.message.includes('有效地点数量不足')) {
        errorMessage = '有效地点数量不足，无法进行路径规划';
        statusCode = 400;
      } else {
        errorMessage = error.message;
        statusCode = 500;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: statusCode }
    );
  }
}

/**
 * 处理单次路径规划
 */
async function handleSingleRoutePlanning(data: any) {
  try {
    const { origin, destination, waypoints, strategy, avoidpolygons, avoidroad } = data;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: '缺少必要参数: origin, destination' },
        { status: 400 }
      );
    }

    const route = await amapServiceServer.routePlanning({
      origin,
      destination,
      waypoints,
      strategy,
      avoidpolygons,
      avoidroad
    });

    if (!route) {
      return NextResponse.json(
        { error: '路径规划失败，请检查起点和终点坐标' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error('单次路径规划失败:', error);
    return NextResponse.json(
      { error: '路径规划失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * 处理每日行程路径规划
 */
async function handleDailyRoutePlanning(data: any) {
  try {
    const { dayPlan, cityCenter } = data;

    if (!dayPlan) {
      return NextResponse.json(
        { error: '缺少必要参数: dayPlan' },
        { status: 400 }
      );
    }

    const dailyRoute = await amapServiceServer.planDailyRoute(dayPlan, cityCenter);

    if (!dailyRoute) {
      return NextResponse.json(
        { error: '每日行程路径规划失败，请检查行程数据' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dailyRoute
    });
  } catch (error) {
    console.error('每日行程路径规划失败:', error);
    return NextResponse.json(
      { error: '每日行程路径规划失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * 处理多日行程路径规划
 */
async function handleMultiDayRoutePlanning(data: any) {
  try {
    const { itinerary, cityCenter, destination } = data;

    if (!itinerary || !Array.isArray(itinerary) || itinerary.length === 0) {
      return NextResponse.json(
        { error: '缺少必要参数: itinerary (行程数组)' },
        { status: 400 }
      );
    }

    // 如果没有提供城市中心坐标，尝试获取目的地城市中心
    let actualCityCenter = cityCenter;
    if (!actualCityCenter && destination) {
      actualCityCenter = await amapServiceServer.getCityCenter(destination);
    }

    const dailyRoutes = await amapServiceServer.planMultiDayRoutes(itinerary, actualCityCenter);

    if (dailyRoutes.length === 0) {
      return NextResponse.json(
        { error: '多日行程路径规划失败，请检查行程数据' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        totalDays: dailyRoutes.length,
        dailyRoutes,
        summary: generateRouteSummary(dailyRoutes)
      }
    });
  } catch (error) {
    console.error('多日行程路径规划失败:', error);
    return NextResponse.json(
      { error: '多日行程路径规划失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * 生成路径规划摘要
 */
function generateRouteSummary(dailyRoutes: DailyRoutePlan[]) {
  const totalDistance = dailyRoutes.reduce((sum, route) => sum + route.totalDistance, 0);
  const totalDuration = dailyRoutes.reduce((sum, route) => sum + route.totalDuration, 0);
  const totalCost = dailyRoutes.reduce((sum, route) => sum + route.totalCost, 0);

  return {
    totalDistance: Math.round(totalDistance / 1000 * 100) / 100, // 转换为公里
    totalDuration: Math.round(totalDuration / 3600 * 100) / 100, // 转换为小时
    totalCost: Math.round(totalCost * 100) / 100,
    averageDailyDistance: Math.round((totalDistance / dailyRoutes.length / 1000) * 100) / 100,
    averageDailyDuration: Math.round((totalDuration / dailyRoutes.length / 3600) * 100) / 100,
    averageDailyCost: Math.round((totalCost / dailyRoutes.length) * 100) / 100
  };
}

/**
 * GET方法 - 获取路径规划状态和限制信息
 */
export async function GET() {
  try {
    const rateLimitStatus = amapServiceServer.getRateLimitStatus();
    
    return NextResponse.json({
      success: true,
      data: {
        rateLimit: rateLimitStatus,
        features: {
          singleRoute: true,
          dailyRoute: true,
          multiDayRoute: true,
          waypoints: true,
          strategy: true,
          avoidAreas: true
        }
      }
    });
  } catch (error) {
    console.error('获取路径规划状态失败:', error);
    return NextResponse.json(
      { error: '获取状态失败' },
      { status: 500 }
    );
  }
}
