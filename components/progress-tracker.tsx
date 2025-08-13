'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, AlertCircle, Loader2 } from 'lucide-react';
import { ProgressState, ProgressStep } from '@/lib/progress-manager';

interface ProgressTrackerProps {
  progressState: ProgressState;
  className?: string;
}

export function ProgressTracker({ progressState, className = '' }: ProgressTrackerProps) {
  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStepBadge = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">完成</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">进行中</Badge>;
      case 'error':
        return <Badge variant="destructive">错误</Badge>;
      default:
        return <Badge variant="outline">等待中</Badge>;
    }
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDuration = (step: ProgressStep) => {
    if (!step.startTime) return '';
    const endTime = step.endTime || Date.now();
    const duration = Math.round((endTime - step.startTime) / 1000);
    return `${duration}s`;
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>生成进度</span>
          <Badge variant="outline">
            {progressState.completedSteps}/{progressState.totalSteps}
          </Badge>
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>整体进度</span>
            <span>{progressState.overallProgress}%</span>
          </div>
          <Progress value={progressState.overallProgress} className="w-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {progressState.steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                step.status === 'in_progress' 
                  ? 'bg-secondary border' 
                  : step.status === 'completed'
                  ? 'bg-secondary border'
                  : step.status === 'error'
                  ? 'bg-destructive/10 border border-destructive'
                  : 'bg-muted'
              }`}
            >
              <div className="flex-shrink-0">
                {getStepIcon(step)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {step.name}
                  </h4>
                  {getStepBadge(step)}
                </div>
                
                {step.message && (
                  <p className="text-sm text-muted-foreground mt-1">{step.message}</p>
                )}
                
                {step.status === 'in_progress' && step.progress > 0 && (
                  <div className="mt-2">
                    <Progress value={step.progress} className="h-2" />
                  </div>
                )}
                
                {step.error && (
                  <p className="text-sm text-destructive mt-1">{step.error}</p>
                )}
                
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  {step.startTime && (
                    <span>开始: {formatTime(step.startTime)}</span>
                  )}
                  {step.endTime && (
                    <span>完成: {formatTime(step.endTime)}</span>
                  )}
                  {(step.startTime || step.endTime) && (
                    <span>耗时: {getDuration(step)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {progressState.isComplete && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-800">
                旅行指南生成完成！
              </span>
            </div>
          </div>
        )}
        
        {progressState.hasError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-800">
                生成过程中出现错误，请重试
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for using progress tracking
export function useProgressTracking() {
  const [progressState, setProgressState] = useState<ProgressState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const startProgressTracking = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgressState(null);

    try {
      const response = await fetch('/api/generate/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('网络请求失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
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
                  setProgressState(data.data);
                  break;
                case 'complete':
                  console.log('进度跟踪完成，设置结果:', data.data.travelGuide);
                  setProgressState(data.data.progress);
                  setResult(data.data.travelGuide);
                  setIsLoading(false);
                  break;
                case 'error':
                  setProgressState(data.data.progress);
                  setError(data.data.error);
                  setIsLoading(false);
                  break;
              }
            } catch (e) {
              // 忽略JSON解析错误
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      setIsLoading(false);
    }
  };

  return {
    progressState,
    isLoading,
    error,
    result,
    startProgressTracking,
  };
}
