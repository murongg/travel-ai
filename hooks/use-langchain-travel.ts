import { useState, useCallback } from 'react';

interface LangChainTravelOptions {
  onProgress?: (progress: any) => void;
  onComplete?: (data: any) => void;
  onError?: (error: any) => void;
}

interface TravelGuideRequest {
  prompt: string;
}

interface OptimizeItineraryRequest {
  destination: string;
  currentItinerary: any[];
  feedback: string;
  preferences: string[];
}

interface DestinationInsightsRequest {
  destination: string;
  interests?: string[];
}

interface BudgetAdviceRequest {
  destination: string;
  duration: string;
  currentBudget: string;
  travelStyle: string;
  groupSize?: number;
}

interface UserPreferencesRequest {
  userId: string;
  preferences: {
    favoriteDestinations?: string[];
    budgetRange?: string;
    travelStyle?: string;
    interests?: string[];
    dietaryRestrictions?: string[];
    accessibility?: string[];
  };
}

export const useLangChainTravel = (options: LangChainTravelOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTravelGuide = useCallback(async (request: TravelGuideRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/langchain/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'progress':
                  options.onProgress?.(data.data);
                  break;
                case 'complete':
                  options.onComplete?.(data.data);
                  break;
                case 'error':
                  options.onError?.(data.data);
                  setError(data.data.error);
                  break;
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成旅行指南时出现错误';
      setError(errorMessage);
      options.onError?.({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [options]);

  const optimizeItinerary = useCallback(async (request: OptimizeItineraryRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/langchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'optimize-itinerary',
          ...request,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '优化行程时出现错误';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getDestinationInsights = useCallback(async (request: DestinationInsightsRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/langchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-destination-insights',
          ...request,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取目的地洞察时出现错误';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBudgetAdvice = useCallback(async (request: BudgetAdviceRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/langchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-budget-advice',
          budgetParams: request,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取预算建议时出现错误';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const rememberUserPreferences = useCallback(async (request: UserPreferencesRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/langchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'remember-preferences',
          ...request,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存用户偏好时出现错误';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserPreferences = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/langchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-preferences',
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户偏好时出现错误';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const identifyTransportationMode = useCallback(async (prompt: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/langchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'identify-transport',
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '识别交通方式时出现错误';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const extractKeyword = useCallback(async (prompt: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/langchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'extract-keyword',
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '提取关键词时出现错误';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const extractBudget = useCallback(async (prompt: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/langchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'extract-budget',
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '提取预算信息时出现错误';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getXiaohongshuInsights = useCallback(async (keyword: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/langchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-xiaohongshu-insights',
          keyword,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取小红书洞察时出现错误';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getWeatherInfo = useCallback(async (prompt: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/langchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-weather-info',
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取天气信息时出现错误';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,
    generateTravelGuide,
    optimizeItinerary,
    getDestinationInsights,
    getBudgetAdvice,
    rememberUserPreferences,
    getUserPreferences,
    identifyTransportationMode,
    extractKeyword,
    extractBudget,
    getXiaohongshuInsights,
    getWeatherInfo,
  };
};
