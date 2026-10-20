import { m, useReducedMotion } from 'motion/react'
import { CLUB, whatsappLink } from '../config.js'
import { ArrowUpRight } from './Icons.jsx'
import { EASE } from './Reveal.jsx'
import CourtLines from './CourtLines.jsx'

// Momento principal de la página: se prenden los reflectores de la cancha (parpadeo corto,
// como un reflector que arranca), la luz baja, se dibuja la cancha y aparece el nombre del club.
const LAMP_ON = 0.15 // segundos hasta que arrancan las lámparas
const LIGHT_ON = 0.55 // segundos hasta que el haz de luz llega al piso

// El contenedor no se mueve: solo reparte la entrada de sus hijos, uno detrás del otro.
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: LIGHT_ON + 0.2 } } }
const rise = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}
// Cada línea del título sube desde abajo de una "ventana" (.h1-mask con overflow: hidden).
const line = {
  hidden: { opacity: 0, y: '100%' },
  show: { opacity: 1, y: '0%', transition: { duration: 0.9, ease: EASE } },
}

/** Reflector: la lámpara arriba y el haz de luz que baja en diagonal hacia el centro. */
function Floodlight({ side, reduced }) {
  return (
    <div className={`light light--${side}`} aria-hidden="true">
      <m.span
        className="light__lamp"
        initial={{ opacity: 0 }}
        animate={{ opacity: reduced ? 1 : [0, 1, 0.35, 1, 0.7, 1] }}
        transition={{ duration: reduced ? 0.4 : 0.6, delay: LAMP_ON, times: reduced ? undefined : [0, 0.15, 0.3, 0.5, 0.7, 1] }}
      />
      <m.span
        className="light__beam"
        initial={{ opacity: 0, scaleY: 0.85 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 1.1, delay: LIGHT_ON, ease: EASE }}
      />
    </div>
  )
}

/** Portada: nombre del club, bajada y los dos botones para reservar o consultar. */
export default function Hero() {
  const reduced = useReducedMotion()
  return (
    <section className="hero" aria-labelledby="hero-t">
      <CourtLines start={LIGHT_ON + 0.1} />
      <Floodlight side="left" reduced={reduced} />
      <Floodlight side="right" reduced={reduced} />

      <m.div
        className="hero__intro"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: LIGHT_ON + 0.8 }}
      >
        <p className="label accent">{CLUB.sports} · {CLUB.city}</p>
        <p className="hero__intro-sub">Canchas de tenis y pádel con reserva por hora</p>
      </m.div>

      <m.div className="hero__title" variants={stagger} initial="hidden" animate="show">
        <h1 id="hero-t">
          <span className="h1-mask">
            <m.span className="h1-line" variants={line}>
              Club Saque
            </m.span>
          </span>{' '}
          <span className="h1-mask">
            <m.span className="h1-line" variants={line}>
              <span className="accent">Y</span> Volea
            </m.span>
          </span>
        </h1>
        <m.p className="hero__lead" variants={rise}>
          Tenis y pádel en {CLUB.city}. Canchas iluminadas, clases para todos los niveles y turnos por
          hora, reservando por WhatsApp.
        </m.p>
        <m.div className="hero__actions" variants={rise}>
          <a className="btn btn--accent" href={whatsappLink('booking')} target="_blank" rel="noopener noreferrer">
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
