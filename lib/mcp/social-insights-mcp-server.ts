import { BaseMCPTool } from './base-mcp-server';
import { XiaoHongShu } from '@/lib/api/xiaohongshu';

/**
 * 小红书笔记获取工具
 */
export class GetXiaohongshuNotesTool extends BaseMCPTool {
  private xiaohongshu = new XiaoHongShu();

  protected getToolName(): string {
    return 'get_xiaohongshu_notes';
  }

  protected getToolDescription(): string {
    return '获取小红书笔记内容';
  }

  protected getInputSchema(): Record<string, any> {
    return {
      keyword: {
        type: 'string',
        description: '搜索关键词'
      },
      limit: {
        type: 'number',
        description: '返回数量限制 (默认5)'
      }
    };
  }

  protected getRequiredFields(): string[] {
    return ['keyword'];
  }

  protected async _call(input: any): Promise<string> {
    try {
      const { keyword, limit = 5 } = input;
      const notes = this.xiaohongshu.getNotesByKeyword(keyword);
      const limitedNotes = notes.slice(0, limit);
      
      return JSON.stringify({
        success: true,
        data: {
          keyword,
          totalFound: notes.length,
          returned: limitedNotes.length,
          notes: limitedNotes
        }
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Failed to get XiaoHongShu notes for ${input.keyword}: ${error}`
      });
    }
  }
}
