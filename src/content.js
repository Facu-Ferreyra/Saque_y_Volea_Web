// Textos e imágenes de las secciones.
// Separar el CONTENIDO de los COMPONENTES permite cambiar textos sin tocar el diseño.

export const NAV_LINKS = [
  { label: 'Canchas', href: '#canchas' },
  { label: 'Clases', href: '#clases' },
  { label: 'Galería', href: '#galeria' },
  { label: 'Reservas', href: '#reservas' },
  { label: 'Contacto', href: '#contacto' },
]

export const SERVICES = [
  {
    title: 'Canchas',
    text: 'Tres canchas de tenis y una de pádel al aire libre, con iluminación para jugar hasta el cierre. Reservá por hora, cuando te quede cómodo.',
    cta: 'Ver horarios',
    href: '#contacto',
  },
  {
    title: 'Clases',
    text: 'Individuales y grupales, para chicos y grandes. Iniciación, perfeccionamiento y escuelita, con profes del club.',
    cta: 'Consultar clases',
    href: '#clases',
  },
  {
    title: 'Reservá tu turno',
    text: 'Elegí deporte, día y horario y escribinos por WhatsApp. Muy pronto vas a poder reservar online.',
    cta: 'Reservar turno',
    href: '#reservas',
  },
]

export const CLASS_FEATURES = [
  'Clases individuales',
  'Clases grupales',
  'Iniciación y perfeccionamiento',
  'Coordinás el día y el horario',
]

// Fotos: guardalas en /public/fotos y completá `src` (ej. '/fotos/cancha-principal.jpg').
// Mientras `src` sea null se muestra un espacio reservado.
export const CLASSES_PHOTO = { src: '/fotos/canchas-tenis-2.webp', alt: 'Canchas de tenis del club con jugadores, al atardecer' }

// size: lg (ancha), md (angosta), full (todo el ancho). Al lado de una lg va una md.
export const GALLERY = [
  { label: 'Canchas de tenis', text: 'Torres de luz para seguir jugando cuando baja el sol', src: '/fotos/canchas-tenis.webp', size: 'lg', tone: 'blue' },
  { label: 'Para esperar tu turno', text: 'Mesas y sombra al lado de la cancha', src: '/fotos/descanso.webp', size: 'md', tone: 'night' },
  { label: 'Vista aérea', text: 'Tres canchas de tenis y una de pádel', src: '/fotos/vista-aerea.webp', size: 'full', tone: 'blue' },
]

// Reseñas de Google: son de personas reales. Lo correcto es pedirles permiso
// para mostrar su nombre, o quitar este array y dejar solo el puntaje.
export const REVIEWS = [
  { quote: 'Excelente servicio, totalmente recomendable. La cancha perfecta.', author: 'Maximiliano Carrizo', stars: 5 },
  { quote: 'Las canchas están buenísimas y la iluminación es excelente. ¡Totalmente recomendable!', author: 'Roberto Salom', stars: 5 },
  { quote: 'Muy buenas canchas de tenis y un ambiente excelente para disfrutar.', author: 'Dario M. Ametrano', stars: 5 },
]

export const BOOKING_STEPS = [
  { title: 'Elegí deporte y horario', text: 'Tenis o pádel, turnos de una hora de 9 a 22 h.' },
  { title: 'Escribinos por WhatsApp', text: 'Contanos el día y la hora que querés jugar.' },
  { title: 'Te confirmamos el turno', text: 'Te respondemos con la disponibilidad.' },
]
