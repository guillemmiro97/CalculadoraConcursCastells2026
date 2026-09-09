import { useState, useEffect } from 'react'
import type { SavedCalculation } from '../domain/types'
import { getSavedCalculation, deleteSavedCalculation, updateSavedCalculationColla } from '../storage/savedCalculations'
import { calculateScore } from '../domain/scoring'
import { getCollaById } from '../data/colles2026'
import { formatPoints } from '../utils/format'
import { CollaAvatar } from './CollaAvatar'
import { CollaPicker } from './CollaPicker'
import { ArrowLeft, Trash2, Pencil, Share2 } from 'lucide-react'

const resultLabels: Record<string, string> = {
  descarregat: 'D',
  carregat: 'C',
  intent: 'I',
  intentDesmuntat: 'ID',
  none: '-',
}

interface Props {
  calculationId: string
  onBack: () => void
  onEdit: (id: string, rounds: SavedCalculation['rounds'], collaId?: string) => void
  onShare?: () => Promise<void>
}

export function SavedCalculationDetail({ calculationId, onBack, onEdit, onShare }: Props) {
  const [calc, setCalc] = useState<SavedCalculation | undefined>(() => getSavedCalculation(calculationId))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showCollaPicker, setShowCollaPicker] = useState(false)

  useEffect(() => {
    setCalc(getSavedCalculation(calculationId))
    setConfirmDelete(false)
  }, [calculationId])

  if (!calc) {
    return (
      <div className="saved-section">
        <p className="saved-empty-text">Càlcul no trobat.</p>
        <button className="btn btn-clear" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Tornar</span>
        </button>
      </div>
    )
  }

  const scoring = calculateScore(calc.rounds)
  const colla = calc.collaId ? getCollaById(calc.collaId) : undefined
  const date = new Date(calc.createdAt)

  const handleDelete = () => {
    deleteSavedCalculation(calc.id)
    onBack()
  }

  const handleEdit = () => {
    onEdit(calc.id, calc.rounds, calc.collaId)
  }

  const handleShare = async () => {
    if (!onShare) return
    const lines: string[] = []
    if (colla) lines.push(colla.name)
    lines.push(calc.name, '')
    for (let i = 0; i < calc.rounds.length; i++) {
      const r = calc.rounds[i]
      if (!r.castell) continue
      const label = resultLabels[r.result] ?? '-'
      const candidate = scoring.counted.find((c) => c.roundIndex === i)
      const pts = candidate ? candidate.points : 0
      lines.push(`${r.castell} ${label} — ${pts}`)
    }
    lines.push('')
    lines.push(`Total: ${scoring.total} punts`)
    lines.push('')
    lines.push('Calculadora Concurs 2026')
    const text = lines.join('\n')

    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {
        await navigator.clipboard.writeText(text)
      }
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  const handleChangeColla = (newCollaId: string | null) => {
    const updated = updateSavedCalculationColla(calc.id, newCollaId ?? undefined)
    const updatedCalc = updated.find((c) => c.id === calc.id)
    if (updatedCalc) setCalc(updatedCalc)
    setShowCollaPicker(false)
  }

  return (
    <div className="saved-section">
      <button className="btn btn-back" onClick={onBack}>
        <ArrowLeft size={18} />
        <span>Tornar</span>
      </button>

      {colla && (
        <div className="saved-detail-colla-header" style={{ borderColor: colla.shirtColorHex }}>
          <CollaAvatar colla={colla} size="lg" />
          <div className="saved-detail-colla-info">
            <h2 className="saved-detail-colla-name">{colla.name}</h2>
            <span className="saved-detail-colla-municipality">{colla.municipality}</span>
          </div>
        </div>
      )}

      <div className="saved-detail-header">
        <h2 className="saved-detail-name">{calc.name}</h2>
        <span className="saved-detail-date">
          {date.toLocaleDateString('ca-ES', { dateStyle: 'medium' })} &middot; {date.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="saved-detail-score">
        <span className="saved-detail-score-value">{formatPoints(scoring.total)} punts</span>
        <span className="saved-detail-score-summary">
          {scoring.counted.length} castell{scoring.counted.length !== 1 ? 's' : ''} que compten
          {scoring.countedCarregats > 0 && (
            <> &middot; {scoring.countedCarregats} carregat{scoring.countedCarregats !== 1 ? 's' : ''}</>
          )}
        </span>
      </div>

      <div className="saved-rounds">
        {calc.rounds.map((r, i) => (
          <div key={i} className="saved-round-row">
            <span className="saved-round-label">Ronda {i + 1}</span>
            {r.castell ? (
              <>
                <span className="saved-round-code">{r.castell}</span>
                <span className={`saved-round-result ${r.result}`}>{resultLabels[r.result]}</span>
              </>
            ) : (
              <span className="saved-round-empty">Buida</span>
            )}
          </div>
        ))}
      </div>

      {scoring.counted.length > 0 && (
        <div className="saved-breakdown">
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
        </div>
      )}

      {scoring.excluded.length > 0 && (
        <div className="saved-breakdown">
          <h4 className="breakdown-subtitle">No compta</h4>
          <div className="breakdown-list">
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
        </div>
      )}

      <section className="saved-detail-actions">
        {onShare && (
          <button className="btn btn-share" onClick={handleShare}>
            <Share2 size={18} />
            <span>Comparteix</span>
          </button>
        )}
        <button className="btn btn-restore" onClick={handleEdit}>
          <Pencil size={18} />
          <span>Modifica</span>
        </button>
        <button className="btn btn-clear" onClick={() => setShowCollaPicker(true)}>
          <Pencil size={18} />
          <span>{colla ? 'Canvia la colla' : 'Afegeix una colla'}</span>
        </button>
        {!confirmDelete ? (
          <button className="btn btn-clear" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={18} />
            <span>Elimina</span>
          </button>
        ) : (
          <div className="confirm-clear">
            <span>Vols eliminar aquest càlcul?</span>
            <button className="btn btn-confirm-yes" onClick={handleDelete}>Elimina</button>
            <button className="btn btn-confirm-no" onClick={() => setConfirmDelete(false)}>Cancel·la</button>
          </div>
        )}
      </section>

      {showCollaPicker && (
        <CollaPicker
          selectedId={calc.collaId ?? null}
          onSelect={handleChangeColla}
          onClose={() => setShowCollaPicker(false)}
        />
      )}
    </div>
  )
}
