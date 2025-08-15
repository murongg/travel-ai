import { BaseMCPTool } from './base-mcp-server';
import { amapServiceServer } from '@/lib/services/amap-service-server';

/**
 * 天气查询工具
 */
export class GetWeatherTool extends BaseMCPTool {
  protected getToolName(): string {
    return 'get_weather';
  }

  protected getToolDescription(): string {
    return '获取指定城市的天气信息';
  }

  protected getInputSchema(): Record<string, any> {
    return {
      city: {
        type: 'string',
        description: '城市名称'
      },
      date: {
        type: 'string',
        description: '查询日期 (YYYY-MM-DD格式，可选)'
      }
    };
  }

  protected getRequiredFields(): string[] {
    return ['city'];
  }

  protected async _call(input: any): Promise<string> {
    try {
      const { city, date } = input;
      const weather = await amapServiceServer.getLiveWeather(city);
      
      return JSON.stringify({
        success: true,
        data: {
          city,
          date: date || new Date().toISOString().split('T')[0],
          weather
        }
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Failed to get weather for ${input.city}: ${error}`
      });
    }
  }
}

/**
 * 地理编码工具
 */
export class GeocodeTool extends BaseMCPTool {
  protected getToolName(): string {
    return 'geocode';
  }

  protected getToolDescription(): string {
    return '地理编码，将地址转换为坐标';
  }

  protected getInputSchema(): Record<string, any> {
    return {
      address: {
        type: 'string',
        description: '地址或地点名称'
      },
      city: {
        type: 'string',
        description: '所在城市'
      }
    };
  }

  protected getRequiredFields(): string[] {
    return ['address'];
  }

  protected async _call(input: any): Promise<string> {
    try {
      const { address, city } = input;
      const result = await amapServiceServer.smartGeocode(address, city);
      
      return JSON.stringify({
        success: true,
        data: {
          address,
          city,
          coordinates: result?.coordinates,
          formattedAddress: result?.formatted_address
        }
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Failed to geocode ${input.address}: ${error}`
      });
    }
  }
}

/**
 * 旅行天气建议工具
 */
export class TravelWeatherAdviceTool extends BaseMCPTool {
  protected getToolName(): string {
    return 'get_travel_weather_advice';
  }

  protected getToolDescription(): string {
    return '获取旅行天气建议';
  }

  protected getInputSchema(): Record<string, any> {
    return {
      destination: {
        type: 'string',
        description: '目的地城市'
      },
      startDate: {
        type: 'string',
        description: '出发日期'
      },
      duration: {
        type: 'number',
        description: '行程天数'
      }
    };
  }

  protected getRequiredFields(): string[] {
    return ['destination'];
  }

  protected async _call(input: any): Promise<string> {
    try {
      const { destination, startDate, duration } = input;
      const advice = await amapServiceServer.getWeatherAdviceWithDates(destination, startDate, duration);
      
      return JSON.stringify({
        success: true,
        data: {
          destination,
          startDate,
          duration,
          advice
        }
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Failed to get travel weather advice for ${input.destination}: ${error}`
      });
    }
  }
}


