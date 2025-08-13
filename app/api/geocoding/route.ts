import { NextRequest, NextResponse } from 'next/server';
import { amapService } from '@/lib/services/amap-service';

export async function POST(request: NextRequest) {
  try {
    const { addresses, city, destination } = await request.json();

    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json({ error: '地址列表不能为空' }, { status: 400 });
    }

    const results = [];

    for (const address of addresses) {
      if (!address || typeof address !== 'string') {
        results.push(null);
        continue;
      }

      try {
        // 使用智能地址解析
        const result = await amapService.smartGeocode(
          address, 
          destination || city || '中国'
        );
        results.push(result);
      } catch (error) {
        console.error(`地理编码失败: ${address}`, error);
        results.push(null);
      }
    }

    return NextResponse.json({
      success: true,
      results,
      total: addresses.length,
      successful: results.filter(r => r !== null).length,
    });

  } catch (error) {
    console.error('地理编码API错误:', error);
    return NextResponse.json(
      { error: '地理编码服务暂时不可用' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');
  const city = searchParams.get('city');

  if (!address) {
    return NextResponse.json({ error: '地址参数不能为空' }, { status: 400 });
  }

  try {
    const result = await amapService.smartGeocode(address, city || '中国');
    
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
      { error: '地理编码服务暂时不可用' }, 
      { status: 500 }
    );
  }
}
