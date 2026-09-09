import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadSavedCalculations,
  saveCalculation,
  deleteSavedCalculation,
  renameSavedCalculation,
  getSavedCalculation,
  updateSavedCalculationColla,
} from '../storage/savedCalculations'
import { calculateScore } from '../domain/scoring'
import type { Round } from '../domain/types'

function makeRounds(...entries: [number, string | null, string][]): Round[] {
  const rounds: Round[] = Array.from({ length: 5 }, (): Round => ({ castell: null, result: 'none' }))
  for (const [index, castell, result] of entries) {
    rounds[index] = { castell: (castell ?? null) as Round['castell'], result: result as Round['result'] }
  }
  return rounds
}

beforeEach(() => {
  localStorage.clear()
})

describe('A. SAVE - valid calculation can be saved', () => {
  it('saves a calculation with correct data', () => {
    const rounds = makeRounds(
      [0, '5de9f', 'carregat'],
      [1, '3de9f', 'carregat'],
      [2, '4de8', 'descarregat'],
    )
    const calc = saveCalculation({ name: 'Test', rounds })
    expect(calc.id).toBeTruthy()
    expect(calc.name).toBe('Test')
    expect(calc.createdAt).toBeTruthy()
    expect(calc.rounds).toEqual(rounds)
  })
})

describe('B. LOAD - saved calculations can be loaded', () => {
  it('loads saved calculations in order', () => {
    const rounds1 = makeRounds([0, '4de8', 'descarregat'])
    const rounds2 = makeRounds([0, '3de7', 'descarregat'])
    saveCalculation({ name: 'First', rounds: rounds1 })
    saveCalculation({ name: 'Second', rounds: rounds2 })

    const saved = loadSavedCalculations()
    expect(saved).toHaveLength(2)
    expect(saved[0].name).toBe('Second')
    expect(saved[1].name).toBe('First')
  })

  it('round-trips data correctly', () => {
    const rounds = makeRounds([0, '4de8', 'descarregat'], [1, '3de7', 'carregat'])
    saveCalculation({ name: 'Test', rounds })
    const loaded = loadSavedCalculations()
    expect(loaded[0].rounds).toEqual(rounds)
  })
})

describe('C. MULTIPLE SAVES - same name stored separately', () => {
  it('allows duplicate names', () => {
    const rounds = makeRounds([0, '4de8', 'descarregat'])
    saveCalculation({ name: 'Same Name', rounds })
    saveCalculation({ name: 'Same Name', rounds })

    const saved = loadSavedCalculations()
    expect(saved).toHaveLength(2)
    expect(saved[0].id).not.toBe(saved[1].id)
  })
})

describe('D. DELETE - deleting one does not affect others', () => {
  it('deletes the correct entry', () => {
    const rounds1 = makeRounds([0, '4de8', 'descarregat'])
    const rounds2 = makeRounds([0, '3de7', 'descarregat'])
    const rounds3 = makeRounds([0, '2de7', 'descarregat'])
    const calc1 = saveCalculation({ name: 'First', rounds: rounds1 })
    saveCalculation({ name: 'Second', rounds: rounds2 })
    saveCalculation({ name: 'Third', rounds: rounds3 })

    deleteSavedCalculation(calc1.id)

    const saved = loadSavedCalculations()
    expect(saved).toHaveLength(2)
    expect(saved.find((c) => c.id === calc1.id)).toBeUndefined()
  })
})

describe('E. CORRUPT STORAGE - malformed JSON does not crash', () => {
  it('returns empty array on corrupt JSON', () => {
    localStorage.setItem('concurs-castells:saved-calculations:v2', '{invalid json!!!')
    const saved = loadSavedCalculations()
    expect(saved).toEqual([])
  })
})

describe('F. INVALID RECORD - invalid entries are ignored', () => {
  it('filters out entries with missing fields', () => {
    const badData = [
      { id: 'good-id', name: 'Good', createdAt: '2026-09-07', rounds: makeRounds() },
      { id: 'bad', name: 'Bad' },
      { noId: true, name: 'Bad2', createdAt: 'x', rounds: makeRounds() },
    ]
    localStorage.setItem('concurs-castells:saved-calculations:v2', JSON.stringify(badData))
    const saved = loadSavedCalculations()
    expect(saved).toHaveLength(1)
    expect(saved[0].id).toBe('good-id')
  })

  it('filters out entries with wrong number of rounds', () => {
    const badData = [
      { id: 'a', name: 'A', createdAt: 'x', rounds: makeRounds().slice(0, 3) },
    ]
    localStorage.setItem('concurs-castells:saved-calculations:v2', JSON.stringify(badData))
    const saved = loadSavedCalculations()
    expect(saved).toHaveLength(0)
  })

  it('filters out entries with invalid round data', () => {
    const badData = [
      { id: 'a', name: 'A', createdAt: 'x', rounds: [{ castell: null, result: 'none' }, 'bad'] },
    ]
    localStorage.setItem('concurs-castells:saved-calculations:v2', JSON.stringify(badData))
    const saved = loadSavedCalculations()
    expect(saved).toHaveLength(0)
  })
})

describe('G. SCORING CONSISTENCY - score is recalculated from engine', () => {
  it('recalculates correct score from saved rounds', () => {
    const rounds = makeRounds(
      [0, '5de9f', 'carregat'],
      [1, '3de9f', 'carregat'],
      [2, '4de8', 'descarregat'],
    )
    saveCalculation({ name: 'Test', rounds })
    const saved = loadSavedCalculations()
    const scoring = calculateScore(saved[0].rounds)
    expect(scoring.total).toBe(5025)
    expect(scoring.counted.length).toBe(3)
  })
})

describe('H. RESTORE - restoring recreates original round state', () => {
  it('restores exact same rounds', () => {
    const rounds = makeRounds(
      [0, '5de9f', 'carregat'],
      [1, '3de9f', 'carregat'],
      [2, '4de8', 'descarregat'],
      [3, null, 'none'],
      [4, '4de7', 'intent'],
    )
    const calc = saveCalculation({ name: 'Test', rounds })
    const loaded = getSavedCalculation(calc.id)
    expect(loaded).toBeDefined()
    expect(loaded!.rounds).toEqual(rounds)
    expect(loaded!.rounds[4]).toEqual({ castell: '4de7', result: 'intent' })
  })
})

describe('I. LIMIT - 101st calculation is rejected', () => {
  it('rejects save when limit is reached', () => {
    const rounds = makeRounds([0, '4de8', 'descarregat'])
    for (let i = 0; i < 100; i++) {
      saveCalculation({ name: `Calc ${i}`, rounds })
    }
    expect(loadSavedCalculations()).toHaveLength(100)
    expect(() => saveCalculation({ name: 'Overflow', rounds })).toThrow('MAX_REACHED')
    expect(loadSavedCalculations()).toHaveLength(100)
  })
})

describe('RENAME', () => {
  it('renames a saved calculation', () => {
    const rounds = makeRounds([0, '4de8', 'descarregat'])
    const calc = saveCalculation({ name: 'Old Name', rounds })
    const updated = renameSavedCalculation(calc.id, 'New Name')
    expect(updated[0].name).toBe('New Name')
    expect(loadSavedCalculations()[0].name).toBe('New Name')
  })
})

describe('getSavedCalculation', () => {
  it('returns the correct calculation by id', () => {
    const rounds = makeRounds([0, '4de8', 'descarregat'])
    const calc = saveCalculation({ name: 'Test', rounds })
    const found = getSavedCalculation(calc.id)
    expect(found).toBeDefined()
    expect(found!.id).toBe(calc.id)
  })

  it('returns undefined for nonexistent id', () => {
    expect(getSavedCalculation('nonexistent')).toBeUndefined()
  })
})

describe('Empty localStorage', () => {
  it('returns empty array for no prior data', () => {
    expect(loadSavedCalculations()).toEqual([])
  })
})

describe('J. MIGRATION - v1 data is migrated to v2', () => {
  it('migrates existing v1 calculations without data loss', () => {
    const rounds = makeRounds([0, '4de8', 'descarregat'])
    const v1Data = [
      { id: 'old-id', name: 'Old Calc', createdAt: '2026-01-01T00:00:00.000Z', rounds },
    ]
    localStorage.setItem('concurs-castells:saved-calculations:v1', JSON.stringify(v1Data))
    const loaded = loadSavedCalculations()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].id).toBe('old-id')
    expect(loaded[0].name).toBe('Old Calc')
    expect(loaded[0].rounds).toEqual(rounds)
    expect(loaded[0].collaId).toBeUndefined()
  })

  it('does not overwrite v2 data with v1 data', () => {
    const rounds = makeRounds([0, '4de8', 'descarregat'])
    const v2Data = [
      { id: 'v2-id', name: 'V2 Calc', createdAt: '2026-09-07T00:00:00.000Z', rounds, collaId: 'castellers-de-vilafranca' },
    ]
    localStorage.setItem('concurs-castells:saved-calculations:v2', JSON.stringify(v2Data))
    const v1Data = [
      { id: 'v1-id', name: 'V1 Calc', createdAt: '2026-01-01T00:00:00.000Z', rounds },
    ]
    localStorage.setItem('concurs-castells:saved-calculations:v1', JSON.stringify(v1Data))
    const loaded = loadSavedCalculations()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].id).toBe('v2-id')
  })
})

describe('SAVE WITH COLLA', () => {
  it('saves a calculation with collaId', () => {
    const rounds = makeRounds([0, '4de8', 'descarregat'])
    const calc = saveCalculation({ name: 'Test', rounds, collaId: 'castellers-de-vilafranca' })
    expect(calc.collaId).toBe('castellers-de-vilafranca')
    const loaded = getSavedCalculation(calc.id)
    expect(loaded!.collaId).toBe('castellers-de-vilafranca')
  })

  it('saves a calculation without collaId', () => {
    const rounds = makeRounds([0, '4de8', 'descarregat'])
    const calc = saveCalculation({ name: 'Test', rounds })
    expect(calc.collaId).toBeUndefined()
  })
})

describe('UPDATE COLLA', () => {
  it('updates collaId on a saved calculation', () => {
    const rounds = makeRounds([0, '4de8', 'descarregat'])
    const calc = saveCalculation({ name: 'Test', rounds })
    const updated = updateSavedCalculationColla(calc.id, 'castellers-de-vilafranca')
    expect(updated.find((c) => c.id === calc.id)!.collaId).toBe('castellers-de-vilafranca')
  })

  it('can remove collaId', () => {
    const rounds = makeRounds([0, '4de8', 'descarregat'])
    const calc = saveCalculation({ name: 'Test', rounds, collaId: 'castellers-de-vilafranca' })
    const updated = updateSavedCalculationColla(calc.id, undefined)
    expect(updated.find((c) => c.id === calc.id)!.collaId).toBeUndefined()
  })
})
