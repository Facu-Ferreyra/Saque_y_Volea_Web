import { m } from 'motion/react'

// Curva "ease-out" larga: arranca rápido y se apoya suave al final (sensación premium).
const EASE = [0.22, 1, 0.36, 1]

/**
 * Hace aparecer su contenido (sube un poco + fade) la primera vez que entra en pantalla.
 * - as: etiqueta HTML a usar ('div', 'a', 'li'...) para no agregar envoltorios de más.
 * - delay: segundos de espera; sirve para escalonar elementos de una lista (i * 0.08).
 * - y: cuántos px sube. Poco movimiento = más elegante.
 * Con "reducir movimiento" activado, MotionConfig (App.jsx) deja solo el fade.
 */
export default function Reveal({ as = 'div', delay = 0, y = 24, children, ...props }) {
  const Tag = m[as]
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...props}
    >
      {children}
    </Tag>
  )
}
