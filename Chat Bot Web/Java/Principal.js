// Efecto de despliegue para los botones
document.querySelectorAll(".dropdown-btn").forEach(button => {
    button.addEventListener("click", () => {
        const content = button.nextElementSibling;
        content.style.display = content.style.display === "flex" ? "none" : "flex";
    });
});

// Ensure tutor badge stays fixed relative to the viewport: move it to body (for Principal page)
function ensureBadgeFixedPrincipal() {
  document.querySelectorAll('.tutor-badge').forEach(b => {
    if (b.parentElement !== document.body) document.body.appendChild(b);
    b.style.position = 'fixed';
    b.style.right = b.style.right || '24px';
    b.style.bottom = b.style.bottom || '86px';
    b.style.zIndex = '1600';
    b.style.pointerEvents = 'auto';
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureBadgeFixedPrincipal);
else ensureBadgeFixedPrincipal();

// Animación de luces de fondo suave
document.addEventListener("mousemove", (e) => {
    const overlay = document.querySelector(".overlay");
    if (overlay) overlay.style.background = `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, rgba(0,255,255,0.3), transparent 60%)`;
});

const asistente = document.getElementById("asistente");
const mensaje = document.getElementById("mensaje");

// Mostrar mensaje al hacer clic (si el usuario quiere interactuar)
if (asistente) {
  asistente.addEventListener("click", () => {
    if (!mensaje) return;
    if (mensaje.style.display === "none" || mensaje.style.display === "") {
      mensaje.style.display = "block";
      setTimeout(() => mensaje.style.display = "none", 3000);
    }
  });
}

// Crear brillitos decorativos en la posición dada
function crearBrillito(x, y) {
  const brillo = document.createElement("div");
  brillo.classList.add("sparkle");
  brillo.style.left = `${x - 4}px`; // centrar (sparkle 8px)
  brillo.style.top = `${y - 4}px`;
  document.body.appendChild(brillo);
  setTimeout(() => brillo.remove(), 1200);
}

// ----- Movimiento inteligente que evita superponer texto -----
if (asistente) {
  // preparación visual
  asistente.style.transition = 'transform 1s cubic-bezier(.22,.9,.35,1)';
  asistente.style.willChange = 'transform';
  asistente.style.zIndex = 9999;
  asistente.style.pointerEvents = 'auto';

  const ASW = asistente.offsetWidth;
  const ASH = asistente.offsetHeight;

  // Elementos a considerar como "ocupados" (no queremos cubrirlos)
  const selectorText = 'main, header, footer, .info-card, .levels, .level, .level-link, p, h1, h2, h3, h4, h5, h6, a, button, nav, section, article, aside, #mensaje';

  function getForbiddenRects() {
    const forbidden = [];
    document.querySelectorAll(selectorText).forEach(el => {
      if (!el || el === asistente) return;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      // expandir un poco el área para no acercarnos demasiado al texto
      const pad = 16;
      forbidden.push({
        left: r.left - pad,
        top: r.top - pad,
        right: r.right + pad,
        bottom: r.bottom + pad
      });
    });
    return forbidden;
  }

  function intersects(a, b) {
    return !(a.left >= b.right || a.right <= b.left || a.top >= b.bottom || a.bottom <= b.top);
  }

  function findFreePosition(forbidden) {
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    const maxAttempts = 250;
    for (let i = 0; i < maxAttempts; i++) {
      const x = Math.floor(Math.random() * (vw - ASW));
      const y = Math.floor(Math.random() * (vh - ASH));
      const rect = { left: x, top: y, right: x + ASW, bottom: y + ASH };
      let ok = true;
      for (const f of forbidden) {
        if (intersects(rect, f)) { ok = false; break; }
      }
      if (ok) return { x, y };
    }

    // Si no encuentra posición aleatoria, probar en los bordes (perímetro)
    const margin = 12;
    const corners = [
      { x: margin, y: margin },
      { x: vw - ASW - margin, y: margin },
      { x: margin, y: vh - ASH - margin },
      { x: vw - ASW - margin, y: vh - ASH - margin }
    ];
    for (const c of corners) {
      const rect = { left: c.x, top: c.y, right: c.x + ASW, bottom: c.y + ASH };
      if (!forbidden.some(f => intersects(rect, f))) return c;
    }

    // fallback: devolver posición actual (si falla)
    const cur = asistente.getBoundingClientRect();
    return { x: Math.max(8, Math.min(cur.left, vw - ASW - 8)), y: Math.max(8, Math.min(cur.top, vh - ASH - 8)) };
  }

  function moveAssistantTo(x, y) {
    // usamos transform para buen rendimiento
    asistente.style.transform = `translate(${x}px, ${y}px)`;
    // crear un brillito sutil en el centro al moverse
    const rect = asistente.getBoundingClientRect();
    crearBrillito(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  let forbiddenCache = getForbiddenRects();

  // mover periódicamente
  function scheduleMove() {
    forbiddenCache = getForbiddenRects();
    const pos = findFreePosition(forbiddenCache);
    moveAssistantTo(pos.x, pos.y);
  }

  // empezar con una primera posición segura
  window.requestAnimationFrame(() => scheduleMove());

  // interval para moverse cada 4-6 segundos aleatoriamente
  let intervalId = setInterval(scheduleMove, 4000 + Math.floor(Math.random() * 2500));

  // actualizar en resize/scroll (nuevas áreas de texto)
  window.addEventListener('resize', () => { forbiddenCache = getForbiddenRects(); scheduleMove(); });
  window.addEventListener('scroll', () => { forbiddenCache = getForbiddenRects(); });

  // permitir pausar el movimiento si el usuario hace hover (mejor UX)
  let paused = false;
  asistente.addEventListener('mouseenter', () => { paused = true; clearInterval(intervalId); });
  asistente.addEventListener('mouseleave', () => { if (paused) { paused = false; intervalId = setInterval(scheduleMove, 4000 + Math.floor(Math.random() * 2500)); } });

}

// Fin del nuevo movimiento inteligente

