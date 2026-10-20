import { useEffect, useRef } from 'react'
import { clamp } from '../animation/math.js'

/**
 * Lee cuánto scrolleaste dentro de un contenedor y llama a onFrame(p, t) en cada frame.
 *
 * Por qué así y no con useState:
 *  - useState re-renderiza el componente 60 veces por segundo → trabado.
 *  - Acá usamos requestAnimationFrame y el callback escribe DIRECTO en el DOM (via refs).
 *    React solo dibuja la estructura una vez; el movimiento lo hace este loop.
 *
 * Suavizado ("lerp" del scroll): en vez de saltar al valor real del scroll,
 * cada frame recorremos un porcentaje de la distancia que falta. Eso da la sensación
 * de inercia, la misma idea que usan librerías como Lenis.
 *
 * @param {React.RefObject<HTMLElement>} containerRef  la sección alta (ej. 400vh)
 * @param {(p:number, t:number) => void} onFrame
 * @param {{ smoothing?: number, disabled?: boolean }} options
 */
export function useScrollTimeline(containerRef, onFrame, { smoothing = 0.12, disabled = false } = {}) {
  // Guardamos onFrame en un ref para no reiniciar el loop si la función cambia.
  const frameRef = useRef(onFrame)
  frameRef.current = onFrame

  useEffect(() => {
    if (disabled) {
      frameRef.current(1, 0) // sin movimiento: mostramos el estado final
      return
    }
    let raf = 0
    let current = 0
    let last = performance.now()
    const start = last

    const tick = (now) => {
      const el = containerRef.current
      if (el) {
        const rect = el.getBoundingClientRect()
        const scrollable = rect.height - window.innerHeight // cuánto se puede scrollear "dentro" del hero
        const target = scrollable > 0 ? clamp(-rect.top / scrollable) : 0

        // Suavizado independiente de los FPS: en una pantalla de 120 Hz no va el doble de rápido.
        const dt = Math.min(0.1, (now - last) / 1000)
        const k = 1 - Math.pow(1 - smoothing, dt * 60)
        current += (target - current) * k
        if (Math.abs(target - current) < 0.0001) current = target

        frameRef.current(current, (now - start) / 1000)
      }
      last = now
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf) // limpieza al desmontar
  }, [containerRef, smoothing, disabled])
}
