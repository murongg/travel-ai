import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'

// 只有在运行时才检查环境变量
const isClient = typeof window !== 'undefined'
const isServer = typeof window === 'undefined'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 检查环境变量是否配置
export const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

// 用户认证相关类型
export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar?: string
  created_at: string
}

export interface SignUpData {
  email: string
  password: string
  name?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface UpdateProfileData {
  name?: string
  avatar?: string
}

// 数据库表类型定义
export interface TravelGuide {
  id?: string
  created_at?: string
  prompt: string
  destination: string
  duration: string
  budget: string
  overview: string
  highlights: string[]
  tips: string[]
  itinerary: DayPlan[]
  map_locations: MapLocation[]
  budget_breakdown: BudgetItem[]
  transportation: string
  user_id?: string
  is_public?: boolean
}

export interface DayPlan {
  day: number
  activities: Activity[]
  meals: Meal[]
  accommodation?: string
}

export interface Activity {
  name: string
  description: string
  time: string
  location: string
  cost?: number
  transportation?: {
    mode: string
    route: string
    duration: string
    cost: number
  }
}

export interface Meal {
  name: string
  description: string
  time: string
  location: string
  cost?: number
  transportation?: {
    mode: string
    route: string
    duration: string
    cost: number
  }
}

export interface MapLocation {
  name: string
  type: 'attraction' | 'restaurant' | 'hotel'
  day: number
  description?: string
  coordinates?: [number, number]
}

export interface BudgetItem {
  category: string
  amount: number
  percentage: number
  color: string
  description?: string
}
