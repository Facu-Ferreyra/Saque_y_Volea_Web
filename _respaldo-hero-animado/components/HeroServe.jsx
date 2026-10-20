import { useId, useRef } from 'react'
import Paddle from './Paddle.jsx'
import { LAYOUTS, contactPoint, computeFrame } from '../animation/timeline.js'
import { useScrollTimeline } from '../hooks/useScrollTimeline.js'
import { useMedia } from '../hooks/useMedia.js'
import { CLUB, whatsappLink } from '../config.js'

const TRAIL = 6 // cantidad de "fantasmas" de la estela

/**
 * HERO con el saque animado por scroll.
 *
 * Estructura (técnica "sticky scroll"):
 *   <section> muy alta (350vh)  ← da el recorrido de scroll
 *     <div sticky 100vh>        ← queda fija en pantalla mientras scrolleás
 *       <svg> con la escena     ← se actualiza en cada frame
 *
 * React dibuja el SVG UNA vez. Después, useScrollTimeline llama a `draw` en cada frame
 * y `draw` modifica atributos directamente usando refs (sin re-renderizar).
 */
export default function HeroServe() {
  const sectionRef = useRef(null)
  const r = useRef({}).current // bolsa de refs a nodos del SVG
  const uid = useId().replace(/:/g, '')

  const portrait = useMedia('(max-aspect-ratio: 11/10)')
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const L = portrait ? LAYOUTS.portrait : LAYOUTS.landscape
  const C = contactPoint(L)

  // Se llama ~60 veces por segundo con el progreso suavizado.
  const draw = (p, t) => {
    const f = computeFrame(p, t, L)
    const { ball, shadow, paddle, impact } = f
    const sx = 1 + (1 - ball.squash) * 0.6

    r.ball?.setAttribute(
      'transform',
      `translate(${ball.x} ${ball.y + L.ballR}) scale(${sx} ${ball.squash}) translate(0 ${-L.ballR}) rotate(${ball.spin})`,
    )
    r.ball?.setAttribute('opacity', ball.visible)
    r.shadow?.setAttribute('transform', `translate(${shadow.x} ${L.floorY}) scale(${shadow.s} 1)`)
    r.shadow?.setAttribute('opacity', shadow.o * ball.visible)

    for (let i = 0; i < TRAIL; i++) {
      const node = r[`trail${i}`]
      const tp = f.trail[i]
      if (!node) continue
      if (tp) {
        node.setAttribute('cx', tp.x)
        node.setAttribute('cy', tp.y)
        node.setAttribute('opacity', tp.o)
      } else node.setAttribute('opacity', 0)
    }

    r.paddle?.setAttribute(
      'transform',
      `translate(${L.pivot.x} ${L.pivot.y + paddle.dy}) rotate(${paddle.angle})`,
    )
    r.paddle?.setAttribute('opacity', paddle.opacity)
    r.impact?.setAttribute('r', impact.r)
    r.impact?.setAttribute('opacity', impact.o)

    // El nombre se "destapa" con un rectángulo de recorte que crece hacia la derecha.
    r.clip1?.setAttribute('width', f.name1 * 1100)
    r.clip2?.setAttribute('width', f.name2 * 1100)
    if (r.tagline) {
      r.tagline.style.opacity = f.tagline
      r.tagline.style.transform = `translateY(${(1 - f.tagline) * 24}px)`
      r.tagline.style.visibility = f.tagline > 0.01 ? 'visible' : 'hidden'
    }
    if (r.hint) r.hint.style.opacity = f.hint
  }

  useScrollTimeline(sectionRef, draw, { disabled: reduced })

  const [vx, vy, vw, vh] = L.viewBox
  const set = (key) => (node) => {
    r[key] = node
  }

  return (
    <section ref={sectionRef} className={`hero ${reduced ? 'hero--static' : ''}`} aria-label={`Club ${CLUB.name}`}>
      <div className="hero__stage">
        <header className="hero__bar">
          <span className="hero__mark">Saque y Volea</span>
          <span className="hero__where">Pádel · {CLUB.city}</span>
        </header>

        <svg
          className="hero__svg"
          viewBox={`${vx} ${vy} ${vw} ${vh}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Una pelota pica en la cancha, aparece una paleta y la golpea en el saque. Detrás aparece el nombre Saque y Volea."
        >
          <defs>
            <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--hero-sky-top)" />
              <stop offset="1" stopColor="var(--hero-sky-bottom)" />
            </linearGradient>
            <radialGradient id={`lamp${uid}`}>
              <stop offset="0" stopColor="var(--hero-lamp)" stopOpacity="0.55" />
              <stop offset="1" stopColor="var(--hero-lamp)" stopOpacity="0" />
            </radialGradient>
            <pattern id={`mesh${uid}`} width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M0 0 L8 8 M8 0 L0 8" stroke="var(--hero-line)" strokeOpacity="0.35" strokeWidth="1" />
            </pattern>
            <clipPath id={`c1${uid}`}>
              <rect ref={set('clip1')} x={L.name.x - 20} y="-200" width="0" height="2000" />
            </clipPath>
            <clipPath id={`c2${uid}`}>
              <rect ref={set('clip2')} x={L.name.x - 20} y="-200" width="0" height="2000" />
            </clipPath>
          </defs>

          {/* Cielo y piso desbordan el viewBox para cubrir cualquier proporción de pantalla */}
          <rect x="-3000" y="-3000" width="7000" height={3000 + L.floorY} fill={`url(#sky${uid})`} />
          <rect x="-3000" y={L.floorY} width="7000" height="3000" fill="var(--hero-turf)" />
          <line x1="-3000" x2="4000" y1={L.floorY} y2={L.floorY} stroke="var(--hero-line)" strokeWidth="5" />

          {/* Luces de la cancha: el club se destaca por la iluminación nocturna */}
          {[0.18, 0.5, 0.82].map((k) => (
            <g key={k}>
              <circle cx={vw * k} cy={vy - 10} r="190" fill={`url(#lamp${uid})`} />
              <rect x={vw * k - 22} y={vy + 6} width="44" height="7" rx="3" fill="var(--hero-lamp)" opacity="0.9" />
            </g>
          ))}

          {/* Pared de vidrio del fondo (en pádel la pelota puede rebotar en ella) */}
          <rect x={vx - 400} y={L.floorY - 300} width="440" height="300" fill="var(--hero-glass)" />
          <line x1={vx + 40} x2={vx + 40} y1={L.floorY - 300} y2={L.floorY} stroke="var(--hero-line)" strokeOpacity="0.5" strokeWidth="3" />

          {/* Red */}
          <rect x={L.netX - 3} y={L.floorY - L.netH - 6} width="6" height={L.netH + 6} fill="var(--hero-line)" />
          <rect x={L.netX - 40} y={L.floorY - L.netH} width="80" height={L.netH} fill={`url(#mesh${uid})`} />
          <rect x={L.netX - 40} y={L.floorY - L.netH - 3} width="80" height="6" fill="var(--hero-line)" />

          {/* Nombre del club: queda DETRÁS de la paleta porque se dibuja antes */}
          <g className="hero__name">
            <text x={L.name.x} y={L.name.y1} fontSize={L.name.size} clipPath={`url(#c1${uid})`}>
              SAQUE
            </text>
            <text x={L.name.x} y={L.name.y2} fontSize={L.name.size} clipPath={`url(#c2${uid})`}>
              <tspan className="hero__name-y">Y </tspan>VOLEA
            </text>
          </g>

          {/* Sombra en el piso */}
          <ellipse ref={set('shadow')} rx="22" ry="5" fill="#000" opacity="0" />

          {/* Estela del vuelo */}
          {Array.from({ length: TRAIL }, (_, i) => (
            <circle key={i} ref={set(`trail${i}`)} r={L.ballR * (1 - i * 0.1)} fill="var(--ball)" opacity="0" />
          ))}

          {/* Destello del impacto */}
          <circle ref={set('impact')} cx={C.x} cy={C.y} r="0" fill="none" stroke="var(--ball)" strokeWidth="4" opacity="0" />

          {/* Pelota */}
          <g ref={set('ball')}>
            <circle r={L.ballR} fill="var(--ball)" />
            <path d="M -15 -5 Q -4 0 -9 12" stroke="var(--ball-seam)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M 15 5 Q 4 0 9 -12" stroke="var(--ball-seam)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </g>

          {/* Paleta (adelante de todo) */}
          <g ref={set('paddle')} opacity="0">
            <Paddle />
          </g>
        </svg>

        <div ref={set('tagline')} className="hero__tagline" style={{ opacity: 0, visibility: 'hidden' }}>
          <p>
            Canchas de pádel con iluminación nocturna en {CLUB.city}.<br />
            Lunes a sábado de 9 a 22 h.
          </p>
          <a className="btn btn--ball" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            Reservá tu cancha
          </a>
        </div>

        <div ref={set('hint')} className="hero__hint" aria-hidden="true">
          Scrolleá para sacar
          <span className="hero__hint-arrow">↓</span>
        </div>
      </div>
    </section>
  )
}
