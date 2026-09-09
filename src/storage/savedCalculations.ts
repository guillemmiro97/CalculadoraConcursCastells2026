import type { SavedCalculation, Round } from '../domain/types'

const STORAGE_KEY_V1 = 'concurs-castells:saved-calculations:v1'
const STORAGE_KEY_V2 = 'concurs-castells:saved-calculations:v2'
const MAX_SAVED = 100

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function isValidRound(r: unknown): r is Round {
  if (!r || typeof r !== 'object') return false
  const obj = r as Record<string, unknown>
  if (obj.result === 'none' && obj.castell === null) return true
  if (typeof obj.castell !== 'string') return obj.castell === null
  if (typeof obj.result !== 'string') return false
  return ['none', 'descarregat', 'carregat', 'intent', 'intentDesmuntat'].includes(obj.result)
}

function isValidSavedCalculation(entry: unknown): entry is SavedCalculation {
  if (!entry || typeof entry !== 'object') return false
  const obj = entry as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.createdAt === 'string' &&
    Array.isArray(obj.rounds) &&
    obj.rounds.length === 5 &&
    obj.rounds.every(isValidRound)
  )
}

function migrateV1ToV2(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V1)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return
    const migrated = parsed.map((entry: Record<string, unknown>) => ({
      ...entry,
      collaId: undefined,
    }))
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated))
  } catch {
    // ignore corrupt v1 data
  }
}

function ensureMigrated(): void {
  const hasV2 = localStorage.getItem(STORAGE_KEY_V2) !== null
  if (!hasV2) {
    migrateV1ToV2()
  }
}

export function loadSavedCalculations(): SavedCalculation[] {
  ensureMigrated()
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidSavedCalculation)
  } catch {
    return []
  }
}

export function saveCalculation(calc: Omit<SavedCalculation, 'id' | 'createdAt'>): SavedCalculation {
  const saved = loadSavedCalculations()
  if (saved.length >= MAX_SAVED) {
    throw new Error('MAX_REACHED')
  }
  const newCalc: SavedCalculation = {
    ...calc,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  saved.unshift(newCalc)
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(saved))
  return newCalc
}

export function deleteSavedCalculation(id: string): SavedCalculation[] {
  const saved = loadSavedCalculations().filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(saved))
  return saved
}

export function renameSavedCalculation(id: string, name: string): SavedCalculation[] {
  const saved = loadSavedCalculations().map((c) => (c.id === id ? { ...c, name } : c))
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(saved))
  return saved
}

export function updateSavedCalculationColla(id: string, collaId: string | undefined): SavedCalculation[] {
  const saved = loadSavedCalculations().map((c) => (c.id === id ? { ...c, collaId } : c))
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(saved))
  return saved
}

export function updateSavedCalculation(id: string, updates: Partial<Omit<SavedCalculation, 'id' | 'createdAt'>>): SavedCalculation[] {
  const saved = loadSavedCalculations().map((c) =>
    c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
  )
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(saved))
  return saved
}

export function getSavedCalculation(id: string): SavedCalculation | undefined {
  return loadSavedCalculations().find((c) => c.id === id)
}
