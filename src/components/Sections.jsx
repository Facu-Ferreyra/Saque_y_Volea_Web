import { CLUB, whatsappLink, googleReviewLink, instagramLink } from '../config.js'
import { SERVICES, CLASS_FEATURES, CLASSES_PHOTO, GALLERY, REVIEWS, BOOKING_STEPS } from '../content.js'
import { ArrowUpRight, Check, Pin, Phone, AtSign, Clock, Stars } from './Icons.jsx'
import Reveal from './Reveal.jsx'

const ext = { target: '_blank', rel: 'noopener noreferrer' } // links que abren en otra pestaña

/** Encabezado de sección reutilizable: etiqueta chica + título grande. */
function SectionHead({ label, title, aside, id }) {
  return (
    <div className="shead">
      <div>
        <p className="label lime">{label}</p>
        <h2 id={id}>{title}</h2>
      </div>
      {aside && <p className="shead__aside">{aside}</p>}
    </div>
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
export function Services() {
  return (
    <section className="section section--grid" id="canchas" aria-labelledby="canchas-t">
      <div className="wrap">
        <Reveal>
          <SectionHead id="canchas-t" label="Tres formas de jugar" title="Todo lo que pasa en el club" />
        </Reveal>
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
                <span className="label lime">{String(i + 1).padStart(2, '0')}</span>
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
export function Classes() {
  return (
    <section className="section" id="clases" aria-labelledby="clases-t">
      <div className="wrap classes">
        <figure className="classes__photo">
          <Photo {...CLASSES_PHOTO} tone="clay" />
          <figcaption className="classes__badge">
            <span className="label">Profes del club</span>
            <strong>Todos los niveles</strong>
          </figcaption>
        </figure>
        <div className="classes__text">
          <p className="label lime">Clases y escuelita</p>
          <h2 id="clases-t">Aprendé a jugar o afiná tu juego</h2>
          <p className="lead">
            Las clases de tenis son individuales o grupales, y se arman según tu nivel: desde la primera
            vez que agarrás la raqueta hasta jugadores que quieren competir. También damos clases de pádel.
          </p>
          <ul className="checks">
            {CLASS_FEATURES.map((f) => (
              <li key={f}>
                <span className="checks__icon">
                  <Check />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <a className="btn btn--lime" href={whatsappLink('classes')} {...ext}>
            Consultar por clases
          </a>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
export function Gallery() {
  return (
    <section className="section" id="galeria" aria-labelledby="galeria-t">
      <div className="wrap">
        <SectionHead
          id="galeria-t"
          label="El club"
          title="Así se ve Escobar de noche"
          aside="Canchas de tenis y pádel al aire libre, con la luz como protagonista para los turnos después del trabajo."
        />
        <div className="bento">
          {GALLERY.map((g) => (
            <figure key={g.label} className={`tile tile--${g.size}`}>
              <Photo src={g.src} alt={`${g.label}: ${g.text}`} tone={g.tone} />
              <figcaption>
                <span className="label lime">{g.label}</span>
                <span>{g.text}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
function RatingBadge({ compact = false }) {
  return (
    <a
      className={`rating ${compact ? 'rating--compact' : ''}`}
      href={googleReviewLink()}
      {...ext}
      aria-label={`${CLUB.rating} de 5 en Google con ${CLUB.ratingCount} reseñas. Dejá tu reseña en Google Maps.`}
    >
      <span className="rating__score">{CLUB.rating.toLocaleString('es-AR')}</span>
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
        <div className="shead">
          <div>
            <p className="label lime">Lo que dicen los jugadores</p>
            <h2 id="resenas-t">Un club recomendado en el barrio</h2>
          </div>
          <RatingBadge />
        </div>
        {REVIEWS.length > 0 && (
          <ul className="reviews">
            {REVIEWS.map((r) => (
              <li key={r.author} className="review">
                <blockquote>“{r.quote}”</blockquote>
                <div className="review__foot">
                  <span className="label">{r.author}</span>
                  <Stars count={r.stars} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------
// La reserva online se implementa más adelante. Mientras tanto, esta sección
// explica cómo reservar hoy (WhatsApp) para que el link "Reservas" no quede vacío.
export function Booking() {
  return (
    <section className="section" id="reservas" aria-labelledby="reservas-t">
      <div className="wrap">
        <SectionHead
          id="reservas-t"
          label="Reservá tu turno"
          title="Elegí cancha, día y horario"
          aside="Turnos de una hora, de 9 a 22 h. Los domingos el club permanece cerrado."
        />
        <div className="booking">
          <ol className="booking__steps">
            {BOOKING_STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="booking__n">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="booking__card">
            <span className="pill">Próximamente</span>
            <h3>Reserva online</h3>
            <p>Estamos preparando la reserva online con disponibilidad en tiempo real. Mientras tanto, pedí tu turno por WhatsApp.</p>
            <a className="btn btn--lime" href={whatsappLink('booking')} {...ext}>
              Reservar por WhatsApp
            </a>
          </div>
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
          <p className="label lime">{CLUB.sports}</p>
          <h2 id="contacto-t" className="footer__name">
            Club Saque <span className="lime">Y</span> Volea
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
            <a className="btn btn--lime" href={whatsappLink('booking')} {...ext}>
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
