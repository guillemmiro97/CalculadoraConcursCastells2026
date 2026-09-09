import { useState, useRef, useEffect, useCallback } from 'react'
import type { CastellCode, Round } from '../domain/types'
import { getCastellAvailability } from '../domain/rules'
import { formatPoints } from '../utils/format'
import { Search, X, AlertCircle } from 'lucide-react'

interface CastellPickerProps {
  roundIndex: number
  rounds: Round[]
  selectedCode: CastellCode | null
  onSelect: (code: CastellCode) => void
  onClose: () => void
}

export function CastellPicker({ roundIndex, rounds, selectedCode, onSelect, onClose }: CastellPickerProps) {
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const availability = getCastellAvailability(roundIndex, rounds)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const filtered = availability.filter((c) => {
    const q = search.toLowerCase()
    if (!q) return true
    return (
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q)
    )
  })

  const handleSelect = useCallback((code: CastellCode, available: boolean) => {
    if (!available) return
    onSelect(code)
    onClose()
  }, [onSelect, onClose])

  return (
    <div className="picker-overlay" role="dialog" aria-label="Escull un castell">
      <div className="picker-sheet">
        <div className="picker-header">
          <h2>Escull un castell</h2>
          <button className="picker-close" onClick={onClose} aria-label="Tanca">
            <X size={20} />
          </button>
        </div>
        <div className="picker-search">
          <Search size={18} />
          <input
            ref={inputRef}
            type="search"
            placeholder="Cerca: 3de9, pilar, folre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cerca castells"
          />
        </div>
        <div className="picker-list">
          {filtered.length === 0 && (
            <div className="picker-empty">
              <AlertCircle size={20} />
              <span>Cap castell trobat</span>
            </div>
          )}
          {filtered.map((c) => (
            <button
              key={c.code}
              className={`picker-item ${c.code === selectedCode ? 'selected' : ''} ${!c.available ? 'unavailable' : ''}`}
              onClick={() => handleSelect(c.code, c.available)}
              disabled={!c.available}
              aria-label={`${c.name}. Carregat: ${formatPoints(c.carregat)}. Descarregat: ${formatPoints(c.descarregat)}.${!c.available ? ` No disponible: ${c.reason}` : ''}`}
            >
              <div className="picker-item-main">
                <span className="picker-item-code">{c.code}</span>
                <span className="picker-item-name">{c.name}</span>
              </div>
              <div className="picker-item-scores">
                <span className="picker-score carregat">C {formatPoints(c.carregat)}</span>
                <span className="picker-score descarregat">D {formatPoints(c.descarregat)}</span>
              </div>
              {!c.available && c.reason && (
                <div className="picker-item-reason">{c.reason}</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
