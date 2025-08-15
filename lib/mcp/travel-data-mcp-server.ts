import { BaseMCPTool } from './base-mcp-server';
import { TravelGuideService } from '@/lib/services/travel-guide-service';
import { FirebaseTravelGuide } from '@/lib/firebase';

/**
 * 创建旅行指南工具
 */
export class CreateTravelGuideTool extends BaseMCPTool {
  protected getToolName(): string {
    return 'create_travel_guide';
  }

  protected getToolDescription(): string {
    return '创建新的旅行指南';
  }

  protected getInputSchema(): Record<string, any> {
    return {
      prompt: {
        type: 'string',
        description: '用户旅行需求'
      },
      destination: {
        type: 'string',
        description: '目的地'
      },
      duration: {
        type: 'string',
        description: '行程时长'
      },
      budget: {
        type: 'string',
        description: '预算'
      },
      overview: {
        type: 'string',
        description: '概述'
      },
      highlights: {
        type: 'array',
        items: { type: 'string' },
        description: '亮点'
      },
      tips: {
        type: 'array',
        items: { type: 'string' },
        description: '提示'
      }
    };
  }

  protected getRequiredFields(): string[] {
    return ['prompt', 'destination', 'duration', 'budget'];
  }

  protected async _call(input: any): Promise<string> {
    try {
      const travelGuide: FirebaseTravelGuide = {
        prompt: input.prompt,
        destination: input.destination,
        duration: input.duration,
        budget: input.budget,
        overview: input.overview || '',
        highlights: input.highlights || [],
        tips: input.tips || [],
        itinerary: [],
        map_locations: [],
        budget_breakdown: [],
        transportation: '未知',
        user_id: undefined,
        is_public: true,
        title: `${input.destination}${input.duration}攻略`,
        weather_info: {} as any,
      };

      const { data: savedGuide, error } = await TravelGuideService.createTravelGuide(travelGuide);
      
      if (error) {
        throw new Error(`Failed to create travel guide: ${error}`);
      }

      return JSON.stringify({
        success: true,
        data: savedGuide
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Failed to create travel guide: ${error}`
      });
    }
  }
} 
