import { useState } from 'react'
import type { TabId, CastellResult, CastellCode } from './domain/types'
import { useCalculator } from './hooks/useCalculator'
import { RoundCard } from './components/RoundCard'
import { CastellPicker } from './components/CastellPicker'
import { CollaPicker } from './components/CollaPicker'
import { CollaBadge } from './components/CollaBadge'
import { ScoreBreakdown } from './components/ScoreBreakdown'
import { Taula } from './components/Taula'
import { Normes } from './components/Normes'
import { SavedCalculationsList } from './components/SavedCalculationsList'
import { SavedCalculationDetail } from './components/SavedCalculationDetail'
import { saveCalculation, updateSavedCalculation } from './storage/savedCalculations'
import { getCollaById } from './data/colles2026'
import { formatPoints } from './utils/format'
import { Calculator, Table2, BookOpen, Share2, Trash2, AlertTriangle, Bookmark, X, Plus } from 'lucide-react'

const TABS: { id: TabId; label: string; icon: typeof Calculator }[] = [
  { id: 'calculadora', label: 'Calculadora', icon: Calculator },
  { id: 'desats', label: 'Desats', icon: Bookmark },
  { id: 'taula', label: 'Taula 2026', icon: Table2 },
  { id: 'normes', label: 'Normes', icon: BookOpen },
]

function defaultSaveName(collaId?: string): string {
  const colla = collaId ? getCollaById(collaId) : undefined
  if (colla) return `${colla.shortName} · Càlcul`
  const d = new Date()
  const dateStr = d.toLocaleDateString('ca-ES', { day: 'numeric', month: '2-digit', year: 'numeric' })
  return `Càlcul ${dateStr}`
}

export default function App() {
  const {
    rounds,
    collaId,
    setCollaId,
    scoring,
    activeTab,
    setActiveTab,
    expandedRound,
    setExpandedRound,
    updateRound,
    clearAll,
    confirmClear,
    setConfirmClear,
    share,
    hasContent,
    editingCalcId,
    startEditing,
    finishEditing,
  } = useCalculator()

  const [pickerRound, setPickerRound] = useState<number | null>(null)
  const [showCollaPicker, setShowCollaPicker] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [savedToast, setSavedToast] = useState(false)
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  const selectedColla = collaId ? getCollaById(collaId) : undefined

  const handleOpenPicker = (index: number) => setPickerRound(index)
  const handleClosePicker = () => setPickerRound(null)

  const handleSelectCastell = (code: CastellCode) => {
    if (pickerRound !== null) {
      updateRound(pickerRound, code, 'none')
    }
  }

  const handleOpenSaveDialog = () => {
    setSaveName(defaultSaveName(collaId))
    setShowSaveDialog(true)
  }

  const handleSave = () => {
    const trimmed = saveName.trim() || defaultSaveName(collaId)
    if (editingCalcId) {
      updateSavedCalculation(editingCalcId, { name: trimmed, rounds, collaId })
      finishEditing()
    } else {
      saveCalculation({ name: trimmed, rounds, collaId })
    }
    setShowSaveDialog(false)
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2000)
  }

  const countedRounds = new Set(scoring.counted.map((c) => c.roundIndex))

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Calculadora Concurs</h1>
        <span className="app-year">2026</span>
        <p className="app-tagline">Cinc rondes. Tres castells. Fes n&uacute;meros.</p>
        <p className="app-disclaimer">Calculadora no oficial</p>
      </header>

      {activeTab === 'calculadora' && (
        <main className="app-main">
          <section className="colla-selector-section">
            {selectedColla ? (
              <button
                className="colla-selector-button has-colla"
                onClick={() => setShowCollaPicker(true)}
                style={{ borderColor: selectedColla.shirtColorHex }}
              >
                <span
                  className="colla-selector-accent"
                  style={{ backgroundColor: selectedColla.shirtColorHex }}
                />
                <CollaBadge colla={selectedColla} showMunicipality />
              </button>
            ) : (
              <button
                className="colla-selector-button empty"
                onClick={() => setShowCollaPicker(true)}
              >
                <Plus size={16} />
                <span>Tria una colla</span>
              </button>
            )}
          </section>

          <section className="score-area" aria-label="Puntuació total">
            <span className="score-label">Punts totals</span>
            <span className="score-value">{formatPoints(scoring.total)}</span>
            <span className="score-summary">
              {scoring.counted.length} castell{scoring.counted.length !== 1 ? 's' : ''} que compten
              {scoring.countedCarregats > 0 && (
                <> &middot; {scoring.countedCarregats} carregat{scoring.countedCarregats !== 1 ? 's' : ''}</>
              )}
            </span>
          </section>

          <section className="rounds-section" aria-label="Rondes">
            {rounds.map((round, i) => (
              <RoundCard
                key={i}
                index={i}
                round={round}
                isExpanded={expandedRound === i}
                candidate={scoring.counted.find((c) => c.roundIndex === i) ?? null}
                isCounted={countedRounds.has(i)}
                onToggleExpand={() => setExpandedRound(expandedRound === i ? null : i)}
                onOpenPicker={() => handleOpenPicker(i)}
                onSetResult={(result: CastellResult) => updateRound(i, round.castell, result)}
              />
            ))}
          </section>

          <ScoreBreakdown scoring={scoring} />

          {editingCalcId && (
            <div className="editing-badge">
              Editant càlcul desat
            </div>
          )}

          <section className="actions">
            <button
              className="btn btn-save"
              onClick={handleOpenSaveDialog}
              disabled={!hasContent}
              aria-label={editingCalcId ? "Actualitza el càlcul" : "Desa el càlcul"}
            >
              <Bookmark size={18} />
              <span>{editingCalcId ? "Actualitza" : "Desa"}</span>
            </button>
            <button className="btn btn-share" onClick={share} aria-label="Comparteix la simulació">
              <Share2 size={18} />
              <span>Comparteix</span>
            </button>
            {!confirmClear ? (
              <button className="btn btn-clear" onClick={() => setConfirmClear(true)} aria-label="Esborra l'actuació">
                <Trash2 size={18} />
                <span>Esborra l'actuació</span>
              </button>
            ) : (
              <div className="confirm-clear">
                <AlertTriangle size={16} />
                <span>Segur que vols esborrar-ho tot?</span>
                <button className="btn btn-confirm-yes" onClick={clearAll}>Sí</button>
                <button className="btn btn-confirm-no" onClick={() => setConfirmClear(false)}>No</button>
              </div>
            )}
          </section>

          {savedToast && (
            <div className="saved-toast" role="status">Càlcul desat</div>
          )}
        </main>
      )}

      {activeTab === 'desats' && !selectedSavedId && (
        <SavedCalculationsList
          onSelect={setSelectedSavedId}
          onBackToCalc={() => setActiveTab('calculadora')}
        />
      )}

      {activeTab === 'desats' && selectedSavedId && (
        <SavedCalculationDetail
          calculationId={selectedSavedId}
          onBack={() => setSelectedSavedId(null)}
          onEdit={(id, savedRounds, savedCollaId) => {
            startEditing(id, savedRounds, savedCollaId)
            setSelectedSavedId(null)
            setActiveTab('calculadora')
          }}
          onShare={share}
        />
      )}

      {activeTab === 'taula' && <Taula />}
      {activeTab === 'normes' && <Normes onShowAbout={() => setShowAbout(true)} />}

      <footer className="app-footer">
        Calculadora Concurs 2026 · Fet per{' '}
        <button className="app-footer-link" onClick={() => setShowAbout(true)}>
          Guillem Miró
        </button>
        {' '}· No oficial
      </footer>

      {showSaveDialog && (
        <div className="picker-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="picker-sheet save-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="picker-header">
              <h2>Desa el càlcul</h2>
              <button className="picker-close" onClick={() => setShowSaveDialog(false)} aria-label="Tanca">
                <X size={22} />
              </button>
            </div>
            <div className="save-dialog-body">
              <label className="save-label">Colla</label>
              {selectedColla ? (
                <button
                  className="save-colla-button"
                  onClick={() => { setShowSaveDialog(false); setShowCollaPicker(true) }}
                >
                  <CollaBadge colla={selectedColla} showMunicipality />
                </button>
              ) : (
                <button
                  className="save-colla-button empty"
                  onClick={() => { setShowSaveDialog(false); setShowCollaPicker(true) }}
                >
                  <Plus size={16} />
                  <span>Tria una colla</span>
                </button>
              )}
              <label className="save-label" htmlFor="save-name">Nom</label>
              <input
                id="save-name"
                className="save-input"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                autoFocus
              />
              <div className="save-dialog-actions">
                <button className="btn btn-clear" onClick={() => setShowSaveDialog(false)}>Cancel·la</button>
                <button className="btn btn-save" onClick={handleSave}>Desa</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCollaPicker && (
        <CollaPicker
          selectedId={collaId ?? null}
          onSelect={(id) => setCollaId(id ?? undefined)}
          onClose={() => setShowCollaPicker(false)}
        />
      )}

      {pickerRound !== null && (
        <CastellPicker
          roundIndex={pickerRound}
          rounds={rounds}
          selectedCode={rounds[pickerRound].castell}
          onSelect={handleSelectCastell}
          onClose={handleClosePicker}
        />
      )}

      {showAbout && (
        <div className="picker-overlay" onClick={() => setShowAbout(false)}>
          <div className="picker-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="picker-header">
              <h2>Sobre la calculadora</h2>
              <button className="picker-close" onClick={() => setShowAbout(false)} aria-label="Tanca">
                <X size={22} />
              </button>
            </div>
            <div className="about-content">
              <p>
                Calculadora independent i no oficial del Concurs de Castells 2026.
              </p>
              <p>
                <span className="about-label">Desenvolupament</span>
                <br />
                <span className="about-value">Guillem Miró</span>
              </p>
              <p>
                <span className="about-label">Fonts de puntuacions i normativa</span>
                <br />
                <span className="about-value">
                  Concurs de Castells / fonts oficials ja utilitzades per l'aplicació.
                </span>
              </p>
              <p>
                <span className="about-label">Versió</span>
                <br />
                <span className="about-value">0.1.0</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="bottom-nav" role="tablist" aria-label="Navegació principal">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id)
                if (tab.id !== 'desats') setSelectedSavedId(null)
              }}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-label={tab.label}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
