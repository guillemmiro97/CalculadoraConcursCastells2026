import type { Colla } from '../domain/types'
import { getContrastTextColor } from '../utils/color'

function getInitials(colla: Colla): string {
  const words = colla.shortName.split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

interface CollaAvatarProps {
  colla: Colla
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = { sm: 28, md: 36, lg: 56 }
const FONT_MAP = { sm: 10, md: 12, lg: 18 }

export function CollaAvatar({ colla, size = 'md' }: CollaAvatarProps) {
  const px = SIZE_MAP[size]
  const fontSize = FONT_MAP[size]

  if (colla.logoPath) {
    return (
      <img
        src={colla.logoPath}
        alt={colla.name}
        className="colla-avatar"
        width={px}
        height={px}
        style={{ borderRadius: '50%', objectFit: 'cover' }}
      />
    )
  }

  return (
    <span
      className="colla-avatar colla-avatar-fallback"
      aria-label={colla.name}
      style={{
        width: px,
        height: px,
        borderRadius: '50%',
        backgroundColor: colla.shirtColorHex,
        color: getContrastTextColor(colla.shirtColorHex),
        fontSize,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {getInitials(colla)}
    </span>
  )
}
