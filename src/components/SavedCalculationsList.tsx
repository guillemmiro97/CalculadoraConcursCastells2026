import { useState, useMemo } from 'react'
import type { SavedCalculation } from '../domain/types'
import { loadSavedCalculations, deleteSavedCalculation, renameSavedCalculation } from '../storage/savedCalculations'
import { calculateScore } from '../domain/scoring'
import { getCollaById } from '../data/colles2026'
import { formatPoints } from '../utils/format'
import { CollaAvatar } from './CollaAvatar'
import { Trash2, ChevronRight, Calculator, Pencil } from 'lucide-react'

interface Props {
  onSelect: (id: string) => void
  onBackToCalc: () => void
}

type SortOption = 'recent' | 'high' | 'low'

export function SavedCalculationsList({ onSelect, onBackToCalc }: Props) {
  const [calculations, setCalculations] = useState<SavedCalculation[]>(() => loadSavedCalculations())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [filterCollaId, setFilterCollaId] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('high')

  const usedCollaIds = useMemo(() => {
    const ids = new Set<string>()
    for (const c of calculations) {
      if (c.collaId) ids.add(c.collaId)
    }
    return Array.from(ids)
  }, [calculations])

  const usedColles = useMemo(() => {
    return usedCollaIds.map((id) => getCollaById(id)).filter(Boolean) as ReturnType<typeof getCollaById> extends infer T ? Extract<T, NonNullable<T>>[] : never
  }, [usedCollaIds])

  const filteredAndSorted = useMemo(() => {
    let result = filterCollaId === 'all'
      ? calculations
      : calculations.filter((c) => c.collaId === filterCollaId)

    result = [...result].sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      const scoreA = calculateScore(a.rounds).total
      const scoreB = calculateScore(b.rounds).total
      return sortBy === 'high' ? scoreB - scoreA : scoreA - scoreB
    })

    return result
  }, [calculations, filterCollaId, sortBy])

  const handleDelete = (id: string) => {
    setCalculations(deleteSavedCalculation(id))
    setConfirmDeleteId(null)
  }

  const handleRename = (id: string) => {
    const trimmed = renameValue.trim()
    if (trimmed) {
      setCalculations(renameSavedCalculation(id, trimmed))
    }
    setRenamingId(null)
  }

  return (
    <div className="saved-section">
      <div className="saved-header">
        <h2 className="saved-title">Desats</h2>
        <p className="saved-info-text">
          Els càlculs es desen només en aquest navegador i dispositiu.
        </p>
      </div>

      {calculations.length === 0 ? (
        <div className="saved-empty">
          <p className="saved-empty-text">
            Encara no tens cap càlcul desat.
          </p>
          <p className="saved-empty-text">
            Quan tinguis una combinació que vulguis conservar, prem «Desa» des de la calculadora.
          </p>
          <button className="btn btn-share" onClick={onBackToCalc} style={{ marginTop: 16 }}>
            <Calculator size={18} />
            <span>Ves a la calculadora</span>
          </button>
        </div>
      ) : (
        <>
          <div className="saved-controls">
            <div className="saved-filter-group">
              <select
                className="saved-filter-select"
                value={filterCollaId}
                onChange={(e) => setFilterCollaId(e.target.value)}
                aria-label="Filtra per colla"
              >
                <option value="all">Totes les colles</option>
                {usedColles.map((c) => (
                  <option key={c!.id} value={c!.id}>{c!.shortName}</option>
                ))}
              </select>
              <select
                className="saved-filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Ordena per"
              >
                <option value="recent">Més recents</option>
                <option value="high">Més punts</option>
                <option value="low">Menys punts</option>
              </select>
            </div>
            {usedColles.length > 0 && usedColles.length <= 6 && (
              <div className="saved-chips">
                <button
                  className={`saved-chip ${filterCollaId === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterCollaId('all')}
                >
                  Totes
                </button>
                {usedColles.map((c) => (
                  <button
                    key={c!.id}
                    className={`saved-chip ${filterCollaId === c!.id ? 'active' : ''}`}
                    onClick={() => setFilterCollaId(filterCollaId === c!.id ? 'all' : c!.id)}
                    style={{ '--chip-color': c!.shirtColorHex } as React.CSSProperties}
                  >
                    <span className="saved-chip-dot" style={{ backgroundColor: c!.shirtColorHex }} />
                    {c!.shortName}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="saved-list">
            {filteredAndSorted.map((calc, index) => {
              const scoring = calculateScore(calc.rounds)
              const prevTotal = index > 0 ? calculateScore(filteredAndSorted[index - 1].rounds).total : null
              const gap = prevTotal === null ? 0 : prevTotal - scoring.total
              const colla = calc.collaId ? getCollaById(calc.collaId) : undefined
              const countedSummary = scoring.counted
                .map((c) => `${c.code} ${c.result === 'carregat' ? 'C' : 'D'}`)
                .join(' · ')
              const date = new Date(calc.createdAt)

              return (
                <div
                  key={calc.id}
                  className={`saved-card ${colla ? 'has-colla' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(calc.id)}
                >
                  {colla && (
                    <span
                      className="saved-card-accent"
                      style={{ backgroundColor: colla.shirtColorHex }}
                    />
                  )}
                  <div className="saved-card-body">
                    <div className="saved-card-top">
                      <div className="saved-card-info">
                        <div className="saved-card-name-row">
                          {colla && <CollaAvatar colla={colla} size="sm" />}
                          <span className="saved-card-name">{calc.name}</span>
                        </div>
                        <div className="saved-card-score-row">
                          <span className="saved-card-score">{formatPoints(scoring.total)} punts</span>
                          {gap !== 0 && (
                            <span className={`saved-card-delta ${gap < 0 ? 'ahead' : ''}`}>
                              {gap > 0 ? `falten ${formatPoints(gap)}` : `+${formatPoints(-gap)}`}
                            </span>
                          )}
                        </div>
                        {countedSummary && <span className="saved-card-summary">{countedSummary}</span>}
                      </div>
                      <div className="saved-card-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="saved-card-icon-btn"
                          onClick={() => { setRenamingId(calc.id); setRenameValue(calc.name) }}
                          aria-label="Canvia el nom"
                        >
                          <Pencil size={16} />
                        </button>
                        {confirmDeleteId === calc.id ? (
                          <div className="saved-confirm-delete">
                            <button className="btn btn-confirm-yes" onClick={() => handleDelete(calc.id)}>Elimina</button>
                            <button className="btn btn-confirm-no" onClick={() => setConfirmDeleteId(null)}>Cancel·la</button>
                          </div>
                        ) : (
                          <button
                            className="saved-card-icon-btn danger"
                            onClick={() => setConfirmDeleteId(calc.id)}
                            aria-label="Elimina"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="saved-card-meta">
                      <span>{date.toLocaleDateString('ca-ES', { dateStyle: 'medium' })}</span>
                      <span>{date.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                  {renamingId === calc.id && (
                    <div className="saved-rename-inline" onClick={(e) => e.stopPropagation()}>
                      <input
                        className="saved-rename-input"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRename(calc.id); if (e.key === 'Escape') setRenamingId(null) }}
                        autoFocus
                      />
                      <button className="btn btn-confirm-yes" onClick={() => handleRename(calc.id)}>Desa</button>
                      <button className="btn btn-confirm-no" onClick={() => setRenamingId(null)}>Cancel·la</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
