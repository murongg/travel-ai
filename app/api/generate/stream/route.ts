import { NextRequest } from 'next/server';
import { langChainTravelAgent } from '@/lib/langchain/travel-agent';
import { ProgressManager, ProgressStep } from '@/lib/progress-manager';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: '请提供旅行需求' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 创建可读流
    const stream = new ReadableStream({
      async start(controller) {
        // 定义所有步骤
        const steps: Omit<ProgressStep, 'status' | 'progress' | 'startTime' | 'endTime'>[] = [
          { id: 'analyze-prompt', name: '分析用户需求' },
          { id: 'identify-transport', name: '识别交通方式' },
          { id: 'extract-keyword', name: '提取关键词' },
          { id: 'fetch-insights', name: '联网搜索' },
          { id: 'generate-basic', name: '生成基础信息' },
          { id: 'generate-itinerary', name: '生成详细行程' },
          { id: 'generate-locations', name: '生成重要地点' },
          { id: 'generate-budget', name: '生成预算明细' },
          { id: 'finalize', name: '整合旅行指南' },
          { id: 'save-database', name: '保存到数据库' },
        ];

        // 创建进度管理器
        const progressManager = new ProgressManager(steps, (state) => {
          // 发送进度更新到前端
          const data = JSON.stringify({ type: 'progress', data: state });
          controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
        });

        try {
          // 开始生成旅行指南
          const travelGuide = await langChainTravelAgent.generateTravelGuideWithProgress(prompt, progressManager);
          
          // 发送最终结果
          const finalData = JSON.stringify({ 
            type: 'complete', 
            data: { 
              travelGuide,
              progress: progressManager.getState() 
            } 
          });
          controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
          
        } catch (error) {
          console.error('Error generating travel guide:', error);
          const errorData = JSON.stringify({ 
            type: 'error', 
            data: { 
              error: error instanceof Error ? error.message : '生成旅行指南时出现错误',
              progress: progressManager.getState() 
            } 
          });
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Stream API error:', error);
    return new Response(JSON.stringify({ error: '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
