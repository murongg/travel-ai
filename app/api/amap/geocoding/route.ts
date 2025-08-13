import { NextRequest, NextResponse } from 'next/server';
import { amapServiceServer, LocationResult } from '@/lib/services/amap-service-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, addresses, city, destination } = body;

    // 支持单个地址和批量地址
    if (addresses && Array.isArray(addresses)) {
      // 批量地址处理
      if (addresses.length === 0) {
        return NextResponse.json(
          { success: false, error: '地址列表不能为空' },
          { status: 400 }
        );
      }

      const results = await amapServiceServer.batchGeocoding(addresses, destination || city);
      
      return NextResponse.json({
        success: true,
        results,
        total: addresses.length,
        successful: results.filter(r => r !== null).length,
      });

    } else if (address && typeof address === 'string') {
      // 单个地址处理
      const result = await amapServiceServer.smartGeocode(address, destination || city || '中国');

      if (result) {
        return NextResponse.json({
          success: true,
          result,
        });
      } else {
        return NextResponse.json({
          success: false,
          error: '未找到该地址的坐标信息',
        }, { status: 404 });
      }

    } else {
      return NextResponse.json(
        { success: false, error: '请提供address或addresses参数' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('地理编码API错误:', error);
    return NextResponse.json(
      { success: false, error: '地理编码服务暂时不可用' },
      { status: 500 }
    );
  }
}

// 保持GET方法兼容性
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');
  const city = searchParams.get('city');

  if (!address) {
    return NextResponse.json(
      { success: false, error: '地址参数不能为空' },
      { status: 400 }
    );
  }

  try {
    const result = await amapServiceServer.smartGeocode(address, city || '中国');
    
    if (result) {
      return NextResponse.json({
        success: true,
        result,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: '未找到该地址的坐标信息',
      }, { status: 404 });
    }

  } catch (error) {
    console.error('地理编码API错误:', error);
    return NextResponse.json(
      { success: false, error: '地理编码服务暂时不可用' },
      { status: 500 }
    );
  }
}

// 新增：获取速率限制状态的调试端点
export async function OPTIONS(request: NextRequest) {
  try {
    const status = amapServiceServer.getRateLimitStatus();
    
    return NextResponse.json({
      success: true,
      rateLimitStatus: status,
    });

  } catch (error) {
    console.error('获取速率限制状态失败:', error);
    return NextResponse.json(
      { success: false, error: '无法获取服务状态' },
      { status: 500 }
    );
  }
}
