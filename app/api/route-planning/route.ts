import { NextRequest, NextResponse } from 'next/server';
import { LangChainTravelAgent } from '@/lib/langchain/travel-agent';

export async function POST(request: NextRequest) {
  try {
    const { origin, destination, preferences, waypoints } = await request.json();

    // 验证输入参数
    if (!origin || !destination) {
      return NextResponse.json(
        { success: false, error: '起点和终点不能为空' },
        { status: 400 }
      );
    }

    // 创建Travel Agent实例
    const travelAgent = new LangChainTravelAgent();

    try {
      // 初始化高德地图MCP服务
      const initResult = await travelAgent.initializeAmapMCPService();
      if (!initResult) {
        return NextResponse.json(
          { success: false, error: '高德地图MCP服务初始化失败' },
          { status: 500 }
        );
      }

      // 使用智能路线规划
      const smartRouteResult = await travelAgent.getSmartRoutePlanning(
        origin,
        destination,
        preferences
      );

      if (!smartRouteResult.success) {
        return NextResponse.json(
          { success: false, error: smartRouteResult.error },
          { status: 500 }
        );
      }

      // 关闭服务
      await travelAgent.closeAmapMCPService();

      // 返回路线规划结果
      return NextResponse.json({
        success: true,
        data: {
          driving: smartRouteResult.data.driving,
          walking: smartRouteResult.data.walking,
          transit: smartRouteResult.data.transit,
          bicycling: smartRouteResult.data.bicycling,
          recommendation: smartRouteResult.data.recommendation,
          waypoints: waypoints || []
        },
        message: '路线规划成功'
      });

    } catch (error) {
      // 确保关闭服务
      try {
        await travelAgent.closeAmapMCPService();
      } catch (closeError) {
        console.error('关闭服务失败:', closeError);
      }

      console.error('路线规划失败:', error);
      return NextResponse.json(
        { success: false, error: '路线规划服务调用失败' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API处理失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 支持GET请求用于测试
export async function GET() {
  return NextResponse.json({
    success: true,
    message: '路线规划API服务正常',
    endpoints: {
      POST: '/api/route-planning',
      description: '发送POST请求进行路线规划',
      body: {
        origin: '起点地址或坐标',
        destination: '终点地址或坐标',
        preferences: {
          maxWalkingDistance: '最大步行距离（米）',
          preferPublicTransport: '是否偏好公共交通',
          avoidHighways: '是否避开高速',
          timeOfDay: '出行时间（morning/afternoon/evening/night）'
        },
        waypoints: '途经点数组（可选）'
      }
    }
  });
}
