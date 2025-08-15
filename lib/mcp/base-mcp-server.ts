/**
 * MCP工具基础类
 * 简单的工具实现，不依赖LangChain Tool
 */
export abstract class BaseMCPTool {
  /**
   * 获取工具名称
   */
  protected abstract getToolName(): string;

  /**
   * 获取工具描述
   */
  protected abstract getToolDescription(): string;

  /**
   * 获取工具名称
   */
  get name(): string {
    return this.getToolName();
  }

  /**
   * 获取工具描述
   */
  get description(): string {
    return this.getToolDescription();
  }

  /**
   * 执行工具调用
   */
  protected abstract _call(input: any): Promise<string>;

  /**
   * 获取工具Schema
   */
  get toolSchema(): any {
    return {
      name: this.name,
      description: this.description,
      inputSchema: {
        type: 'object',
        properties: this.getInputSchema(),
        required: this.getRequiredFields(),
      },
    };
  }

  /**
   * 获取输入Schema
   */
  protected abstract getInputSchema(): Record<string, any>;

  /**
   * 获取必填字段
   */
  protected abstract getRequiredFields(): string[];
}
