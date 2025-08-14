import { aiModel } from "./common";
import { TravelGuide, BudgetItem } from "@/lib/mock-data";
import { XiaoHongShu } from "@/lib/api/xiaohongshu";
import { ProgressManager } from "@/lib/progress-manager";
import { amapServiceServer } from "@/lib/services/amap-service-server";
import { TravelGuideService } from "@/lib/services/travel-guide-service";
import { SupabaseTravelGuide } from "@/lib/supabase";

export interface TravelRequest {
  destination: string;
  duration: string;
  budget: string;
  interests: string[];
  travelStyle?: string;
  season?: string;
  groupSize?: number;
}

export class TravelAgent {
  private xiaohongshu = new XiaoHongShu();

  constructor() {
    console.log('TravelAgent initialized with AI capabilities');
  }

  async generateTravelGuideWithProgress(prompt: string, progressManager: ProgressManager): Promise<TravelGuide> {
    try {
      progressManager.startStep('analyze-prompt', '正在分析您的旅行需求...');
      await this.sleep(500); // 模拟分析时间
      progressManager.completeStep('analyze-prompt', null, '需求分析完成');

      // 步骤1: 识别用户偏好的交通方式
      progressManager.startStep('identify-transport', '正在识别您的交通偏好...');
      const transportationMode = await this.identifyTransportationMode(prompt);
      progressManager.completeStep('identify-transport', transportationMode, `识别到交通方式：${transportationMode}`);

      // 步骤2: 从用户prompt提取关键词和预算信息
      progressManager.startStep('extract-keyword', '正在提取搜索关键词和预算信息...');
      const keyword = await this.extractKeywordFromPrompt(prompt);
      const userBudget = await this.extractBudgetFromPrompt(prompt);
      progressManager.completeStep('extract-keyword', keyword, `提取关键词：${keyword}，预算信息：${userBudget || '未指定'}`);

      // 步骤3: 获取小红书相关内容分析
      progressManager.startStep('fetch-insights', '正在联网搜索...');
      const xiaohongshuInsights = await this.getXiaohongshuInsights(keyword);
      progressManager.completeStep('fetch-insights', xiaohongshuInsights, '联网搜索完成');

      // 步骤4: 结合小红书数据和交通方式生成增强的旅行指南
      progressManager.startStep('generate-basic', '正在生成基础旅行信息...');
      const enhancedPrompt = `作为专业AI旅行专家，请结合用户需求、交通偏好、预算信息和小红书真实分享生成专业指南：

用户需求："${prompt}"
识别的交通方式：${transportationMode}
${userBudget ? `用户预算：${userBudget}` : '用户预算：未指定'}

小红书真实用户经验分析：
${xiaohongshuInsights}

请结合用户需求、预算信息和小红书真实经验，以JSON格式返回专业分析：
{
  "destination": "目的地城市名称（如：北京、上海、东京、巴黎等，不超过20个字）",
  "duration": "X天Y夜",
  "budget": "${userBudget ? `基于用户预算${userBudget}的优化建议（不超过20个字）` : '基于真实经验的预算建议（不超过20个字）'}",
  "overview": "结合真实用户经验和预算考虑的专业概述（不超过100字）",
  "highlights": ["结合小红书的亮点1（不超过30字）", "亮点2", "亮点3", "亮点4", "亮点5", "亮点6"],
  "tips": ["基于真实用户经验和预算考虑的专业建议1（不超过30字）", "建议2", "建议3", "建议4", "建议5", "建议6"]
}

请重点结合小红书用户的真实经验、用户的交通偏好和预算考虑，提供专业和准确建议。
专业交通建议（请结合预算考虑）：
- 自驾游：推荐自驾友好景点、停车便利地点、最佳自驾路线，考虑油费、停车费、过路费等成本
- 公共交通：优选地铁/公交便利景点、交通枢纽住宿、换乘优化，控制交通成本
- 骑行：推荐骑行友好路线、自行车租赁点、骑行安全提示，考虑租赁费用
- 步行：控制步行距离、推荐步行街区、徒步路线规划，节省交通费用
- 飞行：机场交通衔接、航班时间优化、行李寄存建议，考虑机票价格和机场交通成本
- 综合交通：多模式交通组合、最优换乘方案、灵活出行选择，平衡便利性和成本

重要：请严格返回有效的JSON格式，不要添加任何解释文字、markdown代码块或其他内容。确保JSON语法正确，所有字符串用双引号包围。

只返回JSON：
{
  "destination": "...",
  "duration": "...",
  "budget": "...",
  "overview": "...",
  "highlights": [...],
  "tips": [...]
}`;

      const response = await aiModel.doGenerate({
        inputFormat: 'prompt',
        mode: { type: 'regular' },
        prompt: [{
          role: 'user',
          content: [{
            type: 'text',
            text: enhancedPrompt
          }]
        }],
        maxTokens: 1000,
      });

      const content = response.text || '生成旅行指南时出现错误，请稍后重试。';
      progressManager.completeStep('generate-basic', content, '基础信息生成完成');

      // 解析AI响应，构建TravelGuide对象
      const travelGuide = await this.parseAIResponseToTravelGuideWithProgress(content, prompt, xiaohongshuInsights, transportationMode, progressManager, userBudget);

      progressManager.startStep('finalize', '正在整合旅行指南...');
      await this.sleep(300); // 模拟整合时间
      progressManager.completeStep('finalize', travelGuide, '旅行指南生成完成！');

      // 保存到数据库
      progressManager.startStep('save-database', '正在保存到数据库...');
      try {
        // 转换类型以匹配数据库结构
        const supabaseTravelGuide: SupabaseTravelGuide = {
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
          title: travelGuide.title
        };

        const { data: savedGuide, error } = await TravelGuideService.createTravelGuide(supabaseTravelGuide);
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


  private async parseAIResponseToTravelGuideWithProgress(content: string, originalPrompt: string, xiaohongshuInsights?: string, transportationMode?: string, progressManager?: ProgressManager, userBudget?: string | null): Promise<TravelGuide> {
    try {
      // 尝试解析JSON响应，使用更健壮的方法
      let jsonString = '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0]
          .replace(/,(\s*[}\]])/g, '$1') // 移除多余的逗号
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // 为键添加引号
          .trim();

        const parsedData = JSON.parse(jsonString);

        // 生成基础的旅行指南结构
        const travelGuide: TravelGuide = {
          title: `${this.truncateText(parsedData.destination || 'AI智能推荐', 20)}${parsedData.duration || '5天4夜'}攻略`,
          destination: this.truncateText(parsedData.destination || "AI智能推荐目的地", 20),
          duration: parsedData.duration || "5天4夜",
          budget: this.truncateText(parsedData.budget || "待确认预算范围", 20),
          overview: this.truncateText(parsedData.overview || "这是一份由AI智能生成的个性化旅行指南，为您提供全面的旅行规划建议，包含详细行程安排", 100),
          highlights: Array.isArray(parsedData.highlights) ? parsedData.highlights.map((h: string) => this.truncateText(h, 30)) : ['AI个性化智能推荐', '专业智能行程规划', '实用旅行建议指导'],
          itinerary: [],
          map_locations: [],
          budget_breakdown: [],
          tips: Array.isArray(parsedData.tips) ? parsedData.tips.map((t: string) => this.truncateText(t, 30)) : ['出行前请仔细检查签证要求和有效期', '建议购买合适的旅行保险保障安全', '密切关注当地天气变化情况'],
        };

        // 异步生成其他组件
        if (progressManager) {
          progressManager.startStep('generate-itinerary', '正在生成详细行程...');
        }
        travelGuide.itinerary = await this.extractItineraryFromAI(content, parsedData.duration || "5天4夜", originalPrompt, xiaohongshuInsights, transportationMode);
        if (progressManager) {
          progressManager.completeStep('generate-itinerary', travelGuide.itinerary, '详细行程生成完成');

          progressManager.startStep('generate-locations', '正在生成重要地点...');
        }
        travelGuide.map_locations = await this.generateImportantLocations(parsedData.destination || "未知目的地", originalPrompt);
        if (progressManager) {
          progressManager.completeStep('generate-locations', travelGuide.map_locations, '重要地点生成完成');

          progressManager.startStep('generate-budget', '正在生成预算明细...');
        }
        // 优先使用用户指定的预算，如果没有则使用AI生成的预算
        const finalBudget = userBudget || parsedData.budget || "待确认预算范围";
        travelGuide.budget_breakdown = await this.generateBudgetBreakdown(finalBudget, parsedData.destination || "未知目的地", parsedData.duration || "5天4夜", originalPrompt);
        if (progressManager) {
          progressManager.completeStep('generate-budget', travelGuide.budget_breakdown, '预算明细生成完成');
        }

        return travelGuide;
      }
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.log('Raw response that failed to parse:', content);
    }

    // 如果JSON解析失败，使用基础模板
    console.warn('Using fallback basic travel guide');
    return this.generateBasicTravelGuideFromPrompt(originalPrompt);
  }

  private async generateBasicTravelGuideFromPrompt(prompt: string): Promise<TravelGuide> {
    try {
      const travelGuide: TravelGuide = {
        title: "AI智能旅行攻略",
        destination: "待确认",
        duration: "5天4夜",
        budget: "待确认预算",
        overview: "请提供更详细需求，生成精准旅行指南",
        highlights: ['AI个性化智能推荐', '专业智能行程规划', '实用旅行建议指导'],
        itinerary: await this.extractItineraryFromAI(prompt, "5天4夜", prompt),
        map_locations: await this.generateImportantLocations("待分析", prompt),
        budget_breakdown: await this.generateBudgetBreakdown("待确认预算", "待分析", "5天4夜", prompt),
        tips: ['出行前请仔细检查签证要求', '建议购买合适的旅行保险', '密切关注当地天气变化'],
      };

      return travelGuide;
    } catch (error) {
      console.error('Error generating basic travel guide:', error);
      throw new Error('无法生成旅行指南，请稍后重试');
    }
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 1) + '…';
  }

  private async identifyTransportationMode(prompt: string): Promise<string> {
    try {
      const transportPrompt = `分析以下用户旅行需求，识别用户偏好的交通方式：

用户需求："${prompt}"

请分析用户可能的交通偏好，从以下选项中选择最合适的：
- 自驾游：用户提到开车、自驾、租车等
- 公共交通：用户提到地铁、公交、火车、高铁等
- 飞行：用户提到飞机、航班等
- 骑行：用户提到骑车、单车、自行车等
- 步行：用户提到徒步、走路、步行等
- 综合交通：用户没有明确偏好或需要多种交通方式

只返回一个交通方式，如："自驾游"、"公共交通"、"飞行"、"骑行"、"步行"或"综合交通"`;

      const response = await aiModel.doGenerate({
        inputFormat: 'prompt',
        mode: { type: 'regular' },
        prompt: [{ role: 'user', content: [{ type: 'text', text: transportPrompt }] }],
        maxTokens: 100,
      });

      const transportMode = response.text?.trim() || '综合交通';
      return transportMode;

    } catch (error) {
      console.error('Error identifying transportation mode:', error);
      return '综合交通'; // 默认交通方式
    }
  }

  private async extractKeywordFromPrompt(prompt: string): Promise<string> {
    try {
      const keywordPrompt = `从以下用户旅行需求中提取最核心的搜索关键词：

用户需求："${prompt}"

请分析用户需求，提取1-2个最重要的关键词，用于搜索小红书旅行笔记。
关键词应该包含：目的地名称、旅行类型或兴趣点。

只返回关键词，不要其他文字。例如："京都樱花"、"成都美食"、"三亚海滩"`;

      const response = await aiModel.doGenerate({
        inputFormat: 'prompt',
        mode: { type: 'regular' },
        prompt: [{ role: 'user', content: [{ type: 'text', text: keywordPrompt }] }],
        maxTokens: 100,
      });

      const keyword = response.text?.trim() || '';
      return keyword;

    } catch (error) {
      console.error('Error extracting keyword:', error);
      return '旅行攻略'; // 默认关键词
    }
  }

  private async extractBudgetFromPrompt(prompt: string): Promise<string | null> {
    try {
      const budgetPrompt = `从以下用户旅行需求中提取预算相关信息：

用户需求："${prompt}"

请分析用户是否提到了预算、费用、价格等相关信息。如果提到了，请提取具体的预算金额或预算范围。
如果没有提到预算信息，请返回"未指定预算"。

只返回预算信息，不要其他文字。例如："5000元"、"1-2万"、"经济型"、"高端奢华"等。`;

      const response = await aiModel.doGenerate({
        inputFormat: 'prompt',
        mode: { type: 'regular' },
        prompt: [{ role: 'user', content: [{ type: 'text', text: budgetPrompt }] }],
        maxTokens: 100,
      });

      const budget = response.text?.trim() || '';
      return budget === '未指定预算' ? null : budget;

    } catch (error) {
      console.error('Error extracting budget:', error);
      return null;
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

      // 使用AI分析小红书内容
      const analysisPrompt = `作为专业旅行分析师，请分析以下小红书旅行笔记：

${notesContent}

请从这些真实用户分享中提取专业总结：
1. 热门景点和推荐地点
2. 实用的美食推荐
3. 交通和住宿建议  
4. 实际旅行经验和注意事项
5. 预算参考信息

请用简洁专业的中文总结，重点突出实用性和真实性。`;

      const response = await aiModel.doGenerate({
        inputFormat: 'prompt',
        mode: { type: 'regular' },
        prompt: [{ role: 'user', content: [{ type: 'text', text: analysisPrompt }] }],
        maxTokens: 1500,
      });

      const insights = response.text || '';
      return insights;

    } catch (error) {
      console.error('Error getting XiaoHongShu insights:', error);
      return '';
    }
  }

  private async extractItineraryFromAI(content: string, duration: string, originalPrompt: string, xiaohongshuInsights?: string, transportationMode?: string): Promise<any[]> {
    const days = parseInt(duration.match(/(\d+)天/)?.[1] || '5');

    // 使用简化的prompt生成详细行程
    const itineraryPrompt = `生成${days}天旅行行程JSON：

需求：${originalPrompt}
交通：${transportationMode || '综合交通'}
参考：${xiaohongshuInsights || '无'}

返回JSON格式：
{
  "days": [
    {
      "day": 1,
      "title": "第1天标题",
      "activities": [
        {
          "time": "时间",
          "name": "活动名称",
          "location": "地点",
          "description": "描述",
          "duration": "时长",
          "cost": "费用",
          "transportation": {
            "from": "起点",
            "to": "终点",
            "method": "交通方式",
            "duration": "时间",
            "cost": "费用",
            "route": "路线",
            "tips": "提示"
          }
        }
      ],
      "meals": [
        {
          "type": "breakfast/lunch/dinner",
          "name": "餐厅名",
          "location": "位置",
          "cost": "费用",
          "description": "特色",
          "transportation": { "from": "", "to": "", "method": "", "duration": "", "cost": "", "route": "", "tips": "" }
        }
      ]
    }
  ]
}

要求：
- 每天3-4个活动，3餐
- 根据${transportationMode || '综合交通'}规划交通
- 名称<12字，描述<25字
- 只返回JSON，无其他文字`;

    const response = await aiModel.doGenerate({
      inputFormat: 'prompt',
      mode: { type: 'regular' },
      prompt: [{ role: 'user', content: [{ type: 'text', text: itineraryPrompt }] }],
      maxTokens: 4000,
    });

    const aiItinerary = response.text || '';
    return this.parseJSONItineraryResponse(aiItinerary, days);
  }

  private parseJSONItineraryResponse(aiResponse: string, days: number): any[] {
    // 多种方式尝试提取JSON
    let jsonString = '';

    // 方法1: 匹配完整的JSON对象
    const fullJsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (fullJsonMatch) {
      jsonString = fullJsonMatch[0];

      // 尝试修复常见的JSON格式问题
      jsonString = jsonString
        .replace(/,(\s*[}\]])/g, '$1') // 移除多余的逗号
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // 为键添加引号
        .replace(/:\s*([^",\[\{][^,\]\}]*)/g, (match, p1) => {
          // 只为看起来像值但没有引号的内容添加引号
          if (p1.trim().match(/^[^"'\[\{].*[^"'\]\}]$/)) {
            return `:"${p1.trim()}"`;
          }
          return match;
        })
        .trim();
    }

    // 方法2: 如果找不到完整JSON，尝试寻找days数组
    if (!jsonString) {
      const daysMatch = aiResponse.match(/"days"\s*:\s*\[[\s\S]*\]/);
      if (daysMatch) {
        jsonString = `{${daysMatch[0]}}`;
      }
    }

    if (jsonString) {
      const parsedData = JSON.parse(jsonString);

      if (parsedData.days && Array.isArray(parsedData.days)) {
        return parsedData.days;
      }
    }

    throw new Error('Failed to parse JSON response');
  }

  private async generateImportantLocations(destination: string, originalPrompt: string): Promise<any[]> {
    try {
      // 使用AI生成重要地点推荐
      const locationsPrompt = `作为专业旅行AI专家，请为${destination}推荐重要地点：

用户需求：${originalPrompt}

请以JSON格式返回智能地点推荐：
{
  "locations": [
    {
      "name": "地点名称（不超过15字）",
      "type": "attraction|restaurant|hotel",
      "description": "专业推荐理由（不超过40字）",
      "day": 1
    }
  ]
}

请推荐5-8个精选重要地点，包括：
- 必去景点(attraction)：3-4个专业推荐
- 推荐餐厅(restaurant)：2-3个精选美食  
- 住宿推荐(hotel)：1-2个优质选择

注意：只需要提供地点名称，坐标将自动获取。只返回JSON格式，确保专业性和准确性。`;

      const response = await aiModel.doGenerate({
        inputFormat: 'prompt',
        mode: { type: 'regular' },
        prompt: [{ role: 'user', content: [{ type: 'text', text: locationsPrompt }] }],
        maxTokens: 1500,
      });

      const aiResponse = response.text || '';
      const locations = await this.parseJSONLocationsResponse(aiResponse, destination);
      return locations;

    } catch (error) {
      console.error('Error generating important locations:', error);
      return await this.generateBasicLocations(destination);
    }
  }

  private async parseJSONLocationsResponse(aiResponse: string, destination: string): Promise<any[]> {
    try {
      // 尝试解析JSON响应
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        if (parsedData.locations && Array.isArray(parsedData.locations)) {
          // 为每个地点自动获取坐标
          const locationsWithCoordinates = await this.enrichLocationsWithCoordinates(parsedData.locations, destination);
          return locationsWithCoordinates;
        }
      }

      console.warn('Failed to parse JSON locations, using fallback');
      return await this.generateBasicLocations(destination);

    } catch (error) {
      console.error('Error parsing JSON locations:', error);
      return await this.generateBasicLocations(destination);
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

  private async generateBudgetBreakdown(budget: string, destination: string, duration: string, originalPrompt: string): Promise<any[]> {
    try {
      // 使用AI生成预算明细
      const budgetPrompt = `为${destination}${duration}旅行生成预算明细JSON：

用户需求：${originalPrompt}
总预算：${budget}

${budget !== '待确认预算范围' ? `请严格按照用户预算${budget}来分配各项费用，确保总费用不超过预算范围。` : '请基于目的地消费水平提供合理的预算分配建议。'}

返回JSON格式：
{
  "breakdown": [
    {
      "category": "交通费用",
      "amount": 数字,
      "percentage": 百分比数字,
      "color": "#3b82f6",
      "description": "包含往返交通、当地交通等费用"
    },
    {
      "category": "住宿费用", 
      "amount": 数字,
      "percentage": 百分比数字,
      "color": "#8b5cf6",
      "description": "根据预算选择合适的住宿档次"
    },
    {
      "category": "餐饮费用",
      "amount": 数字,
      "percentage": 百分比数字,
      "color": "#10b981",
      "description": "当地特色美食和日常餐饮"
    },
    {
      "category": "门票娱乐",
      "amount": 数字,
      "percentage": 百分比数字,
      "color": "#f59e0b",
      "description": "景点门票、娱乐活动等"
    },
    {
      "category": "购物其他",
      "amount": 数字,
      "percentage": 百分比数字,
      "color": "#ef4444",
      "description": "纪念品、意外支出等"
    }
  ]
}

要求：
- 5个分类的百分比总和必须等于100
- ${budget !== '待确认预算范围' ? `严格按照用户预算${budget}分配，总费用不能超过预算` : '金额要合理，符合目的地消费水平'}
- 考虑目的地消费水平和旅行天数
- 只返回JSON，无其他文字`;

      const response = await aiModel.doGenerate({
        inputFormat: 'prompt',
        mode: { type: 'regular' },
        prompt: [{ role: 'user', content: [{ type: 'text', text: budgetPrompt }] }],
        maxTokens: 800,
      });

      const aiBudget = response.text || '';
      return this.parseBudgetResponse(aiBudget);

    } catch (error) {
      console.error('Error generating budget breakdown:', error);
      return this.generateBasicBudget();
    }
  }

  private parseBudgetResponse(aiResponse: string): any[] {
    try {
      // 尝试解析JSON响应
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0]
          .replace(/,(\s*[}\]])/g, '$1') // 移除多余的逗号
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // 为键添加引号
          .trim();

        const parsedData = JSON.parse(jsonString);
        if (parsedData.breakdown && Array.isArray(parsedData.breakdown)) {
          return parsedData.breakdown;
        }
      }

      console.warn('Failed to parse budget JSON, using fallback');
      return this.generateBasicBudget();

    } catch (error) {
      console.error('Error parsing budget JSON:', error);
      return this.generateBasicBudget();
    }
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


  private generateTitle(destination: string, duration: string, interests: string[]): string {
    const interestStr = interests.length > 0 ? ` - ${interests.slice(0, 2).join('+')}` : '';
    return `${destination}${duration}深度游攻略${interestStr}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === Mastra增强功能 ===

  async optimizeItinerary(request: {
    destination: string;
    currentItinerary: any[];
    feedback: string;
    preferences: string[];
  }) {
    const { destination, currentItinerary, feedback, preferences } = request;

    const prompt = `请优化以下旅行行程：

目的地：${destination}
当前行程：${JSON.stringify(currentItinerary, null, 2)}
用户反馈：${feedback}
用户偏好：${preferences.join(', ')}

请分析当前行程的问题，并提供优化建议。使用你的工具来获取更好的活动安排、预算分配和文化体验建议。`;

    try {
      const response = await aiModel.doGenerate({
        inputFormat: 'prompt',
        mode: { type: 'regular' },
        prompt: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
        maxTokens: 1500,
      });
      return response.text || '优化行程时出现错误';
    } catch (error) {
      console.error('Itinerary optimization error:', error);
      throw new Error('优化行程时出现错误，请稍后重试。');
    }
  }

  async getDestinationInsights(destination: string, interests: string[] = []) {
    const prompt = `请为${destination}提供全面的目的地洞察：

用户兴趣：${interests.join(', ') || '一般旅游'}

请使用你的工具来获取：
1. 详细的文化信息和当地习俗
2. 天气状况和最佳旅行时间
3. 推荐的文化体验和活动
4. 安全注意事项和实用建议

请整合这些信息，为用户提供一个全面的目的地指南。`;

    try {
      const response = await aiModel.doGenerate({
        inputFormat: 'prompt',
        mode: { type: 'regular' },
        prompt: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
        maxTokens: 1500,
      });
      return response.text || '获取目的地信息时出现错误';
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

    const prompt = `请为以下旅行提供详细的预算建议：

- 目的地：${destination}
- 时长：${duration}
- 当前预算：${currentBudget}
- 旅行风格：${travelStyle}
- 人数：${groupSize}人

请使用预算分析工具，提供：
1. 详细的费用分解和分配建议
2. 实用的省钱技巧
3. 预算优化建议
4. 应急资金规划`;

    try {
      const response = await aiModel.doGenerate({
        inputFormat: 'prompt',
        mode: { type: 'regular' },
        prompt: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
        maxTokens: 1500,
      });
      return response.text || '获取预算建议时出现错误';
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
    // 这里可以集成Mastra的记忆功能
    // 暂时用简单的存储方式
    const userMemory = {
      userId,
      preferences,
      lastUpdated: new Date().toISOString(),
    };

    // 在实际应用中，这里会使用Mastra的持久化存储
    console.log('User preferences saved:', userMemory);
    return userMemory;
  }

  async getUserPreferences(userId: string) {
    // 从存储中获取用户偏好
    // 这里需要实现实际的存储逻辑
    return null;
  }
}

export const travelAgent = new TravelAgent();

// 别名导出，用于向后兼容
export const mastraTravelAgent = travelAgent;
export const simpleMastraTravelAgent = travelAgent;
