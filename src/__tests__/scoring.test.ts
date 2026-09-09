import { describe, it, expect } from 'vitest'
import { CASTELLS_2026 } from '../data/castells2026'
import { calculateScore } from '../domain/scoring'
import { checkRoundRestriction } from '../domain/rules'
import type { Round } from '../domain/types'

function makeRounds(...entries: [number, string | null, string][]): Round[] {
  const rounds: Round[] = Array.from({ length: 5 }, (): Round => ({ castell: null, result: 'none' }))
  for (const [index, castell, result] of entries) {
    rounds[index] = { castell: (castell ?? null) as Round['castell'], result: result as Round['result'] }
  }
  return rounds
}

describe('Official 2026 dataset', () => {
  it('contains exactly 47 constructions', () => {
    expect(CASTELLS_2026).toHaveLength(47)
  })

  it('has correct 2de6 values', () => {
    const c = CASTELLS_2026.find((e) => e.code === '2de6')!
    expect(c.carregat).toBe(250)
    expect(c.descarregat).toBe(300)
  })

  it('has correct 3de9f values', () => {
    const c = CASTELLS_2026.find((e) => e.code === '3de9f')!
    expect(c.carregat).toBe(1585)
    expect(c.descarregat).toBe(1910)
  })

  it('has correct Pde7sf values', () => {
    const c = CASTELLS_2026.find((e) => e.code === 'Pde7sf')!
    expect(c.carregat).toBe(5280)
    expect(c.descarregat).toBe(6360)
  })

  it('has correct 3de10sm values', () => {
    const c = CASTELLS_2026.find((e) => e.code === '3de10sm')!
    expect(c.carregat).toBe(6205)
    expect(c.descarregat).toBe(7475)
  })
})

describe('Simple scoring', () => {
  it('sums three descarregats correctly', () => {
    const rounds = makeRounds(
      [0, '2de7', 'descarregat'],
      [1, '4de7', 'descarregat'],
      [2, '3de7', 'descarregat'],
    )
    const result = calculateScore(rounds)
    expect(result.total).toBe(1615)
  })
})

describe('Maximum two carregats', () => {
  it('does not count three carregats', () => {
    const rounds = makeRounds(
      [0, '5de9f', 'carregat'],
      [1, '3de9f', 'carregat'],
      [2, '4de9f', 'carregat'],
      [3, '4de8', 'descarregat'],
    )
    const result = calculateScore(rounds)
    expect(result.total).toBe(5025)
    expect(result.countedCarregats).toBe(2)
    expect(result.counted).toHaveLength(3)
  })
})

describe('Only carregats', () => {
  it('counts at most two carregats', () => {
    const rounds = makeRounds(
      [0, '5de9f', 'carregat'],
      [1, '3de9f', 'carregat'],
      [2, '4de9f', 'carregat'],
    )
    const result = calculateScore(rounds)
    expect(result.total).toBe(4180)
    expect(result.countedCarregats).toBe(2)
  })
})

describe('Duplicated castell', () => {
  it('only counts the higher-scoring one', () => {
    const rounds = makeRounds(
      [0, '3de9f', 'carregat'],
      [3, '3de9f', 'descarregat'],
    )
    const result = calculateScore(rounds)
    expect(result.total).toBe(1910)
    expect(result.counted).toHaveLength(1)
    expect(result.counted[0].points).toBe(1910)
  })
})

describe('Fewer than three constructions', () => {
  it('sums one construction', () => {
    const rounds = makeRounds([0, '4de8', 'descarregat'])
    const result = calculateScore(rounds)
    expect(result.total).toBe(845)
  })

  it('sums two constructions', () => {
    const rounds = makeRounds(
      [0, '4de8', 'descarregat'],
      [1, '3de7', 'descarregat'],
    )
    const result = calculateScore(rounds)
    expect(result.total).toBe(1260)
  })
})

describe('Attempts', () => {
  it('intent scores zero', () => {
    const rounds = makeRounds([0, '4de8', 'intent'])
    const result = calculateScore(rounds)
    expect(result.total).toBe(0)
  })

  it('intent desmuntat scores zero', () => {
    const rounds = makeRounds([0, '4de8', 'intentDesmuntat'])
    const result = calculateScore(rounds)
    expect(result.total).toBe(0)
  })

  it('does not count attempts in candidates', () => {
    const rounds = makeRounds(
      [0, '4de8', 'intent'],
      [1, '3de8', 'intentDesmuntat'],
      [2, '2de7', 'descarregat'],
    )
    const result = calculateScore(rounds)
    expect(result.total).toBe(805)
    expect(result.counted).toHaveLength(1)
  })
})

describe('Rule validation', () => {
  it('blocks after descarregat', () => {
    const rounds = makeRounds(
      [0, '4de8', 'descarregat'],
      [1, null, 'none'],
      [2, null, 'none'],
      [3, null, 'none'],
      [4, null, 'none'],
    )
    const r = checkRoundRestriction(1, '4de8', rounds)
    expect(r.allowed).toBe(false)
  })

  it('blocks after two attempts', () => {
    const rounds = makeRounds(
      [0, '4de8', 'intent'],
      [1, '4de8', 'intentDesmuntat'],
    )
    const r = checkRoundRestriction(2, '4de8', rounds)
    expect(r.allowed).toBe(false)
  })

  it('blocks incompatible same-base castells (4de7 and 4de8)', () => {
    const rounds = makeRounds(
      [0, '4de7', 'descarregat'],
      [1, null, 'none'],
      [2, null, 'none'],
      [3, null, 'none'],
      [4, null, 'none'],
    )
    const r = checkRoundRestriction(1, '4de8', rounds)
    expect(r.allowed).toBe(false)
    expect(r.message).toContain('incompatible')
  })

  it('allows compatible 2de8sf after 2de9fm', () => {
    const rounds = makeRounds(
      [0, '2de9fm', 'descarregat'],
      [1, null, 'none'],
      [2, null, 'none'],
      [3, null, 'none'],
      [4, null, 'none'],
    )
    const r = checkRoundRestriction(1, '2de8sf', rounds)
    expect(r.allowed).toBe(true)
  })

  it('allows 3de9sf after 3de9f (official compatibility exception)', () => {
    const rounds = makeRounds(
      [0, '3de9f', 'descarregat'],
      [1, null, 'none'],
      [2, null, 'none'],
      [3, null, 'none'],
      [4, null, 'none'],
    )
    const r = checkRoundRestriction(1, '3de9sf', rounds)
    expect(r.allowed).toBe(true)
  })

  it('allows 3de9sf after 3de10fm (official compatibility exception)', () => {
    const rounds = makeRounds(
      [0, '3de10fm', 'descarregat'],
      [1, null, 'none'],
      [2, null, 'none'],
      [3, null, 'none'],
      [4, null, 'none'],
    )
    const r = checkRoundRestriction(1, '3de9sf', rounds)
    expect(r.allowed).toBe(true)
  })

  it('blocks rounds 4-5 if 3+ castells achieved and not superior', () => {
    const rounds = makeRounds(
      [0, '4de7', 'descarregat'],
      [1, '3de7', 'descarregat'],
      [2, '2de7', 'descarregat'],
      [3, null, 'none'],
      [4, null, 'none'],
    )
    const r = checkRoundRestriction(3, '4de7', rounds)
    expect(r.allowed).toBe(false)
  })

  it('allows rounds 4-5 if 3+ castells but attempting superior', () => {
    const rounds = makeRounds(
      [0, '4de7', 'descarregat'],
      [1, '3de7', 'descarregat'],
      [2, '7de7', 'descarregat'],
      [3, null, 'none'],
      [4, null, 'none'],
    )
    const r = checkRoundRestriction(3, '5de8', rounds)
    expect(r.allowed).toBe(true)
  })

  it('allows retrying a carregat in rounds 4-5', () => {
    const rounds = makeRounds(
      [0, '4de8', 'carregat'],
      [1, '3de8', 'carregat'],
      [2, '2de7', 'descarregat'],
      [3, null, 'none'],
      [4, null, 'none'],
    )
    const r = checkRoundRestriction(3, '4de8', rounds)
    expect(r.allowed).toBe(true)
  })

  it('allows 2de7 after weaker castells in rounds 4-5 (805 > 565, 395, 345)', () => {
    const rounds = makeRounds(
      [0, '3de7', 'descarregat'],
      [1, '4de7', 'descarregat'],
      [2, '5de7', 'descarregat'],
      [3, null, 'none'],
      [4, null, 'none'],
    )
    const r = checkRoundRestriction(3, '2de7', rounds)
    expect(r.allowed).toBe(true)
  })

  it('blocks 2de7 after 9de8 in rounds 4-5 (805 is not > 2385)', () => {
    const rounds = makeRounds(
      [0, '9de8', 'descarregat'],
      [1, '3de8a', 'descarregat'],
      [2, '3de7s', 'carregat'],
      [3, null, 'none'],
      [4, null, 'none'],
    )
    const r = checkRoundRestriction(3, '2de7', rounds)
    expect(r.allowed).toBe(false)
  })

  it('allows retrying carregat 3de7s even if not superior to all', () => {
    const rounds = makeRounds(
      [0, '9de8', 'descarregat'],
      [1, '3de8a', 'descarregat'],
      [2, '3de7s', 'carregat'],
      [3, null, 'none'],
      [4, null, 'none'],
    )
    const r = checkRoundRestriction(3, '3de7s', rounds)
    expect(r.allowed).toBe(true)
  })
})

describe('Build candidates deduplication', () => {
  it('returns only the higher-scoring castell for duplicates', () => {
    const rounds = makeRounds(
      [0, '3de9f', 'carregat'],
      [2, '3de9f', 'descarregat'],
    )
    const scored = calculateScore(rounds)
    expect(scored.total).toBe(1910)
  })
})

describe('Carregat limit with descarregats', () => {
  it('always counts descarregats even with excess carregats', () => {
    const rounds = makeRounds(
      [0, '5de9f', 'carregat'],
      [1, '3de9f', 'carregat'],
      [2, '4de9f', 'carregat'],
      [3, '4de8', 'descarregat'],
    )
    const result = calculateScore(rounds)
    expect(result.total).toBe(5025)
    expect(result.countedCarregats).toBe(2)
    expect(result.counted).toHaveLength(3)
    const countedCodes = result.counted.map((c) => c.code)
    expect(countedCodes).toContain('4de8')
  })

  it('counts all descarregats when only carregats present', () => {
    const rounds = makeRounds(
      [0, '5de9f', 'carregat'],
      [1, '3de9f', 'carregat'],
      [2, '4de9f', 'carregat'],
    )
    const result = calculateScore(rounds)
    expect(result.total).toBe(4180)
    expect(result.countedCarregats).toBe(2)
    expect(result.counted).toHaveLength(2)
  })

  it('deduplicates and counts highest-scoring version', () => {
    const rounds = makeRounds(
      [0, '5de9f', 'carregat'],
      [2, '5de9f', 'descarregat'],
    )
    const result = calculateScore(rounds)
    expect(result.total).toBe(3125)
    expect(result.counted).toHaveLength(1)
    expect(result.counted[0].result).toBe('descarregat')
  })
})
