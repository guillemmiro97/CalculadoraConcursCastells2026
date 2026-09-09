import { useState } from 'react'
import { CASTELLS_2026 } from '../data/castells2026'
import { formatPoints } from '../utils/format'
import { Search } from 'lucide-react'

export function Taula() {
  const [search, setSearch] = useState('')

  const filtered = CASTELLS_2026.filter((c) => {
    const q = search.toLowerCase()
    if (!q) return true
    return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
  })

  return (
    <div className="taula-section">
      <div className="taula-search">
        <Search size={18} />
        <input
          type="search"
          placeholder="Cerca castell..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Cerca a la taula de puntuacions"
        />
      </div>
      <div className="taula-table-wrapper">
        <table className="taula-table" role="table">
          <thead>
            <tr>
              <th scope="col">Castell</th>
              <th scope="col" className="taula-col-num">Carregat</th>
              <th scope="col" className="taula-col-num">Descarregat</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.code}>
                <td>
                  <span className="taula-code">{c.code}</span>
                  <span className="taula-name">{c.name}</span>
                </td>
                <td className="taula-col-num">{formatPoints(c.carregat)}</td>
                <td className="taula-col-num">{formatPoints(c.descarregat)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
