/**
 * 路径规划调试工具
 * 帮助诊断和解决地理编码问题
 */

export interface GeocodingDebugInfo {
  originalAddress: string;
  enhancedAddress: string;
  city: string;
  attempts: string[];
  success: boolean;
  result?: any;
  error?: string;
}

export interface RoutePlanningDebugReport {
  totalLocations: number;
  successfulGeocoding: number;
  failedGeocoding: number;
  successRate: number;
  failedAddresses: string[];
  recommendations: string[];
  debugInfo: GeocodingDebugInfo[];
}

export class RouteDebugger {
  /**
   * 分析地点名称，提供改进建议
   */
  static analyzeLocationName(location: string): {
    issues: string[];
    suggestions: string[];
    enhancedName: string;
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let enhancedName = location.trim();

    // 检查地点名称长度
    if (enhancedName.length < 2) {
      issues.push('地点名称过短');
      suggestions.push('使用更具体的地点名称');
    }

    // 检查是否包含通用词汇
    const genericTerms = ['附近', '周边', '旁边', '对面', '斜对面'];
    if (genericTerms.some(term => enhancedName.includes(term))) {
      issues.push('包含位置描述词汇');
      suggestions.push('移除位置描述词汇，使用具体地点名称');
    }

    // 检查是否包含推荐词汇
    const recommendationTerms = ['推荐', '必去', '热门', '著名', '知名', '网红', '人气'];
    if (recommendationTerms.some(term => enhancedName.includes(term))) {
      issues.push('包含推荐描述词汇');
      suggestions.push('移除推荐描述词汇，使用具体地点名称');
    }

    // 检查是否包含括号内容
    if (/[（）()]/.test(enhancedName)) {
      issues.push('包含括号内容');
      suggestions.push('移除括号内容，保留核心地点名称');
    }

    // 应用改进
    enhancedName = enhancedName
      .replace(/（.*?）/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/附近|周边|旁边|对面|斜对面/g, '')
      .replace(/推荐|必去|热门|著名|知名|网红|人气/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      issues,
      suggestions,
      enhancedName
    };
  }

  /**
   * 生成地点名称改进建议
   */
  static generateLocationSuggestions(originalLocation: string, destination: string): string[] {
    const suggestions: string[] = [];
    
    // 移除通用后缀
    let cleaned = originalLocation
      .replace(/餐厅|饭店|酒楼|食府|大排档$/g, '')
      .replace(/酒店|宾馆|旅馆|度假村$/g, '')
      .replace(/购物中心|商场|百货|广场$/g, '')
      .trim();

    // 添加城市前缀建议
    if (cleaned.length > 0) {
      suggestions.push(`${destination}${cleaned}`);
    }

    // 提取核心名称
    const coreName = this.extractCoreName(cleaned);
    if (coreName && coreName !== cleaned) {
      suggestions.push(coreName);
      suggestions.push(`${destination}${coreName}`);
    }

    // 添加常见地点类型
    if (cleaned.includes('岛') || cleaned.includes('山') || cleaned.includes('公园')) {
      suggestions.push(`${destination}${cleaned}景区`);
    }

    return suggestions.filter(s => s.length > 0);
  }

  /**
   * 提取地点核心名称
   */
  private static extractCoreName(location: string): string | null {
    // 移除常见的前缀和后缀
    let core = location
      .replace(/^威海|^济南|^北京|^上海|^广州|^深圳/g, '')
      .replace(/景区|景点|公园|广场|中心|商城|市场$/g, '')
      .trim();

    return core.length > 0 ? core : null;
  }

  /**
   * 生成调试报告
   */
  static generateDebugReport(
    originalAddresses: string[],
    geocodingResults: any[],
    city: string
  ): RoutePlanningDebugReport {
    const totalLocations = originalAddresses.length;
    const successfulGeocoding = geocodingResults.filter(r => r !== null).length;
    const failedGeocoding = totalLocations - successfulGeocoding;
    const successRate = totalLocations > 0 ? (successfulGeocoding / totalLocations) * 100 : 0;

    const failedAddresses = originalAddresses.filter((_, index) => geocodingResults[index] === null);
    
    const recommendations: string[] = [];
    
    if (successRate < 50) {
      recommendations.push('地理编码成功率较低，建议检查地点名称格式');
    }
    
    if (failedAddresses.length > 0) {
      recommendations.push(`重点关注失败的地点: ${failedAddresses.slice(0, 3).join(', ')}`);
    }

    if (successRate < 80) {
      recommendations.push('考虑添加城市前缀或使用更具体的地点名称');
    }

    const debugInfo: GeocodingDebugInfo[] = originalAddresses.map((address, index) => {
      const result = geocodingResults[index];
      const analysis = this.analyzeLocationName(address);
      const suggestions = this.generateLocationSuggestions(address, city);
      
      return {
        originalAddress: address,
        enhancedAddress: analysis.enhancedName,
        city,
        attempts: suggestions,
        success: result !== null,
        result: result || undefined,
        error: result ? undefined : '地理编码失败'
      };
    });

    return {
      totalLocations,
      successfulGeocoding,
      failedGeocoding,
      successRate: Math.round(successRate * 100) / 100,
      failedAddresses,
      recommendations,
      debugInfo
    };
  }

  /**
   * 格式化调试报告为可读文本
   */
  static formatDebugReport(report: RoutePlanningDebugReport): string {
    let output = '🔍 路径规划调试报告\n\n';
    
    output += `📊 统计信息:\n`;
    output += `   总地点数: ${report.totalLocations}\n`;
    output += `   成功编码: ${report.successfulGeocoding}\n`;
    output += `   失败编码: ${report.failedGeocoding}\n`;
    output += `   成功率: ${report.successRate}%\n\n`;
    
    if (report.failedAddresses.length > 0) {
      output += `❌ 失败的地点:\n`;
      report.failedAddresses.forEach(address => {
        output += `   • ${address}\n`;
      });
      output += `\n`;
    }
    
    if (report.recommendations.length > 0) {
      output += `💡 改进建议:\n`;
      report.recommendations.forEach(rec => {
        output += `   • ${rec}\n`;
      });
      output += `\n`;
    }
    
    output += `🔧 详细调试信息:\n`;
    report.debugInfo.forEach((info, index) => {
      output += `   ${index + 1}. ${info.originalAddress}\n`;
      output += `      状态: ${info.success ? '✅ 成功' : '❌ 失败'}\n`;
      if (!info.success) {
        output += `      建议尝试: ${info.attempts.join(', ')}\n`;
      }
      output += `\n`;
    });
    
    return output;
  }

  /**
   * 检查地点名称质量
   */
  static checkLocationQuality(location: string): {
    score: number; // 0-100
    level: 'excellent' | 'good' | 'fair' | 'poor';
    issues: string[];
    improvements: string[];
  } {
    let score = 100;
    const issues: string[] = [];
    const improvements: string[] = [];

    // 长度检查
    if (location.length < 2) {
      score -= 30;
      issues.push('地点名称过短');
      improvements.push('使用更具体的地点名称');
    } else if (location.length < 4) {
      score -= 15;
      issues.push('地点名称较短');
      improvements.push('考虑添加更多描述信息');
    }

    // 通用词汇检查
    const genericTerms = ['附近', '周边', '旁边', '对面', '斜对面'];
    if (genericTerms.some(term => location.includes(term))) {
      score -= 25;
      issues.push('包含位置描述词汇');
      improvements.push('移除位置描述词汇');
    }

    // 推荐词汇检查
    const recommendationTerms = ['推荐', '必去', '热门', '著名', '知名', '网红', '人气'];
    if (recommendationTerms.some(term => location.includes(term))) {
      score -= 20;
      issues.push('包含推荐描述词汇');
      improvements.push('移除推荐描述词汇');
    }

    // 括号内容检查
    if (/[（）()]/.test(location)) {
      score -= 15;
      issues.push('包含括号内容');
      improvements.push('移除括号内容');
    }

    // 确定质量等级
    let level: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 90) level = 'excellent';
    else if (score >= 70) level = 'good';
    else if (score >= 50) level = 'fair';
    else level = 'poor';

    return {
      score: Math.max(0, score),
      level,
      issues,
      improvements
    };
  }
}
