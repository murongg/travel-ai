import { createOpenAI } from "@ai-sdk/openai";

// 创建 AI 模型实例
export const ai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export const aiModel = ai('gpt-4o-mini');

