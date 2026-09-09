import type { Colla } from '../domain/types'
import { CollaAvatar } from './CollaAvatar'

interface CollaBadgeProps {
  colla: Colla
  showMunicipality?: boolean
}

export function CollaBadge({ colla, showMunicipality = false }: CollaBadgeProps) {
  return (
    <div className="colla-badge">
      <CollaAvatar colla={colla} size="sm" />
      <div className="colla-badge-text">
        <span className="colla-badge-name">{colla.shortName}</span>
        {showMunicipality && (
          <span className="colla-badge-municipality">{colla.municipality}</span>
        )}
      </div>
      <span
        className="colla-badge-dot"
        style={{ backgroundColor: colla.shirtColorHex }}
        aria-label={colla.shirtColorName}
      />
      <span className="colla-badge-color">{colla.shirtColorName}</span>
    </div>
  )
}
