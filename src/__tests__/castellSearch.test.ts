import { describe, it, expect } from 'vitest'
import { normalizeCastellTerm, matchesCastellQuery } from '../utils/castellSearch'

describe('castell search', () => {
  it('treats d and de as the same separator', () => {
    expect(normalizeCastellTerm('2d7')).toBe(normalizeCastellTerm('2de7'))
    expect(matchesCastellQuery('2de7', '2 de 7', '2d7')).toBe(true)
    expect(matchesCastellQuery('2de7', '2 de 7', '2de7')).toBe(true)
  })

  it('ignores spaces and case', () => {
    expect(matchesCastellQuery('4de7a', '4 de 7 amb agulla', '4d7a')).toBe(true)
    expect(matchesCastellQuery('Pde5', 'Pilar de 5', 'pilar')).toBe(true)
  })

  it('matches by suffix letter', () => {
    expect(matchesCastellQuery('4de7a', '4 de 7 amb agulla', '4d7a')).toBe(true)
    expect(matchesCastellQuery('4de7', '4 de 7', '4d7a')).toBe(false)
  })

  it('returns everything for an empty query', () => {
    expect(matchesCastellQuery('2de6', '2 de 6', '')).toBe(true)
  })
})
