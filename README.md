# Club Saque y Volea — sitio web

Landing page en React + Vite. Las animaciones de la interfaz (entrada del título,
secciones que aparecen al scrollear) usan [Motion](https://motion.dev).

## Cómo correrlo

```bash
npm install      # instala React y Vite (solo la primera vez)
npm run dev      # servidor local en http://localhost:5173
npm run build    # genera /dist listo para subir (Netlify, Vercel, GitHub Pages)
```

## Mapa del proyecto

```
src/
  config.js                 ← datos del club (teléfono, horarios, links). EMPEZÁ ACÁ.
  content.js                ← textos de las secciones, fotos y reseñas
  main.jsx                  ← monta la app en el <div id="root">
  App.jsx                   ← arma la página: hero + secciones + botón. Acá se configura Motion.
  styles.css                ← colores (tokens en :root), tipografías y layout
  components/
    Nav.jsx                 ← barra fija + menú hamburguesa en celular
    Hero.jsx                ← portada: nombre del club y botones, con entrada animada
    Reveal.jsx              ← envoltorio que hace aparecer algo al entrar en pantalla
    Sections.jsx            ← Canchas, Clases, Galería, Reseñas, Reservas, Footer
    Icons.jsx               ← íconos SVG propios
    WhatsAppButton.jsx      ← botón flotante
```

## Animaciones (Motion)
- `App.jsx` envuelve todo en `LazyMotion` (carga solo lo necesario) y `MotionConfig
  reducedMotion="user"` (si el sistema pide menos movimiento, se sacan los desplazamientos).
- Dentro de LazyMotion se usa `m.div`, `m.a`... (no `motion.div`).
- `<Reveal>`: aparece una sola vez al entrar en pantalla. Props: `as` (etiqueta), `delay`
  (para escalonar listas) e `y` (cuánto sube). Curva y duración están en `Reveal.jsx`.
- Regla: animar solo `opacity` y `transform`, con poco recorrido.

## Hero animado anterior (respaldo)
La animación 3D de la pelota y la paleta (WebGL) y su versión SVG se sacaron del sitio.
El código quedó en `_respaldo-hero-animado/` (no se incluye en el build). Si no se va a
usar más, se puede borrar esa carpeta.

## Links importantes
- Botón de reseñas → `googleReviewLink()` abre el formulario de reseña de Google con el
  Place ID del club (`googlePlaceId` en config.js).
- "Reservar turno" → WhatsApp con mensaje precargado (`WA_MESSAGES`). Cuando exista la
  reserva online, se cambia el destino en un solo lugar.

## Pendiente con el club
- [ ] Confirmar que **+54 348 436-1873** tiene WhatsApp (o pedir el celular). Se cambia en `config.js`.
- [ ] Fotos reales → `public/fotos/` y completar `src` en `GALLERY` y `CLASSES_PHOTO` (content.js).
      No usar fotos generadas por IA ni con marcas (ej. raquetas con logo).
- [ ] Permiso de las personas cuyas reseñas se muestran con nombre (array `REVIEWS`).
- [ ] Confirmar la cuenta de Instagram.
- [ ] Confirmar actividades, duración de turnos y si hay bar (hoy es contenido de ejemplo).
- [ ] Logo, si tienen uno.
