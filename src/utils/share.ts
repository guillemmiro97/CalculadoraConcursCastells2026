import type { Round, CastellCode, CastellResult } from '../domain/types'
import { colles2026 } from '../data/colles2026'

const RESULT_CHARS: Record<string, string> = {
  none: 'n',
  descarregat: 'd',
  carregat: 'c',
  intent: 'i',
  intentDesmuntat: 'x',
}

const CHAR_TO_RESULT: Record<string, CastellResult> = {
  n: 'none',
  d: 'descarregat',
  c: 'carregat',
  i: 'intent',
  x: 'intentDesmuntat',
}

const VALID_COLLA_IDS = new Set(colles2026.map((c) => c.id))

export function encodeCollaId(id: string): string {
  return encodeURIComponent(id)
}

export function decodeCollaId(raw: string): string | null {
  try {
    const decoded = decodeURIComponent(raw)
    return VALID_COLLA_IDS.has(decoded) ? decoded : null
  } catch {
    return null
  }
}

export function encodeRounds(rounds: Round[]): string {
  return rounds
    .map((r) => {
      const code = r.castell ?? '-'
      const result = RESULT_CHARS[r.result] ?? 'n'
      return `${code}.${result}`
    })
    .join('/')
}

export function decodeRounds(hash: string): { rounds: Round[]; collaId: string | null } | null {
  try {
    const [roundsPart, collaPart] = hash.split('@')
    if (!roundsPart) return null

    const parts = roundsPart.split('/')
    if (parts.length !== 5) return null

    const rounds: Round[] = parts.map((part) => {
      const [codeStr, resultChar] = part.split('.')
      if (!resultChar || !(resultChar in CHAR_TO_RESULT)) return { castell: null, result: 'none' as const }
      const castell = codeStr === '-' ? null : (codeStr as CastellCode)
      return { castell, result: CHAR_TO_RESULT[resultChar] }
    })

    const collaId = collaPart ? decodeCollaId(collaPart) : null

    return { rounds, collaId }
  } catch {
    return null
  }
}
