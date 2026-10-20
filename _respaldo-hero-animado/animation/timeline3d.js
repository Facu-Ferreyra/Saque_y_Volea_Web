// LÍNEA DE TIEMPO 3D — función pura: progreso del scroll → pelota, paleta y cámara.
//
// Sistema de coordenadas (metros, cancha reglamentaria de pádel 20 x 10):
//   x: ancho (-5 a 5)    y: altura    z: largo (+10 es nuestro fondo, -10 el fondo rival)
//   La red está en z = 0.
//
// Coreografía (p = progreso del scroll):
//   0.00 – 0.04  en reposo: la pelota pica en la mano del sacador (antes de sacar se pica)
//   0.02 – 0.40  saque cruzado: la pelota viaja, pasa la red, la cámara la sigue de atrás
//   0.40         pique en el cuadro de saque rival
//   0.40 – 0.55  la pelota sube del pique; aparece la paleta del que recibe y se arma
//   0.55         CONTACTO: la paleta devuelve (la pelota pasa al lado de la cámara)
//   0.55 – 0.68  la cámara se acerca a la paleta, que queda "congelada"
//   0.68 – 0.80  la cámara atraviesa un agujero de la paleta
//   0.80 – 0.93  sale del otro lado y queda mirando el fondo de la cancha (ahí aparece el título HTML)
//   0.90 – 0.97  aparece el texto y el botón

import { clamp, lerp, range, easeInCubic, easeOutCubic, easeInOutCubic } from './math.js'
import { add, lerp3, chain, translation, rotationX, rotationZ, scaling } from '../gl/math3d.js'
import { PADDLE } from '../gl/geometry.js'

export const BALL_R = 0.05 // más grande que la real (0.033) para que se lea en pantalla
export const PADDLE_SCALE = 1.5
export const HIT = 0.55

// Puntos clave de la jugada
export const SERVE = [1.3, 0.75, 8.6] // donde el sacador golpea
export const BOUNCE = [-2.4, BALL_R, -5.2] // pique en el cuadro de saque rival
export const CONTACT = [-2.9, 1.0, -7.7] // centro de la cara de la paleta al devolver
const RETURN_TO = [1.2, 2.4, 6]

// La paleta se mueve desde la MANO (el mango), como si alguien la sostuviera.
// GRIP = distancia del centro del grip al centro de la cara (medida real 0.28 m × escala).
const GRIP = 0.28 * PADDLE_SCALE
const DEG = Math.PI / 180
// Inclinación en el contacto: negativo = la cabeza se inclina hacia el centro de la cancha.
// Si la querés para el otro lado, cambiá el signo.
export const ROLL_AT_HIT = -20
const SWING = {
  rollFrom: -45, // arranca más inclinada
  pitchFrom: -110, // cabeza hacia abajo y atrás: el mango "tira" de la paleta hacia arriba
  handFrom: [0.3, -0.35, -0.3], // la mano arranca más abajo, más al medio y más atrás
}
const FACE_OFFSET = (PADDLE.thickness / 2) * PADDLE_SCALE + BALL_R
const BALL_AT_HIT = add(CONTACT, [0, 0, FACE_OFFSET])
// Cuadro final: un poco más al centro y más alto, mirando el fondo y el alambrado.
const FINAL_EYE = [-1.2, 1.85, -8.5]
const FINAL_TARGET = [-0.6, 2.2, -14]

/** Posición de la pelota guiada SOLO por el scroll (sin el pique en reposo). */
export function ballPath(p) {
  if (p < 0.4) {
    const u = range(p, 0.02, 0.4)
    const pos = lerp3(SERVE, BOUNCE, u)
    pos[1] += 4 * 1.5 * u * (1 - u) // parábola: arriba de la red
    return pos
  }
  if (p < HIT) {
    const u = range(p, 0.4, HIT)
    const pos = lerp3(BOUNCE, BALL_AT_HIT, u)
    pos[1] += 4 * 0.45 * u * (1 - u)
    return pos
  }
  const u = range(p, HIT, 0.64)
  const pos = lerp3(BALL_AT_HIT, RETURN_TO, u)
  pos[1] += 4 * 0.4 * u * (1 - u)
  return pos
}

function idleBall(t) {
  const h = 0.7 * Math.abs(Math.sin((Math.PI * t) / 0.85))
  return [SERVE[0], BALL_R + h, SERVE[2]]
}

const CAM_OFFSET = [0.26, 0.33, 1.1]

/** La cámara "persigue" a la pelota con un poco de retraso: eso da la sensación de seguimiento. */
function followEye(p) {
  const a = ballPath(Math.max(0, p - 0.02))
  const b = ballPath(Math.max(0, p - 0.035))
  const e = add(lerp3(a, b, 0.5), CAM_OFFSET)
  e[1] = Math.max(e[1], 0.5)
  return e
}
function followTarget(p) {
  const t = ballPath(Math.min(HIT, p + 0.012))
  return lerp3(t, CONTACT, easeInOutCubic(range(p, 0.44, 0.54)))
}

/** Dónde tiene que estar la mano para que, con esa inclinación, la cara quede justo en CONTACT. */
const handAtHit = (() => {
  const r = ROLL_AT_HIT * DEG
  return [CONTACT[0] + GRIP * Math.sin(r), CONTACT[1] - GRIP * Math.cos(r), CONTACT[2]]
})()

/**
 * Matriz de la paleta.
 * Orden (se lee de derecha a izquierda): escalar → subir la paleta para que la mano quede
 * en el origen → inclinar hacia adelante/atrás (pitch, eje X) → inclinar de costado (roll, eje Z)
 * → llevar la mano a su posición en la cancha.
 */
export function paddleMatrix(hand, rollDeg, pitchDeg, s = 1) {
  return chain(
    translation(...hand),
    rotationZ(rollDeg * DEG),
    rotationX(pitchDeg * DEG),
    translation(0, GRIP * s, 0),
    scaling(PADDLE_SCALE * s),
  )
}

/** El swing: la mano sube primero y la cabeza "latiguea" al final (como una muñeca real). */
export function paddlePose(p) {
  const handK = easeOutCubic(range(p, 0.41, HIT)) // la mano llega rápido...
  const whipK = easeInCubic(range(p, 0.43, HIT)) // ...y la cabeza alcanza al final
  return {
    hand: lerp3(add(handAtHit, SWING.handFrom), handAtHit, handK),
    roll: lerp(SWING.rollFrom, ROLL_AT_HIT, easeOutCubic(range(p, 0.41, HIT))),
    pitch: lerp(SWING.pitchFrom, 0, whipK),
    // Aparece desde el mango hacia la punta (coordenada Y local: -0.37 mango, +0.16 punta)
    cut: lerp(-0.37, 0.17, easeInOutCubic(range(p, 0.41, 0.47))),
  }
}

/**
 * @param {number} p progreso 0–1
 * @param {number} t segundos (solo para el pique en reposo)
 * @param {{aspect:number}} view
 */
export function computeCourtFrame(p, t, { aspect }) {
  p = clamp(p)
  const portrait = aspect < 1
  const fov = ((portrait ? 66 : 50) * Math.PI) / 180

  // ---------- Pelota ----------
  let pos = ballPath(p)
  if (p < 0.04) pos = lerp3(pos, idleBall(t), 1 - easeOutCubic(range(p, 0, 0.04)))
  const h = pos[1] - BALL_R
  const squash = p < HIT ? 1 - 0.3 * (1 - clamp(h / 0.06)) : 1
  const ball = { pos, radius: BALL_R, squash, spin: -p * 140, visible: p < 0.64 }

  // ---------- Paleta ----------
  const pose = paddlePose(p)
  const paddle = {
    visible: p >= 0.41 && p < 0.86,
    matrix: paddleMatrix(pose.hand, pose.roll, pose.pitch),
    cut: pose.cut,
  }

  // ---------- Cámara ----------
  const idleEye = [SERVE[0] + 0.35, 1.15, SERVE[2] + 1.25]
  const idleTarget = [SERVE[0] - 0.8, 0.55, SERVE[2] - 4]
  const approach = add(CONTACT, [0, 0, 0.55])
  let eye, target

  if (p < HIT) {
    const k = easeInOutCubic(range(p, 0, 0.08))
    eye = lerp3(idleEye, followEye(p), k)
    target = lerp3(idleTarget, followTarget(p), k)
  } else if (p < 0.68) {
    const k = easeInOutCubic(range(p, HIT, 0.68))
    eye = lerp3(followEye(HIT), approach, k)
    target = lerp3(followTarget(HIT), CONTACT, Math.min(1, k * 1.6))
  } else if (p < 0.8) {
    // Curva cúbica simétrica: lenta justo en el agujero, para que se vea el cruce.
    const s = range(p, 0.68, 0.8)
    const d = 0.55 * Math.pow(1 - 2 * s, 3)
    eye = add(CONTACT, [0, 0, d])
    target = add(CONTACT, [0, 0, d - 5])
  } else {
    const k = easeInOutCubic(range(p, 0.8, 0.93))
    eye = lerp3(add(CONTACT, [0, 0, -0.55]), FINAL_EYE, k)
    target = lerp3(add(CONTACT, [0, 0, -5.55]), FINAL_TARGET, k)
  }

  // Temblor corto en el impacto
  const shake = 0.025 * Math.sin(Math.PI * range(p, HIT, 0.59)) // sube y baja suave, sin saltos
  eye = add(eye, [Math.sin(p * 900) * shake, Math.cos(p * 700) * shake, 0])

  return {
    camera: { eye, target, fov },
    ball,
    shadow: { pos, size: 0.16 + h * 0.12, alpha: 0.6 * (1 - clamp(h / 3)) },
    paddle,
    title: easeOutCubic(range(p, 0.84, 0.95)), // el hero HTML aparece al final
    hint: 1 - range(p, 0, 0.04),
    portrait,
  }
}
