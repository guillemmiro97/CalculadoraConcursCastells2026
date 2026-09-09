const numberFormatter = new Intl.NumberFormat('ca-ES')

export function formatPoints(n: number): string {
  return numberFormatter.format(n)
}
