import { whatsappLink } from '../config.js'
import { Chat } from './Icons.jsx'

/**
 * Botón flotante abajo a la derecha.
 * - position: fixed en CSS lo mantiene visible siempre.
 * - target="_blank" abre WhatsApp en otra pestaña (o la app en el celular).
 * - rel="noopener noreferrer" es una buena práctica de seguridad con target="_blank".
 * - aria-label: los lectores de pantalla anuncian para qué sirve el botón.
 */
export default function WhatsAppButton() {
  return (
    <a className="wa-fab" href={whatsappLink('general')} target="_blank" rel="noopener noreferrer" aria-label="Escribir al club por WhatsApp">
      <Chat />
    </a>
  )
}
