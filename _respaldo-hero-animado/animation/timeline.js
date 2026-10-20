// LÍNEA DE TIEMPO DEL SAQUE
// -------------------------------------------------------------
// Idea central: la animación es una FUNCIÓN PURA.
//   computeFrame(progreso, tiempo, layout)  →  posiciones de todo
// - progreso (p): 0 arriba del todo, 1 cuando terminó el scroll del hero.
// - tiempo (t): segundos desde que cargó la página (solo para el pique "en reposo").
// Al ser pura (no toca el DOM ni React) se puede testear sola y es fácil de razonar.
//
// Reparto del scroll (p):
//   0.00 – 0.46  pique: la pelota rebota 3 veces yendo hacia el lado del sacador
//   0.30 – 0.54  aparece la paleta y se arma hacia atrás
//   0.46 – 0.62  último rebote: la pelota sube hasta la altura del golpe
//   0.54 – 0.62  swing (acelera)  →  CONTACTO en p = 0.62
//   0.62 – 0.84  la pelota sale disparada por encima de la red
//   0.60 – 0.86  el nombre del club se revela detrás de la paleta
//   0.80 – 0.92  aparece el subtítulo y el botón
// Detalle de pádel: el saque es de abajo (después de picar la pelota),
// por eso la paleta barre de atrás hacia adelante por debajo de la mano.

import { clamp, lerp, range, easeInCubic, easeOutCubic, easeInOutCubic, toRad } from './math.js'

export const HIT = 0.62

// Dos composiciones: pantalla horizontal y vertical (celular).
// Todas las medidas están en "unidades del viewBox" del SVG, no en píxeles.
export const LAYOUTS = {
  landscape: {
    viewBox: [0, 0, 1000, 640],
    floorY: 540,
    ballR: 16,
    pivot: { x: 260, y: 330 }, // la "mano" que sostiene la paleta
    headDist: 170, // distancia mano → centro de la cara de la paleta
    startX: 610,
    landings: [550, 470, 400], // dónde toca el piso en cada pique
    heights: [260, 160, 90], // altura de cada arco
    netX: 800,
    netH: 70,
    exit: { x: 1100, y: 200 },
    name: { x: 390, y1: 250, y2: 386, size: 140 },
  },
  portrait: {
    viewBox: [0, 0, 640, 1240],
    floorY: 900,
    ballR: 16,
    pivot: { x: 250, y: 700 },
    headDist: 170,
    startX: 545,
    landings: [505, 450, 390],
    heights: [320, 200, 110],
    netX: 600,
    netH: 70,
    exit: { x: 760, y: 560 },
    name: { x: 36, y1: 330, y2: 452, size: 130 },
  },
}

// Ángulos de la paleta (grados). La paleta se dibuja apuntando hacia ABAJO;
// en SVG un ángulo positivo gira en sentido horario.
const ANGLE = { hidden: 120, windup: 60, cocked: 75, contact: -35, follow: -115 }

/** Punto donde la cara de la paleta encuentra a la pelota. */
export function contactPoint(L) {
  const a = toRad(ANGLE.contact)
  return { x: L.pivot.x - Math.sin(a) * L.headDist, y: L.pivot.y + Math.cos(a) * L.headDist }
}

/** Altura (desde el piso) → coordenada Y del centro de la pelota. */
const yFromHeight = (L, h) => L.floorY - L.ballR - h

/** Posición de la pelota durante el pique, guiada por el scroll. */
function bouncePosition(p, L) {
  const C = contactPoint(L)
  const [l0, l1, l2] = L.landings
  const [h0, h1, h2] = L.heights
  const hContact = L.floorY - L.ballR - C.y

  // Cada tramo: [inicio p, fin p, x desde, x hasta, función de altura s→h]
  const segments = [
    [0.0, 0.16, L.startX, l0, (s) => h0 * (1 - s * s)], // cae desde arriba
    [0.16, 0.32, l0, l1, (s) => h1 * 4 * s * (1 - s)], // parábola completa
    [0.32, 0.46, l1, l2, (s) => h2 * 4 * s * (1 - s)], // parábola más baja
    [0.46, HIT, l2, C.x, (s) => hContact * (1 - (1 - s) * (1 - s))], // sube hasta el golpe
  ]
  for (const [a, b, x0, x1, hFn] of segments) {
    if (p <= b) {
      const s = range(p, a, b)
      return { x: lerp(x0, x1, s), h: hFn(s) }
    }
  }
  return { x: C.x, h: hContact }
}

/** Posición en vuelo después del golpe: curva de Bézier cuadrática. */
function flightPosition(u, L) {
  const C = contactPoint(L)
  const E = L.exit
  const Q = { x: (C.x + E.x) / 2, y: Math.min(C.y, E.y) - 220 } // punto de control (la "comba")
  const k = 1 - (1 - u) * (1 - u) // sale rápido y va frenando un poco
  const mt = 1 - k
  return {
    x: mt * mt * C.x + 2 * mt * k * Q.x + k * k * E.x,
    y: mt * mt * C.y + 2 * mt * k * Q.y + k * k * E.y,
  }
}

/** Ángulo de la paleta según el progreso. */
function paddleAngle(p) {
  if (p < 0.44) return lerp(ANGLE.hidden, ANGLE.windup, easeOutCubic(range(p, 0.3, 0.44)))
  if (p < 0.54) return lerp(ANGLE.windup, ANGLE.cocked, easeInOutCubic(range(p, 0.44, 0.54)))
  if (p < HIT) return lerp(ANGLE.cocked, ANGLE.contact, easeInCubic(range(p, 0.54, HIT)))
  return lerp(ANGLE.contact, ANGLE.follow, easeOutCubic(range(p, HIT, 0.74)))
}

/**
 * Calcula TODO lo que se ve en un instante.
 * @param {number} p progreso del scroll (0–1)
 * @param {number} t tiempo en segundos (para el rebote en reposo)
 * @param {object} L layout (LAYOUTS.landscape o LAYOUTS.portrait)
 */
export function computeFrame(p, t, L) {
  p = clamp(p)
  let x, y, h

  if (p < HIT) {
    // 1) Rebote "en reposo" (depende del tiempo) mezclado con el pique guiado por scroll.
    //    Al principio manda el reloj; apenas scrolleás, manda el scroll.
    const idleH = L.heights[0] * Math.abs(Math.sin((Math.PI * t) / 0.9))
    const scrolled = bouncePosition(p, L)
    const w = 1 - easeOutCubic(range(p, 0, 0.05)) // peso del rebote en reposo
    x = lerp(scrolled.x, L.startX, w)
    h = lerp(scrolled.h, idleH, w)
    y = yFromHeight(L, h)
  } else {
    const pos = flightPosition(range(p, HIT, 0.84), L)
    x = pos.x
    y = pos.y
    h = L.floorY - L.ballR - y
  }

  // Aplastamiento al tocar el piso: la pelota se achata cuando h ≈ 0.
  const squash = p < HIT ? 1 - 0.28 * (1 - clamp(h / 14)) : 1
  // Estela: posiciones "pasadas" del vuelo, solo después del golpe.
  const u = range(p, HIT, 0.84)
  const trail = []
  if (u > 0 && u < 1) {
    for (let k = 1; k <= 6; k++) {
      const uk = u - k * 0.035
      if (uk <= 0) break
      trail.push({ ...flightPosition(uk, L), o: 0.45 * (1 - k / 7) })
    }
  }

  const appear = easeOutCubic(range(p, 0.3, 0.44))

  return {
    ball: {
      x,
      y,
      squash,
      spin: x * 1.4 + (p > HIT ? u * 900 : 0),
      visible: p < 0.84 ? 1 : 0,
    },
    shadow: { x, o: 0.35 * (1 - clamp(h / 300)), s: 1 - 0.6 * clamp(h / 300) },
    trail,
    paddle: { angle: paddleAngle(p), opacity: appear, dy: (1 - appear) * 80 },
    impact: { r: lerp(12, 90, easeOutCubic(range(p, HIT, 0.7))), o: p >= HIT ? 0.9 * (1 - range(p, HIT, 0.7)) : 0 },
    name1: easeOutCubic(range(p, 0.6, 0.8)),
    name2: easeOutCubic(range(p, 0.66, 0.86)),
    tagline: easeOutCubic(range(p, 0.8, 0.92)),
    hint: 1 - range(p, 0, 0.06),
  }
}
