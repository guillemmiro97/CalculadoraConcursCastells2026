import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { Colla, ConcursSession } from '../domain/types'
import { colles2026, searchColles, SESSION_LABELS } from '../data/colles2026'
import { CollaAvatar } from './CollaAvatar'
import { Search, X, AlertCircle } from 'lucide-react'

interface CollaPickerProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
  onClose: () => void
}

const SESSION_ORDER: ConcursSession[] = ['diumenge', 'dissabte', 'torredembarra']

export function CollaPicker({ selectedId, onSelect, onClose }: CollaPickerProps) {
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const filtered = useMemo(() => {
    const results = search ? searchColles(search) : colles2026
    const grouped = new Map<ConcursSession, Colla[]>()
    for (const session of SESSION_ORDER) {
      const inSession = results.filter((c) => c.concurs2026.session === session)
      if (inSession.length > 0) grouped.set(session, inSession)
    }
    return grouped
  }, [search])

  const handleSelect = useCallback((id: string) => {
    onSelect(id === selectedId ? null : id)
    onClose()
  }, [onSelect, selectedId, onClose])

  return (
    <div className="picker-overlay" role="dialog" aria-label="Tria una colla">
      <div className="picker-sheet">
        <div className="picker-header">
          <h2>Tria una colla</h2>
          <button className="picker-close" onClick={onClose} aria-label="Tanca">
            <X size={20} />
          </button>
        </div>
        <div className="picker-search">
          <Search size={18} />
          <input
            ref={inputRef}
            type="search"
            placeholder="Cerca: Vilafranca, Jove, Tarragona..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cerca colles"
          />
        </div>
        <div className="picker-list">
          {filtered.size === 0 && (
            <div className="picker-empty">
              <AlertCircle size={20} />
              <span>Cap colla trobada</span>
            </div>
          )}
          {Array.from(filtered.entries()).map(([session, colles]) => (
            <div key={session}>
              <div className="colla-session-group">
                <span className="colla-session-label">{SESSION_LABELS[session]}</span>
                <span className="colla-session-count">{colles.length}</span>
              </div>
              {colles.map((c) => (
                <button
                  key={c.id}
                  className={`picker-item colla-picker-item ${c.id === selectedId ? 'selected' : ''}`}
                  onClick={() => handleSelect(c.id)}
                >
                  <CollaAvatar colla={c} size="sm" />
                  <div className="colla-picker-item-text">
                    <span className="colla-picker-item-name">{c.name}</span>
                    <span className="colla-picker-item-meta">
                      {c.municipality}
                      <span
                        className="colla-picker-item-dot"
                        style={{ backgroundColor: c.shirtColorHex }}
                      />
                      {c.shirtColorName}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
