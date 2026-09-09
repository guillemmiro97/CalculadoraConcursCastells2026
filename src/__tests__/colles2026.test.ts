import { describe, it, expect } from 'vitest'
import { colles2026, getCollaById, getCollesBySession, searchColles } from '../data/colles2026'

describe('Colles 2026 dataset', () => {
  it('contains exactly 42 participating colles', () => {
    expect(colles2026).toHaveLength(42)
  })

  it('all IDs are unique', () => {
    const ids = colles2026.map((c) => c.id)
    expect(new Set(ids).size).toBe(42)
  })

  it('every colla has required metadata', () => {
    for (const c of colles2026) {
      expect(c.name).toBeTruthy()
      expect(c.shortName).toBeTruthy()
      expect(c.municipality).toBeTruthy()
      expect(c.shirtColorName).toBeTruthy()
      expect(c.shirtColorHex).toMatch(/^#[0-9a-f]{6}$/i)
      expect(c.concurs2026.participating).toBe(true)
      expect(c.concurs2026.session).toMatch(/^(diumenge|dissabte|torredembarra)$/)
    }
  })

  it('has exactly 12 diumenge colles', () => {
    const diumenge = colles2026.filter((c) => c.concurs2026.session === 'diumenge')
    expect(diumenge).toHaveLength(12)
  })

  it('has exactly 18 dissabte colles', () => {
    const dissabte = colles2026.filter((c) => c.concurs2026.session === 'dissabte')
    expect(dissabte).toHaveLength(18)
  })

  it('has exactly 12 torredembarra colles', () => {
    const torredembarra = colles2026.filter((c) => c.concurs2026.session === 'torredembarra')
    expect(torredembarra).toHaveLength(12)
  })

  it('does NOT contain Minyons de Terrassa', () => {
    const found = colles2026.find((c) => c.name.toLowerCase().includes('minyons de terrassa'))
    expect(found).toBeUndefined()
  })

  it('does NOT contain Castellers de Cornellà', () => {
    const found = colles2026.find((c) => c.name.toLowerCase().includes('cornell'))
    expect(found).toBeUndefined()
  })
})

describe('getCollaById', () => {
  it('returns the correct colla', () => {
    const colla = getCollaById('castellers-de-vilafranca')
    expect(colla).toBeDefined()
    expect(colla!.name).toBe('Castellers de Vilafranca')
  })

  it('returns undefined for unknown id', () => {
    expect(getCollaById('nonexistent')).toBeUndefined()
  })
})

describe('getCollesBySession', () => {
  it('returns colles for diumenge', () => {
    const colles = getCollesBySession('diumenge')
    expect(colles).toHaveLength(12)
    expect(colles.every((c) => c.concurs2026.session === 'diumenge')).toBe(true)
  })
})

describe('searchColles', () => {
  it('"gracia" finds Vila de Gràcia', () => {
    const results = searchColles('gracia')
    expect(results.some((c) => c.id === 'castellers-vila-gracia')).toBe(true)
  })

  it('"tarragona" finds Tarragona colles', () => {
    const results = searchColles('tarragona')
    const ids = results.map((c) => c.id)
    expect(ids).toContain('jove-xiquets-tarragona')
    expect(ids).toContain('xiquets-de-tarragona')
    expect(ids).toContain('colla-castellera-sant-pere-sant-pau')
    expect(ids).toContain('xiquets-del-serrallo')
  })

  it('"valls" finds both Joves and Vella', () => {
    const results = searchColles('valls')
    const ids = results.map((c) => c.id)
    expect(ids).toContain('colla-vella-xiquets-valls')
    expect(ids).toContain('colla-joves-xiquets-valls')
  })

  it('empty query returns all', () => {
    expect(searchColles('')).toHaveLength(42)
  })

  it('is accent-insensitive', () => {
    const results = searchColles('esquerra')
    expect(results.some((c) => c.id === 'colla-castellera-esquerra-eixample')).toBe(true)
  })
})
