import { NextRequest, NextResponse } from 'next/server';
import { amapServiceServer } from '@/lib/services/amap-service-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const startDate = searchParams.get('startDate');
    const duration = searchParams.get('duration');

    if (!city) {
      return NextResponse.json(
        { error: '城市参数是必需的' },
        { status: 400 }
      );
    }

    // 获取天气建议（包含实时天气和预报）
    let weatherAdvice: string;
    
    if (startDate && duration) {
      // 如果提供了日期和天数，使用带日期的天气建议
      const durationNum = parseInt(duration) || 1;
      weatherAdvice = await amapServiceServer.getWeatherAdviceWithDates(city, startDate, durationNum);
    } else {
      // 否则使用默认的天气建议
      weatherAdvice = await amapServiceServer.getWeatherAdvice(city);
    }

    return NextResponse.json({
      success: true,
      data: {
        city,
        weatherAdvice,
        startDate: startDate || null,
        duration: duration ? parseInt(duration) : null,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('天气查询API错误:', error);
    return NextResponse.json(
      { 
        error: '获取天气信息失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
