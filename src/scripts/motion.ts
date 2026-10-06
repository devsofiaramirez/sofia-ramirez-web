// Motor de movimiento compartido: GSAP + ScrollTrigger + Lenis (desplazamiento suave).
// Mismo patrón que la landing de Kivoo, adaptado al ClientRouter de Astro:
//   - se arma en cada `astro:page-load` y se desarma en `astro:before-swap`;
//   - quien tenga activo "reducir movimiento" no recibe Lenis ni animaciones de GSAP.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;
const tick = (time: number) => lenis?.raf(time * 1000);

export function getLenis() {
  return lenis;
}

// Ojo con el orden: startMotion NO mata los ScrollTrigger (los componentes pueden haber creado los
// suyos antes en el mismo `astro:page-load`); la limpieza va en `astro:before-swap` (stopMotion).
export function startMotion() {
  if (lenis || reducedMotion()) return;
  lenis = new Lenis({
    autoRaf: false,
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // En el celular se respeta el desplazamiento nativo (más natural y no consume batería).
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
}

export function stopMotion() {
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
  gsap.ticker.remove(tick);
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

/** Desplaza hasta un elemento (suave con Lenis, nativo si no hay). */
export function scrollToTarget(target: HTMLElement | number, immediate = false) {
  const offset = -80;
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: immediate ? 0 : 1.3, immediate });
    return;
  }
  const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top: y, behavior: immediate || reducedMotion() ? 'auto' : 'smooth' });
}

/** Registra una función que corre en cada carga de página (incluida la primera). */
export function onPageLoad(fn: () => void) {
  document.addEventListener('astro:page-load', fn);
}
