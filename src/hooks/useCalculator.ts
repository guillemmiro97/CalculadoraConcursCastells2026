import { useState, useCallback, useEffect } from 'react'
import type { Round, ScoringResult, TabId } from '../domain/types'
import { calculateScore } from '../domain/scoring'
import { encodeRounds, decodeRounds, encodeCollaId } from '../utils/share'

const STORAGE_KEY = 'calc-concurs-2026'
const SCHEMA_VERSION = 1

interface StoredState {
  version: number
  rounds: Round[]
  collaId?: string
}

const DEFAULT_ROUNDS: Round[] = Array.from({ length: 5 }, () => ({
  castell: null,
  result: 'none',
}))

function loadState(): { rounds: Round[]; collaId: string | undefined } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { rounds: DEFAULT_ROUNDS, collaId: undefined }
    const data: StoredState = JSON.parse(raw)
    if (data.version !== SCHEMA_VERSION || !Array.isArray(data.rounds)) return { rounds: DEFAULT_ROUNDS, collaId: undefined }
    return { rounds: data.rounds, collaId: data.collaId }
  } catch {
    return { rounds: DEFAULT_ROUNDS, collaId: undefined }
  }
}

function loadFromUrl(): { rounds: Round[]; collaId: string | null } | null {
  const hash = window.location.hash.slice(1)
  if (!hash) return null
  return decodeRounds(hash)
}

function saveState(rounds: Round[], collaId: string | undefined): void {
  const data: StoredState = { version: SCHEMA_VERSION, rounds, collaId }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useCalculator() {
  const [rounds, setRounds] = useState<Round[]>(() => {
    const urlState = loadFromUrl()
    return urlState?.rounds ?? loadState().rounds
  })
  const [collaId, setCollaId] = useState<string | undefined>(() => {
    const urlState = loadFromUrl()
    return urlState?.collaId ?? loadState().collaId
  })
  const [activeTab, setActiveTab] = useState<TabId>('calculadora')
  const [expandedRound, setExpandedRound] = useState<number | null>(0)
  const [confirmClear, setConfirmClear] = useState(false)
  const [editingCalcId, setEditingCalcId] = useState<string | null>(null)

  const scoring: ScoringResult = calculateScore(rounds)

  useEffect(() => {
    saveState(rounds, collaId)
  }, [rounds, collaId])

  useEffect(() => {
    if (rounds.some((r) => r.castell)) {
      const encoded = encodeRounds(rounds)
      const collaPart = collaId ? `@${encodeCollaId(collaId)}` : ''
      window.location.hash = encoded + collaPart
    } else {
      window.location.hash = ''
    }
  }, [rounds, collaId])

  const updateRound = useCallback((index: number, castell: Round['castell'], result: Round['result']) => {
    setRounds((prev) => {
      const next = [...prev]
      next[index] = { castell, result }
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setRounds(DEFAULT_ROUNDS)
    setCollaId(undefined)
    setConfirmClear(false)
    window.location.hash = ''
  }, [])

  const hasContent = rounds.some((r) => r.castell)

  const restoreRounds = useCallback((newRounds: Round[], newCollaId?: string) => {
    setRounds(newRounds)
    setCollaId(newCollaId)
    window.location.hash = ''
  }, [])

  const startEditing = useCallback((id: string, newRounds: Round[], newCollaId?: string) => {
    setRounds(newRounds)
    setCollaId(newCollaId)
    setEditingCalcId(id)
    window.location.hash = ''
  }, [])

  const finishEditing = useCallback(() => {
    setEditingCalcId(null)
  }, [])

  const share = useCallback(async () => {
    const lines: string[] = ['Calculadora Concurs 2026', '']
    for (let i = 0; i < rounds.length; i++) {
      const r = rounds[i]
      if (!r.castell) continue
      const resultLabel =
        r.result === 'descarregat' ? 'D' :
        r.result === 'carregat' ? 'C' :
        r.result === 'intent' ? 'I' :
        r.result === 'intentDesmuntat' ? 'ID' : '?'
      const candidate = scoring.counted.find((c) => c.roundIndex === i)
      const pts = candidate ? candidate.points : 0
      lines.push(`${r.castell} ${resultLabel} — ${pts}`)
    }
    lines.push('')
    lines.push(`Total: ${scoring.total} punts`)
    const text = lines.join('\n')

    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {
        await navigator.clipboard.writeText(text)
      }
    } else {
      await navigator.clipboard.writeText(text)
    }
  }, [rounds, scoring])

  return {
    rounds,
    collaId,
    setCollaId,
    scoring,
    activeTab,
    setActiveTab,
    expandedRound,
    setExpandedRound,
    updateRound,
    clearAll,
    confirmClear,
    setConfirmClear,
    share,
    hasContent,
    restoreRounds,
    editingCalcId,
    startEditing,
    finishEditing,
  }
}
