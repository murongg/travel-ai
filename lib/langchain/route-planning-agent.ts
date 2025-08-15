import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { amapServiceServer } from '@/lib/services/amap-service-server';

export interface RoutePlanningRequest {
  itinerary: any[];
  destination: string;
  preferences?: {
    maxWalkingDistance?: number;
    preferPublicTransport?: boolean;
    avoidHighways?: boolean;
    timeOfDay?: string;
  };
}

export interface RoutePlanningResult {
  dailyRoutes: any[];
  summary: any;
}

export class RoutePlanningAgent {
  private llm: ChatOpenAI;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.1,
      maxTokens: 2000
    });
  }

  /**
   * 主入口：规划路线
   */
  async planRoutes(request: RoutePlanningRequest): Promise<RoutePlanningResult> {
    try {
      console.log('🚀 开始AI智能路线规划...');
      console.log('目的地:', request.destination);
      console.log('行程天数:', request.itinerary.length);

      // 1. AI分析itinerary，提取需要路线规划的地点
      const analysis = await this.analyzeItineraryLocations(request);
      console.log('AI分析结果:', analysis);

      // 2. 为每天生成地点坐标
      const dailyRoutes = [];
      for (const day of request.itinerary) {
        const dayLocations = day.activities?.map((activity: any) => activity.location) || [];
        
        if (dayLocations.length === 0) {
          console.log('当天无地点，跳过坐标生成');
          continue;
        }

        // 生成当天的地点坐标
        const dayRoute = await this.generateDayRoute(
          dayLocations,
          day,
          request.preferences,
          request.destination
        );

        dailyRoutes.push(dayRoute);
      }

      // 3. 生成总体总结和推荐
      const summary = await this.generateRouteSummary(dailyRoutes, request);

      const result: RoutePlanningResult = {
        dailyRoutes,
        summary
      };

      console.log('✅ 地点坐标生成完成');
      return result;

    } catch (error) {
      console.error('❌ 地点坐标生成失败:', error);
      throw new Error(`地点坐标生成失败: ${error}`);
    }
  }

  /**
   * AI分析itinerary，提取需要路线规划的地点
   */
  private async analyzeItineraryLocations(request: RoutePlanningRequest): Promise<any> {
    const prompt = PromptTemplate.fromTemplate(`
你是一个专业的旅行路线规划专家。请分析以下旅行行程，提取需要路线规划的关键信息：

目的地：{destination}
行程：{itinerary}

请分析：
1. 每天的主要活动地点
2. 地点之间的逻辑顺序
3. 需要路线规划的关键路径
4. 可能的交通方式选择

请以JSON格式返回分析结果，包含每天的地点序列和路线规划建议。
`);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    const analysis = await chain.invoke({
      destination: request.destination,
      itinerary: JSON.stringify(request.itinerary, null, 2)
    });

    try {
      return JSON.parse(analysis);
    } catch (e) {
      console.log('AI分析结果解析失败，使用默认分析');
      return this.defaultLocationAnalysis(request.itinerary);
    }
  }

  /**
   * 默认地点分析（fallback）
   */
  private defaultLocationAnalysis(itinerary: any[]): any {
    return {
      dailyLocations: itinerary.map(day => ({
        day: day.day,
        locations: day.activities.map((activity: any) => activity.location)
      }))
    };
  }

  /**
   * 生成单天的地点坐标
   */
  private async generateDayRoute(
    locations: string[],
    dayInfo: any,
    preferences: any,
    destination: string
  ): Promise<any> {
    try {
      console.log(`📍 生成第${dayInfo.day}天地点坐标...`);

      // 处理单点行程
      if (locations.length === 1) {
        return {
          day: dayInfo.day,
          title: dayInfo.title,
          locations: locations,
          coordinates: [],
          locationDetails: [],
          waypoints: [],
          totalDistance: '0米',
          totalDuration: '0分钟',
          recommendations: ['单点行程，无需路线规划']
        };
      }
      
      const waypoints = locations.slice(1, -1);

      // 为所有地点进行地理编码，获取坐标
      const geocodePromises = locations.map(location => 
        this.callAmapMCPService('maps_geo', {
          address: location,
          city: destination
        })
      );
      
      const geocodeResults = await Promise.allSettled(geocodePromises);
      
      // 解析坐标结果
      const coordinates: string[] = [];
      const locationDetails: any[] = [];
      
      for (let i = 0; i < geocodeResults.length; i++) {
        const result = geocodeResults[i];
        if (result.status === 'fulfilled' && result.value) {
          try {
            const geoData = JSON.parse(result.value.content[0].text);
            if (geoData.return && geoData.return.length > 0) {
              // 对于常见地名，优先选择目标城市的坐标
              let bestLocation = geoData.return[0];
              
              // 如果是"白堤"这样的常见地名，优先选择目标城市的结果
              if (locations[i] === '白堤' && destination === '杭州') {
                const hangzhouResult = geoData.return.find((loc: any) => 
                  loc.city === '杭州市' || loc.province === '浙江省'
                );
                if (hangzhouResult) {
                  bestLocation = hangzhouResult;
                  console.log(`为"白堤"选择了杭州的坐标: ${bestLocation.location}`);
                }
              }
              
              if (bestLocation.location) {
                const coord = bestLocation.location;
                coordinates.push(coord);
                locationDetails.push({
                  name: locations[i],
                  coordinate: coord,
                  address: bestLocation,
                  index: i
                });
              } else {
                coordinates.push('');
                locationDetails.push({
                  name: locations[i],
                  coordinate: '',
                  address: null,
                  index: i
                });
              }
            } else {
              coordinates.push('');
              locationDetails.push({
                name: locations[i],
                coordinate: '',
                address: null,
                index: i
              });
            }
          } catch (e) {
            console.log(`解析第${i + 1}个地点地理编码结果失败:`, e instanceof Error ? e.message : '未知错误');
            coordinates.push('');
            locationDetails.push({
              name: locations[i],
              coordinate: '',
              address: null,
              index: i
            });
          }
        } else {
          coordinates.push('');
          locationDetails.push({
            name: locations[i],
            coordinate: '',
            address: null,
            index: i
          });
        }
      }
      
      // 生成推荐
      const recommendations = this.generateLocationRecommendations(locationDetails, preferences);

      return {
        day: dayInfo.day,
        title: dayInfo.title,
        locations: locations,
        coordinates: coordinates,
        locationDetails: locationDetails,
        waypoints,
        totalDistance: '需要在地图上计算',
        totalDuration: '需要在地图上计算',
        recommendations
      };

    } catch (error) {
      console.error(`第${dayInfo.day}天地点坐标生成失败:`, error);
      return {
        day: dayInfo.day,
        title: dayInfo.title,
        locations: [],
        coordinates: [],
        locationDetails: [],
        waypoints: [],
        totalDistance: '未知',
        totalDuration: '未知',
        recommendations: ['地点坐标生成失败，请手动输入']
      };
    }
  }

  /**
   * 生成地点推荐
   */
  private generateLocationRecommendations(locationDetails: any[], preferences: any): string[] {
    const recommendations = [];
    
    // 检查是否有有效的坐标
    const validCoordinates = locationDetails.filter(loc => loc.coordinate);
    if (validCoordinates.length > 1) {
      recommendations.push('已获取地点坐标，可在地图上显示路线');
    } else if (validCoordinates.length === 1) {
      recommendations.push('单点行程，无需路线规划');
    } else {
      recommendations.push('无法获取地点坐标，请检查地点名称');
    }
    
    if (preferences?.preferPublicTransport) {
      recommendations.push('建议使用公共交通');
    }
    
    return recommendations.length > 0 ? recommendations : ['根据实际情况选择出行方式'];
  }

  /**
   * 生成路线规划总结
   */
  private async generateRouteSummary(dailyRoutes: any[], request: RoutePlanningRequest): Promise<any> {
    const prompt = PromptTemplate.fromTemplate(`
基于以下每日地点坐标结果，生成一个智能总结：

每日地点：{dailyRoutes}
用户偏好：{preferences}
目的地：{destination}

请分析：
1. 地点分布情况
2. 行程安排合理性
3. 交通建议
4. 实用建议

请以JSON格式返回，包含locationAnalysis、transportationAdvice、practicalTips等字段。
`);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    try {
      const summary = await chain.invoke({
        dailyRoutes: JSON.stringify(dailyRoutes, null, 2),
        preferences: JSON.stringify(request.preferences, null, 2),
        destination: request.destination
      });

      // 尝试提取JSON内容
      const jsonMatch = summary.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // 如果无法提取JSON，返回默认值
      return {
        locationAnalysis: '地点分布合理',
        transportationAdvice: '根据实际情况选择',
        practicalTips: ['建议提前规划路线', '关注实时交通信息']
      };
    } catch (error) {
      console.error('生成总结失败:', error);
      return {
        locationAnalysis: '地点分布合理',
        transportationAdvice: '根据实际情况选择',
        practicalTips: ['建议提前规划路线', '关注实时交通信息']
      };
    }
  }

  /**
   * 直接调用高德地图地理编码服务
   */
  private async callAmapMCPService(toolName: string, params: any): Promise<any> {
    try {
      if (toolName === 'maps_geo') {
        const { address, city } = params;
        console.log(`📍 地理编码: ${address} (城市: ${city})`);
        
        // 使用现有的 amapServiceServer 进行地理编码
        const result = await amapServiceServer.smartGeocode(address, city);
        
        if (result && result.coordinates) {
          // 构造与 MCP 服务兼容的响应格式
          return {
            content: [{
              text: JSON.stringify({
                return: [{
                  location: `${result.coordinates[0]},${result.coordinates[1]}`,
                  city: result.city || city,
                  district: result.district || '',
                  formatted_address: result.formatted_address || address
                }]
              })
            }]
          };
        } else {
          console.warn(`地理编码失败: ${address}`);
          return {
            content: [{
              text: JSON.stringify({
                return: []
              })
            }]
          };
        }
      } else {
        console.warn(`不支持的工具: ${toolName}`);
        return {
          content: [{
            text: JSON.stringify({
              return: []
            })
          }]
        };
      }
    } catch (error) {
      console.error(`地理编码服务调用失败: ${error}`);
      return {
        content: [{
          text: JSON.stringify({
            return: []
          })
        }]
      };
    }
  }
}
