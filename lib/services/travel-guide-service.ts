import { FirebaseTravelGuide, isFirebaseConfigured } from '@/lib/firebase'
import { getFirebaseAdminDb, isFirebaseAdminConfigured } from '@/lib/firebase-admin'

// 工具函数：清理数据，移除 undefined 值
function cleanFirestoreData(data: any): any {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )
}

export class TravelGuideService {
  // 创建新的旅行指南
  static async createTravelGuide(travelGuide: FirebaseTravelGuide): Promise<{ data: FirebaseTravelGuide | null; error: any }> {
    if (!isFirebaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Firebase not configured. Please set Firebase environment variables.' } 
      }
    }

    try {
      // 使用服务端管理员客户端
      const adminDb = getFirebaseAdminDb()
      if (!adminDb) {
        return { 
          data: null, 
          error: { message: 'Firebase admin not available. Please check server configuration.' } 
        }
      }

      // 过滤掉 undefined 值，避免 Firestore 错误
      const cleanData = cleanFirestoreData(travelGuide)
      
      const docRef = await adminDb.collection('travel_guides').add({
        ...cleanData,
        created_at: new Date()
      })
      
      const docSnap = await docRef.get()
      const data = { id: docRef.id, ...docSnap.data() } as FirebaseTravelGuide
      
      return { data, error: null }
    } catch (error) {
      console.error('Exception creating travel guide:', error)
      return { data: null, error }
    }
  }

  // 根据ID获取旅行指南
  static async getTravelGuideById(id: string): Promise<{ data: FirebaseTravelGuide | null; error: any }> {
    if (!isFirebaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Firebase not configured. Please set Firebase environment variables.' } 
      }
    }

    try {
      const adminDb = getFirebaseAdminDb()
      if (!adminDb) {
        return { 
          data: null, 
          error: { message: 'Firebase admin not available. Please check server configuration.' } 
        }
      }

      const docRef = adminDb.collection('travel_guides').doc(id)
      const docSnap = await docRef.get()

      if (!docSnap.exists) {
        return { data: null, error: { message: 'Travel guide not found' } }
      }

      const data = { id: docSnap.id, ...docSnap.data() } as FirebaseTravelGuide
      return { data, error: null }
    } catch (error) {
      console.error('Exception fetching travel guide:', error)
      return { data: null, error }
    }
  }

  // 根据提示词获取旅行指南
  static async getTravelGuideByPrompt(prompt: string): Promise<{ data: FirebaseTravelGuide | null; error: any }> {
    if (!isFirebaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Firebase not configured. Please set Firebase environment variables.' } 
      }
    }

    try {
      const adminDb = getFirebaseAdminDb()
      if (!adminDb) {
        return { 
          data: null, 
          error: { message: 'Firebase admin not available. Please check server configuration.' } 
        }
      }

      const querySnapshot = await adminDb
        .collection('travel_guides')
        .where('prompt', '==', prompt)
        .orderBy('created_at', 'desc')
        .limit(1)
        .get()
      
      if (querySnapshot.empty) {
        return { data: null, error: { message: 'No travel guide found with this prompt' } }
      }

      const docSnap = querySnapshot.docs[0]
      const data = { id: docSnap.id, ...docSnap.data() } as FirebaseTravelGuide
      
      return { data, error: null }
    } catch (error) {
      console.error('Exception fetching travel guide by prompt:', error)
      return { data: null, error }
    }
  }

  // 获取所有公开的旅行指南
  static async getPublicTravelGuides(): Promise<{ data: FirebaseTravelGuide[] | null; error: any }> {
    if (!isFirebaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Firebase not configured. Please set Firebase environment variables.' } 
      }
    }

    try {
      const adminDb = getFirebaseAdminDb()
      if (!adminDb) {
        return { 
          data: null, 
          error: { message: 'Firebase admin not available. Please check server configuration.' } 
        }
      }

      const querySnapshot = await adminDb
        .collection('travel_guides')
        .where('is_public', '==', true)
        .orderBy('created_at', 'desc')
        .get()
      
      const data = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseTravelGuide[]

      return { data, error: null }
    } catch (error) {
      console.error('Exception fetching public travel guides:', error)
      return { data: null, error }
    }
  }

  // 根据目的地搜索旅行指南
  static async searchTravelGuidesByDestination(destination: string): Promise<{ data: FirebaseTravelGuide[] | null; error: any }> {
    if (!isFirebaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Firebase not configured. Please set Firebase environment variables.' } 
      }
    }

    try {
      const adminDb = getFirebaseAdminDb()
      if (!adminDb) {
        return { 
          data: null, 
          error: { message: 'Firebase admin not available. Please check server configuration.' } 
        }
      }

      // Firebase不支持原生文本搜索，这里使用简单的相等匹配
      // 在生产环境中，建议使用Algolia等搜索服务
      const querySnapshot = await adminDb
        .collection('travel_guides')
        .where('destination', '==', destination)
        .orderBy('created_at', 'desc')
        .get()
      
      const data = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseTravelGuide[]

      return { data, error: null }
    } catch (error) {
      console.error('Exception searching travel guides by destination:', error)
      return { data: null, error }
    }
  }

  // 更新旅行指南
  static async updateTravelGuide(id: string, updates: Partial<FirebaseTravelGuide>): Promise<{ data: FirebaseTravelGuide | null; error: any }> {
    if (!isFirebaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Firebase not configured. Please set Firebase environment variables.' } 
      }
    }

    try {
      const adminDb = getFirebaseAdminDb()
      if (!adminDb) {
        return { 
          data: null, 
          error: { message: 'Firebase admin not available. Please check server configuration.' } 
        }
      }

      // 过滤掉 undefined 值，避免 Firestore 错误
      const cleanUpdates = cleanFirestoreData(updates)
      
      const docRef = adminDb.collection('travel_guides').doc(id)
      await docRef.update(cleanUpdates)

      // 获取更新后的文档
      const docSnap = await docRef.get()
      const data = { id: docSnap.id, ...docSnap.data() } as FirebaseTravelGuide

      return { data, error: null }
    } catch (error) {
      console.error('Exception updating travel guide:', error)
      return { data: null, error }
    }
  }

  // 删除旅行指南
  static async deleteTravelGuide(id: string): Promise<{ error: any }> {
    if (!isFirebaseConfigured()) {
      return { 
        error: { message: 'Firebase not configured. Please set Firebase environment variables.' } 
      }
    }

    try {
      const adminDb = getFirebaseAdminDb()
      if (!adminDb) {
        return { 
          error: { message: 'Firebase admin not available. Please check server configuration.' } 
        }
      }

      const docRef = adminDb.collection('travel_guides').doc(id)
      await docRef.delete()

      return { error: null }
    } catch (error) {
      console.error('Exception deleting travel guide:', error)
      return { error }
    }
  }

  // 获取用户的旅行指南
  static async getUserTravelGuides(userId: string): Promise<{ data: FirebaseTravelGuide[] | null; error: any }> {
    if (!isFirebaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Firebase not configured. Please set Firebase environment variables.' } 
      }
    }

    try {
      const adminDb = getFirebaseAdminDb()
      if (!adminDb) {
        return { 
          data: null, 
          error: { message: 'Firebase admin not available. Please check server configuration.' } 
        }
      }

      const querySnapshot = await adminDb
        .collection('travel_guides')
        .where('user_id', '==', userId)
        .orderBy('created_at', 'desc')
        .get()
      
      const data = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseTravelGuide[]

      return { data, error: null }
    } catch (error) {
      console.error('Exception fetching user travel guides:', error)
      return { data: null, error }
    }
  }
}
