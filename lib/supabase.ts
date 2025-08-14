import { createClient } from '@supabase/supabase-js'
import { TravelGuide as BaseTravelGuide } from './mock-data'

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
export interface SupabaseTravelGuide extends BaseTravelGuide {
  id?: string
  created_at?: string
  user_id?: string
  is_public?: boolean
  prompt: string
  transportation: string
}

