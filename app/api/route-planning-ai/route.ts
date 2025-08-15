import { NextRequest, NextResponse } from 'next/server';
import { RoutePlanningAgent, RoutePlanningRequest } from '@/lib/langchain/route-planning-agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求体
    if (!body.itinerary || !body.destination) {
      return NextResponse.json(
        { success: false, error: '缺少必要的参数：itinerary 和 destination' },
        { status: 400 }
      );
    }

    // 创建路线规划请求
    const routeRequest: RoutePlanningRequest = {
      itinerary: body.itinerary,
      preferences: body.preferences || {},
      destination: body.destination
    };

    console.log('🚀 开始AI智能路线规划...');
    console.log('目的地:', routeRequest.destination);
    console.log('行程天数:', routeRequest.itinerary.length);

    // 创建RoutePlanningAgent并执行路线规划
    const routeAgent = new RoutePlanningAgent();
    const result = await routeAgent.planRoutes(routeRequest);

    console.log('✅ AI智能路线规划完成');

    return NextResponse.json({
      success: true,
      data: result,
      message: 'AI智能路线规划成功',
      source: 'AI智能路线规划Agent'
    });

  } catch (error) {
    console.error('❌ AI智能路线规划失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'AI智能路线规划失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI智能路线规划API',
    description: '使用AI Agent分析用户itinerary并调用高德地图MCP服务进行智能路线规划',
    usage: {
      method: 'POST',
      body: {
        itinerary: 'Array<{day: number, title: string, activities: Array<{time, name, location, description, duration, cost}>}>',
        destination: 'string',
        preferences: 'Object<{maxWalkingDistance?, preferPublicTransport?, avoidHighways?, timeOfDay?}>'
      }
    },
    features: [
      'AI智能分析用户行程',
      '自动提取需要路线规划的地点',
      '调用高德地图MCP服务获取经纬度和路线',
      '支持多种出行方式（驾车、步行、公交、骑行）',
      '智能推荐最佳出行方式',
      '生成每日路线规划和总体总结'
    ]
  });
}
