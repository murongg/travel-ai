import { GetWeatherTool, GeocodeTool, TravelWeatherAdviceTool } from './weather-geo-mcp-server';
import { GetXiaohongshuNotesTool } from './social-insights-mcp-server';
import { CreateTravelGuideTool } from './travel-data-mcp-server';

/**
 * MCP工具管理器
 * 管理所有可用的MCP工具
 */
export class MCPToolsManager {
  private tools: Map<string, any> = new Map();

  constructor() {
    this.initializeTools();
  }

  /**
   * 初始化所有工具
   */
  private initializeTools() {
    // 天气地理工具
    this.tools.set('get_weather', new GetWeatherTool());
    this.tools.set('geocode', new GeocodeTool());
    this.tools.set('get_travel_weather_advice', new TravelWeatherAdviceTool());
    
    // 社交洞察工具
    this.tools.set('get_xiaohongshu_notes', new GetXiaohongshuNotesTool());
    
    // 旅行数据工具
    this.tools.set('create_travel_guide', new CreateTravelGuideTool());
    

  }

  /**
   * 获取所有可用工具
   */
  getAllTools(): any[] {
    return Array.from(this.tools.values());
  }

  /**
   * 获取指定工具
   */
  getTool(name: string): any | undefined {
    return this.tools.get(name);
  }

  /**
   * 获取工具名称列表
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * 获取工具Schema列表
   */
  getToolSchemas(): any[] {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.toolSchema.inputSchema
    }));
  }

  /**
   * 执行工具调用
   */
  async executeTool(name: string, args: any): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    try {
      return await tool._call(args);
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Tool execution failed: ${error}`
      });
    }
  }

  /**
   * 检查工具是否存在
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * 添加新工具
   */
  addTool(name: string, tool: any): void {
    this.tools.set(name, tool);
  }

  /**
   * 移除工具
   */
  removeTool(name: string): boolean {
    return this.tools.delete(name);
  }
}

// 导出单例实例
export const mcpToolsManager = new MCPToolsManager();
