export interface TravelTemplate {
  id: string
  title: string
  description: string
  category: string
  duration: string
  budget: string
  difficulty: "easy" | "medium" | "hard"
  tags: string[]
  image: string
  prompt: string
  features: string[]
}

export const travelTemplates: TravelTemplate[] = [
  {
    id: "family-trip",
    title: "亲子游攻略",
    description: "适合全家出行的温馨旅程，包含儿童友好的景点和活动",
    category: "家庭旅行",
    duration: "3-7天",
    budget: "中等",
    difficulty: "easy",
    tags: ["亲子", "家庭", "儿童友好", "安全"],
    image: "/placeholder.svg?height=200&width=300",
    prompt: "为一个有小孩的家庭规划{destination}的{duration}天旅行，包含适合儿童的景点、安全的住宿和方便的交通安排",
    features: ["儿童友好景点", "安全住宿", "便民设施", "教育意义"],
  },
  {
    id: "honeymoon",
    title: "蜜月旅行",
    description: "浪漫温馨的二人世界，精选情侣必去的浪漫景点",
    category: "情侣旅行",
    duration: "5-10天",
    budget: "高端",
    difficulty: "easy",
    tags: ["浪漫", "情侣", "蜜月", "奢华"],
    image: "/placeholder.svg?height=200&width=300",
    prompt: "为新婚夫妇规划{destination}的{duration}天浪漫蜜月之旅，包含浪漫餐厅、情侣活动和私密住宿",
    features: ["浪漫景点", "高端住宿", "情侣活动", "私人体验"],
  },
  {
    id: "backpacker",
    title: "背包客之旅",
    description: "经济实惠的自由行，体验当地文化和自然风光",
    category: "自由行",
    duration: "7-30天",
    budget: "经济",
    difficulty: "medium",
    tags: ["背包客", "经济", "自由行", "文化体验"],
    image: "/placeholder.svg?height=200&width=300",
    prompt: "为背包客规划{destination}的{duration}天经济型自由行，包含青旅住宿、当地交通和文化体验活动",
    features: ["经济住宿", "当地交通", "文化体验", "自然探索"],
  },
  {
    id: "business-trip",
    title: "商务出差",
    description: "高效便捷的商务旅行，兼顾工作和休闲",
    category: "商务旅行",
    duration: "2-5天",
    budget: "中高端",
    difficulty: "easy",
    tags: ["商务", "高效", "便捷", "会议"],
    image: "/placeholder.svg?height=200&width=300",
    prompt: "为商务人士规划{destination}的{duration}天出差行程，包含商务酒店、会议场所和短暂休闲时光",
    features: ["商务酒店", "交通便利", "会议设施", "休闲时间"],
  },
  {
    id: "adventure",
    title: "探险之旅",
    description: "刺激的户外探险，挑战自我极限",
    category: "探险旅行",
    duration: "5-14天",
    budget: "中高端",
    difficulty: "hard",
    tags: ["探险", "户外", "挑战", "刺激"],
    image: "/placeholder.svg?height=200&width=300",
    prompt: "为探险爱好者规划{destination}的{duration}天户外探险之旅，包含徒步、攀岩等刺激活动和专业装备建议",
    features: ["户外活动", "专业装备", "安全保障", "挑战体验"],
  },
  {
    id: "cultural",
    title: "文化深度游",
    description: "深入了解当地历史文化，品味传统艺术",
    category: "文化旅行",
    duration: "4-8天",
    budget: "中等",
    difficulty: "medium",
    tags: ["文化", "历史", "艺术", "传统"],
    image: "/placeholder.svg?height=200&width=300",
    prompt: "为文化爱好者规划{destination}的{duration}天深度文化之旅，包含博物馆、历史遗迹和传统艺术体验",
    features: ["历史遗迹", "博物馆参观", "艺术体验", "文化交流"],
  },
  {
    id: "food-tour",
    title: "美食之旅",
    description: "品尝地道美食，探索当地饮食文化",
    category: "美食旅行",
    duration: "3-6天",
    budget: "中等",
    difficulty: "easy",
    tags: ["美食", "餐厅", "小吃", "烹饪"],
    image: "/placeholder.svg?height=200&width=300",
    prompt: "为美食爱好者规划{destination}的{duration}天美食探索之旅，包含特色餐厅、街头小吃和烹饪体验",
    features: ["特色餐厅", "街头美食", "烹饪课程", "市场探索"],
  },
  {
    id: "wellness",
    title: "养生度假",
    description: "放松身心的健康之旅，享受SPA和瑜伽",
    category: "养生旅行",
    duration: "4-7天",
    budget: "高端",
    difficulty: "easy",
    tags: ["养生", "SPA", "瑜伽", "放松"],
    image: "/placeholder.svg?height=200&width=300",
    prompt: "为追求身心健康的旅客规划{destination}的{duration}天养生度假之旅，包含SPA、瑜伽和健康饮食",
    features: ["SPA体验", "瑜伽课程", "健康饮食", "冥想放松"],
  },
]

export const templateCategories = [
  "全部",
  "家庭旅行",
  "情侣旅行",
  "自由行",
  "商务旅行",
  "探险旅行",
  "文化旅行",
  "美食旅行",
  "养生旅行",
]
