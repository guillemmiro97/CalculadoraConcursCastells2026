export type CastellCode =
  | '2de6' | 'Pde5' | '9de6' | '4de7' | '3de7'
  | '4de7a' | '3de7a' | '7de7' | '5de7' | '7de7a' | '5de7a'
  | '3de7s' | '9de7' | '2de7' | '4de8' | 'Pde6' | '3de8'
  | '7de8' | '2de8f' | 'Pde7f' | '5de8' | '4de8a' | '3de8a' | '7de8a' | '5de8a'
  | '4de9f' | '3de9f'
  | '9de8' | '3de8s' | '2de9fm' | 'Pde8fm' | '7de9f' | '5de9f' | '4de9fa' | '3de9fa'
  | '4de9sf' | '2de8sf' | '3de10fm'
  | '4de10fm' | '9de9f'
  | '2de9sm' | 'Pde9fmp' | '3de9sf' | 'Pde7sf'
  | '2de10fmp' | '4de10sm' | '3de10sm'

export type CastellResult = 'none' | 'descarregat' | 'carregat' | 'intent' | 'intentDesmuntat'

export interface CastellEntry {
  code: CastellCode
  name: string
  carregat: number
  descarregat: number
}

export interface Round {
  castell: CastellCode | null
  result: CastellResult
}

export interface ScoringCandidate {
  code: CastellCode
  name: string
  result: 'carregat' | 'descarregat'
  points: number
  roundIndex: number
}

export interface ScoringResult {
  total: number
  counted: ScoringCandidate[]
  excluded: Array<ScoringCandidate & { reason: string }>
  countedCarregats: number
  countedDescarregats: number
}

export type TabId = 'calculadora' | 'desats' | 'taula' | 'normes'

export type ConcursSession = 'torredembarra' | 'dissabte' | 'diumenge' | 'internacional'

export interface Colla {
  id: string
  name: string
  shortName: string
  municipality: string
  shirtColorName: string
  shirtColorHex: string
  logoPath?: string
  website?: string
  concurs2026: {
    participating: true
    session: ConcursSession
  }
}

export interface SavedCalculation {
  id: string
  name: string
  createdAt: string
  updatedAt?: string
  collaId?: string
  rounds: Round[]
}
