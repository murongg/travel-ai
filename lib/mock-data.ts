export interface BudgetItem {
  category: string
  amount: number
  percentage: number
  color: string
}

export interface TravelGuide {
  title: string
  destination: string
  duration: string
  budget: string
  overview: string
  highlights: string[]
  itinerary: DayPlan[]
  tips: string[]
  map_locations?: MapLocation[]
  budget_breakdown?: BudgetItem[]
  weather_info: WeatherInfo
}

export interface WeatherInfo {
  current: {
    temperature: string
    condition: string
    humidity: string
    windSpeed: string
    windDirection: string
    reportTime: string
  }
  forecast: Array<{
    date: string // YYYY-MM-DD 格式
    readableDate: string // 可读格式，如"3月15日"
    week: string // 周几，如"周一"
    dayWeather: string
    nightWeather: string
    dayTemp: string
    nightTemp: string
    dayWind: string
    nightWind: string
    dayPower: string
    nightPower: string
  }>
  advice: string
  startDate?: string
  endDate?: string
  duration: number
}

export interface MapLocation {
  name: string
  type: "attraction" | "restaurant" | "hotel"
  day?: number
  description?: string
  coordinates?: [number, number] // [lng, lat] 高德地图格式
}

export interface DayPlan {
  day: number
  title: string
  activities: Activity[]
  meals: Meal[]
  accommodation?: string
}

export interface Activity {
  time: string
  name: string
  description: string
  location: string
  duration: string
  cost: string
  tips?: string
  coordinates?: [number, number] // [lng, lat] 高德地图格式
}

export interface Meal {
  type: "breakfast" | "lunch" | "dinner"
  name: string
  location: string
  cost: string
  description: string
}

