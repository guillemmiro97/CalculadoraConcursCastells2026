import type { CastellCode, CastellResult, Round, ScoringCandidate, ScoringResult } from './types'
import { CASTELLS_MAP } from '../data/castells2026'

const MAX_CARREGATS = 2
const MAX_COUNTED = 3

export function getPoints(code: CastellCode, result: 'carregat' | 'descarregat'): number {
  const entry = CASTELLS_MAP.get(code)
  if (!entry) return 0
  return result === 'carregat' ? entry.carregat : entry.descarregat
}

function resultToScoringResult(result: CastellResult): 'carregat' | 'descarregat' | null {
  if (result === 'carregat') return 'carregat'
  if (result === 'descarregat') return 'descarregat'
  return null
}

export function buildCandidates(rounds: Round[]): ScoringCandidate[] {
  const candidates: ScoringCandidate[] = []

  for (let i = 0; i < rounds.length; i++) {
    const round = rounds[i]
    if (!round.castell) continue
    const scoringResult = resultToScoringResult(round.result)
    if (!scoringResult) continue

    const entry = CASTELLS_MAP.get(round.castell)
    if (!entry) continue

    const points = getPoints(round.castell, scoringResult)
    candidates.push({
      code: round.castell,
      name: entry.name,
      result: scoringResult,
      points,
      roundIndex: i,
    })
  }

  return candidates
}

function deduplicateCandidates(candidates: ScoringCandidate[]): ScoringCandidate[] {
  const bestByCode = new Map<CastellCode, ScoringCandidate>()

  for (const c of candidates) {
    const existing = bestByCode.get(c.code)
    if (!existing || c.points > existing.points) {
      bestByCode.set(c.code, c)
    }
  }

  return Array.from(bestByCode.values())
}

function enumerateBestCombination(candidates: ScoringCandidate[]): {
  counted: ScoringCandidate[]
  excluded: Array<ScoringCandidate & { reason: string }>
} {
  const deduped = deduplicateCandidates(candidates)

  if (deduped.length === 0) {
    return { counted: [], excluded: [] }
  }

  if (deduped.length <= MAX_COUNTED) {
    return applyCarregatLimit(deduped, candidates)
  }

  let bestCombination: ScoringCandidate[] = []
  let bestScore = -1

  const combos = getCombinations(deduped, MAX_COUNTED)
  for (const combo of combos) {
    const carregatCount = combo.filter((c) => c.result === 'carregat').length
    if (carregatCount > MAX_CARREGATS) continue
    const score = combo.reduce((sum, c) => sum + c.points, 0)
    if (score > bestScore) {
      bestScore = score
      bestCombination = combo
    }
  }

  const countedSet = new Set(bestCombination.map((c) => `${c.code}-${c.roundIndex}`))

  const excluded = deduped
    .filter((c) => !countedSet.has(`${c.code}-${c.roundIndex}`))
    .map((c) => ({
      ...c,
      reason: getExclusionReason(c, bestCombination, deduped, candidates),
    }))

  return { counted: bestCombination, excluded }
}

function applyCarregatLimit(
  candidates: ScoringCandidate[],
  allCandidates: ScoringCandidate[],
): { counted: ScoringCandidate[]; excluded: Array<ScoringCandidate & { reason: string }> } {
  const carregats = candidates.filter((c) => c.result === 'carregat')
  const descarregats = candidates.filter((c) => c.result === 'descarregat')

  let counted: ScoringCandidate[]
  let excessCarregats: ScoringCandidate[]

  if (carregats.length <= MAX_CARREGATS) {
    counted = candidates
    excessCarregats = []
  } else {
    const sortedCarregats = [...carregats].sort((a, b) => b.points - a.points)
    counted = [...sortedCarregats.slice(0, MAX_CARREGATS), ...descarregats]
    excessCarregats = sortedCarregats.slice(MAX_CARREGATS)
  }

  const countedSet = new Set(counted.map((c) => `${c.code}-${c.roundIndex}`))

  const excluded = excessCarregats.map((c) => ({
    ...c,
    reason: 'Ja compten els dos carregats amb més puntuació.',
  }))

  for (const c of allCandidates) {
    const key = `${c.code}-${c.roundIndex}`
    if (countedSet.has(key)) continue
    if (excessCarregats.some((e) => e.code === c.code && e.roundIndex === c.roundIndex)) continue
    excluded.push({
      ...c,
      reason: 'Superat per castells de major puntuació.',
    })
  }

  return { counted, excluded }
}

function getExclusionReason(
  candidate: ScoringCandidate,
  counted: ScoringCandidate[],
  deduped: ScoringCandidate[],
  _allCandidates: ScoringCandidate[],
): string {
  const sameCode = deduped.find((c) => c.code === candidate.code && counted.some((ct) => ct.code === c.code))
  if (sameCode && sameCode.points > candidate.points) {
    return `El ${candidate.name} ${candidate.result === 'carregat' ? 'carregat' : 'descarregat'} substitueix el ${sameCode.name} en el còmput.`
  }

  const countedCarregats = counted.filter((c) => c.result === 'carregat')
  if (candidate.result === 'carregat' && countedCarregats.length >= MAX_CARREGATS) {
    return 'Ja compten els dos carregats amb més puntuació.'
  }

  return 'Superat per castells de major puntuació.'
}

function getCombinations<T>(arr: T[], size: number): T[][] {
  if (size === 0) return [[]]
  if (arr.length < size) return []

  const result: T[][] = []
  for (let i = 0; i <= arr.length - size; i++) {
    const rest = getCombinations(arr.slice(i + 1), size - 1)
    for (const combo of rest) {
      result.push([arr[i], ...combo])
    }
  }
  return result
}

export function calculateScore(rounds: Round[]): ScoringResult {
  const candidates = buildCandidates(rounds)
  const { counted, excluded } = enumerateBestCombination(candidates)

  const total = counted.reduce((sum, c) => sum + c.points, 0)
  const countedCarregats = counted.filter((c) => c.result === 'carregat').length
  const countedDescarregats = counted.filter((c) => c.result === 'descarregat').length

  return {
    total,
    counted,
    excluded,
    countedCarregats,
    countedDescarregats,
  }
}
