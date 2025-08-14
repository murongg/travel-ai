import { TravelGuide as BaseTravelGuide } from './mock-data'

// 数据库表类型定义
export interface FirebaseTravelGuide extends BaseTravelGuide {
  id?: string
  created_at?: string
  user_id?: string
  is_public?: boolean
  prompt: string
  transportation: string
}

// 检查环境变量是否配置
export const isFirebaseConfigured = () => {
  return process.env.FIREBASE_PROJECT_ID && 
         process.env.FIREBASE_PRIVATE_KEY && 
         process.env.FIREBASE_CLIENT_EMAIL
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
