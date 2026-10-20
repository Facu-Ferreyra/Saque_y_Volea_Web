import { useEffect, useRef } from 'react'
import { m, animate, useInView, useReducedMotion } from 'motion/react'
import { CLUB, whatsappLink, googleReviewLink, instagramLink } from '../config.js'
import { SERVICES, CLASS_FEATURES, CLASSES_PHOTO, GALLERY, REVIEWS, BOOKING_STEPS } from '../content.js'
import { ArrowUpRight, Pin, Phone, AtSign, Clock, Stars } from './Icons.jsx'
import Reveal, { EASE } from './Reveal.jsx'
import ReviewsCarousel from './ReviewsCarousel.jsx'

const ext = { target: '_blank', rel: 'noopener noreferrer' } // links que abren en otra pestaña
const once = { once: true, margin: '0px 0px -12% 0px' } // animar una sola vez, al entrar en pantalla

/** Encabezado de sección reutilizable: título grande + texto al costado (opcional). */
function SectionHead({ title, aside, id }) {
  return (
    <Reveal className="shead">
      <h2 id={id}>{title}</h2>
      {aside && (typeof aside === 'string' ? <p className="shead__aside">{aside}</p> : aside)}
    </Reveal>
  )
}

/** Foto real o, si todavía no hay, un espacio reservado con el mismo tamaño. */
function Photo({ src, alt, tone = 'night' }) {
  if (src) return <img src={src} alt={alt} loading="lazy" decoding="async" />
  return (
    <div className={`ph ph--${tone}`} role="img" aria-label={`Foto pendiente: ${alt}`}>
      <span className="ph__tag">Foto pendiente</span>
    </div>
  )
}

// ---------------------------------------------------------------
// Canchas: las tres opciones son una lista, así que entran escalonadas.
export function Services() {
  return (
    <section className="section" id="canchas" aria-labelledby="canchas-t">
      <div className="wrap">
        <SectionHead id="canchas-t" title="Todo lo que pasa en el club" />
        <div className="services">
          {SERVICES.map((s, i) => {
            const external = s.href.startsWith('http')
            return (
              <Reveal
                as="a"
                key={s.title}
                className="service"
                href={s.href}
                {...(external ? ext : {})}
                delay={0.1 + i * 0.08}
                y={16}
              >
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <span className="service__cta label">
                  {s.cta} <ArrowUpRight />
                </span>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
// Clases: la foto se descubre de abajo hacia arriba, después aparece el sello verde
// y la lista se "tilda" ítem por ítem (cada check se dibuja).
const checkList = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }
const checkItem = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } }
const checkMark = {
  hidden: { pathLength: 0 },
  show: { pathLength: 1, transition: { duration: 0.45, ease: EASE, delay: 0.1 } },
}

export function Classes() {
  return (
    <section className="section" id="clases" aria-labelledby="clases-t">
      <div className="wrap classes">
        <figure className="classes__photo">
          <m.div
            className="classes__frame"
            initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
            whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            viewport={once}
            transition={{ duration: 1, ease: EASE }}
          >
            <Photo {...CLASSES_PHOTO} tone="clay" />
          </m.div>
          <m.figcaption
            className="classes__badge"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={once}
            transition={{ duration: 0.5, ease: EASE, delay: 0.7 }}
          >
            <span className="label">Profes del club</span>
            <strong>Todos los niveles</strong>
          </m.figcaption>
        </figure>
        <div className="classes__text">
          <Reveal as="h2" id="clases-t">
            Aprendé a jugar o afiná tu juego
          </Reveal>
          <Reveal as="p" className="lead" delay={0.08}>
            Las clases de tenis son individuales o grupales, y se arman según tu nivel: desde la primera
            vez que agarrás la raqueta hasta jugadores que quieren competir. Hay escuelita para chicos y
            también damos clases de pádel.
          </Reveal>
          <m.ul className="checks" variants={checkList} initial="hidden" whileInView="show" viewport={once}>
            {CLASS_FEATURES.map((f) => (
              <m.li key={f} variants={checkItem}>
                <span className="checks__icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <m.path d="m5 12 4.5 4.5L19 7" variants={checkMark} />
                  </svg>
                </span>
                {f}
              </m.li>
            ))}
          </m.ul>
          <Reveal delay={0.3}>
            <a className="btn btn--accent" href={whatsappLink('classes')} {...ext}>
              Consultar por clases
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
// Galería: cada foto "se enciende" como una cancha cuando prenden las luces
// (pasa de oscura a su brillo normal).
export function Gallery() {
  return (
    <section className="section" id="galeria" aria-labelledby="galeria-t">
      <div className="wrap">
        <SectionHead
          id="galeria-t"
          title="Así es el club"
          aside="Canchas de tenis y pádel al aire libre en Belén de Escobar, con iluminación para los turnos después del trabajo."
        />
        <div className="bento">
          {GALLERY.map((g, i) => (
            <m.figure
              key={g.label}
              className={`tile tile--${g.size}`}
              initial={{ opacity: 0.4, filter: 'brightness(0.25)' }}
              whileInView={{ opacity: 1, filter: 'brightness(1)' }}
              viewport={once}
              transition={{ duration: 1.1, ease: EASE, delay: (i % 2) * 0.12 }}
            >
              <Photo src={g.src} alt={g.label} tone={g.tone} />
              <figcaption>
                <span className="label accent">{g.label}</span>
                <span>{g.text}</span>
              </figcaption>
            </m.figure>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
const formatRating = (v) => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** Puntaje que cuenta de 0 al valor real la primera vez que se ve. Sin JS o con
 *  "reducir movimiento" muestra directamente el número final. */
function CountUp({ value }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const reduced = useReducedMotion()
  useEffect(() => {
    if (!inView || reduced) return
    const controls = animate(0, value, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = formatRating(v)
      },
    })
    return () => controls.stop()
  }, [inView, reduced, value])
  return <span ref={ref}>{formatRating(value)}</span>
}

function RatingBadge({ compact = false }) {
  return (
    <a
      className={`rating ${compact ? 'rating--compact' : ''}`}
      href={googleReviewLink()}
      {...ext}
      aria-label={`${CLUB.rating} de 5 en Google con ${CLUB.ratingCount} reseñas. Dejá tu reseña en Google Maps.`}
    >
      <span className="rating__score">{compact ? formatRating(CLUB.rating) : <CountUp value={CLUB.rating} />}</span>
      <span className="rating__meta">
        {!compact && <Stars count={5} />}
        <span className="label">{CLUB.ratingCount} reseñas en Google</span>
        <span className="rating__cta">
          Dejá tu reseña <ArrowUpRight />
        </span>
      </span>
    </a>
  )
}

export function Reviews() {
  return (
    <section className="section" id="resenas" aria-labelledby="resenas-t">
      <div className="wrap">
        <SectionHead id="resenas-t" title="Un club recomendado en el barrio" aside={<RatingBadge />} />
        {REVIEWS.length > 0 && (
          <Reveal delay={0.1}>
            <ReviewsCarousel reviews={REVIEWS} />
          </Reveal>
        )}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
// Reservas: los pasos son una secuencia. Una línea baja de un paso al otro y el borde
// de cada número se "enciende" en verde cuando la línea llega.
// La reserva online se implementa más adelante. Mientras tanto, esta sección
// explica cómo reservar hoy (WhatsApp) para que el link "Reservas" no quede vacío.
const STEP_GAP = 0.35 // segundos entre un paso y el siguiente
const steps = { hidden: {}, show: { transition: { staggerChildren: STEP_GAP, delayChildren: 0.15 } } }
const step = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
}
// El tramo tarda lo mismo que la espera entre pasos: llega justo cuando aparece el siguiente.
const segment = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: STEP_GAP, ease: 'linear', delay: 0.2 } },
}
// El "encendido" es un aro de color de acento que aparece sobre el borde del número.
// Se anima su opacidad (y no el color del borde) para que funcione igual en los dos temas.
const stepRing = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, delay: 0.15 } },
}

export function Booking() {
  return (
    <section className="section" id="reservas" aria-labelledby="reservas-t">
      <div className="wrap">
        <SectionHead
          id="reservas-t"
          title="Elegí cancha, día y horario"
          aside="Turnos de una hora, de 9 a 22 h. Los domingos el club permanece cerrado."
        />
        <div className="booking">
          <m.ol className="booking__steps" variants={steps} initial="hidden" whileInView="show" viewport={once}>
            {BOOKING_STEPS.map((s, i) => (
              <m.li key={s.title} variants={step}>
                <span className="booking__n">
                  <m.span className="booking__ring" aria-hidden="true" variants={stepRing} />
                  {i + 1}
                </span>
                {i < BOOKING_STEPS.length - 1 && <m.span className="booking__seg" aria-hidden="true" variants={segment} />}
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </m.li>
            ))}
          </m.ol>
          <Reveal className="booking__card" delay={0.2}>
            <span className="pill">Próximamente</span>
            <h3>Reserva online</h3>
            <p>Estamos preparando la reserva online con disponibilidad en tiempo real. Mientras tanto, pedí tu turno por WhatsApp.</p>
            <a className="btn btn--accent" href={whatsappLink('booking')} {...ext}>
              Reservar por WhatsApp
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
export function Footer() {
  return (
    <footer className="footer" id="contacto" aria-labelledby="contacto-t">
      <div className="wrap footer__grid">
        <div className="footer__brand">
          <img className="footer__logo" src="/logo.webp" alt="Logo del Club Saque y Volea" width="112" height="134" loading="lazy" />
          <h2 id="contacto-t" className="footer__name">
            Club Saque <span className="accent">Y</span> Volea
          </h2>
          <p className="muted">Un club de barrio para jugar tenis y pádel en {CLUB.city}, de lunes a sábado.</p>
          <RatingBadge compact />
        </div>

        <div>
          <p className="label">Contacto</p>
          <ul className="contact">
            <li>
              <Pin />
              <a href={CLUB.mapsUrl} {...ext}>{CLUB.address}</a>
            </li>
            <li>
              <Phone />
              <a href={`tel:+${CLUB.whatsapp}`}>{CLUB.phoneDisplay}</a>
            </li>
            <li>
              <AtSign />
              <a href={instagramLink()} {...ext}>@{CLUB.instagram}</a>
            </li>
          </ul>
        </div>

        <div>
          <p className="label">Horarios</p>
          <table className="hours">
            <tbody>
              {CLUB.hours.map((h) => (
                <tr key={h.days}>
                  <th scope="row">
                    <Clock /> {h.days}
                  </th>
                  <td>{h.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="footer__actions">
            <a className="btn btn--accent" href={whatsappLink('booking')} {...ext}>
              Reservar por WhatsApp
            </a>
            <a className="btn btn--ghost" href={CLUB.mapsUrl} {...ext}>
              Cómo llegar
            </a>
          </div>
        </div>
      </div>
      <div className="wrap footer__bottom">
        <span>© {new Date().getFullYear()} {CLUB.fullName}</span>
        <span>{CLUB.address}</span>
      </div>
    </footer>
  )
}
