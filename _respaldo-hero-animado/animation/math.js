// Herramientas matemáticas mínimas para animar.
// Toda la animación del hero se construye combinando estas 5 funciones.

/** Limita un valor entre min y max. */
export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v))

/** Interpolación lineal: t=0 devuelve a, t=1 devuelve b, t=0.5 el punto medio. */
export const lerp = (a, b, t) => a + (b - a) * t

/**
 * Convierte el progreso global (0→1) en un progreso LOCAL de una etapa.
 * Ej: range(p, 0.2, 0.4) vale 0 antes de 0.2, 1 después de 0.4 y crece en el medio.
 * Es la base de la "línea de tiempo": cada etapa ocupa un tramo del scroll.
 */
export const range = (p, start, end) => clamp((p - start) / (end - start))

// Curvas de aceleración (easing). Reciben y devuelven un valor entre 0 y 1.
export const easeInCubic = (t) => t * t * t // arranca lento, termina rápido (el golpe)
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3) // arranca rápido, frena suave
export const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const DEG = Math.PI / 180
export const toRad = (deg) => deg * DEG
