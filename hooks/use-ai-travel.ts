import { useState, useCallback } from 'react';

export interface TravelPlanParams {
  destination: string;
  duration: string;
  budget: string;
  interests: string[];
  travelStyle: 'luxury' | 'budget' | 'adventure' | 'cultural' | 'relaxation';
  groupSize?: number;
  specialRequirements?: string[];
}

export interface BudgetParams {
  destination: string;
  duration: number;
  travelStyle: 'budget' | 'standard' | 'luxury';
  accommodationType: 'hostel' | 'hotel' | 'resort' | 'apartment';
  transportationType: 'public' | 'rental' | 'private';
  groupSize: number;
}

export interface ItineraryParams {
  destination: string;
  attractions: Array<{
    name: string;
    location: string;
    estimatedTime: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  duration: number;
  preferences: {
    pace: 'relaxed' | 'moderate' | 'intense';
    transportation: 'walking' | 'public' | 'taxi';
    includeRest: boolean;
  };
}

export interface WeatherParams {
  destination: string;
  travelDates: {
    start: string;
    end: string;
  };
  activities: string[];
}

export interface CulturalParams {
  destination: string;
  travelPurpose: 'leisure' | 'business' | 'cultural' | 'adventure';
  duration: number;
}

export interface AIResponse {
  success: boolean;
  result: any;
  action: string;
  error?: string;
}

export function useAITravel() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callAI = useCallback(async (action: string, params: any): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-travel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, params }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      return {
        success: false,
        result: null,
        action,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTravelPlan = useCallback(async (params: TravelPlanParams): Promise<AIResponse> => {
    return callAI('create_travel_plan', params);
  }, [callAI]);

  const calculateBudget = useCallback(async (params: BudgetParams): Promise<AIResponse> => {
    return callAI('calculate_budget', params);
  }, [callAI]);

  const optimizeItinerary = useCallback(async (params: ItineraryParams): Promise<AIResponse> => {
    return callAI('optimize_itinerary', params);
  }, [callAI]);

  const getWeatherAdvice = useCallback(async (params: WeatherParams): Promise<AIResponse> => {
    return callAI('get_weather_advice', params);
  }, [callAI]);

  const getCulturalGuide = useCallback(async (params: CulturalParams): Promise<AIResponse> => {
    return callAI('get_cultural_guide', params);
  }, [callAI]);

  const getQuickPlan = useCallback(async (destination: string): Promise<AIResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/ai-travel?action=quick_plan&destination=${encodeURIComponent(destination)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      return {
        success: false,
        result: null,
        action: 'quick_plan',
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBudgetEstimate = useCallback(async (destination: string): Promise<AIResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/ai-travel?action=budget_estimate&destination=${encodeURIComponent(destination)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      return {
        success: false,
        result: null,
        action: 'budget_estimate',
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCulturalTips = useCallback(async (destination: string): Promise<AIResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/ai-travel?action=cultural_tips&destination=${encodeURIComponent(destination)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      return {
        success: false,
        result: null,
        action: 'cultural_tips',
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 状态
    isLoading,
    error,
    
    // 方法
    createTravelPlan,
    calculateBudget,
    optimizeItinerary,
    getWeatherAdvice,
    getCulturalGuide,
    getQuickPlan,
    getBudgetEstimate,
    getCulturalTips,
    clearError,
  };
}
