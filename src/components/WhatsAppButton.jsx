import { useEffect, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { whatsappLink } from '../config.js'
import { Chat } from './Icons.jsx'
import { EASE } from './Reveal.jsx'

/**
 * Botón flotante abajo a la derecha.
 * - Aparece recién cuando el hero (que ya tiene sus botones de WhatsApp) sale de pantalla,
 *   así no hay dos llamados a lo mismo compitiendo en la portada.
 * - position: fixed en CSS lo mantiene visible siempre.
 * - target="_blank" abre WhatsApp en otra pestaña (o la app en el celular).
 * - rel="noopener noreferrer" es una buena práctica de seguridad con target="_blank".
 * - aria-label: los lectores de pantalla anuncian para qué sirve el botón.
 */
export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <m.a
          className="wa-fab"
          href={whatsappLink('general')}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escribir al club por WhatsApp"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.35, ease: EASE } }}
          exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.2 } }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
        >
          <Chat />
        </m.a>
      )}
    </AnimatePresence>
  )
}
