export function normalizeCastellTerm(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/(?:de|d)/g, '')
}

export function matchesCastellQuery(code: string, name: string, query: string): boolean {
  const q = normalizeCastellTerm(query)
  if (!q) return true
  return normalizeCastellTerm(code).includes(q) || normalizeCastellTerm(name).includes(q)
}
