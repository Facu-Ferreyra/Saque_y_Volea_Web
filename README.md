# Club Saque y Volea — sitio web

Landing page en React + Vite. Las animaciones de la interfaz (entrada del título,
secciones que aparecen al scrollear) usan [Motion](https://motion.dev).

## Cómo correrlo

```bash
npm install      # instala React y Vite (solo la primera vez)
npm run dev      # servidor local en http://localhost:5173
npm run build    # genera /dist listo para subir (Netlify, Vercel, GitHub Pages)
```

## Publicar en Vercel
1. Entrar a [vercel.com](https://vercel.com) con la cuenta de GitHub → **Add New… → Project**.
2. Importar el repo `Saque_y_Volea_Web`. Vercel detecta Vite solo (build: `npm run build`, salida: `dist`).
3. **Deploy**. Cada `git push` a `main` vuelve a publicar solo.

- Los encabezados de seguridad y la caché salen de `vercel.json`.
- La vista previa al compartir usa la dirección de Vercel automáticamente (ver `vite.config.js`).
- Dominio propio: en el proyecto → Settings → Domains. No hay que cambiar nada en el código.

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
    CourtLines.jsx          ← cancha de tenis en perspectiva detrás del título + pelota
    Reveal.jsx              ← envoltorio que hace aparecer algo al entrar en pantalla
    Sections.jsx            ← Canchas, Clases, Galería, Reseñas, Reservas, Footer
    ReviewsCarousel.jsx     ← cinta de reseñas estilo Google que pasa sola
    Icons.jsx               ← íconos SVG propios
    WhatsAppButton.jsx      ← botón flotante
```

## Tema claro y oscuro
El sitio sigue el modo del dispositivo (`prefers-color-scheme`):
- **Oscuro = cancha de noche:** azul noche, verde menta del club, reflectores en el hero.
- **Claro = cancha de día:** fondo cielo, azul del club en los botones, verde oscuro para textos
  de acento (el menta no se lee sobre blanco) y rayos de sol en lugar de reflectores.
- Todos los colores son variables en `:root` (styles.css). El bloque `@media (prefers-color-scheme: light)`
  redefine las mismas variables: para cambiar un color, se cambia ahí y no en cada componente.
- Textos sobre fotos usan colores fijos claros, porque la foto lleva un degradé oscuro en los dos temas.

## Animaciones (Motion)
Idea central: **la página se enciende como una cancha de noche**.
- **Hero** (`Hero.jsx`): se prenden los reflectores (parpadeo corto), baja la luz y aparece el
  nombre del club. Tiempos en `LAMP_ON` / `LIGHT_ON`; forma y color de los haces en `.light` (styles.css).
  Detrás se dibuja la cancha en perspectiva (medidas reales, `CourtLines.jsx`) y queda una pelota
  picando detrás de la marca del centro, como antes de sacar. La pelota se detiene cuando el hero no se ve.
- **Canchas**: las tres opciones entran escalonadas (son una lista).
- **Clases**: la foto se descubre de abajo hacia arriba, aparece el sello y cada check se dibuja.
- **Galería**: cada foto pasa de oscura a iluminada.
- **Reseñas**: el puntaje cuenta de 0 a 4,8 y las reseñas pasan solas en una cinta estilo Google
  (`ReviewsCarousel.jsx`). Se frena con el mouse, al tocarla o con el botón de pausa. Velocidad: `SECONDS_PER_CARD`.
  Para sumar reseñas, agregarlas al array `REVIEWS` en content.js.
- **Reservas**: una línea baja de un paso al siguiente y el número se enciende en verde.
- **Botón de WhatsApp**: aparece recién al pasar el hero (que ya tiene sus botones).

Reglas:
- `App.jsx` envuelve todo en `LazyMotion` (carga solo lo necesario) y `MotionConfig
  reducedMotion="user"` (si el sistema pide menos movimiento, se sacan los desplazamientos).
- Dentro de LazyMotion se usa `m.div`, `m.a`... (no `motion.div`).
- `<Reveal>`: aparece una sola vez al entrar en pantalla. Props: `as` (etiqueta), `delay` e `y`.
  Todas las animaciones comparten la curva `EASE` exportada desde `Reveal.jsx`.
- No poner `transform` en `:hover` por CSS sobre un elemento animado con Motion (Motion pisa el
  transform): usar `whileHover` como en `WhatsAppButton.jsx`.

## Seguridad
- Sitio 100% estático: no hay servidor, base de datos, formularios ni claves. El `.env` es público.
- `public/_headers` (Netlify, Cloudflare Pages) y `vercel.json` (Vercel) agregan encabezados de
  seguridad. La Content-Security-Policy solo permite cargar recursos del propio sitio: si se suma algo
  externo (mapa embebido, analytics, reserva online), hay que agregar su dominio en **los dos** archivos.
- Las tipografías se sirven desde el sitio (`@fontsource-variable`), sin depender de Google Fonts.
- Links externos con `rel="noopener noreferrer"`.
- `.github/dependabot.yml`: GitHub avisa con un Pull Request cuando hay actualizaciones de dependencias.
- Revisar de vez en cuando: `npm audit`.

## Links importantes
- Botón de reseñas → `googleReviewLink()` abre el formulario de reseña de Google con el
  Place ID del club (`googlePlaceId` en config.js).
- "Reservar turno" → WhatsApp con mensaje precargado (`WA_MESSAGES`). Cuando exista la
  reserva online, se cambia el destino en un solo lugar.

## Pendiente con el club
- [x] WhatsApp +54 348 436-1873 (es el mismo del link del Instagram del club).
- [x] Fotos reales en `public/fotos/` (WebP). Falta una foto de una clase para la sección Clases.
- [x] Canchas: 3 de tenis y 1 de pádel.
- [ ] Permiso de las personas cuyas reseñas se muestran con nombre (array `REVIEWS`).
- [x] Instagram: @clubsaqueyvolea.
- [ ] Confirmar actividades, duración de turnos y si hay bar (hoy es contenido de ejemplo).
- [x] Logo y favicon (`public/`). Originales: `marca.png` sale de Favicon.jpeg y `logo.webp` de Logo.jpeg.
