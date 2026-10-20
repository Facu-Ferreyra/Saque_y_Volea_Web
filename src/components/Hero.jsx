import { m } from 'motion/react'
import { CLUB, whatsappLink } from '../config.js'
import { ArrowUpRight } from './Icons.jsx'

const EASE = [0.22, 1, 0.36, 1]

// El contenedor no se mueve: solo reparte la entrada de sus hijos, uno detrás del otro.
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }
const rise = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}
// Cada línea del título sube desde abajo de una "ventana" (.h1-mask con overflow: hidden).
const line = {
  hidden: { opacity: 0, y: '100%' },
  show: { opacity: 1, y: '0%', transition: { duration: 0.9, ease: EASE } },
}

/** Portada: nombre del club, bajada y los dos botones para reservar o consultar. */
export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-t">
      <m.div className="hero__intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }}>
        <p className="label lime">{CLUB.sports} · {CLUB.city}</p>
        <p className="hero__intro-sub">Canchas de tenis y pádel con reserva por hora</p>
      </m.div>

      <m.div className="hero__title" variants={stagger} initial="hidden" animate="show">
        <m.p className="label lime" variants={rise}>
          Bienvenido a tu cancha
        </m.p>
        <h1 id="hero-t">
          <span className="h1-mask">
            <m.span className="h1-line" variants={line}>
              Club Saque
            </m.span>
          </span>
          <span className="h1-mask">
            <m.span className="h1-line" variants={line}>
              <span className="lime">Y</span> Volea
            </m.span>
          </span>
        </h1>
        <m.p className="hero__lead" variants={rise}>
          Tenis y pádel en {CLUB.city}. Canchas iluminadas, clases para todos los niveles y turnos por
          hora, reservando por WhatsApp.
        </m.p>
        <m.div className="hero__actions" variants={rise}>
          <a className="btn btn--lime" href={whatsappLink('booking')} target="_blank" rel="noopener noreferrer">
            Reservar turno
          </a>
          <a className="btn btn--ghost" href={whatsappLink('general')} target="_blank" rel="noopener noreferrer">
            Escribinos por WhatsApp <ArrowUpRight />
          </a>
        </m.div>
      </m.div>
    </section>
  )
}
