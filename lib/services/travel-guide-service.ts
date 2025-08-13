import { supabase, TravelGuide, isSupabaseConfigured } from '@/lib/supabase'
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase-admin'

export class TravelGuideService {
  // 创建新的旅行指南
  static async createTravelGuide(travelGuide: TravelGuide): Promise<{ data: TravelGuide | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.' } 
      }
    }

    try {
      // 优先使用服务端管理员客户端以绕过RLS
      const admin = getSupabaseAdminClient()
      if (admin) {
        const { data, error } = await admin
          .from('travel_guides')
          .insert([travelGuide])
          .select()
          .single()

        if (error) {
          console.error('Error creating travel guide (admin):', error)
          return { data: null, error }
        }

        return { data: data as unknown as TravelGuide, error: null }
      }

      const { data, error } = await supabase
        .from('travel_guides')
        .insert([travelGuide])
        .select()
        .single()

      if (error) {
        console.error('Error creating travel guide:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Exception creating travel guide:', error)
      return { data: null, error }
    }
  }

  // 根据ID获取旅行指南
  static async getTravelGuideById(id: string): Promise<{ data: TravelGuide | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.' } 
      }
    }

    try {
      const { data, error } = await supabase
        .from('travel_guides')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching travel guide:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Exception fetching travel guide:', error)
      return { data: null, error }
    }
  }

  // 根据提示词获取旅行指南
  static async getTravelGuideByPrompt(prompt: string): Promise<{ data: TravelGuide | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.' } 
      }
    }

    try {
      const { data, error } = await supabase
        .from('travel_guides')
        .select('*')
        .eq('prompt', prompt)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error('Error fetching travel guide by prompt:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Exception fetching travel guide by prompt:', error)
      return { data: null, error }
    }
  }

  // 获取所有公开的旅行指南
  static async getPublicTravelGuides(): Promise<{ data: TravelGuide[] | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.' } 
      }
    }

    try {
      const { data, error } = await supabase
        .from('travel_guides')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching public travel guides:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Exception fetching public travel guides:', error)
      return { data: null, error }
    }
  }

  // 根据目的地搜索旅行指南
  static async searchTravelGuidesByDestination(destination: string): Promise<{ data: TravelGuide[] | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.' } 
      }
    }

    try {
      const { data, error } = await supabase
        .from('travel_guides')
        .select('*')
        .ilike('destination', `%${destination}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching travel guides by destination:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Exception searching travel guides by destination:', error)
      return { data: null, error }
    }
  }

  // 更新旅行指南
  static async updateTravelGuide(id: string, updates: Partial<TravelGuide>): Promise<{ data: TravelGuide | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.' } 
      }
    }

    try {
      const { data, error } = await supabase
        .from('travel_guides')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating travel guide:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Exception updating travel guide:', error)
      return { data: null, error }
    }
  }

  // 删除旅行指南
  static async deleteTravelGuide(id: string): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) {
      return { 
        error: { message: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.' } 
      }
    }

    try {
      const { error } = await supabase
        .from('travel_guides')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting travel guide:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Exception deleting travel guide:', error)
      return { error }
    }
  }

  // 获取用户的旅行指南
  static async getUserTravelGuides(userId: string): Promise<{ data: TravelGuide[] | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.' } 
      }
    }

    try {
      const { data, error } = await supabase
        .from('travel_guides')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user travel guides:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Exception fetching user travel guides:', error)
      return { data: null, error }
    }
  }
}
