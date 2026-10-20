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
    text: 'Tenis y pádel al aire libre, con superficie cuidada e iluminación para jugar hasta el cierre. Reservá por hora, cuando te quede cómodo.',
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
export const CLASSES_PHOTO = { src: null, alt: 'Profesor dando clase de tenis de noche' }

export const GALLERY = [
  { label: 'Cancha principal', text: 'Iluminada para jugar hasta el cierre', src: null, size: 'lg', tone: 'clay' },
  { label: 'Pádel', text: 'Paredes de cristal y césped sintético', src: null, size: 'md', tone: 'blue' },
  { label: 'El club', text: 'Un club de barrio en Escobar', src: null, size: 'md', tone: 'night' },
  { label: 'El primer pique', text: 'Polvo de ladrillo en el aire', src: null, size: 'lg', tone: 'ball' },
  { label: 'Raqueta lista', text: 'Alquilamos lo que te falte', src: null, size: 'full', tone: 'clay' },
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
