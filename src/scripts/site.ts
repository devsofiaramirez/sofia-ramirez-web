// Comportamiento común a todas las páginas públicas: desplazamiento suave, encabezado vivo,
// menú móvil, apariciones al hacer scroll, luz en tarjetas, barra de progreso y botón de WhatsApp.
// Corre en cada `astro:page-load` (ClientRouter); lo que se registra en `window`/`document`
// se hace una sola vez para no duplicar oyentes entre navegaciones.
import { startMotion, stopMotion, scrollToTarget, getLenis, onPageLoad } from './motion';

let cleanups: (() => void)[] = [];
const addCleanup = (fn: () => void) => cleanups.push(fn);

document.addEventListener('astro:before-swap', () => {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  stopMotion();
});

onPageLoad(() => {
  startMotion();
  setupHeader();
  setupMobileMenu();
  setupReveal();
  setupSpotlight();
  setupAnchors();
  setupWhatsappFloat();
});

// ── Encabezado: transparente arriba, compacto al bajar, se esconde si sigues bajando ──
function setupHeader() {
  const header = document.getElementById('site-header');
  const progress = document.querySelector<HTMLElement>('.scroll-progress');
  if (!header) return;

  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress?.style.setProperty('--progress', String(max > 0 ? Math.min(1, y / max) : 0));
    header.dataset.state = y > 24 ? 'scrolled' : 'top';
    if (header.dataset.menu !== 'open') {
      const goingDown = y > lastY + 4;
      const goingUp = y < lastY - 4;
      if (goingDown && y > 420) header.dataset.hidden = 'true';
      else if (goingUp || y < 420) header.dataset.hidden = 'false';
    }
    lastY = y;
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  addCleanup(() => window.removeEventListener('scroll', onScroll));
  update();
  // La opción del menú de la página actual la marca el servidor (aria-current="page").
}

// ── Menú móvil a pantalla completa ──
function setupMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const header = document.getElementById('site-header');
  if (!btn || !menu || !header) return;

  const setOpen = (open: boolean) => {
    menu.dataset.open = String(open);
    header.dataset.menu = open ? 'open' : 'closed';
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = 'hidden';
      menu.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
    } else {
      lenis?.start();
      document.documentElement.style.overflow = '';
    }
  };

  btn.addEventListener('click', () => setOpen(menu.dataset.open !== 'true'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && menu.dataset.open === 'true') {
      setOpen(false);
      btn.focus();
    }
  };
  document.addEventListener('keydown', onKey);
  addCleanup(() => {
    document.removeEventListener('keydown', onKey);
    document.documentElement.style.overflow = '';
  });
}

// ── Aparición suave de bloques al entrar en pantalla ──
function setupReveal() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
  );
  els.forEach((el) => {
    // Lo que ya está en pantalla al cargar aparece sin esperar (evita "saltos" en el primer pantallazo).
    el.classList.add('reveal');
    io.observe(el);
  });
  addCleanup(() => io.disconnect());
}

// ── Luz que sigue el cursor en las tarjetas (solo con mouse) ──
function setupSpotlight() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const onMove = (e: PointerEvent) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('.spotlight');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  document.addEventListener('pointermove', onMove, { passive: true });
  addCleanup(() => document.removeEventListener('pointermove', onMove));
}

// ── Botones "baja a la siguiente sección" (data-scroll-to="id"): desplazan suave sin tocar la URL ──
// El sitio no usa enlaces con "#": cada sección del menú es su propia página.
function setupAnchors() {
  const onClick = (e: MouseEvent) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-scroll-to]');
    const target = btn && document.getElementById(btn.dataset.scrollTo!);
    if (!target) return;
    e.preventDefault();
    scrollToTarget(target);
  };
  document.addEventListener('click', onClick);
  addCleanup(() => document.removeEventListener('click', onClick));
}

// ── Botón flotante de WhatsApp: se oculta en el pie (ahí ya está el llamado grande) ──
function setupWhatsappFloat() {
  const btn = document.getElementById('wa-float');
  const footer = document.getElementById('site-footer');
  if (!btn || !footer) return;
  const io = new IntersectionObserver(([e]) => (btn.dataset.hidden = String(e.isIntersecting)), { threshold: 0.05 });
  io.observe(footer);
  addCleanup(() => io.disconnect());
}
