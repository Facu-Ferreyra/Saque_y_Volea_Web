// Íconos SVG simples dibujados a mano (sin librerías).
// currentColor = toman el color del texto que los rodea.

const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export const ArrowUpRight = (p) => (
  <svg {...base} width="14" height="14" {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)
export const Check = (p) => (
  <svg {...base} width="14" height="14" {...p}>
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
)
export const Pin = (p) => (
  <svg {...base} {...p}>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
)
export const Phone = (p) => (
  <svg {...base} {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
)
export const AtSign = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
  </svg>
)
export const Clock = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)
export const Chat = (p) => (
  <svg {...base} width="26" height="26" {...p}>
    <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" />
    <path d="M8.5 10.5h7M8.5 13.5h4.5" />
  </svg>
)
export const Pause = (p) => (
  <svg {...base} width="14" height="14" {...p}>
    <path d="M8 5v14M16 5v14" />
  </svg>
)
export const Play = (p) => (
  <svg {...base} width="14" height="14" {...p}>
    <path d="M7 5l12 7-12 7z" />
  </svg>
)
export const Menu = (p) => (
  <svg {...base} width="22" height="22" {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)
export const Close = (p) => (
  <svg {...base} width="22" height="22" {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

/** Fila de estrellas. role="img" + aria-label para que se lea "5 de 5 estrellas". */
export function Stars({ count = 5, size = 14 }) {
  return (
    <span className="stars" role="img" aria-label={`${count} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={i < count ? 'on' : 'off'}>
          <path d="M12 2.8l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 17l-5.8 3.3 1.4-6.4L2.7 9.5l6.5-.7z" fill="currentColor" />
        </svg>
      ))}
    </span>
  )
}
