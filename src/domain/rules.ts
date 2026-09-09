import type { CastellCode, Round } from './types'
import { CASTELLS_2026, CASTELLS_MAP } from '../data/castells2026'

// Incompatibility groups from official Protocol de Plaça 2026, Section IX
// Castells in the same group with identical base are incompatible
// (except for specific cross-group compatibility exceptions below)
const INCOMPATIBILITY_GROUPS: CastellCode[][] = [
  ['Pde5', 'Pde6', 'Pde7f', 'Pde8fm', 'Pde9fmp', 'Pde7sf'],
  ['2de6', '2de7', '2de8f', '2de9fm', '2de10fmp'],
  ['2de8sf', '2de9sm'],
  ['3de7', '3de8', '3de9f', '3de10fm'],
  ['3de7a', '3de8a', '3de9fa'],
  ['3de7s', '3de8s'],
  ['3de9sf', '3de10sm'],
  ['4de7', '4de8', '4de9f', '4de10fm'],
  ['4de7a', '4de8a', '4de9fa'],
  ['4de9sf', '4de10sm'],
  ['5de7', '5de8', '5de9f'],
  ['5de7a', '5de8a'],
  ['7de7', '7de8', '7de9f'],
  ['9de6', '9de7', '9de8', '9de9f'],
]

// Official compatibility exceptions from Protocol de Plaça 2026
// Pairs that ARE compatible despite being in the same base family
const COMPATIBILITY_EXCEPTIONS: [CastellCode, CastellCode][] = [
  ['2de7', '2de8sf'],
  ['2de7', '2de9sm'],
  ['2de8f', '2de8sf'],
  ['2de8f', '2de9sm'],
  ['2de9fm', '2de9sm'],
  ['2de8sf', '2de9fm'],
  ['3de9f', '3de9sf'],
  ['3de9sf', '3de10fm'],
  ['4de9f', '4de9sf'],
  ['4de9sf', '4de10fm'],
]

function areCompatible(a: CastellCode, b: CastellCode): boolean {
  if (a === b) return false

  for (const pair of COMPATIBILITY_EXCEPTIONS) {
    if (
      (pair[0] === a && pair[1] === b) ||
      (pair[0] === b && pair[1] === a)
    ) {
      return true
    }
  }

  for (const group of INCOMPATIBILITY_GROUPS) {
    if (group.includes(a) && group.includes(b)) {
      return false
    }
  }

  return true
}

function countAttempts(code: CastellCode, rounds: Round[]): number {
  let attempts = 0
  for (const round of rounds) {
    if (round.castell === code && round.result !== 'none') {
      attempts++
    }
  }
  return attempts
}

function hasDescarregat(code: CastellCode, rounds: Round[]): boolean {
  return rounds.some((r) => r.castell === code && r.result === 'descarregat')
}

export type RestrictionReason = {
  allowed: boolean
  message: string | null
}

export function checkRoundRestriction(
  roundIndex: number,
  code: CastellCode,
  rounds: Round[],
): RestrictionReason {
  const currentRound = rounds[roundIndex]

  // If this castell was already descarregat, cannot attempt again
  if (hasDescarregat(code, rounds)) {
    return {
      allowed: false,
      message: `No disponible: ja has descarregat aquest castell.`,
    }
  }

  // Max 2 attempts per construction
  const attempts = countAttempts(code, rounds)
  if (attempts >= 2 && !(currentRound.castell === code)) {
    return {
      allowed: false,
      message: `No disponible: ja has intentat aquest castell dues vegades.`,
    }
  }

  // Check incompatibility with other counted castells
  for (let i = 0; i < rounds.length; i++) {
    if (i === roundIndex) continue
    const r = rounds[i]
    if (!r.castell) continue
    if (r.result !== 'descarregat' && r.result !== 'carregat') continue
    if (r.castell === code) continue

    if (!areCompatible(code, r.castell)) {
      const other = CASTELLS_MAP.get(r.castell)
      return {
        allowed: false,
        message: `No disponible: incompatible amb el ${other?.name ?? r.castell} de la ronda ${i + 1}.`,
      }
    }
  }

  // Rounds 4 and 5 restrictions (index 3 and 4)
  if (roundIndex >= 3) {
    const previousRounds = rounds.slice(0, roundIndex)
    const previousAchieved = previousRounds.filter(
      (r) => r.result === 'descarregat' || r.result === 'carregat',
    )

    // Article 8.3.b: If attempting a construction superior to those achieved
    const entry = CASTELLS_MAP.get(code)
    const isRetryingCarregat = previousRounds.some(
      (r) => r.castell === code && r.result === 'carregat',
    )

    if (previousAchieved.length >= 3 && !isRetryingCarregat) {
      const descarregats = previousRounds.filter((r) => r.result === 'descarregat')

      if (descarregats.length > 0) {
        const canReplaceAtLeastOne = descarregats.some((r) => {
          const d = CASTELLS_MAP.get(r.castell!)
          return d ? entry && entry.descarregat > d.descarregat : false
        })

        if (!canReplaceAtLeastOne) {
          return {
            allowed: false,
            message: `A la ronda ${roundIndex + 1}, només pots intentar un castell superior als descarregats o un que ja hagis carregat.`,
          }
        }
      }
    }
  }

  return { allowed: true, message: null }
}

export function getCastellAvailability(roundIndex: number, rounds: Round[]) {
  return CASTELLS_2026.map((castell) => {
    const restriction = checkRoundRestriction(roundIndex, castell.code, rounds)
    return {
      ...castell,
      available: restriction.allowed,
      reason: restriction.message,
    }
  })
}
