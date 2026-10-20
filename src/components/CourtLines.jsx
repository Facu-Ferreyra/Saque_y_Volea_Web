import { useRef } from 'react'
import { m, useInView, useReducedMotion } from 'motion/react'
import { EASE } from './Reveal.jsx'

/*
 * Cancha de tenis en perspectiva detrás del título del hero.
 * Las líneas se dibujan trazo a trazo y después queda una pelota picando suave.
 *
 * Las medidas son las reales de una cancha (en metros) y se pasan a la pantalla con una
 * perspectiva simple: una cámara parada detrás del fondo de la cancha, a CAM_H metros de altura.
 * Un punto más lejos (z más grande) queda más arriba y más cerca del centro.
 */
const VIEW_W = 1600
const VIEW_H = 1000
const CAM_H = 5 // altura de la cámara (m)
const CAM_BACK = 7 // distancia de la cámara a la línea de fondo cercana (m)
const FOCAL = 672 // "zoom" de la cámara
const HORIZON = 380 // altura del horizonte en el dibujo (la cancha queda en la mitad de abajo)

// Medidas oficiales (m)
const LENGTH = 23.77
const HALF_DOUBLES = 5.485
const HALF_SINGLES = 4.115
const SERVICE = 6.4 // de la red a la línea de saque
const NET_Z = LENGTH / 2
const NET_H = 0.914
const NET_HALF = HALF_DOUBLES + 0.914 // los postes están un poco afuera de la cancha

/** Pasa un punto de la cancha (x: a lo ancho, z: hacia el fondo, y: altura) al dibujo. */
function project(x, z, y = 0) {
  const depth = z + CAM_BACK
  return [VIEW_W / 2 + (FOCAL * x) / depth, HORIZON + (FOCAL * (CAM_H - y)) / depth]
}
const line = (...pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.map((n) => n.toFixed(1)).join(' ')}`).join(' ')

// Trazos en el orden en que se dibujan. `at`: segundos después de que empieza la cancha.
const STROKES = [
  {
    // Contorno (dobles)
    d:
      line(
        project(-HALF_DOUBLES, 0),
        project(HALF_DOUBLES, 0),
        project(HALF_DOUBLES, LENGTH),
        project(-HALF_DOUBLES, LENGTH),
      ) + ' Z',
    at: 0,
    dur: 1.2,
  },
  { d: line(project(-HALF_SINGLES, 0), project(-HALF_SINGLES, LENGTH)), at: 0.5, dur: 0.8 },
  { d: line(project(HALF_SINGLES, 0), project(HALF_SINGLES, LENGTH)), at: 0.5, dur: 0.8 },
  { d: line(project(-HALF_SINGLES, NET_Z - SERVICE), project(HALF_SINGLES, NET_Z - SERVICE)), at: 0.85, dur: 0.6 },
  { d: line(project(-HALF_SINGLES, NET_Z + SERVICE), project(HALF_SINGLES, NET_Z + SERVICE)), at: 0.85, dur: 0.6 },
  { d: line(project(0, NET_Z - SERVICE), project(0, NET_Z + SERVICE)), at: 1.05, dur: 0.6 },
  // Marcas del centro en cada línea de fondo (desde donde se saca)
  { d: line(project(0, 0), project(0, 0.4)), at: 1.05, dur: 0.3 },
  { d: line(project(0, LENGTH), project(0, LENGTH - 0.4)), at: 1.05, dur: 0.3 },
  // Red: postes y faja de arriba
  {
    d: line(project(-NET_HALF, NET_Z), project(-NET_HALF, NET_Z, NET_H), project(NET_HALF, NET_Z, NET_H), project(NET_HALF, NET_Z)),
    at: 1.3,
    dur: 0.7,
    net: true,
  },
]

// Pelota: pica detrás de la marca del centro, como el jugador antes de sacar.
// Queda abajo, debajo de los botones, para no tapar el texto.
const BALL_Z = -1
const [BALL_X, BALL_Y] = project(0, BALL_Z)
const BOUNCE = (FOCAL * 0.7) / (BALL_Z + CAM_BACK) // sube 0,7 m, pasado a píxeles a esa distancia
const BALL_R = 10

export default function CourtLines({ start = 0 }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref) // la pelota deja de picar cuando el hero no se ve
  const ballAt = start + 2.1

  return (
    <svg
      ref={ref}
      className="court"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {STROKES.map((s, i) => (
        <m.path
          key={i}
          d={s.d}
          className={s.net ? 'court__net' : undefined}
          initial={{ pathLength: reduced ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: s.dur, delay: start + s.at, ease: EASE }}
        />
      ))}

      {/* Sombra en el piso: se achica cuando la pelota sube */}
      <m.ellipse
        className="court__shadow"
        cx={BALL_X}
        cy={BALL_Y}
        rx={BALL_R * 1.3}
        ry={BALL_R * 0.4}
        initial={{ opacity: 0 }}
        animate={
          reduced || !inView
            ? { opacity: 1, scale: 1 }
            : { opacity: [1, 0.35, 1], scale: [1, 0.55, 1] }
        }
        transition={
          reduced || !inView
            ? { duration: 0.4, delay: ballAt }
            : { duration: 1.1, delay: ballAt, times: [0, 0.5, 1], ease: ['easeOut', 'easeIn'], repeat: Infinity }
        }
      />
      <m.circle
        className="court__ball"
        cx={BALL_X}
        cy={BALL_Y - BALL_R}
        r={BALL_R}
        initial={{ opacity: 0, y: 0 }}
        animate={reduced || !inView ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -BOUNCE, 0] }}
        transition={
          reduced || !inView
            ? { duration: 0.4, delay: ballAt }
            : {
                opacity: { duration: 0.3, delay: ballAt },
                // sube frenando y baja acelerando, como una pelota de verdad
                y: { duration: 1.1, delay: ballAt, times: [0, 0.5, 1], ease: ['easeOut', 'easeIn'], repeat: Infinity },
              }
        }
      />
    </svg>
  )
}
