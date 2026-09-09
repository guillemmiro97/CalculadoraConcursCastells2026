import type { ScoringResult } from '../domain/types'
import { formatPoints } from '../utils/format'

interface ScoreBreakdownProps {
  scoring: ScoringResult
}

export function ScoreBreakdown({ scoring }: ScoreBreakdownProps) {
  if (scoring.counted.length === 0) return null

  return (
    <div className="score-breakdown">
      <h3 className="breakdown-title">Castells que compten</h3>
      <div className="breakdown-list">
        {scoring.counted.map((c) => (
          <div key={`${c.code}-${c.roundIndex}`} className="breakdown-row counted">
            <span className="breakdown-code">{c.code}</span>
            <span className="breakdown-name">{c.name}</span>
            <span className={`breakdown-result ${c.result}`}>
              {c.result === 'carregat' ? 'C' : 'D'}
            </span>
            <span className="breakdown-points">{formatPoints(c.points)}</span>
          </div>
        ))}
        <div className="breakdown-total">
          <span>Total</span>
          <span className="breakdown-total-points">{formatPoints(scoring.total)}</span>
        </div>
      </div>

      {scoring.excluded.length > 0 && (
        <div className="breakdown-excluded">
          <h4 className="breakdown-subtitle">No compta</h4>
          {scoring.excluded.map((c, i) => (
            <div key={`${c.code}-${c.roundIndex}-${i}`} className="breakdown-row excluded">
              <span className="breakdown-code">{c.code}</span>
              <span className="breakdown-name">{c.name}</span>
              <span className={`breakdown-result ${c.result}`}>
                {c.result === 'carregat' ? 'C' : 'D'}
              </span>
              <span className="breakdown-points">{formatPoints(c.points)}</span>
              <span className="breakdown-reason">{c.reason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
