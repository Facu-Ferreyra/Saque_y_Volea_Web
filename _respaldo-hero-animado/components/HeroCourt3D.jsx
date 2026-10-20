import { useEffect, useRef, useState } from 'react'
import HeroServe from './HeroServe.jsx'
import { createRenderer } from '../gl/renderer.js'
import { computeCourtFrame } from '../animation/timeline3d.js'
import { useScrollTimeline } from '../hooks/useScrollTimeline.js'
import { useMedia } from '../hooks/useMedia.js'
import { CLUB, ENVIRONMENT, whatsappLink } from '../config.js'
import { ArrowUpRight } from './Icons.jsx'

/**
 * HERO 3D (WebGL2): la cámara sigue la pelota del saque, ve el pique y la devolución,
 * y atraviesa un agujero de la paleta. Al salir del otro lado aparece el título del club (HTML).
 *
 * Misma técnica de scroll que la versión SVG (sección alta + escenario sticky),
 * pero el dibujo lo hace la GPU en un <canvas>.
 *
 * Si el navegador no soporta WebGL2 (o la placa falla), mostramos <HeroServe /> (SVG).
 */
export default function HeroCourt3D() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const titleRef = useRef(null)
  const hintRef = useRef(null)
  const gfx = useRef({ renderer: null, size: { w: 1, h: 1 }, last: { p: -1, t: 0 }, dirty: true })
  const [fallback, setFallback] = useState(false)
  const reduced = useMedia('(prefers-reduced-motion: reduce)')

  // Dibuja un frame (lo llama el loop de scroll ~60 veces por segundo).
  const draw = (p, t) => {
    const g = gfx.current
    const r = g.renderer
    if (!r) return
    const section = sectionRef.current
    const rect = section?.getBoundingClientRect()
    if (rect && rect.bottom < 0) return // el hero no se ve: no gastamos GPU

    // Solo redibujamos si algo cambió. Con p < 0.045 la pelota pica sola (animación por tiempo).
    const idle = p < 0.045
    if (!g.dirty && !idle && Math.abs(p - g.last.p) < 1e-5) return
    g.last = { p, t }
    g.dirty = false

    const f = computeCourtFrame(p, t, { aspect: g.size.w / g.size.h })
    r.render(f)

    // Capas HTML encima del canvas: el título aparece cuando la cámara sale de la paleta.
    if (titleRef.current) {
      const el = titleRef.current
      el.style.opacity = f.title
      el.style.transform = `translateY(${(1 - f.title) * 28}px)`
      el.style.visibility = f.title > 0.01 ? 'visible' : 'hidden'
      el.style.pointerEvents = f.title > 0.6 ? 'auto' : 'none' // botones clickeables solo cuando se ven
    }
    if (hintRef.current) hintRef.current.style.opacity = f.hint
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  // Crear el renderer UNA vez y mantener el tamaño del canvas sincronizado.
  useEffect(() => {
    const canvas = canvasRef.current
    let renderer
    try {
      renderer = createRenderer(canvas)
    } catch (err) {
      console.warn('WebGL no disponible, uso la versión SVG', err)
    }
    if (!renderer) {
      setFallback(true)
      return
    }
    const g = gfx.current
    g.renderer = renderer

    // Foto 360° del club (si está configurada): se carga en segundo plano.
    if (ENVIRONMENT.src) {
      const img = new Image()
      img.onload = () => {
        if (!g.renderer) return
        renderer.setEnvironment(img, ENVIRONMENT)
        g.dirty = true
        drawRef.current(g.last.p < 0 ? 0 : g.last.p, g.last.t)
      }
      img.src = ENVIRONMENT.src
    }

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75) // tope: más píxeles = más trabajo de GPU
      g.size = { w: width, h: height }
      renderer.resize(width, height, dpr)
      g.dirty = true
      drawRef.current(g.last.p < 0 ? 0 : g.last.p, g.last.t)
    })
    ro.observe(canvas)

    const onLost = (e) => {
      e.preventDefault()
      setFallback(true)
    }
    canvas.addEventListener('webglcontextlost', onLost)

    return () => {
      ro.disconnect()
      canvas.removeEventListener('webglcontextlost', onLost)
      renderer.dispose()
      g.renderer = null
    }
  }, [])

  useScrollTimeline(sectionRef, (p, t) => drawRef.current(p, t), { disabled: reduced || fallback, smoothing: 0.1 })

  if (fallback) return <HeroServe />

  return (
    <section ref={sectionRef} className={`hero hero--3d ${reduced ? 'hero--static' : ''}`} aria-label={`Club ${CLUB.name}`}>
      <div className="hero__stage">
        <canvas
          ref={canvasRef}
          className="hero__canvas"
          role="img"
          aria-label="Vista en 3D desde atrás de la pelota: el saque cruza la red, pica, una paleta la devuelve y la cámara atraviesa un agujero de la paleta."
        />
        <div className="hero__intro">
          <p className="label lime">{CLUB.sports} · {CLUB.city}</p>
          <p className="hero__intro-sub">Canchas de tenis y pádel con reserva por hora</p>
        </div>

        <div ref={titleRef} className="hero__title" style={{ opacity: 0, visibility: 'hidden' }}>
          <p className="label lime">Bienvenido a tu cancha</p>
          <h1>
            <span className="h1-line">Club Saque</span>
            <span className="h1-line">
              <span className="lime">Y</span> Volea
            </span>
          </h1>
          <p className="hero__lead">
            Tenis y pádel en {CLUB.city}. Canchas iluminadas, clases para todos los niveles y turnos
            por hora, reservando por WhatsApp.
          </p>
          <div className="hero__actions">
            <a className="btn btn--lime" href={whatsappLink('booking')} target="_blank" rel="noopener noreferrer">
              Reservar turno
            </a>
            <a className="btn btn--ghost" href={whatsappLink('general')} target="_blank" rel="noopener noreferrer">
              Escribinos por WhatsApp <ArrowUpRight />
            </a>
          </div>
        </div>

        <div ref={hintRef} className="hero__hint" aria-hidden="true">
          Scrolleá para sacar
          <span className="hero__hint-arrow">↓</span>
        </div>
      </div>
    </section>
  )
}
