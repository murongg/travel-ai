import { spawn } from 'child_process';
import { EventEmitter } from 'events';

/**
 * 直接集成高德地图MCP服务器的客户端
 * 通过子进程调用 @amap/amap-maps-mcp-server
 */
export class AmapMCPDirectClient extends EventEmitter {
  private process: any;
  private isConnected: boolean = false;

  constructor() {
    super();
  }

  /**
   * 启动高德地图MCP服务器
   */
  async startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 启动高德地图MCP服务器进程
        this.process = spawn('npx', ['@amap/amap-maps-mcp-server'], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: {
            ...process.env,
            AMAP_MAPS_API_KEY: process.env.AMAP_MAPS_API_KEY
          }
        });

        // 处理stdout
        this.process.stdout.on('data', (data: Buffer) => {
          const message = data.toString().trim();
          if (message) {
            try {
              const parsed = JSON.parse(message);
              this.emit('message', parsed);
            } catch (error) {
              console.log('Raw stdout:', message);
            }
          }
        });

        // 处理stderr
        this.process.stderr.on('data', (data: Buffer) => {
          const message = data.toString().trim();
          if (message && !message.includes('Amap Maps MCP Server running on stdio')) {
            console.error('Amap MCP Server stderr:', message);
          }
        });

        // 处理进程退出
        this.process.on('exit', (code: number) => {
          this.isConnected = false;
          this.emit('disconnected', code);
        });

        // 等待连接建立
        setTimeout(() => {
          this.isConnected = true;
          resolve();
        }, 1000);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 停止服务器
   */
  stopServer(): void {
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.isConnected = false;
    }
  }

  /**
   * 发送消息到MCP服务器
   */
  sendMessage(message: any): void {
    if (this.process && this.isConnected) {
      this.process.stdin.write(JSON.stringify(message) + '\n');
    }
  }

  /**
   * 获取可用工具列表
   */
  async listTools(): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = Date.now().toString();
      
      const handler = (message: any) => {
        if (message.id === requestId) {
          this.removeListener('message', handler);
          resolve(message);
        }
      };

      this.on('message', handler);

      const request = {
        jsonrpc: "2.0",
        id: requestId,
        method: "tools/list"
      };

      this.sendMessage(request);

      // 超时处理
      setTimeout(() => {
        this.removeListener('message', handler);
        reject(new Error('List tools timeout'));
      }, 10000);
    });
  }

  /**
   * 调用工具
   */
  async callTool(toolName: string, arguments_: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = Date.now().toString();
      
      const handler = (message: any) => {
        if (message.id === requestId) {
          this.removeListener('message', handler);
          if (message.error) {
            reject(new Error(message.error.message || 'Tool call failed'));
          } else {
            resolve(message.result);
          }
        }
      };

      this.on('message', handler);

      const request = {
        jsonrpc: "2.0",
        id: requestId,
        method: "tools/call",
        params: {
          name: toolName,
          arguments: arguments_
        }
      };

      this.sendMessage(request);

      // 超时处理
      setTimeout(() => {
        this.removeListener('message', handler);
        reject(new Error('Tool call timeout'));
      }, 30000);
    });
  }

  /**
   * 检查连接状态
   */
  isServerConnected(): boolean {
    return this.isConnected && this.process && !this.process.killed;
  }
}

/**
 * 高德地图MCP工具包装器
 * 直接使用官方库的工具定义和实现
 */
export class AmapMCPToolWrapper {
  private client: AmapMCPDirectClient;

  constructor() {
    this.client = new AmapMCPDirectClient();
  }

  /**
   * 初始化客户端
   */
  async initialize(): Promise<void> {
    await this.client.startServer();
  }

  /**
   * 获取可用工具列表
   */
  async getAvailableTools(): Promise<any[]> {
    const response = await this.client.listTools();
    return response.tools || [];
  }

  /**
   * 调用地理编码工具
   */
  async geocode(address: string, city?: string): Promise<any> {
    const result = await this.client.callTool('maps_geo', { address, city });
    return result;
  }

  /**
   * 调用逆地理编码工具
   */
  async reverseGeocode(location: string): Promise<any> {
    const result = await this.client.callTool('maps_regeocode', { location });
    return result;
  }

  /**
   * 调用驾车路线规划工具
   */
  async getDrivingRoute(origin: string, destination: string): Promise<any> {
    // 确保参数格式正确，高德地图需要坐标格式
    const result = await this.client.callTool('maps_direction_driving', { 
      origin: origin,
      destination: destination,
      strategy: '0', // 0:速度最快 1:费用最低 2:距离最短
      avoidHighways: false,
      avoidTolls: false
    });
    return result;
  }

  /**
   * 调用步行路线规划工具
   */
  async getWalkingRoute(origin: string, destination: string): Promise<any> {
    const result = await this.client.callTool('maps_direction_walking', { 
      origin: origin,
      destination: destination,
      avoidHighways: false
    });
    return result;
  }

  /**
   * 调用公交路线规划工具
   */
  async getTransitRoute(origin: string, destination: string, city: string, cityd: string): Promise<any> {
    const result = await this.client.callTool('maps_direction_transit_integrated', { 
      origin: origin,
      destination: destination,
      city: city,
      cityd: cityd,
      strategy: '0', // 0:速度最快 1:费用最低 2:距离最短
      date: new Date().toISOString().split('T')[0], // 当前日期
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false }) // 当前时间
    });
    return result;
  }

  /**
   * 调用骑行路线规划工具
   */
  async getBicyclingRoute(origin: string, destination: string): Promise<any> {
    const result = await this.client.callTool('maps_bicycling', { 
      origin: origin,
      destination: destination,
      avoidHighways: false
    });
    return result;
  }

  /**
   * 调用POI搜索工具
   */
  async searchPOI(keywords: string, city?: string, types?: string): Promise<any> {
    const result = await this.client.callTool('maps_text_search', { keywords, city, types });
    return result;
  }

  /**
   * 调用周边搜索工具
   */
  async searchAround(location: string, radius?: string, keywords?: string): Promise<any> {
    const result = await this.client.callTool('maps_around_search', { location, radius, keywords });
    return result;
  }

  /**
   * 调用POI详情工具
   */
  async getPOIDetail(id: string): Promise<any> {
    const result = await this.client.callTool('maps_search_detail', { id });
    return result;
  }

  /**
   * 调用天气工具
   */
  async getWeather(city: string): Promise<any> {
    const result = await this.client.callTool('maps_weather', { city });
    return result;
  }

  /**
   * 调用距离测量工具
   */
  async getDistance(origins: string, destination: string, type?: string): Promise<any> {
    const result = await this.client.callTool('maps_distance', { origins, destination, type });
    return result;
  }

  /**
   * 调用IP定位工具
   */
  async getIPLocation(ip: string): Promise<any> {
    const result = await this.client.callTool('maps_ip_location', { ip });
    return result;
  }

  /**
   * 检查服务连接状态
   */
  isServerConnected(): boolean {
    return this.client.isServerConnected();
  }

  /**
   * 关闭客户端
   */
  async close(): Promise<void> {
    this.client.stopServer();
  }
}

// 导出单例实例
export const amapMCPToolWrapper = new AmapMCPToolWrapper();
