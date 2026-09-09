import { useCallback } from 'react'
import type { Round, CastellResult, ScoringCandidate } from '../domain/types'
import { CASTELLS_MAP } from '../data/castells2026'
import { formatPoints } from '../utils/format'
import { ChevronDown, ChevronUp, Check, X as XIcon } from 'lucide-react'

interface RoundCardProps {
  index: number
  round: Round
  isExpanded: boolean
  candidate: ScoringCandidate | null
  isCounted: boolean
  onToggleExpand: () => void
  onOpenPicker: () => void
  onSetResult: (result: CastellResult) => void
}

const RESULT_OPTIONS: { value: CastellResult; label: string; shortLabel: string }[] = [
  { value: 'descarregat', label: 'Descarregat', shortLabel: 'D' },
  { value: 'carregat', label: 'Carregat', shortLabel: 'C' },
  { value: 'intent', label: 'Intent', shortLabel: 'I' },
  { value: 'intentDesmuntat', label: 'ID', shortLabel: 'ID' },
]

export function RoundCard({
  index,
  round,
  isExpanded,
  candidate,
  isCounted,
  onToggleExpand,
  onOpenPicker,
  onSetResult,
}: RoundCardProps) {
  const entry = round.castell ? CASTELLS_MAP.get(round.castell) : null

  const handleResultChange = useCallback(
    (result: CastellResult) => {
      onSetResult(result)
    },
    [onSetResult],
  )

  return (
    <div className={`round-card ${isExpanded ? 'expanded' : ''} ${isCounted && candidate ? 'counted' : ''}`}>
      <button
        className="round-header"
        onClick={onToggleExpand}
        aria-expanded={isExpanded}
        aria-label={`Ronda ${index + 1}${entry ? `, ${entry.name}` : ''}`}
      >
        <span className="round-number">Ronda {index + 1}</span>
        {entry && (
          <span className="round-summary">
            <span className="round-castell-code">{round.castell}</span>
            <span className={`round-result-badge ${round.result}`}>
              {round.result === 'descarregat' ? 'D' :
               round.result === 'carregat' ? 'C' :
               round.result === 'intent' ? 'I' :
               round.result === 'intentDesmuntat' ? 'ID' : ''}
            </span>
            {candidate && (
              <span className="round-points">{formatPoints(candidate.points)}</span>
            )}
          </span>
        )}
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isExpanded && (
        <div className="round-body">
          <button className="round-castell-selector" onClick={onOpenPicker} aria-label="Escull un castell">
            {entry ? (
              <>
                <span className="selected-castell-code">{round.castell}</span>
                <span className="selected-castell-name">{entry.name}</span>
              </>
            ) : (
              <span className="placeholder">Escull un castell...</span>
            )}
          </button>

          {round.castell && (
            <div className="round-results" role="radiogroup" aria-label="Resultat">
              {RESULT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`result-option ${opt.value} ${round.result === opt.value ? 'active' : ''}`}
                  onClick={() => handleResultChange(opt.value)}
                  role="radio"
                  aria-checked={round.result === opt.value}
                  aria-label={opt.label}
                >
                  {opt.shortLabel}
                </button>
              ))}
            </div>
          )}

          {candidate && (
            <div className={`round-calc ${isCounted ? 'counted' : 'not-counted'}`}>
              {isCounted ? (
                <>
                  <Check size={16} />
                  <span>Compta</span>
                  <span className="round-calc-points">{formatPoints(candidate.points)} punts</span>
                </>
              ) : (
                <>
                  <XIcon size={16} />
                  <span>No compta</span>
                </>
              )}
            </div>
          )}

          {entry && round.result === 'none' && (
            <div className="round-placeholder-scores">
              <span>C {formatPoints(entry.carregat)}</span>
              <span>D {formatPoints(entry.descarregat)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
