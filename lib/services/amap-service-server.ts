/**
 * 高德地图API服务 - 服务器端版本
 * 提供地理编码、逆地理编码等功能，带并发控制
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

export class AmapServiceServer {
  private apiKey: string;
  private baseUrl = 'https://restapi.amap.com/v3';
  private maxRequestsPerSecond = 3; // 高德API限制：1秒3次
  private requestTimestamps: number[] = [];

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_AMAP_KEY || '';
    if (!this.apiKey) {
      console.warn('高德地图API密钥未配置，地理编码功能将不可用');
    }
  }

  /**
   * 速率限制控制 - 1秒3次
   */
  private async withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    
    // 清除1秒前的时间戳
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp < 1000
    );

    // 如果在1秒内已经有3次请求，需要等待
    if (this.requestTimestamps.length >= this.maxRequestsPerSecond) {
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = 1000 - (now - oldestTimestamp);
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.withRateLimit(fn); // 递归调用，重新检查限制
      }
    }

    // 记录当前请求时间
    this.requestTimestamps.push(Date.now());
    
    try {
      return await fn();
    } catch (error) {
      throw error;
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

    return this.withRateLimit(async () => {
      try {
        const params = new URLSearchParams({
          key: this.apiKey,
          address: address,
          output: 'json',
          ...(city && { city: city }),
        });

        const response = await fetch(`${this.baseUrl}/geocode/geo?${params}`);
        
        if (!response.ok) {
          throw new Error(`高德API请求失败: ${response.status}`);
        }

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
        throw error;
      }
    });
  }

  /**
   * 批量地理编码
   * @param addresses 地址数组
   * @param city 城市名称（可选）
   * @returns 坐标结果数组
   */
  async batchGeocoding(addresses: string[], city?: string): Promise<(LocationResult | null)[]> {
    // 由于并发限制，批量请求会自动排队处理
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
    try {
      // 标准化城市名称
      const normalizedCity = this.normalizeCityName(cityName);
      
      // 尝试多种城市名称格式
      const cityVariants = [
        normalizedCity,
        `${normalizedCity}市`,
        `${normalizedCity}市中心`,
        `${normalizedCity}市政府`
      ];
      
      for (const cityVariant of cityVariants) {
        try {
          const result = await this.geocoding(cityVariant);
          if (result && result.coordinates) {
            console.log(`成功获取城市中心坐标: ${cityName} → ${cityVariant} → ${result.coordinates}`);
            return result.coordinates;
          }
        } catch (error) {
          console.warn(`城市中心查询失败 ${cityVariant}:`, error);
          continue;
        }
      }
      
      console.warn(`无法获取城市中心坐标: ${cityName}`);
      return null;
    } catch (error) {
      console.error(`获取城市中心坐标时发生错误: ${cityName}`, error);
      return null;
    }
  }

  /**
   * 智能地址解析
   * 尝试从完整地址中提取有用信息
   * @param fullAddress 完整地址字符串
   * @param destination 目的地城市
   * @returns 解析结果
   */
  /**
   * 标准化城市名称
   * 确保城市名称格式适合地理编码
   */
  private normalizeCityName(cityName: string): string {
    // 移除常见的描述性词汇
    let normalized = cityName
      .replace(/市$/, '') // 移除"市"后缀，因为有些地方需要，有些不需要
      .replace(/省$/, '') // 移除"省"后缀
      .replace(/自治区$/, '') // 移除"自治区"后缀
      .replace(/特别行政区$/, '') // 移除"特别行政区"后缀
      .trim();
    
    // 对于常见城市的特殊处理
    const cityMappings: { [key: string]: string } = {
      '北京': '北京市',
      '上海': '上海市',
      '天津': '天津市',
      '重庆': '重庆市',
    };
    
    return cityMappings[normalized] || normalized;
  }

  async smartGeocode(fullAddress: string, destination: string): Promise<LocationResult | null> {
    const normalizedCity = this.normalizeCityName(destination);
    
    // 策略1: 先尝试完整地址 + 目标城市
    let result = await this.geocoding(fullAddress, normalizedCity);
    if (result) return result;

    // 策略2: 尝试"目标城市 + 地点名称"的明确组合
    const cityPrefixedAddress = `${normalizedCity}${fullAddress}`;
    result = await this.geocoding(cityPrefixedAddress);
    if (result) {
      console.log(`通过城市前缀成功定位: ${cityPrefixedAddress}`);
      return result;
    }

    // 策略3: 如果失败，尝试简化地址 + 目标城市
    const simplifiedAddress = this.simplifyAddress(fullAddress);
    if (simplifiedAddress !== fullAddress) {
      result = await this.geocoding(simplifiedAddress, normalizedCity);
      if (result) return result;
      
      // 尝试简化地址 + 城市前缀
      const simplifiedWithCity = `${normalizedCity}${simplifiedAddress}`;
      result = await this.geocoding(simplifiedWithCity);
      if (result) {
        console.log(`通过简化地址+城市前缀成功定位: ${simplifiedWithCity}`);
        return result;
      }
    }

    // 策略4: 最后尝试只用地名 + 目标城市
    const placeName = this.extractPlaceName(fullAddress);
    if (placeName) {
      result = await this.geocoding(placeName, normalizedCity);
      if (result) return result;
      
      // 尝试地名 + 城市前缀
      const placeWithCity = `${normalizedCity}${placeName}`;
      result = await this.geocoding(placeWithCity);
      if (result) {
        console.log(`通过地名+城市前缀成功定位: ${placeWithCity}`);
        return result;
      }
    }

    console.warn(`所有地理编码策略都失败了: ${fullAddress} (目标城市: ${normalizedCity})`);
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
      .replace(/推荐|必去|热门|著名|知名|网红|人气/g, '') // 移除推荐词汇
      .replace(/餐厅|饭店|酒楼|食府|大排档$/g, '') // 移除通用餐饮后缀（保留特色名称）
      .replace(/酒店|宾馆|旅馆|度假村$/g, '') // 移除通用住宿后缀
      .replace(/购物中心|商场|百货|广场$/g, '') // 移除通用购物后缀
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim();
  }

  /**
   * 提取地名
   * 从描述中提取可能的地名
   */
  private extractPlaceName(address: string): string | null {
    // 优先提取特色名称（餐厅、酒店等的主要名称部分）
    
    // 1. 提取餐厅特色名称（去掉通用后缀）
    const restaurantMatch = address.match(/([\u4e00-\u9fa5\w]{2,})(餐厅|饭店|酒楼|食府|大排档|海鲜|火锅|烧烤)/);
    if (restaurantMatch && restaurantMatch[1]) {
      return restaurantMatch[1];
    }
    
    // 2. 提取酒店特色名称
    const hotelMatch = address.match(/([\u4e00-\u9fa5\w]{2,})(酒店|宾馆|旅馆|度假村|大酒店)/);
    if (hotelMatch && hotelMatch[1]) {
      return hotelMatch[1];
    }
    
    // 3. 提取购物场所名称
    const shoppingMatch = address.match(/([\u4e00-\u9fa5\w]{2,})(购物中心|商场|百货|广场|商城)/);
    if (shoppingMatch && shoppingMatch[1]) {
      return shoppingMatch[1];
    }
    
    // 4. 通用中文词组提取（fallback）
    const matches = address.match(/[\u4e00-\u9fa5]{2,}/g);
    if (matches && matches.length > 0) {
      // 返回最长的中文词组（通常是主要名称）
      return matches.reduce((longest, current) => 
        current.length > longest.length ? current : longest
      );
    }
    
    return null;
  }

  /**
   * 获取当前速率限制状态（用于监控）
   */
  getRateLimitStatus() {
    const now = Date.now();
    const recentRequests = this.requestTimestamps.filter(
      timestamp => now - timestamp < 1000
    );
    
    return {
      recentRequestsCount: recentRequests.length,
      maxRequestsPerSecond: this.maxRequestsPerSecond,
      remainingRequests: Math.max(0, this.maxRequestsPerSecond - recentRequests.length),
      nextAvailableTime: recentRequests.length >= this.maxRequestsPerSecond 
        ? recentRequests[0] + 1000 
        : now,
    };
  }
}

// 创建单例实例
export const amapServiceServer = new AmapServiceServer();
