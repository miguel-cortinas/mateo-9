'use strict';

// ═══════════════════════════════════════════
// CONFIG — Actualizar estos valores
// ═══════════════════════════════════════════
const CONFIG = {
  // CAMBIAR cuando se confirme la fecha del evento
  // Formato: new Date('YYYY-MM-DDTHH:mm:ss')
  eventDate: new Date('2026-08-14T15:00:00'),

  // Numero de WhatsApp sin espacios ni guiones (con codigo de pais)
  whatsappNumber: '526144948844',

  // Mensaje prefilled
  whatsappMsg: 'Hola!\nConfirmo mi asistencia al cumpleaños de Mateo.',

  // Link de Google Maps (actualizar cuando este disponible)
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=28.653562475653175,-106.01984382449845',

  // ── CLIP DE MESSI ──────────────────────────────────────────
  // Pon aquí la ruta a tu video (relativa a /img/) cuando lo tengas.
  // Ejemplo: 'messi.mp4'  →  el archivo debe estar en /img/messi.mp4
  // Mientras esté vacío ('') se muestra el placeholder animado.
  messiVideo: 'video.mp4',

  // Duración del placeholder en milisegundos (se usa solo si messiVideo='')
  placeholderDuration: 5000,
};

// ═══════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('scroll-locked'); // bloquear scroll en opening
  initKickoff();
  initCountdown();
  initScrollAnimations();
  initGallery();
  initRSVP();
  applyConfig();
});

// ═══════════════════════════════════════════
// KICKOFF — secuencia de opening
// ═══════════════════════════════════════════
function initKickoff() {
  const btn = document.getElementById('kickoff-btn');
  if (btn) btn.addEventListener('click', startKickoff);
}

function startKickoff() {
  const btn = document.getElementById('kickoff-btn');
  if (btn) btn.disabled = true;

  const opening = document.getElementById('opening');
  const screen = document.getElementById('messi-video-screen');

  // ── 1. Preparar la pantalla de video detrás (invisible) ──
  screen.style.opacity = '0';
  screen.style.transition = 'none';
  screen.classList.add('active');
  screen.removeAttribute('aria-hidden');

  // ── 2. Fade-out suave del opening (0.8s) ──
  opening.style.transition = 'opacity 0.8s ease';
  opening.style.opacity = '0';

  // ── 3. Al terminar el fade-out → fade-in del video ──
  setTimeout(() => {
    opening.style.display = 'none';

    // Doble rAF: garantiza que el navegador pinte antes de la transición
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        screen.style.transition = 'opacity 1s ease';
        screen.style.opacity = '1';
      });
    });

    // Arrancar el video mientras hace fade-in
    if (CONFIG.messiVideo) {
      playRealVideo(screen);
    } else {
      playPlaceholder(screen);
    }
  }, 820);
}


// ─── VIDEO REAL ───
function playRealVideo(screen) {
  const videoEl = document.getElementById('messi-video');
  const placeholder = document.getElementById('messi-placeholder');
  const skipBtn = document.getElementById('skip-btn');

  // Configurar fuente
  videoEl.src = `../img/${CONFIG.messiVideo}`;
  videoEl.style.display = 'block';
  if (placeholder) placeholder.style.display = 'none';

  // Reproducir
  videoEl.play().catch(() => {
    // Si no puede reproducirse, caer en placeholder
    videoEl.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
    playPlaceholder(screen);
  });

  // Mostrar botón skip a los 3 segundos
  let skipTimer = setTimeout(() => {
    if (skipBtn) skipBtn.hidden = false;
  }, 3000);

  // Al presionar skip → transición cinemática inmediata
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      clearTimeout(skipTimer);
      skipBtn.hidden = true;
      videoEl.pause();
      startCinematicZoom(videoEl, null);
    }, { once: true });
  }

  // Al terminar naturalmente → ocultar skip y hacer transición
  videoEl.addEventListener('ended', () => {
    clearTimeout(skipTimer);
    if (skipBtn) skipBtn.hidden = true;
    startCinematicZoom(videoEl, null);
  }, { once: true });
}

// ─── PLACEHOLDER (sin video) ───
function playPlaceholder(screen) {
  const bar = document.getElementById('mp-bar');
  const duration = CONFIG.placeholderDuration;
  const start = performance.now();

  // Animar barra de progreso
  let rafId;
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration * 100, 100);
    if (bar) bar.style.width = progress + '%';

    if (elapsed < duration) {
      rafId = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafId);
      startCinematicZoom(null, screen);
    }
  }
  rafId = requestAnimationFrame(tick);
}

// ─── TRANSICIÓN CINEMÁTICA (zoom-in extremo → negro → balón → grietas) ───
function startCinematicZoom(videoEl, screen) {
  const zoomOverlay = document.getElementById('video-zoom-overlay');

  // Si hay video real, aplicar zoom-in al elemento <video>
  if (videoEl) {
    videoEl.classList.add('zoom-in');
  }

  // Fade a negro simultáneo
  if (zoomOverlay) {
    zoomOverlay.classList.add('fade-in');
  }

  // Después del zoom (1.1s) → el balón entra en cuadro y "rompe" la pantalla
  setTimeout(() => {
    // Ocultar pantalla de video
    const videoScreen = document.getElementById('messi-video-screen');
    if (videoScreen) {
      videoScreen.classList.remove('active');
      videoScreen.setAttribute('aria-hidden', 'true');
    }

    // Mostrar la capa de transición (balón + grietas + flash)
    const transLayer = document.getElementById('transition-layer');
    if (transLayer) transLayer.style.display = 'block';

    launchBall(() => {
      shakeScreen();
      showCrack();
    });
  }, 1100);
}

// ─── BALÓN DE IMPACTO ───
// Anima #flying-ball desde una esquina hasta el centro de la pantalla;
// al llegar, dispara el callback (onImpact) que arranca el shake + las grietas.
function launchBall(onImpact) {
  const ball = document.getElementById('flying-ball');
  if (!ball) { onImpact(); return; }

  const w = window.innerWidth;
  const h = window.innerHeight;
  const size = ball.offsetWidth || 90;

  // Punto de entrada aleatorio, siempre fuera de cuadro
  const corners = [
    { x: -size * 1.6, y: -size * 1.6, rot: 400 },
    { x: w + size * 1.6, y: -size * 1.6, rot: -400 },
    { x: -size * 1.6, y: h + size * 1.6, rot: 440 },
    { x: w + size * 1.6, y: h + size * 1.6, rot: -440 },
  ];
  const start = corners[Math.floor(Math.random() * corners.length)];
  const targetX = w / 2 - size / 2;
  const targetY = h / 2 - size / 2;

  // Estado inicial (sin transición)
  ball.style.transition = 'none';
  ball.style.opacity = '1';
  ball.style.display = 'block';
  ball.style.left = start.x + 'px';
  ball.style.top = start.y + 'px';
  ball.style.transform = 'rotate(0deg) scale(0.7)';
  ball.style.filter = 'drop-shadow(0 4px 20px rgba(0,0,0,0.7))';

  // Forzar reflow antes de animar
  void ball.offsetWidth;

  requestAnimationFrame(() => {
    ball.style.transition =
      'left 0.4s cubic-bezier(0.55,0,0.85,0.15), ' +
      'top 0.4s cubic-bezier(0.55,0,0.85,0.15), ' +
      'transform 0.4s cubic-bezier(0.55,0,0.85,0.15), ' +
      'filter 0.4s ease-in';
    ball.style.left = targetX + 'px';
    ball.style.top = targetY + 'px';
    ball.style.transform = `rotate(${start.rot}deg) scale(1.15)`;
    ball.style.filter =
      'drop-shadow(0 4px 20px rgba(0,0,0,0.7)) ' +
      'blur(1.5px) drop-shadow(0 0 18px rgba(240,208,96,0.65))';
  });

  // Al llegar al centro → impacto: el balón se aplasta y desaparece
  setTimeout(() => {
    ball.style.transition = 'transform 0.16s ease-out, opacity 0.16s ease-out, filter 0.16s ease-out';
    ball.style.transform = `rotate(${start.rot}deg) scale(0.25)`;
    ball.style.opacity = '0';
    ball.style.filter = 'drop-shadow(0 0 30px rgba(240,208,96,0.9)) blur(2px)';

    onImpact();

    setTimeout(() => { ball.style.display = 'none'; }, 180);
  }, 400);
}

// ─── SHAKE DE CÁMARA (sacude la capa de transición al momento del impacto) ───
function shakeScreen() {
  const layer = document.getElementById('transition-layer');
  if (!layer) return;
  layer.classList.remove('shake');
  void layer.offsetWidth; // reflow para poder re-disparar la animación
  layer.classList.add('shake');
  setTimeout(() => layer.classList.remove('shake'), 430);
}

// ─── GRIETAS → FLASH → REVEAL ───
function showCrack() {
  const overlay = document.getElementById('crack-overlay');
  if (overlay) {
    overlay.style.display = 'block';
    // Núcleo del impacto, grietas y destellos arrancan juntos;
    // cada uno usa su propio --d (delay) definido inline en el SVG.
    overlay.querySelectorAll('.impact-core, .crack').forEach(el => el.classList.add('animate'));
  }
  // Deja que se vea la mayor parte del estallido de grietas antes del flash
  setTimeout(showFlash, 460);
}

function showFlash() {
  const flash = document.getElementById('flash-overlay');
  if (flash) {
    flash.style.display = ''; // resetear por si se ocultó antes
    flash.classList.remove('go');
    void flash.offsetWidth; // reflow para poder re-disparar la animación
    flash.classList.add('go');
  }
  setTimeout(revealContent, 340);
}

function revealContent() {
  // Ocultar toda la capa de transición
  const transLayer = document.getElementById('transition-layer');
  if (transLayer) transLayer.style.display = 'none';

  // Liberar scroll
  document.body.classList.remove('scroll-locked');

  // Revelar contenido principal
  const main = document.getElementById('main-content');
  if (main) {
    main.classList.add('visible');
    window.scrollTo({ top: 0, behavior: 'instant' });
    triggerVisibleCheck();
  }
}




// ═══════════════════════════════════════════
// COUNTDOWN
// ═══════════════════════════════════════════
function initCountdown() {
  tick();
  setInterval(tick, 1000);
}

function tick() {
  const diff = CONFIG.eventDate - new Date();
  const display = document.getElementById('countdown-display');
  const msg = document.getElementById('countdown-msg');

  if (diff <= 0) {
    display?.classList.add('hidden');
    msg?.classList.remove('hidden');
    return;
  }

  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  const s = Math.floor((diff % 6e4) / 1e3);

  setDigit('count-days', d);
  setDigit('count-hours', h);
  setDigit('count-mins', m);
  setDigit('count-secs', s);
}

function setDigit(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  const str = String(val).padStart(2, '0');
  if (el.textContent !== str) {
    el.textContent = str;
    // Flash dorado breve en cada cambio
    el.style.color = 'var(--gold-l)';
    setTimeout(() => (el.style.color = ''), 220);
  }
}

// ═══════════════════════════════════════════
// SCROLL ANIMATIONS (IntersectionObserver)
// ═══════════════════════════════════════════
function initScrollAnimations() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -55px 0px' });

  document.querySelectorAll('.animate-in').forEach(el => obs.observe(el));
}

function triggerVisibleCheck() {
  document.querySelectorAll('.animate-in').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.88) el.classList.add('visible');
  });
}

// ═══════════════════════════════════════════
// GALLERY
// ═══════════════════════════════════════════
function initGallery() {
  const track = document.getElementById('gallery-track');
  const viewport = document.getElementById('gallery-viewport');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  const dotWrap = document.getElementById('gallery-dots');

  if (!track) return;
  const slides = track.querySelectorAll('.gallery-slide');
  const dots = dotWrap?.querySelectorAll('.gdot');
  const total = slides.length;
  let current = 0;
  let autoTimer;

  function goTo(idx) {
    current = ((idx % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots?.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  dots?.forEach((d, i) => d.addEventListener('click', () => { goTo(i); resetAuto(); }));

  // Touch swipe
  let touchStartX = 0;
  viewport?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  viewport?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 48) { goTo(dx > 0 ? current - 1 : current + 1); resetAuto(); }
  }, { passive: true });

  // Pause on hover
  const wrap = document.querySelector('.gallery-wrap');
  wrap?.addEventListener('mouseenter', () => clearInterval(autoTimer));
  wrap?.addEventListener('mouseleave', resetAuto);

  resetAuto();
}

// ═══════════════════════════════════════════
// RSVP + CONFETTI
// ═══════════════════════════════════════════
function initRSVP() {
  const btn = document.getElementById('rsvp-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappMsg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    launchConfetti();
  });
}

function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  // Colores Argentina + dorado
  const palette = ['#74ACDF', '#FFFFFF', '#74ACDF', '#FFFFFF', '#C9A84C', '#F0D060'];
  const parts = Array.from({ length: 130 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    w: Math.random() * 12 + 4,
    h: Math.random() * 6 + 3,
    col: palette[Math.floor(Math.random() * palette.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3.5 + 1.8,
    rot: Math.random() * 360,
    rs: (Math.random() - 0.5) * 6,
  }));

  let rafId;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    parts.forEach(p => {
      if (p.y < canvas.height + 10) alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.07;
      p.rot += p.rs;
      const op = Math.max(0, 1 - p.y / canvas.height * 0.6);
      ctx.save();
      ctx.globalAlpha = op;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.col;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (alive) rafId = requestAnimationFrame(draw);
    else { cancelAnimationFrame(rafId); ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }
  cancelAnimationFrame(rafId);
  draw();
}

// ═══════════════════════════════════════════
// CONFIG APLICADA AL DOM
// ═══════════════════════════════════════════
function applyConfig() {
  // Google Maps link
  const mapsLink = document.getElementById('maps-link');
  if (mapsLink) mapsLink.href = CONFIG.mapsUrl;
}