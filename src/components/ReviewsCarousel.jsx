import { useState } from 'react'
import { Stars, Pause, Play } from './Icons.jsx'

// Colores de los círculos con la inicial (como en Google). Se elige uno fijo por nombre.
const AVATAR_COLORS = ['#37488a', '#2a7341', '#a4502f', '#6b4fa0', '#1f6f80']
const avatarColor = (name) => AVATAR_COLORS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % AVATAR_COLORS.length]

const MIN_PER_HALF = 6 // con pocas reseñas se repiten para que la cinta nunca quede vacía
const SECONDS_PER_CARD = 7 // velocidad: más segundos = más lento

/** Tarjeta de reseña con el formato de Google: inicial, nombre, estrellas y texto. */
function ReviewCard({ review, hidden }) {
  return (
    <li className="greview" aria-hidden={hidden || undefined}>
      <div className="greview__head">
        <span className="greview__avatar" style={{ backgroundColor: avatarColor(review.author) }} aria-hidden="true">
          {review.author.charAt(0)}
        </span>
        <span className="greview__who">
          <strong>{review.author}</strong>
          <span>Reseña de Google</span>
        </span>
      </div>
      <Stars count={review.stars} size={16} />
      <p>{review.quote}</p>
    </li>
  )
}

/**
 * Cinta de reseñas que pasa sola, de derecha a izquierda.
 * - La lista se dibuja dos veces seguidas y la animación CSS corre la mitad: al terminar,
 *   la segunda copia está justo donde empezó la primera, así el giro no tiene "salto".
 * - Se frena al pasar el mouse, al tocarla o al navegar con Tab, y con el botón de pausa
 *   (lo pide la accesibilidad para cualquier contenido que se mueve solo).
 * - Con "reducir movimiento" no se anima: queda una fila que se desliza con el dedo.
 * - Las copias repetidas llevan aria-hidden para que el lector de pantalla lea cada reseña una vez.
 */
export default function ReviewsCarousel({ reviews }) {
  const [paused, setPaused] = useState(false)

  const half = []
  while (half.length < Math.max(MIN_PER_HALF, reviews.length)) half.push(...reviews)
  const track = [...half, ...half]

  return (
    <div className={`marquee ${paused ? 'is-paused' : ''}`}>
      <div className="marquee__viewport">
        <ul className="marquee__track" style={{ '--marquee-duration': `${half.length * SECONDS_PER_CARD}s` }}>
          {track.map((r, i) => (
            <ReviewCard key={i} review={r} hidden={i >= reviews.length} />
          ))}
        </ul>
      </div>
      <button
        type="button"
        className="marquee__toggle"
        aria-pressed={paused}
        onClick={() => setPaused((p) => !p)}
      >
        {paused ? <Play /> : <Pause />}
        {paused ? 'Reanudar reseñas' : 'Pausar reseñas'}
      </button>
    </div>
  )
}
