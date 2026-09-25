import { getApps, initializeApp } from 'firebase/app'
import {
  initializeAnalytics,
  logEvent,
  setConsent,
  setAnalyticsCollectionEnabled,
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
let initialization: Promise<boolean> | null = null
let pendingEvents: Array<{ name: string; params?: Record<string, unknown> }> = []
let consentGranted = false
let consentVersion = 0

export function initAnalytics(): Promise<boolean> {
  consentGranted = true
  if (analytics) {
    setConsent({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    setAnalyticsCollectionEnabled(analytics, true)
    return Promise.resolve(true)
  }
  if (initialization) {
    return initialization.then((ready) => ready || (consentGranted ? initAnalytics() : false))
  }
  if (!import.meta.env.PROD) return Promise.resolve(false)

  const version = consentVersion
  initialization = (async () => {
    try {
      if (!(await isSupported())) return false
      if (!consentGranted || version !== consentVersion) return false

      const app = getApps().find((firebaseApp) => firebaseApp.name === '[DEFAULT]')
        ?? initializeApp(firebaseConfig)
      analytics = initializeAnalytics(app, { config: { send_page_view: false } })
      setConsent({
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
      setAnalyticsCollectionEnabled(analytics, true)

      for (const event of pendingEvents) logEvent(analytics, event.name, event.params)
      pendingEvents = []
      return true
    } catch {
      analytics = null
      pendingEvents = []
      return false
    } finally {
      initialization = null
    }
  })()

  return initialization
}

export function disableAnalytics(): void {
  consentGranted = false
  consentVersion += 1
  pendingEvents = []
  if (!analytics) return

  setConsent({
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  setAnalyticsCollectionEnabled(analytics, false)
}

export function track(name: string, params?: Record<string, unknown>): void {
  if (!consentGranted) return

  if (analytics) {
    logEvent(analytics, name, params)
  } else if (initialization) {
    pendingEvents.push({ name, params })
  }
}
