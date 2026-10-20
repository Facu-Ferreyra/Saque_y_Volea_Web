import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import { Services, Classes, Gallery, Reviews, Booking, Footer } from './components/Sections.jsx'
import WhatsAppButton from './components/WhatsAppButton.jsx'

// Una sola página con anclas (#canchas, #clases...). La nav salta a cada sección.
// Si más adelante la reserva online necesita su propia página, se agrega react-router.
// LazyMotion carga solo las funciones de animación que usamos (más liviano que el paquete entero).
// reducedMotion="user": si el sistema pide menos movimiento, Motion saca los desplazamientos.
export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <a className="skip" href="#canchas">
          Saltar al contenido
        </a>
        <Nav />
        <main id="top">
          <Hero />
          <Services />
          <Classes />
          <Gallery />
          <Reviews />
          <Booking />
        </main>
        <Footer />
        <WhatsAppButton />
      </MotionConfig>
    </LazyMotion>
  )
}
