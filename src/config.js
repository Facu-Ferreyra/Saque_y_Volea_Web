// Datos del club en UN solo lugar.
// Si cambia el teléfono, el horario o un link, se edita acá y se actualiza toda la página.

export const CLUB = {
  name: 'Saque y Volea',
  fullName: 'Club Saque y Volea',
  sports: 'Tenis & Pádel',
  city: 'Belén de Escobar',
  address: 'Patricias Mendocinas 305, Belén de Escobar',
  phoneDisplay: '+54 348 436-1873',
  // Formato para wa.me: código de país + área + número, sin "+", espacios ni guiones.
  // Es el mismo número del link de WhatsApp del Instagram del club (verificado).
  whatsapp: '543484361873',
  instagram: 'clubsaqueyvolea', // cuenta oficial: "Tenis y Padel en Escobar"
  mapsUrl:
    'https://www.google.com/maps/place/Club+Saque+y+Volea/@-34.3438241,-58.7832867,17z/data=!4m6!3m5!1s0x95bb611550a81985:0x8fb91ad072bd4791!8m2!3d-34.3446503!4d-58.7819666!16s%2Fg%2F11rgh4pz4h',
  // Place ID de Google del club: con él se arma el link directo para dejar una reseña.
  googlePlaceId: 'ChIJhRmoUBVhu5URkUe9ctAauY8',
  rating: 4.8, // actualizar a mano de vez en cuando
  ratingCount: 54,
  hours: [
    { days: 'Lunes a viernes', time: '09:00 – 22:00' },
    { days: 'Sábado', time: '09:00 – 22:00' },
    { days: 'Domingo', time: 'Cerrado' },
  ],
}

// Mensajes precargados de WhatsApp según desde dónde escribe la persona.
export const WA_MESSAGES = {
  general: 'Hola! Quería hacer una consulta.',
  booking: 'Hola! Quería reservar un turno.',
  classes: 'Hola! Quería consultar por clases.',
}

// encodeURIComponent convierte espacios y signos en un formato válido para URL.
export const whatsappLink = (kind = 'general') =>
  `https://wa.me/${CLUB.whatsapp}?text=${encodeURIComponent(WA_MESSAGES[kind] ?? WA_MESSAGES.general)}`

// Abre Google directamente en el formulario para dejar una reseña del club.
export const googleReviewLink = () =>
  `https://search.google.com/local/writereview?placeid=${CLUB.googlePlaceId}`

export const instagramLink = () => `https://www.instagram.com/${CLUB.instagram}/`
