// Animación de luces de fondo suave
// -- Explicación: al mover el ratón actualizamos el fondo de la capa ".overlay"
//    para crear un foco radial que sigue el cursor. El color usado ahora
//    corresponde al magenta de la paleta (rgba(224,58,140,...)).
document.addEventListener("mousemove", (e) => {
  const overlay = document.querySelector(".overlay");
  if (overlay) overlay.style.background = `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, rgba(224,58,140,0.28), transparent 60%)`;
});

const asistente = document.getElementById("asistente");
const mensaje = document.getElementById("mensaje");

// Mostrar mensaje al hacer clic (si el usuario quiere interactuar)
// -- Explicación: cuando el usuario hace clic en el asistente mostramos un
//    mensaje temporal (#mensaje) durante 3 segundos. Esto es una micro-gestura
//    para indicar que el bot está disponible sin abrir una ventana grande.
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
// -- Explicación: genera un elemento DOM temporal con la clase "sparkle"
//    en la posición indicada. Se elimina automáticamente tras 1.2s.
function crearBrillito(x, y) {
  const brillo = document.createElement("div");
  brillo.classList.add("sparkle");
  brillo.style.left = `${x - 4}px`; // centrar (sparkle 8px)
  brillo.style.top = `${y - 4}px`;
  document.body.appendChild(brillo);
  setTimeout(() => brillo.remove(), 1200);
}

// ----- Movimiento inteligente que evita superponer texto -----
// -- Explicación general: el asistente (elemento flotante) se mueve periódicamente
//    a posiciones aleatorias de la ventana evitando rectángulos donde haya texto
//    u otros elementos importantes. Esto mejora la legibilidad y evita cubrir
//    botones o títulos.
if (asistente) {
  // preparación visual
  asistente.style.transition = 'transform 1s cubic-bezier(.22,.9,.35,1)';
  asistente.style.willChange = 'transform';
  asistente.style.zIndex = 9999;
  asistente.style.pointerEvents = 'auto';

  const ASW = asistente.offsetWidth;
  const ASH = asistente.offsetHeight;

  // Elementos a considerar como "ocupados" (no queremos cubrirlos)
  // -- Notas: la variable 'selectorText' contiene un selector compuesto que
  //    recoge la mayoría de bloques textuales y estructurales. Si agregas nuevos
  //    componentes con texto importante, añádelos aquí para que el bot no los cubra.
  const selectorText = 'main, header, footer, .info-card, .levels, .level, .level-link, p, h1, h2, h3, h4, h5, h6, a, button, nav, section, article, aside, #mensaje';

  function getForbiddenRects() {
    const forbidden = [];
    // Recorremos cada elemento relevante y calculamos su rectángulo en viewport
    // para luego 'inflarlo' (pad) y reservar esa zona como prohibida.
    document.querySelectorAll(selectorText).forEach(el => {
      if (!el || el === asistente) return;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      // expandir un poco el área para no acercarnos demasiado al texto
      // Esto crea un margen extra alrededor de elementos importantes.
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
    // Devuelve true si los rectángulos A y B se solapan.
    return !(a.left >= b.right || a.right <= b.left || a.top >= b.bottom || a.bottom <= b.top);
  }

  function findFreePosition(forbidden) {
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    // Intentamos posiciones aleatorias un número limitado de veces para evitar
    // bucles costosos. Si fallamos, probamos esquinas y finalmente fallback.
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
    // crear un brillito sutil en el centro al moverse (feedback visual)
    const rect = asistente.getBoundingClientRect();
    crearBrillito(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  let forbiddenCache = getForbiddenRects();

  // mover periódicamente (tarea programada)
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
  // Esto evita que el asistente se mueva cuando el usuario intenta interactuar con él.
  let paused = false;
  asistente.addEventListener('mouseenter', () => { paused = true; clearInterval(intervalId); });
  asistente.addEventListener('mouseleave', () => { if (paused) { paused = false; intervalId = setInterval(scheduleMove, 4000 + Math.floor(Math.random() * 2500)); } });

}

// Fin del nuevo movimiento inteligente

// ----- Modo barrido horizontal (lado a lado) evitando el recuadro .info-card -----
// - Objetivo: mover la "abeja" (asistente) en un barrido horizontal a lo ancho
//   de la ventana, pero sin que pase por encima del recuadro informativo (.info-card).
// - Estrategia: fijar una coordenada Y segura (arriba o abajo del .info-card) y
//   usar una animación CSS que traduzca X entre 0 y --sweep-distance (escrita por JS).
// - Se recalcula en resize/scroll para mantener la zona segura.
function startHorizontalSweep() {
  if (!asistente) return;
  const margin = 12;
  const img = asistente.querySelector('.imagen-bot');
  const ASW = asistente.offsetWidth || (img ? img.width : 80);
  const ASH = asistente.offsetHeight || (img ? img.height : 80);

  function computeAndApply() {
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const info = document.querySelector('.info-card');
    let y = margin; // default

    if (info) {
      const r = info.getBoundingClientRect();
      const spaceAbove = r.top;
      const spaceBelow = vh - r.bottom;
      // Preferir colocar la abeja encima si hay suficiente espacio, sino abajo
      if (spaceAbove > ASH + margin + 20) {
        y = Math.max(margin, r.top - ASH - margin);
      } else if (spaceBelow > ASH + margin + 20) {
        y = Math.min(vh - ASH - margin, r.bottom + margin);
      } else {
        // Si no hay suficiente espacio en ninguno, usar el borde superior con un pequeño desplazamiento
        y = Math.max(margin, Math.min(r.top - ASH - margin, vh - ASH - margin));
      }
    } else {
      // Sin info-card, dejarla en 12px desde arriba
      y = margin;
    }

    // Aplicar posición vertical fija (usamos position:fixed en CSS .sweep)
    asistente.style.top = `${y}px`;
    asistente.style.left = `8px`;

    // distancia de barrido horizontal: todo el ancho visible menos ancho del asistente
    const sweepDistance = Math.max(0, vw - ASW - (margin * 2));
    document.documentElement.style.setProperty('--sweep-distance', `${sweepDistance}px`);
  }

  // Cambiar a modo sweep: añadir clase .sweep
  asistente.classList.add('sweep');

  // preparar orientación inicial de la imagen y escucha de cambios de dirección
  const imgEl = asistente.querySelector('.imagen-bot');
  let directionForward = true; // true = left->right (forward), false = right->left
  if (imgEl) {
    // establecer valores CSS custom iniciales
    imgEl.style.setProperty('--face-scaleX', '1');
    imgEl.style.setProperty('--face-rotate', '6deg');
    imgEl.style.setProperty('--hover-scale', '1');

    // cuando la animación de barrido complete una iteración alterna la dirección
    asistente.addEventListener('animationiteration', () => {
      directionForward = !directionForward;
      if (directionForward) {
        imgEl.style.setProperty('--face-scaleX', '1');
        imgEl.style.setProperty('--face-rotate', '6deg');
      } else {
        imgEl.style.setProperty('--face-scaleX', '-1');
        imgEl.style.setProperty('--face-rotate', '-6deg');
      }
    });
  }

  computeAndApply();

  // Recalcular al redimensionar o al hacer scroll (puede cambiar posición del .info-card)
  window.addEventListener('resize', computeAndApply);
  window.addEventListener('scroll', computeAndApply, { passive: true });

  // Pausar movimiento inteligente previo (si existiera intervalId)
  try { if (typeof intervalId !== 'undefined') clearInterval(intervalId); } catch (e) {}
}

// Iniciamos el barrido automáticamente en la página principal
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startHorizontalSweep);
else startHorizontalSweep();
