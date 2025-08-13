export interface BudgetItem {
  category: string
  amount: number
  percentage: number
  color: string
}

export interface TravelGuide {
  id: string
  title: string
  destination: string
  duration: string
  budget: string
  overview: string
  highlights: string[]
  itinerary: DayPlan[]
  tips: string[]
  mapLocations?: MapLocation[]
  budgetBreakdown?: BudgetItem[]
  createdAt: string
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
}

export interface Meal {
  type: "breakfast" | "lunch" | "dinner"
  name: string
  location: string
  cost: string
  description: string
}

