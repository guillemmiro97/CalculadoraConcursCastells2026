import { initializeApp } from 'firebase/app'
import {
  getAnalytics,
  logEvent,
  setConsent,
  isSupported,
  type Analytics,
} from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyBSsVGRQ0m2WN7swfHqLcleTAy71EqmKCY',
  authDomain: 'calculador-concurs-castells.firebaseapp.com',
  projectId: 'calculador-concurs-castells',
  storageBucket: 'calculador-concurs-castells.firebasestorage.app',
  messagingSenderId: '467571264447',
  appId: '1:467571264447:web:7a613f2c527e02dd01ef0a',
  measurementId: 'G-EHTDF8PHRH',
}

let analytics: Analytics | null = null

export async function initAnalytics(): Promise<void> {
  if (!import.meta.env.PROD) return
  if (!(await isSupported())) return
  analytics = getAnalytics(initializeApp(firebaseConfig))
  setConsent({
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
}

export function track(name: string, params?: Record<string, unknown>): void {
  if (analytics) logEvent(analytics, name, params)
}
