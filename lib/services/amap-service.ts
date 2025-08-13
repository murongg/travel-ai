/**
 * 高德地图API服务
 * 提供地理编码、逆地理编码等功能
 */

interface AmapApiResponse {
  status: string;
  info: string;
  infocode: string;
  count: string;
  geocodes?: AmapGeocode[];
}

interface AmapGeocode {
  formatted_address: string;
  country: string;
  province: string;
  city: string;
  district: string;
  township: string;
  neighborhood: {
    name: string;
    type: string;
  };
  building: {
    name: string;
    type: string;
  };
  adcode: string;
  street: string;
  number: string;
  location: string; // "lng,lat" 格式
  level: string;
}

export interface LocationResult {
  address: string;
  coordinates: [number, number]; // [lng, lat]
  city: string;
  district: string;
  formatted_address: string;
}

export class AmapService {
  private apiKey: string;
  private baseUrl = 'https://restapi.amap.com/v3';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_AMAP_KEY || '';
    if (!this.apiKey) {
      console.warn('高德地图API密钥未配置，地理编码功能将不可用');
    }
  }

  /**
   * 地理编码 - 地址转坐标
   * @param address 地址字符串
   * @param city 城市名称（可选，提高准确性）
   * @returns 坐标和地址信息
   */
  async geocoding(address: string, city?: string): Promise<LocationResult | null> {
    if (!this.apiKey) {
      throw new Error('高德地图API密钥未配置');
    }

    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        address: address,
        output: 'json',
        ...(city && { city: city }),
      });

      const response = await fetch(`${this.baseUrl}/geocode/geo?${params}`);
      const data: AmapApiResponse = await response.json();

      if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
        const geocode = data.geocodes[0];
        const [lng, lat] = geocode.location.split(',').map(Number);

        return {
          address: address,
          coordinates: [lng, lat],
          city: geocode.city,
          district: geocode.district,
          formatted_address: geocode.formatted_address,
        };
      } else {
        console.warn(`地理编码失败: ${address}`, data);
        return null;
      }
    } catch (error) {
      console.error('地理编码请求失败:', error);
      return null;
    }
  }

  /**
   * 批量地理编码
   * @param addresses 地址数组
   * @param city 城市名称（可选）
   * @returns 坐标结果数组
   */
  async batchGeocoding(addresses: string[], city?: string): Promise<(LocationResult | null)[]> {
    const results = await Promise.allSettled(
      addresses.map(address => this.geocoding(address, city))
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : null
    );
  }

  /**
   * 获取城市中心坐标
   * @param cityName 城市名称
   * @returns 城市中心坐标
   */
  async getCityCenter(cityName: string): Promise<[number, number] | null> {
    const result = await this.geocoding(cityName);
    return result ? result.coordinates : null;
  }

  /**
   * 智能地址解析
   * 尝试从完整地址中提取有用信息
   * @param fullAddress 完整地址字符串
   * @param destination 目的地城市
   * @returns 解析结果
   */
  async smartGeocode(fullAddress: string, destination: string): Promise<LocationResult | null> {
    // 先尝试完整地址
    let result = await this.geocoding(fullAddress, destination);
    if (result) return result;

    // 如果失败，尝试简化地址
    const simplifiedAddress = this.simplifyAddress(fullAddress);
    if (simplifiedAddress !== fullAddress) {
      result = await this.geocoding(simplifiedAddress, destination);
      if (result) return result;
    }

    // 最后尝试只用地名
    const placeName = this.extractPlaceName(fullAddress);
    if (placeName) {
      result = await this.geocoding(placeName, destination);
      if (result) return result;
    }

    return null;
  }

  /**
   * 简化地址字符串
   * 移除一些可能影响搜索的描述性词汇
   */
  private simplifyAddress(address: string): string {
    return address
      .replace(/（.*?）/g, '') // 移除括号内容
      .replace(/\(.*?\)/g, '') // 移除英文括号内容
      .replace(/附近|周边|旁边|对面|斜对面/g, '') // 移除位置描述
      .replace(/推荐|必去|热门|著名/g, '') // 移除推荐词汇
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim();
  }

  /**
   * 提取地名
   * 从描述中提取可能的地名
   */
  private extractPlaceName(address: string): string | null {
    // 简单的地名提取逻辑，可以根据需要扩展
    const matches = address.match(/[\u4e00-\u9fa5]{2,}/g);
    if (matches && matches.length > 0) {
      return matches[0]; // 返回第一个中文词组
    }
    return null;
  }
}

// 创建单例实例
export const amapService = new AmapService();

// 工具函数
export const formatCoordinates = (coordinates: [number, number]): string => {
  return `${coordinates[0]}, ${coordinates[1]}`;
};

export const calculateDistance = (
  coord1: [number, number], 
  coord2: [number, number]
): number => {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const deltaLat = radLat2 - radLat1;
  const deltaLng = ((lng2 - lng1) * Math.PI) / 180;
  
  const a = Math.sin(deltaLat / 2) ** 2 + 
           Math.cos(radLat1) * Math.cos(radLat2) * 
           Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return 6371 * c; // 地球半径，返回公里
};
