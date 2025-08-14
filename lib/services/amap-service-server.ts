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

interface AmapWeatherResponse {
  status: string;
  info: string;
  infocode: string;
  count: string;
  lives?: AmapWeatherLive[];
  forecasts?: AmapWeatherForecast[];
}

interface AmapWeatherLive {
  province: string;
  city: string;
  adcode: string;
  weather: string;
  temperature: string;
  winddirection: string;
  windpower: string;
  humidity: string;
  reporttime: string;
}

interface AmapWeatherForecast {
  city: string;
  adcode: string;
  province: string;
  reporttime: string;
  casts: AmapWeatherCast[];
}

interface AmapWeatherCast {
  date: string;
  week: string;
  dayweather: string;
  nightweather: string;
  daytemp: string;
  nighttemp: string;
  daywind: string;
  nightwind: string;
  daypower: string;
  nightpower: string;
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
    console.log('normalizedCity', normalizedCity)
    
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

  /**
   * 获取实时天气信息
   * @param city 城市名称
   * @returns 实时天气信息
   */
  async getLiveWeather(city: string): Promise<AmapWeatherLive | null> {
    if (!this.apiKey) {
      throw new Error('高德地图API密钥未配置');
    }

    return this.withRateLimit(async () => {
      try {
        const params = new URLSearchParams({
          key: this.apiKey,
          city: city,
          extensions: 'base',
          output: 'json',
        });

        const response = await fetch(`${this.baseUrl}/weather/weatherInfo?${params}`);
        
        if (!response.ok) {
          throw new Error(`高德天气API请求失败: ${response.status}`);
        }

        const data: AmapWeatherResponse = await response.json();

        if (data.status === '1' && data.lives && data.lives.length > 0) {
          return data.lives[0];
        } else {
          console.warn(`获取天气信息失败: ${city}`, data);
          return null;
        }
      } catch (error) {
        console.error('天气查询请求失败:', error);
        throw error;
      }
    });
  }

  /**
   * 获取天气预报信息
   * @param city 城市名称
   * @returns 4天天气预报信息
   */
  async getWeatherForecast(city: string): Promise<AmapWeatherForecast | null> {
    if (!this.apiKey) {
      throw new Error('高德地图API密钥未配置');
    }

    return this.withRateLimit(async () => {
      try {
        const params = new URLSearchParams({
          key: this.apiKey,
          city: city,
          extensions: 'all',
          output: 'json',
        });

        const response = await fetch(`${this.baseUrl}/weather/weatherInfo?${params}`);
        
        if (!response.ok) {
          throw new Error(`高德天气API请求失败: ${response.status}`);
        }

        const data: AmapWeatherResponse = await response.json();

        if (data.status === '1' && data.forecasts && data.forecasts.length > 0) {
          return data.forecasts[0];
        } else {
          console.warn(`获取天气预报失败: ${city}`, data);
          return null;
        }
      } catch (error) {
        console.error('天气预报查询失败:', error);
        throw error;
      }
    });
  }

  /**
   * 获取城市天气建议
   * @param city 城市名称
   * @returns 天气相关的旅行建议
   */
  async getWeatherAdvice(city: string): Promise<string> {
    try {
      const [liveWeather, forecast] = await Promise.all([
        this.getLiveWeather(city),
        this.getWeatherForecast(city)
      ]);

      if (!liveWeather && !forecast) {
        return `无法获取${city}的天气信息，建议出行前查看当地天气预报。`;
      }

      let advice = `📍 ${city}天气情况：\n\n`;
      
      if (liveWeather) {
        advice += `🌡️ 当前温度：${liveWeather.temperature}°C\n`;
        advice += `🌤️ 天气状况：${liveWeather.weather}\n`;
        advice += `💨 风向：${liveWeather.winddirection} ${liveWeather.windpower}级\n`;
        advice += `💧 湿度：${liveWeather.humidity}%\n`;
        advice += `⏰ 更新时间：${liveWeather.reporttime}\n\n`;
      }

      if (forecast && forecast.casts.length > 0) {
        advice += `📅 未来天气预报：\n`;
        forecast.casts.slice(0, 3).forEach((cast, index) => {
          const dayLabel = index === 0 ? '今天' : index === 1 ? '明天' : '后天';
          advice += `${dayLabel}：${cast.dayweather}转${cast.nightweather}，${cast.daytemp}°C~${cast.nighttemp}°C\n`;
        });
        advice += `\n`;
      }

      // 根据天气情况提供旅行建议
      if (liveWeather) {
        const temp = parseInt(liveWeather.temperature);
        const weather = liveWeather.weather;
        
        if (temp < 10) {
          advice += `❄️ 天气较冷，建议携带保暖衣物，注意防寒。`;
        } else if (temp > 30) {
          advice += `☀️ 天气炎热，建议携带防晒用品，注意防暑降温。`;
        } else {
          advice += `🌤️ 温度适宜，是出行的好天气。`;
        }

        if (weather.includes('雨')) {
          advice += `\n🌧️ 有雨，建议携带雨具，注意防滑。`;
        } else if (weather.includes('雪')) {
          advice += `\n❄️ 有雪，建议携带防滑鞋，注意保暖。`;
        } else if (weather.includes('雾') || weather.includes('霾')) {
          advice += `\n🌫️ 能见度较低，出行注意安全。`;
        } else if (weather.includes('晴')) {
          advice += `\n☀️ 天气晴朗，适合户外活动。`;
        }
      }

      return advice;
    } catch (error) {
      console.error('获取天气建议失败:', error);
      return `获取${city}天气信息时出现错误，建议出行前查看当地天气预报。`;
    }
  }

  /**
   * 获取城市天气建议（带日期信息）
   * @param city 城市名称
   * @param startDate 出发日期（可选）
   * @param duration 行程天数
   * @returns 天气相关的旅行建议
   */
  async getWeatherAdviceWithDates(city: string, startDate: string | null, duration: number): Promise<string> {
    try {
      // 计算实际的日期范围
      let actualStartDate: Date;
      let actualEndDate: Date;
      
      if (startDate) {
        // 如果用户指定了具体日期
        actualStartDate = new Date(startDate);
        if (isNaN(actualStartDate.getTime())) {
          // 如果日期解析失败，回退到当前日期
          actualStartDate = new Date();
        }
      } else {
        // 如果没有指定日期，从当前日期开始
        actualStartDate = new Date();
      }
      
      // 计算结束日期
      actualEndDate = new Date(actualStartDate);
      actualEndDate.setDate(actualEndDate.getDate() + duration - 1);
      
      // 格式化日期显示
      const formatDate = (date: Date) => {
        return `${date.getMonth() + 1}月${date.getDate()}日`;
      };
      
      const startDateStr = formatDate(actualStartDate);
      const endDateStr = formatDate(actualEndDate);
      
      // 获取天气信息
      const [liveWeather, forecast] = await Promise.all([
        this.getLiveWeather(city),
        this.getWeatherForecast(city)
      ]);

      if (!liveWeather && !forecast) {
        return `无法获取${city}的天气信息，建议出行前查看当地天气预报。`;
      }

      let advice = `📍 ${city}天气情况（${startDateStr} - ${endDateStr}）：\n\n`;
      
      if (liveWeather) {
        advice += `🌡️ 当前温度：${liveWeather.temperature}°C\n`;
        advice += `🌤️ 天气状况：${liveWeather.weather}\n`;
        advice += `💨 风向：${liveWeather.winddirection} ${liveWeather.windpower}级\n`;
        advice += `💧 湿度：${liveWeather.humidity}%\n`;
        advice += `⏰ 更新时间：${liveWeather.reporttime}\n\n`;
      }

      if (forecast && forecast.casts.length > 0) {
        advice += `📅 行程期间天气预报：\n`;
        
        // 根据行程日期筛选相关的天气预报
        const relevantForecasts = forecast.casts.filter((cast, index) => {
          if (startDate) {
            // 如果指定了出发日期，计算相对日期
            const forecastDate = new Date(actualStartDate);
            forecastDate.setDate(forecastDate.getDate() + index);
            return forecastDate <= actualEndDate;
          } else {
            // 如果没有指定日期，显示前3天
            return index < 3;
          }
        });
        
        relevantForecasts.forEach((cast, index) => {
          let dayLabel: string;
          if (startDate) {
            const forecastDate = new Date(actualStartDate);
            forecastDate.setDate(forecastDate.getDate() + index);
            dayLabel = formatDate(forecastDate);
          } else {
            dayLabel = index === 0 ? '今天' : index === 1 ? '明天' : '后天';
          }
          
          advice += `${dayLabel}：${cast.dayweather}转${cast.nightweather}，${cast.daytemp}°C~${cast.nighttemp}°C\n`;
        });
        advice += `\n`;
      }

      // 根据天气情况提供旅行建议
      if (liveWeather) {
        const temp = parseInt(liveWeather.temperature);
        const weather = liveWeather.weather;
        
        if (temp < 10) {
          advice += `❄️ 天气较冷，建议携带保暖衣物，注意防寒。`;
        } else if (temp > 30) {
          advice += `☀️ 天气炎热，建议携带防晒用品，注意防暑降温。`;
        } else {
          advice += `🌤️ 温度适宜，是出行的好天气。`;
        }

        if (weather.includes('雨')) {
          advice += `\n🌧️ 有雨，建议携带雨具，注意防滑。`;
        } else if (weather.includes('雪')) {
          advice += `\n❄️ 有雪，建议携带防滑鞋，注意保暖。`;
        } else if (weather.includes('雾') || weather.includes('霾')) {
          advice += `\n🌫️ 能见度较低，出行注意安全。`;
        } else if (weather.includes('晴')) {
          advice += `\n☀️ 天气晴朗，适合户外活动。`;
        }
      }

      // 添加行程日期相关的建议
      if (startDate) {
        advice += `\n📅 您的行程：${startDateStr} 出发，共${duration}天，到${endDateStr}结束。`;
      } else {
        advice += `\n📅 您的行程：从今天开始，共${duration}天。`;
      }

      return advice;
    } catch (error) {
      console.error('获取天气建议失败:', error);
      return `获取${city}天气信息时出现错误，建议出行前查看当地天气预报。`;
    }
  }
}

// 创建单例实例
export const amapServiceServer = new AmapServiceServer();
