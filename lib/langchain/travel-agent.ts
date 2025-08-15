import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { spawn } from "child_process";
import { TravelGuide } from "@/lib/mock-data";
import { XiaoHongShu } from "@/lib/api/xiaohongshu";
import { ProgressManager } from "@/lib/progress-manager";
import { amapServiceServer } from "@/lib/services/amap-service-server";
import { TravelGuideService } from "@/lib/services/travel-guide-service";
import { FirebaseTravelGuide } from "@/lib/firebase";
import { mcpToolsManager } from "@/lib/mcp/mcp-tools-manager";
import { amapMCPToolWrapper } from "@/lib/mcp/amap-direct-integration";

export interface TravelRequest {
  destination: string;
  duration: string;
  budget: string;
  interests: string[];
  travelStyle?: string;
  season?: string;
  groupSize?: number;
}

// 定义输出结构
const TravelGuideSchema = z.object({
  destination: z.string().max(20),
  duration: z.string(),
  budget: z.string().max(20),
  overview: z.string().max(100),
  highlights: z.array(z.string().max(30)).length(6),
  tips: z.array(z.string().max(30)).length(6)
});

const ItinerarySchema = z.object({
  days: z.array(z.object({
    day: z.number(),
    title: z.string(),
    activities: z.array(z.object({
      time: z.string(),
      name: z.string(),
      location: z.string(),
      description: z.string(),
      duration: z.string(),
      cost: z.string(),
      coordinates: z.array(z.number()).optional(), // [经度, 纬度]
      formattedAddress: z.string().optional(),
      city: z.string().optional(),
      district: z.string().optional(),
      transportation: z.object({
        from: z.string(),
        to: z.string(),
        method: z.string(),
        duration: z.string(),
        cost: z.string(),
        route: z.string(),
        tips: z.string()
      })
    })),
    meals: z.array(z.object({
      type: z.string(),
      name: z.string(),
      location: z.string(),
      cost: z.string(),
      description: z.string(),
      coordinates: z.array(z.number()).optional(), // [经度, 纬度]
      formattedAddress: z.string().optional(),
      city: z.string().optional(),
      district: z.string().optional(),
      transportation: z.object({
        from: z.string(),
        to: z.string(),
        method: z.string(),
        duration: z.string(),
        cost: z.string(),
        route: z.string(),
        tips: z.string()
      })
    }))
  }))
});

const LocationsSchema = z.object({
  locations: z.array(z.object({
    name: z.string().max(15),
    type: z.enum(["attraction", "restaurant", "hotel"]),
    description: z.string().max(40),
    day: z.number(),
    coordinates: z.array(z.number()).optional(), // [经度, 纬度]
    formattedAddress: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional()
  }))
});

const BudgetSchema = z.object({
  breakdown: z.array(z.object({
    category: z.string(),
    amount: z.number(),
    percentage: z.number(),
    color: z.string(),
    description: z.string()
  }))
});

export class LangChainTravelAgent {
  private llm: ChatOpenAI;
  private xiaohongshu = new XiaoHongShu();
  private outputParser = StructuredOutputParser.fromZodSchema(TravelGuideSchema);
  private itineraryParser = StructuredOutputParser.fromZodSchema(ItinerarySchema);
  private locationsParser = StructuredOutputParser.fromZodSchema(LocationsSchema);
  private budgetParser = StructuredOutputParser.fromZodSchema(BudgetSchema);

  /**
   * 获取可用的MCP工具
   */
  getAvailableMCPTools() {
    return mcpToolsManager.getToolNames();
  }

  /**
   * 使用MCP工具获取天气信息
   */
  async getWeatherWithMCP(city: string, date?: string): Promise<any> {
    try {
      const result = await mcpToolsManager.executeTool('get_weather', { city, date });
      return JSON.parse(result);
    } catch (error) {
      console.error('MCP天气工具调用失败:', error);
      return { success: false, error: '天气信息获取失败' };
    }
  }

  /**
   * 使用MCP工具进行地理编码
   */
  async geocodeWithMCP(address: string, city?: string): Promise<any> {
    try {
      const result = await mcpToolsManager.executeTool('geocode', { address, city });
      return JSON.parse(result);
    } catch (error) {
      console.error('MCP地理编码工具调用失败:', error);
      return { success: false, error: '地理编码失败' };
    }
  }

  /**
   * 使用MCP工具获取旅行天气建议
   */
  async getTravelWeatherAdviceWithMCP(destination: string, startDate?: string, duration?: number): Promise<any> {
    try {
      const result = await mcpToolsManager.executeTool('get_travel_weather_advice', { 
        destination, 
        startDate, 
        duration 
      });
      return JSON.parse(result);
    } catch (error) {
      console.error('MCP旅行天气建议工具调用失败:', error);
      return { success: false, error: '旅行天气建议获取失败' };
    }
  }

  // ==================== 高德地图MCP直接集成服务 ====================

  /**
   * 初始化高德地图MCP服务
   */
  async initializeAmapMCPService(): Promise<boolean> {
    try {
      await amapMCPToolWrapper.initialize();
      console.log('✅ 高德地图MCP服务初始化成功');
      return true;
    } catch (error) {
      console.error('❌ 高德地图MCP服务初始化失败:', error);
      return false;
    }
  }

  /**
   * 检查高德地图MCP服务状态
   */
  isAmapMCPServiceAvailable(): boolean {
    return amapMCPToolWrapper.isServerConnected();
  }

  /**
   * 关闭高德地图MCP服务
   */
  async closeAmapMCPService(): Promise<void> {
    try {
      await amapMCPToolWrapper.close();
      console.log('✅ 高德地图MCP服务已关闭');
    } catch (error) {
      console.error('❌ 关闭高德地图MCP服务失败:', error);
    }
  }

  /**
   * 智能路线规划（直接调用高德地图MCP服务）
   */
  async getSmartRoutePlanning(origin: string, destination: string, preferences?: {
    maxWalkingDistance?: number;
    preferPublicTransport?: boolean;
    avoidHighways?: boolean;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  }): Promise<any> {
    try {
      console.log('🚗 开始智能路线规划...');
      console.log('起点:', origin);
      console.log('终点:', destination);
      console.log('偏好设置:', preferences);

      const results: any = {
        driving: null,
        walking: null,
        transit: null,
        bicycling: null,
        recommendation: null
      };

      // 直接调用高德地图MCP服务
      const [driving, walking, transit, bicycling] = await Promise.allSettled([
        this.callAmapMCPService('maps_direction_driving', {
          origin,
          destination,
          strategy: '0',
          avoidHighways: preferences?.avoidHighways || false,
          avoidTolls: false
        }),
        
        this.callAmapMCPService('maps_direction_walking', {
          origin,
          destination,
          avoidHighways: preferences?.avoidHighways || false
        }),
        
        this.callAmapMCPService('maps_direction_transit_integrated', {
          origin,
          destination,
          city: '杭州',
          cityd: '杭州',
          strategy: '0',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('zh-CN', { hour12: false })
        }),
        
        this.callAmapMCPService('maps_bicycling', {
          origin,
          destination,
          avoidHighways: preferences?.avoidHighways || false
        })
      ]);

      console.log('✅ 高德地图MCP服务调用完成');

      // 处理结果
      if (driving.status === 'fulfilled' && driving.value) {
        results.driving = { success: true, data: driving.value, source: '高德地图MCP直接服务' };
      }
      if (walking.status === 'fulfilled' && walking.value) {
        results.walking = { success: true, data: walking.value, source: '高德地图MCP直接服务' };
      }
      if (transit.status === 'fulfilled' && transit.value) {
        results.transit = { success: true, data: transit.value, source: '高德地图MCP直接服务' };
      }
      if (bicycling.status === 'fulfilled' && bicycling.value) {
        results.bicycling = { success: true, data: bicycling.value, source: '高德地图MCP直接服务' };
      }

      // 智能推荐最佳出行方式
      results.recommendation = this.recommendBestRoute(results, preferences);

      return {
        success: true,
        data: results,
        source: '高德地图MCP智能路线规划'
      };

    } catch (error) {
      console.error('智能路线规划失败:', error);
      return { success: false, error: '智能路线规划失败', source: '高德地图MCP智能路线规划' };
    }
  }

  /**
   * 直接调用高德地图MCP服务
   */
  private async callAmapMCPService(toolName: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // 启动高德地图MCP服务器
      const mcpProcess = spawn('npx', ['@amap/amap-maps-mcp-server'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      // 处理输出
      mcpProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      // 处理错误
      mcpProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      // 处理进程结束
      mcpProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`MCP服务进程异常退出，代码: ${code}`));
          return;
        }

        try {
          // 解析输出
          const lines = output.trim().split('\n');
          for (const line of lines) {
            if (line.startsWith('{')) {
              try {
                const result = JSON.parse(line);
                if (result.jsonrpc === '2.0' && result.result) {
                  resolve(result.result);
                  return;
                }
              } catch (e) {
                // 忽略JSON解析错误
              }
            }
          }
          reject(new Error('未找到有效的MCP响应'));
        } catch (e) {
          reject(new Error('解析MCP响应失败'));
        }
      });

      // 发送请求
      const request = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params
        }
      };

      mcpProcess.stdin.write(JSON.stringify(request) + '\n');
      mcpProcess.stdin.end();

      // 设置超时
      setTimeout(() => {
        mcpProcess.kill();
        reject(new Error('MCP服务调用超时'));
      }, 10000);
    });
  }

  /**
   * 推荐最佳出行方式
   */
  private recommendBestRoute(results: any, preferences?: any): any {
    const recommendations = [];
    
    // 分析各种出行方式
    if (results.walking && results.walking.data) {
      const walkingData = results.walking.data;
      if (walkingData.route && walkingData.route.paths && walkingData.route.paths[0]) {
        const distance = parseInt(walkingData.route.paths[0].distance);
        if (distance <= (preferences?.maxWalkingDistance || 3000)) {
          recommendations.push({
            method: 'walking',
            reason: `步行距离适中 (${distance}米)`,
            priority: 1
          });
        }
      }
    }

    if (results.transit && results.transit.data) {
      recommendations.push({
        method: 'transit',
        reason: '公共交通环保经济',
        priority: 2
      });
    }

    if (results.bicycling && results.bicycling.data) {
      recommendations.push({
        method: 'bicycling',
        reason: '骑行健康环保',
        priority: 3
      });
    }

    if (results.driving && results.driving.data) {
      recommendations.push({
        method: 'driving',
        reason: '驾车便捷快速',
        priority: 4
      });
    }

    // 按优先级排序
    recommendations.sort((a, b) => a.priority - b.priority);
    
    return {
      bestOption: recommendations[0]?.method || 'unknown',
      allOptions: recommendations,
      reasoning: recommendations.map(r => r.reason).join('; ')
    };
  }

  constructor() {
    // 从环境变量获取OpenAI API密钥
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    this.llm = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 4000,
    });

    console.log('LangChainTravelAgent initialized with OpenAI capabilities');
  }

  async generateTravelGuideWithProgress(prompt: string, progressManager: ProgressManager): Promise<TravelGuide> {
    try {
      progressManager.startStep('analyze-prompt', '正在分析您的旅行需求...');
      await this.sleep(500);
      progressManager.completeStep('analyze-prompt', null, '需求分析完成');

      // 步骤1: 识别用户偏好的交通方式
      progressManager.startStep('identify-transport', '正在识别您的交通偏好...');
      const transportationMode = await this.identifyTransportationMode(prompt);
      progressManager.completeStep('identify-transport', transportationMode, `识别到交通方式：${transportationMode}`);

      // 步骤2: 从用户prompt提取关键词和预算信息
      progressManager.startStep('extract-keyword', '正在提取搜索关键词和预算信息...');
      const [keyword, userBudget] = await Promise.all([
        this.extractKeywordFromPrompt(prompt),
        this.extractBudgetFromPrompt(prompt)
      ]);
      progressManager.completeStep('extract-keyword', keyword, `提取关键词：${keyword}，预算信息：${userBudget || '未指定'}`);

      // 步骤3: 获取小红书相关内容分析和天气信息
      progressManager.startStep('fetch-insights', '正在联网搜索和获取天气信息...');
      const [xiaohongshuInsights, weatherInfo] = await Promise.all([
        this.getXiaohongshuInsights(keyword),
        this.getWeatherInfoForDestination(prompt)
      ]);
      
      // 记录MCP工具使用情况
      if (weatherInfo.source === 'MCP工具') {
        console.log('✅ 使用MCP工具获取天气信息成功');
        progressManager.completeStep('fetch-insights', xiaohongshuInsights, '联网搜索和天气信息获取完成 (MCP工具)');
      } else {
        console.log('ℹ️ 使用原有服务获取天气信息');
        progressManager.completeStep('fetch-insights', xiaohongshuInsights, '联网搜索和天气信息获取完成');
      }

      // 步骤4: 使用LangChain生成增强的旅行指南
      progressManager.startStep('generate-basic', '正在生成基础旅行信息...');
      const travelGuideData = await this.generateTravelGuideWithLangChain(
        prompt, 
        transportationMode, 
        userBudget, 
        xiaohongshuInsights, 
        weatherInfo
      );
      progressManager.completeStep('generate-basic', travelGuideData, '基础信息生成完成');

      // 步骤5: 构建完整的TravelGuide对象
      const travelGuide = await this.buildCompleteTravelGuide(
        travelGuideData, 
        prompt, 
        xiaohongshuInsights, 
        transportationMode, 
        progressManager, 
        userBudget, 
        weatherInfo
      );

      progressManager.startStep('finalize', '正在整合旅行指南...');
      await this.sleep(300);
      progressManager.completeStep('finalize', travelGuide, '旅行指南生成完成！');

      // 保存到数据库
      progressManager.startStep('save-database', '正在保存到数据库...');
      try {
        const firebaseTravelGuide: FirebaseTravelGuide = {
          prompt: prompt,
          destination: travelGuide.destination,
          duration: travelGuide.duration,
          budget: travelGuide.budget,
          overview: travelGuide.overview,
          highlights: travelGuide.highlights,
          tips: travelGuide.tips,
          itinerary: travelGuide.itinerary,
          map_locations: travelGuide.map_locations || [],
          budget_breakdown: travelGuide.budget_breakdown || [],
          transportation: transportationMode || '未知',
          user_id: undefined,
          is_public: true,
          title: travelGuide.title,
          weather_info: travelGuide.weather_info,
        };

        const { data: savedGuide, error } = await TravelGuideService.createTravelGuide(firebaseTravelGuide);
        if (error) {
          console.error('Error saving to database:', error);
          progressManager.completeStep('save-database', null, '数据库保存失败，但旅行指南已生成');
        } else {
          console.log('Travel guide saved to database with ID:', savedGuide?.id);
          progressManager.completeStep('save-database', savedGuide, '数据库保存成功');
        }
      } catch (dbError) {
        console.error('Exception saving to database:', dbError);
        progressManager.completeStep('save-database', null, '数据库保存异常，但旅行指南已生成');
      }

      return travelGuide;

    } catch (error) {
      console.error('Error generating travel guide from prompt:', error);
      throw new Error('生成旅行指南时出现错误，请稍后重试。');
    }
  }

  private async generateTravelGuideWithLangChain(
    prompt: string, 
    transportationMode: string, 
    userBudget: string | null, 
    xiaohongshuInsights: string, 
    weatherInfo: any
  ) {
    const formatInstructions = this.outputParser.getFormatInstructions();
    
    const travelGuidePrompt = PromptTemplate.fromTemplate(`
作为专业AI旅行专家，请结合用户需求、交通偏好、预算信息和小红书真实分享生成专业指南：

用户需求："{prompt}"
识别的交通方式：{transportationMode}
用户预算：{userBudget}

小红书真实用户经验分析：
{xiaohongshuInsights}

目的地天气信息：
{weatherInfo}

请结合用户需求、预算信息、小红书真实经验和天气情况，以JSON格式返回专业分析：

{formatInstructions}

请重点结合小红书用户的真实经验、用户的交通偏好、预算考虑和天气情况，提供专业和准确建议。
专业交通建议（请结合预算和天气考虑）：
- 自驾游：推荐自驾友好景点、停车便利地点、最佳自驾路线，考虑油费、停车费、过路费等成本
- 公共交通：优选地铁/公交便利景点、交通枢纽住宿、换乘优化，控制交通成本
- 骑行：推荐骑行友好路线、自行车租赁点、骑行安全提示，考虑租赁费用
- 步行：控制步行距离、推荐步行街区、徒步路线规划，节省交通费用
- 飞行：机场交通衔接、航班时间优化、行李寄存建议，考虑机票价格和机场交通成本
- 综合交通：多模式交通组合、最优换乘方案、灵活出行选择，平衡便利性和成本

重要：请严格返回有效的JSON格式，不要添加任何解释文字、markdown代码块或其他内容。确保JSON语法正确，所有字符串用双引号包围。
`);

    const chain = RunnableSequence.from([
      travelGuidePrompt,
      this.llm,
      new StringOutputParser(),
      this.outputParser
    ]);

    return await chain.invoke({
      prompt,
      transportationMode,
      userBudget: userBudget || '未指定',
      xiaohongshuInsights,
      weatherInfo: JSON.stringify(weatherInfo),
      formatInstructions
    });
  }

  private async buildCompleteTravelGuide(
    travelGuideData: any, 
    originalPrompt: string, 
    xiaohongshuInsights: string, 
    transportationMode: string, 
    progressManager: ProgressManager, 
    userBudget: string | null, 
    weatherInfo: any
  ): Promise<TravelGuide> {
    // 生成基础的旅行指南结构
    const travelGuide: TravelGuide = {
      title: `${this.truncateText(travelGuideData.destination || 'AI智能推荐', 20)}${travelGuideData.duration || '5天4夜'}攻略`,
      destination: this.truncateText(travelGuideData.destination || "AI智能推荐目的地", 20),
      duration: travelGuideData.duration || "5天4夜",
      budget: this.truncateText(travelGuideData.budget || "待确认预算范围", 20),
      overview: this.truncateText(travelGuideData.overview || "这是一份由AI智能生成的个性化旅行指南，为您提供全面的旅行规划建议，包含详细行程安排", 100),
      highlights: Array.isArray(travelGuideData.highlights) ? travelGuideData.highlights.map((h: string) => this.truncateText(h, 30)) : ['AI个性化智能推荐', '专业智能行程规划', '实用旅行建议指导'],
      itinerary: [],
      map_locations: [],
      budget_breakdown: [],
      tips: Array.isArray(travelGuideData.tips) ? travelGuideData.tips.map((t: string) => this.truncateText(t, 30)) : ['出行前请仔细检查签证要求和有效期', '建议购买合适的旅行保险保障安全', '密切关注当地天气变化情况'],
      weather_info: weatherInfo || undefined,
    };

    // 异步生成其他组件
    if (progressManager) {
      progressManager.startStep('generate-itinerary', '正在生成详细行程...');
    }
    travelGuide.itinerary = await this.generateItineraryWithLangChain(
      originalPrompt, 
      travelGuideData.duration || "5天4夜", 
      xiaohongshuInsights, 
      transportationMode
    );
    if (progressManager) {
      progressManager.completeStep('generate-itinerary', travelGuide.itinerary, '详细行程生成完成');

      progressManager.startStep('generate-locations', '正在生成重要地点...');
    }
    travelGuide.map_locations = await this.generateLocationsWithLangChain(
      travelGuideData.destination || "未知目的地", 
      originalPrompt
    );
    if (progressManager) {
      progressManager.completeStep('generate-locations', travelGuide.map_locations, '重要地点生成完成');

      progressManager.startStep('generate-budget', '正在生成预算明细...');
    }
    const finalBudget = userBudget || travelGuideData.budget || "待确认预算范围";
    travelGuide.budget_breakdown = await this.generateBudgetWithLangChain(
      finalBudget, 
      travelGuideData.destination || "未知目的地", 
      travelGuideData.duration || "5天4夜", 
      originalPrompt
    );
    if (progressManager) {
      progressManager.completeStep('generate-budget', travelGuide.budget_breakdown, '预算明细生成完成');
    }

    return travelGuide;
  }

  private async generateItineraryWithLangChain(
    originalPrompt: string, 
    duration: string, 
    xiaohongshuInsights: string, 
    transportationMode: string
  ): Promise<any[]> {
    const days = parseInt(duration.match(/(\d+)天/)?.[1] || '5');
    const formatInstructions = this.itineraryParser.getFormatInstructions();

    const itineraryPrompt = PromptTemplate.fromTemplate(`
生成{days}天旅行行程：

需求：{originalPrompt}
交通：{transportationMode}
参考：{xiaohongshuInsights}

{formatInstructions}

要求：
- 每天3-4个活动，3餐
- 根据{transportationMode}规划交通
- 名称<12字，描述<25字
- 只返回JSON，无其他文字
`);

    const chain = RunnableSequence.from([
      itineraryPrompt,
      this.llm,
      new StringOutputParser(),
      this.itineraryParser
    ]);

    try {
      const result = await chain.invoke({
        days,
        originalPrompt,
        transportationMode: transportationMode || '综合交通',
        xiaohongshuInsights: xiaohongshuInsights || '无',
        formatInstructions
      });
      
      const itinerary = result.days || [];
      
      // 为行程中的每个地点获取坐标
      const enrichedItinerary = await this.enrichItineraryWithCoordinates(itinerary, originalPrompt);
      
      return enrichedItinerary;
    } catch (error) {
      console.error('Error generating itinerary with LangChain:', error);
      return [];
    }
  }

  private async generateLocationsWithLangChain(destination: string, originalPrompt: string): Promise<any[]> {
    const formatInstructions = this.locationsParser.getFormatInstructions();

    const locationsPrompt = PromptTemplate.fromTemplate(`
作为专业旅行AI专家，请为{destination}推荐重要地点：

用户需求：{originalPrompt}

{formatInstructions}

请推荐5-8个精选重要地点，包括：
- 必去景点(attraction)：3-4个专业推荐
- 推荐餐厅(restaurant)：2-3个精选美食  
- 住宿推荐(hotel)：1-2个优质选择

注意：只需要提供地点名称，坐标将自动获取。只返回JSON格式，确保专业性和准确性。
`);

    const chain = RunnableSequence.from([
      locationsPrompt,
      this.llm,
      new StringOutputParser(),
      this.locationsParser
    ]);

    try {
      const result = await chain.invoke({
        destination,
        originalPrompt,
        formatInstructions
      });
      
      // 为每个地点自动获取坐标
      const locationsWithCoordinates = await this.enrichLocationsWithCoordinates(result.locations, destination);
      return locationsWithCoordinates;
    } catch (error) {
      console.error('Error generating locations with LangChain:', error);
      return await this.generateBasicLocations(destination);
    }
  }

  private async generateBudgetWithLangChain(
    budget: string, 
    destination: string, 
    duration: string, 
    originalPrompt: string
  ): Promise<any[]> {
    const formatInstructions = this.budgetParser.getFormatInstructions();

    const budgetPrompt = PromptTemplate.fromTemplate(`
为{destination}{duration}旅行生成预算明细：

用户需求：{originalPrompt}
总预算：{budget}

请基于目的地消费水平提供合理的预算分配建议。

{formatInstructions}

要求：
- 5个分类的百分比总和必须等于100
- 金额要合理，符合目的地消费水平
- 考虑目的地消费水平和旅行天数
- 只返回JSON，无其他文字
`);

    const chain = RunnableSequence.from([
      budgetPrompt,
      this.llm,
      new StringOutputParser(),
      this.budgetParser
    ]);

    try {
      const result = await chain.invoke({
        destination,
        duration,
        originalPrompt,
        budget,
        formatInstructions
      });
      return result.breakdown || [];
    } catch (error) {
      console.error('Error generating budget with LangChain:', error);
      return this.generateBasicBudget();
    }
  }



  private async getXiaohongshuInsights(keyword: string): Promise<string> {
    try {
      if (!keyword) return '';

      const notes = this.xiaohongshu.getNotesByKeyword(keyword);

      if (notes.length === 0) return '';

      // 取前5条笔记进行分析，避免内容过多
      const selectedNotes = notes.slice(0, 5);
      const notesContent = selectedNotes.join('\n\n---\n\n');

      // 使用LangChain分析小红书内容
      const analysisPrompt = PromptTemplate.fromTemplate(`
作为专业旅行分析师，请分析以下小红书旅行笔记：

{notesContent}

请从这些真实用户分享中提取专业总结：
1. 热门景点和推荐地点
2. 实用的美食推荐
3. 交通和住宿建议  
4. 实际旅行经验和注意事项
5. 预算参考信息

请用简洁专业的中文总结，重点突出实用性和真实性。
`);

      const chain = RunnableSequence.from([
        analysisPrompt,
        this.llm,
        new StringOutputParser()
      ]);

      const insights = await chain.invoke({ notesContent });
      return insights || '';

    } catch (error) {
      console.error('Error getting XiaoHongShu insights:', error);
      return '';
    }
  }

  private async getWeatherInfoForDestination(prompt: string): Promise<any> {
    let destination = '';
    let startDate: string | null = null;
    let duration = 0;
    
    try {
      // 从prompt中提取目的地城市、日期信息和行程天数
      const extractionPrompt = PromptTemplate.fromTemplate(`
从以下用户旅行需求中提取信息：

用户需求：{prompt}

请提取以下信息，以JSON格式返回：
1. destination: 目的地城市名称
2. startDate: 出发日期（如果用户指定了具体日期，如"3月15日出发"、"下周一去"等，返回具体日期；如果没有指定，返回null）
3. duration: 行程天数（如"3天"、"一周"等，转换为数字天数）

请分析用户的具体需求，提取真实信息，不要返回示例格式。

重要：请严格返回有效的JSON格式，不要添加任何解释文字、markdown代码块或其他内容。确保JSON语法正确，所有字符串用双引号包围。
`);

      const chain = RunnableSequence.from([
        extractionPrompt,
        this.llm,
        new StringOutputParser()
      ]);

      const response = await chain.invoke({ prompt });

      try {
        // 清理响应，移除可能的markdown代码块标记
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }
        
        const extractedData = JSON.parse(cleanResponse);
        destination = extractedData.destination || '';
        startDate = extractedData.startDate || null;
        duration = extractedData.duration || 0;
        
        console.log('Successfully extracted data:', { destination, startDate, duration });
      } catch (parseError) {
        console.warn('Failed to parse extracted data, falling back to simple extraction:', parseError);
        console.log('Raw response was:', response);
        
        // 如果JSON解析失败，回退到简单提取
        const simplePrompt = PromptTemplate.fromTemplate(`
从以下用户旅行需求中提取目的地城市名称：

用户需求：{prompt}

请提取用户要去的目的地城市名称，只返回城市名称，不要其他文字。
`);
        
        const simpleChain = RunnableSequence.from([
          simplePrompt,
          this.llm,
          new StringOutputParser()
        ]);
        
        try {
          destination = await simpleChain.invoke({ prompt });
          destination = destination.trim();
          console.log('Fallback extraction successful, destination:', destination);
        } catch (fallbackError) {
          console.error('Fallback extraction also failed:', fallbackError);
          // 最后的回退：尝试从prompt中简单匹配城市名
          destination = this.extractCityFromPrompt(prompt);
        }
      }
      
      if (!destination) {
        return '无法识别目的地，无法提供天气建议。';
      }

      // 优先使用MCP工具获取天气信息
      try {
        const mcpResult = await this.getTravelWeatherAdviceWithMCP(destination, startDate || undefined, duration);
        
        if (mcpResult.success) {
          return {
            destination,
            startDate: startDate || '未指定',
            duration: duration || '未指定',
            weather_info: {
              current_weather: '通过MCP工具获取',
              forecast: mcpResult.data.advice,
              recommendations: '建议出行前查看当地天气预报'
            },
            source: 'MCP工具'
          };
        }
      } catch (mcpError) {
        console.log('MCP工具调用失败，回退到原有服务:', mcpError);
      }

      // 如果MCP工具失败，使用原有的高德地图服务作为fallback
      const weatherAdvice = await amapServiceServer.getWeatherAdviceWithDates(destination, startDate, duration);
      
      // 解析天气建议文本，提取结构化数据
      const weatherData = this.parseWeatherAdviceToStructuredData(weatherAdvice, destination, startDate, duration);
      
      return weatherData;

    } catch (error) {
      console.error('Error getting weather advice:', error);
      return {
        current: {
          temperature: '',
          condition: '未知',
          humidity: '',
          windSpeed: '',
          windDirection: '',
          reportTime: ''
        },
        forecast: [],
        advice: '无法获取天气信息，建议出行前查看当地天气预报。',
        startDate: startDate || null,
        endDate: null,
        duration: duration
      };
    }
  }

  private async enrichLocationsWithCoordinates(locations: any[], destination: string): Promise<any[]> {
    const enrichedLocations = [];

    for (const location of locations) {
      const enrichedLocation = { ...location };

      // 如果没有坐标，尝试通过地理编码获取
      if (!location.coordinates) {
        try {
          const result = await amapServiceServer.smartGeocode(location.name, destination);
          if (result && result.coordinates) {
            enrichedLocation.coordinates = result.coordinates;
            console.log(`成功获取 ${location.name} 的坐标:`, result.coordinates);
          } else {
            console.warn(`无法获取 ${location.name} 的坐标`);
          }
        } catch (error) {
          console.error(`获取 ${location.name} 坐标失败:`, error);
        }
      }

      enrichedLocations.push(enrichedLocation);
    }

    return enrichedLocations;
  }

  /**
   * 为行程中的每个地点获取坐标信息
   */
  private async enrichItineraryWithCoordinates(itinerary: any[], destination: string): Promise<any[]> {
    const enrichedItinerary = [];

    for (const day of itinerary) {
      const enrichedDay = { ...day };
      
      // 为活动获取坐标
      if (day.activities && Array.isArray(day.activities)) {
        enrichedDay.activities = await Promise.all(
          day.activities.map(async (activity: any) => {
            const enrichedActivity = { ...activity };
            
            if (activity.location && !activity.coordinates) {
              try {
                console.log(`📍 正在获取活动地点坐标: ${activity.location}`);
                const result = await amapServiceServer.smartGeocode(activity.location, destination);
                if (result && result.coordinates) {
                  enrichedActivity.coordinates = result.coordinates;
                  enrichedActivity.formattedAddress = result.formatted_address;
                  enrichedActivity.city = result.city;
                  enrichedActivity.district = result.district;
                  console.log(`✅ 成功获取 ${activity.location} 的坐标:`, result.coordinates);
                } else {
                  console.warn(`⚠️ 无法获取 ${activity.location} 的坐标`);
                  enrichedActivity.coordinates = null;
                }
              } catch (error) {
                console.error(`❌ 获取 ${activity.location} 坐标失败:`, error);
                enrichedActivity.coordinates = null;
              }
            }
            
            return enrichedActivity;
          })
        );
      }
      
      // 为餐饮获取坐标
      if (day.meals && Array.isArray(day.meals)) {
        enrichedDay.meals = await Promise.all(
          day.meals.map(async (meal: any) => {
            const enrichedMeal = { ...meal };
            
            if (meal.location && !meal.coordinates) {
              try {
                console.log(`📍 正在获取餐厅坐标: ${meal.location}`);
                const result = await amapServiceServer.smartGeocode(meal.location, destination);
                if (result && result.coordinates) {
                  enrichedMeal.coordinates = result.coordinates;
                  enrichedMeal.formattedAddress = result.formatted_address;
                  enrichedMeal.city = result.city;
                  enrichedMeal.district = result.district;
                  console.log(`✅ 成功获取 ${meal.location} 的坐标:`, result.coordinates);
                } else {
                  console.warn(`⚠️ 无法获取 ${meal.location} 的坐标`);
                  enrichedMeal.coordinates = null;
                }
              } catch (error) {
                console.error(`❌ 获取 ${meal.location} 坐标失败:`, error);
                enrichedMeal.coordinates = null;
              }
            }
            
            return enrichedMeal;
          })
        );
      }
      
      enrichedItinerary.push(enrichedDay);
    }

    console.log(`🎯 行程坐标获取完成，共处理 ${enrichedItinerary.length} 天`);
    return enrichedItinerary;
  }

  private async generateBasicLocations(destination: string): Promise<any[]> {
    const basicLocations = [
      {
        name: `${destination}核心景区`,
        type: "attraction",
        description: "AI推荐的必游核心景点",
        day: 1
      },
      {
        name: `${destination}特色餐厅`,
        type: "restaurant",
        description: "AI推荐的当地特色美食",
        day: 1
      },
      {
        name: `${destination}精选酒店`,
        type: "hotel",
        description: "AI推荐的优质住宿",
        day: 1
      }
    ];

    // 为基础地点也尝试获取坐标
    return await this.enrichLocationsWithCoordinates(basicLocations, destination);
  }

  private generateBasicBudget(): any[] {
    return [
      { category: "交通费用", amount: 4500, percentage: 30, color: "#3b82f6" },
      { category: "住宿费用", amount: 4200, percentage: 28, color: "#8b5cf6" },
      { category: "餐饮费用", amount: 3600, percentage: 24, color: "#10b981" },
      { category: "门票娱乐", amount: 1800, percentage: 12, color: "#f59e0b" },
      { category: "购物其他", amount: 900, percentage: 6, color: "#ef4444" },
    ];
  }

  private async identifyTransportationMode(prompt: string): Promise<string> {
    const transportPrompt = PromptTemplate.fromTemplate(`
分析以下用户旅行需求，识别用户偏好的交通方式：

用户需求："{prompt}"

请分析用户可能的交通偏好，从以下选项中选择最合适的：
- 自驾游：用户提到开车、自驾、租车等
- 公共交通：用户提到地铁、公交、火车、高铁等
- 飞行：用户提到飞机、航班等
- 骑行：用户提到骑车、单车、自行车等
- 步行：用户提到徒步、走路、步行等
- 综合交通：用户没有明确偏好或需要多种交通方式

只返回一个交通方式，如："自驾游"、"公共交通"、"飞行"、"骑行"、"步行"或"综合交通"
`);

    const chain = RunnableSequence.from([
      transportPrompt,
      this.llm,
      new StringOutputParser()
    ]);

    try {
      const transportMode = await chain.invoke({ prompt });
      return transportMode.trim() || '综合交通';
    } catch (error) {
      console.error('Error identifying transportation mode:', error);
      return '综合交通';
    }
  }

  private async extractKeywordFromPrompt(prompt: string): Promise<string> {
    const keywordPrompt = PromptTemplate.fromTemplate(`
从以下用户旅行需求中提取最核心的搜索关键词：

用户需求："{prompt}"

请分析用户需求，提取1-2个最重要的关键词，用于搜索小红书旅行笔记。
关键词应该包含：目的地名称、旅行类型或兴趣点。

只返回关键词，不要其他文字。例如："京都樱花"、"成都美食"、"三亚海滩"
`);

    const chain = RunnableSequence.from([
      keywordPrompt,
      this.llm,
      new StringOutputParser()
    ]);

    try {
      const keyword = await chain.invoke({ prompt });
      return keyword.trim() || '';
    } catch (error) {
      console.error('Error extracting keyword:', error);
      return '旅行攻略';
    }
  }

  private async extractBudgetFromPrompt(prompt: string): Promise<string | null> {
    const budgetPrompt = PromptTemplate.fromTemplate(`
从以下用户旅行需求中提取预算相关信息：

用户需求："{prompt}"

请分析用户是否提到了预算、费用、价格等相关信息。如果提到了，请提取具体的预算金额或预算范围。
如果没有提到预算信息，请返回"未指定预算"。

只返回预算信息，不要其他文字。例如："5000元"、"1-2万"、"经济型"、"高端奢华"等。
`);

    const chain = RunnableSequence.from([
      budgetPrompt,
      this.llm,
      new StringOutputParser()
    ]);

    try {
      const budget = await chain.invoke({ prompt });
      const trimmedBudget = budget.trim();
      return trimmedBudget === '未指定预算' ? null : trimmedBudget;
    } catch (error) {
      console.error('Error extracting budget:', error);
      return null;
    }
  }

  /**
   * 从prompt中简单提取城市名称（最后的回退方法）
   */
  private extractCityFromPrompt(prompt: string): string {
    // 常见城市名称列表
    const cities = [
      '北京', '上海', '广州', '深圳', '杭州', '南京', '苏州', '成都', '重庆', '西安',
      '武汉', '长沙', '青岛', '大连', '厦门', '三亚', '丽江', '大理', '桂林', '张家界',
      '黄山', '九寨沟', '敦煌', '拉萨', '乌鲁木齐', '哈尔滨', '长春', '沈阳', '天津',
      '济南', '郑州', '合肥', '南昌', '福州', '南宁', '海口', '贵阳', '昆明', '兰州',
      '西宁', '银川', '呼和浩特', '太原', '石家庄', '唐山', '秦皇岛', '邯郸', '邢台',
      '保定', '张家口', '承德', '沧州', '廊坊', '衡水', '雄安', '香港', '澳门', '台北',
      '东京', '大阪', '京都', '横滨', '名古屋', '神户', '福冈', '札幌', '仙台', '广岛',
      '纽约', '洛杉矶', '芝加哥', '休斯顿', '费城', '凤凰城', '圣安东尼奥', '圣地亚哥',
      '达拉斯', '圣何塞', '伦敦', '巴黎', '柏林', '罗马', '马德里', '阿姆斯特丹',
      '布鲁塞尔', '维也纳', '苏黎世', '斯德哥尔摩', '哥本哈根', '奥斯陆', '赫尔辛基'
    ];

    // 在prompt中查找城市名称
    for (const city of cities) {
      if (prompt.includes(city)) {
        console.log(`Found city "${city}" in prompt using fallback method`);
        return city;
      }
    }

    // 如果没有找到，返回默认值
    console.log('No city found in prompt, using default');
    return '未知目的地';
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === 增强功能 ===

  async optimizeItinerary(request: {
    destination: string;
    currentItinerary: any[];
    feedback: string;
    preferences: string[];
  }) {
    const { destination, currentItinerary, feedback, preferences } = request;

    const prompt = PromptTemplate.fromTemplate(`
请优化以下旅行行程：

目的地：{destination}
当前行程：{currentItinerary}
用户反馈：{feedback}
用户偏好：{preferences}

请分析当前行程的问题，并提供优化建议。使用你的工具来获取更好的活动安排、预算分配和文化体验建议。
`);

    try {
      const chain = RunnableSequence.from([
        prompt,
        this.llm,
        new StringOutputParser()
      ]);

      const result = await chain.invoke({
        destination,
        currentItinerary: JSON.stringify(currentItinerary, null, 2),
        feedback,
        preferences: preferences.join(', ')
      });

      return result || '优化行程时出现错误';
    } catch (error) {
      console.error('Itinerary optimization error:', error);
      throw new Error('优化行程时出现错误，请稍后重试。');
    }
  }

  async getDestinationInsights(destination: string, interests: string[] = []) {
    const prompt = PromptTemplate.fromTemplate(`
请为{destination}提供全面的目的地洞察：

用户兴趣：{interests}

请使用你的工具来获取：
1. 详细的文化信息和当地习俗
2. 天气状况和最佳旅行时间
3. 推荐的文化体验和活动
4. 安全注意事项和实用建议

请整合这些信息，为用户提供一个全面的目的地指南。
`);

    try {
      const chain = RunnableSequence.from([
        prompt,
        this.llm,
        new StringOutputParser()
      ]);

      const result = await chain.invoke({
        destination,
        interests: interests.join(', ') || '一般旅游'
      });

      return result || '获取目的地信息时出现错误';
    } catch (error) {
      console.error('Destination insights error:', error);
      throw new Error('获取目的地信息时出现错误，请稍后重试。');
    }
  }

  async getBudgetAdvice(request: {
    destination: string;
    duration: string;
    currentBudget: string;
    travelStyle: string;
    groupSize?: number;
  }) {
    const { destination, duration, currentBudget, travelStyle, groupSize = 1 } = request;

    const prompt = PromptTemplate.fromTemplate(`
请为以下旅行提供详细的预算建议：

- 目的地：{destination}
- 时长：{duration}
- 当前预算：{currentBudget}
- 旅行风格：{travelStyle}
- 人数：{groupSize}人

请使用预算分析工具，提供：
1. 详细的费用分解和分配建议
2. 实用的省钱技巧
3. 预算优化建议
4. 应急资金规划
`);

    try {
      const chain = RunnableSequence.from([
        prompt,
        this.llm,
        new StringOutputParser()
      ]);

      const result = await chain.invoke({
        destination,
        duration,
        currentBudget,
        travelStyle,
        groupSize
      });

      return result || '获取预算建议时出现错误';
    } catch (error) {
      console.error('Budget advice error:', error);
      throw new Error('获取预算建议时出现错误，请稍后重试。');
    }
  }

  // 添加记忆功能的方法
  async rememberUserPreferences(userId: string, preferences: {
    favoriteDestinations?: string[];
    budgetRange?: string;
    travelStyle?: string;
    interests?: string[];
    dietaryRestrictions?: string[];
    accessibility?: string[];
  }) {
    // 这里可以集成LangChain的记忆功能
    // 暂时用简单的存储方式
    const userMemory = {
      userId,
      preferences,
      lastUpdated: new Date().toISOString(),
    };

    console.log('User preferences saved:', userMemory);
    return userMemory;
  }

  async getUserPreferences(userId: string) {
    // 从存储中获取用户偏好
    return null;
  }

  /**
   * 解析天气建议文本为结构化数据
   */
  private parseWeatherAdviceToStructuredData(weatherAdvice: string, destination: string, startDate: string | null, duration: number): any {
    try {
      const lines = weatherAdvice.split('\n');
      
      // 提取当前天气信息
      const current = {
        temperature: '',
        condition: '',
        humidity: '',
        windSpeed: '',
        windDirection: '',
        reportTime: ''
      };

      lines.forEach(line => {
        if (line.includes('当前温度：')) {
          current.temperature = line.split('：')[1].replace('°C', '');
        } else if (line.includes('天气状况：')) {
          current.condition = line.split('：')[1];
        } else if (line.includes('湿度：')) {
          current.humidity = line.split('：')[1].replace('%', '');
        } else if (line.includes('风向：')) {
          const windInfo = line.split('：')[1];
          current.windDirection = windInfo.split(' ')[0];
          current.windSpeed = windInfo.split(' ')[1].replace('级', '');
        } else if (line.includes('更新时间：')) {
          current.reportTime = line.split('：')[1];
        }
      });

      // 提取预报信息
      const forecast: any[] = [];
      let currentDate = startDate ? new Date(startDate) : new Date();
      
      lines.forEach((line, index) => {
        if (line.includes('：') && (line.includes('转') || line.includes('°C'))) {
          const parts = line.split('：');
          if (parts.length >= 2) {
            const dayLabel = parts[0];
            const weatherInfo = parts[1];
            
            let dayWeather = '';
            let nightWeather = '';
            let dayTemp = '';
            let nightTemp = '';
            
            if (weatherInfo.includes('转')) {
              const [day, temp] = weatherInfo.split('，');
              dayWeather = day || '';
              nightWeather = day.includes('转') ? day.split('转')[1] : day;
              
              if (temp && temp.includes('°C')) {
                const tempParts = temp.split('°C');
                dayTemp = tempParts[0] || '';
                nightTemp = tempParts[1] || '';
              }
            } else {
              dayWeather = weatherInfo;
            }
            
            // 计算具体日期
            let forecastDate: Date;
            if (dayLabel === '今天') {
              forecastDate = new Date(currentDate);
            } else if (dayLabel === '明天') {
              forecastDate = new Date(currentDate);
              forecastDate.setDate(forecastDate.getDate() + 1);
            } else if (dayLabel === '后天') {
              forecastDate = new Date(currentDate);
              forecastDate.setDate(forecastDate.getDate() + 2);
            } else {
              // 如果是具体日期，尝试解析
              forecastDate = new Date(currentDate);
              forecastDate.setDate(forecastDate.getDate() + index);
            }
            
            // 格式化日期为 YYYY-MM-DD 和可读格式
            const dateString = forecastDate.toISOString().split('T')[0];
            const readableDate = `${forecastDate.getMonth() + 1}月${forecastDate.getDate()}日`;
            const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][forecastDate.getDay()];
            
            forecast.push({
              date: dateString,
              readableDate: readableDate,
              week: weekDay,
              dayWeather: dayWeather,
              nightWeather: nightWeather,
              dayTemp: dayTemp,
              nightTemp: nightTemp,
              dayWind: '',
              nightWind: '',
              dayPower: '',
              nightPower: ''
            });
          }
        }
      });

      // 计算结束日期
      let endDate = null;
      if (startDate) {
        const endDateObj = new Date(startDate);
        endDateObj.setDate(endDateObj.getDate() + duration - 1);
        endDate = `${endDateObj.getMonth() + 1}月${endDateObj.getDate()}日`;
      }

      return {
        current,
        forecast,
        advice: weatherAdvice,
        startDate: startDate,
        endDate: endDate,
        duration: duration
      };
    } catch (error) {
      console.error('Error parsing weather advice:', error);
      return {
        current: {
          temperature: '',
          condition: '解析失败',
          humidity: '',
          windSpeed: '',
          windDirection: '',
          reportTime: ''
        },
        forecast: [],
        advice: weatherAdvice,
        startDate: startDate,
        endDate: null,
        duration: duration
      };
    }
  }
}

export const langChainTravelAgent = new LangChainTravelAgent();
