"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAITravel } from "@/hooks/use-ai-travel";
import { Loader2, MapPin, Calendar, DollarSign, Users, Star, Lightbulb, Cloud, Globe } from "lucide-react";

export function AITravelAssistant() {
  const [activeTab, setActiveTab] = useState("travel-plan");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [travelStyle, setTravelStyle] = useState<"luxury" | "budget" | "adventure" | "cultural" | "relaxation">("cultural");
  const [groupSize, setGroupSize] = useState(1);
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [aiResponse, setAiResponse] = useState<any>(null);

  const {
    isLoading,
    error,
    createTravelPlan,
    calculateBudget,
    getQuickPlan,
    getBudgetEstimate,
    getCulturalTips,
    clearError,
  } = useAITravel();

  const handleCreateTravelPlan = async () => {
    if (!destination || !duration || !budget) {
      alert("请填写必要信息");
      return;
    }

    const response = await createTravelPlan({
      destination,
      duration,
      budget,
      interests,
      travelStyle,
      groupSize,
      specialRequirements: specialRequirements ? specialRequirements.split(",").map(s => s.trim()) : [],
    });

    if (response.success) {
      setAiResponse(response);
    }
  };

  const handleQuickPlan = async () => {
    if (!destination) {
      alert("请输入目的地");
      return;
    }

    const response = await getQuickPlan(destination);
    if (response.success) {
      setAiResponse(response);
    }
  };

  const handleBudgetEstimate = async () => {
    if (!destination) {
      alert("请输入目的地");
      return;
    }

    const response = await getBudgetEstimate(destination);
    if (response.success) {
      setAiResponse(response);
    }
  };

  const handleCulturalTips = async () => {
    if (!destination) {
      alert("请输入目的地");
      return;
    }

    const response = await getCulturalTips(destination);
    if (response.success) {
      setAiResponse(response);
    }
  };

  const addInterest = (interest: string) => {
    if (interest && !interests.includes(interest)) {
      setInterests([...interests, interest]);
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const interestOptions = ["文化古迹", "美食", "自然风光", "购物", "冒险运动", "休闲放松", "摄影", "历史"];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI 智能旅行助手
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          利用先进的AI技术，为您提供个性化的旅行规划、预算计算、行程优化、天气建议和文化指导
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="travel-plan" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            旅行计划
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            预算计算
          </TabsTrigger>
          <TabsTrigger value="quick-plan" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            快速规划
          </TabsTrigger>
          <TabsTrigger value="weather" className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            天气建议
          </TabsTrigger>
          <TabsTrigger value="cultural" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            文化指南
          </TabsTrigger>
        </TabsList>

        {/* 旅行计划创建 */}
        <TabsContent value="travel-plan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                创建个性化旅行计划
              </CardTitle>
              <CardDescription>
                详细描述您的旅行需求，AI将为您量身定制完美的旅行方案
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">目的地 *</Label>
                  <Input
                    id="destination"
                    placeholder="例如：日本东京"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">旅行时长 *</Label>
                  <Input
                    id="duration"
                    placeholder="例如：7天6夜"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">预算范围 *</Label>
                  <Input
                    id="budget"
                    placeholder="例如：15000元/人"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="travel-style">旅行风格</Label>
                  <Select value={travelStyle} onValueChange={(value: any) => setTravelStyle(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="luxury">奢华享受</SelectItem>
                      <SelectItem value="budget">经济实惠</SelectItem>
                      <SelectItem value="adventure">冒险刺激</SelectItem>
                      <SelectItem value="cultural">文化深度</SelectItem>
                      <SelectItem value="relaxation">休闲放松</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-size">团队人数</Label>
                  <Input
                    id="group-size"
                    type="number"
                    min="1"
                    value={groupSize}
                    onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="special-requirements">特殊要求</Label>
                  <Input
                    id="special-requirements"
                    placeholder="例如：无障碍设施、素食餐厅"
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>旅行兴趣</Label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((interest) => (
                    <Badge
                      key={interest}
                      variant={interests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => interests.includes(interest) ? removeInterest(interest) : addInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCreateTravelPlan}
                disabled={isLoading || !destination || !duration || !budget}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在生成...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    生成旅行计划
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 快速规划 */}
        <TabsContent value="quick-plan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                快速旅行规划
              </CardTitle>
              <CardDescription>
                输入目的地，快速获得AI生成的旅行建议
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quick-destination">目的地</Label>
                <Input
                  id="quick-destination"
                  placeholder="例如：巴黎、京都、纽约"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={handleQuickPlan} disabled={isLoading || !destination}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                  快速规划
                </Button>
                <Button onClick={handleBudgetEstimate} disabled={isLoading || !destination}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
                  预算估算
                </Button>
                <Button onClick={handleCulturalTips} disabled={isLoading || !destination}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
                  文化指南
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 其他标签页内容可以类似实现 */}
        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>预算计算功能</CardTitle>
              <CardDescription>详细计算旅行预算，包括各项费用明细</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">预算计算功能正在开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>天气建议功能</CardTitle>
              <CardDescription>根据目的地和旅行时间提供天气信息和着装建议</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">天气建议功能正在开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cultural" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>文化指南功能</CardTitle>
              <CardDescription>提供目的地的文化习俗、礼仪和注意事项</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">文化指南功能正在开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI 响应显示 */}
      {aiResponse && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              AI 智能建议
            </CardTitle>
            <CardDescription>
              基于您的需求生成的个性化旅行建议
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                {JSON.stringify(aiResponse.result, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误显示 */}
      {error && (
        <Card className="mt-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <span className="text-sm font-medium">错误：{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                清除
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
