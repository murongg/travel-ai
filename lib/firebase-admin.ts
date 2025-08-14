import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp, getApps, cert, ServiceAccount, App } from 'firebase-admin/app'

let adminApp: any = null
let adminAuth: any = null
let adminDb: any = null

export function getFirebaseAdminApp() {
  if (typeof window !== 'undefined') return null
  
  if (!adminApp) {
    const serviceAccount: any = {
      type: process.env.FIREBASE_TYPE || 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID || '',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
      private_key: process.env.FIREBASE_PRIVATE_KEY ? 
        process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
      client_email: process.env.FIREBASE_CLIENT_EMAIL || '',
      client_id: process.env.FIREBASE_CLIENT_ID || '',
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 
        'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || ''
    }

    if (!getApps().length) {
      adminApp = initializeApp({
        credential: cert(serviceAccount)
      })
    } else {
      adminApp = getApps()[0]
    }
  }
  
  return adminApp as App
}

export function getFirebaseAdminAuth() {
  if (typeof window !== 'undefined') return null
  
  if (!adminAuth) {
    const app = getFirebaseAdminApp()
    if (app) {
      adminAuth = getAuth(app)
    }
  }
  
  return adminAuth
}

export function getFirebaseAdminDb() {
  if (typeof window !== 'undefined') return null
  
  if (!adminDb) {
    const app = getFirebaseAdminApp()
    if (app) {
      adminDb = getFirestore(app)
    }
  }
  
  return adminDb
}

export function isFirebaseAdminConfigured(): boolean {
  return !!(process.env.FIREBASE_PROJECT_ID && 
           process.env.FIREBASE_PRIVATE_KEY && 
           process.env.FIREBASE_CLIENT_EMAIL)
}
