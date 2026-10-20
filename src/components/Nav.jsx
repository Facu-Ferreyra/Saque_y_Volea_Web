import { useEffect, useState } from 'react'
import { CLUB, whatsappLink } from '../config.js'
import { NAV_LINKS } from '../content.js'
import { Menu, Close } from './Icons.jsx'

/**
 * Barra de navegación fija.
 * - Arriba de todo es transparente (deja ver el 3D); al scrollear toma fondo.
 * - En celular los links se esconden detrás de un botón de menú.
 */
export default function Nav() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true }) // passive: no frena el scroll
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cerrar el menú con Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={`nav ${solid || open ? 'nav--solid' : ''}`}>
      <div className="nav__in">
        <a className="brand" href="#top" onClick={() => setOpen(false)} aria-label={`${CLUB.fullName}, ir al inicio`}>
          <img className="brand__mark" src="/marca.png" alt="" width="36" height="36" />
          <span className="brand__text">
            <span className="brand__name">
              Saque <span className="accent">Y</span> Volea
            </span>
            <span className="brand__city">{CLUB.city}</span>
          </span>
        </a>

        <nav className={`nav__links ${open ? 'is-open' : ''}`} id="menu" aria-label="Secciones">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a className="btn btn--accent nav__cta-mobile" href={whatsappLink('booking')} target="_blank" rel="noopener noreferrer">
            Reservar turno
          </a>
        </nav>

        <a className="btn btn--accent nav__cta" href={whatsappLink('booking')} target="_blank" rel="noopener noreferrer">
          Reservar turno
        </a>

        <button
          className="nav__burger"
          type="button"
          aria-expanded={open}
          aria-controls="menu"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <Close /> : <Menu />}
        </button>
      </div>
    </header>
  )
}
