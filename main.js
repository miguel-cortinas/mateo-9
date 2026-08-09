'use strict';

const CONFIG = {
  eventDate: new Date('2026-08-14T15:00:00'),
  whatsappNumber: '526144948844',
  whatsappMsg: 'Hola!\nConfirmo mi asistencia al cumpleaños de Mateo.',
  messiVideo: 'video.mp4',
  placeholderDuration: 5000,
};

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('scroll-locked');
  initKickoff();
  initCountdown();
  initScrollAnimations();
  initRSVP();
});

function initKickoff() {
  const btn = document.getElementById('kickoff-btn');
  if (btn) btn.addEventListener('click', startKickoff);
}

function startKickoff() {
  const btn = document.getElementById('kickoff-btn');
  if (btn) btn.disabled = true;

  const opening = document.getElementById('opening');
  const screen = document.getElementById('messi-video-screen');

  screen.style.opacity = '0';
  screen.style.transition = 'none';
  screen.classList.add('active');
  screen.removeAttribute('aria-hidden');

  opening.style.transition = 'opacity 0.8s ease';
  opening.style.opacity = '0';

  setTimeout(() => {
    opening.style.display = 'none';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        screen.style.transition = 'opacity 1s ease';
        screen.style.opacity = '1';
      });
    });

    if (CONFIG.messiVideo) {
      playRealVideo(screen);
    } else {
      playPlaceholder(screen);
    }
  }, 820);
}

function playRealVideo(screen) {
  const videoEl = document.getElementById('messi-video');
  const placeholder = document.getElementById('messi-placeholder');
  const skipBtn = document.getElementById('skip-btn');

  videoEl.src = `../img/${CONFIG.messiVideo}`;
  videoEl.style.display = 'block';
  if (placeholder) placeholder.style.display = 'none';

  videoEl.play().catch(() => {
    videoEl.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
    playPlaceholder(screen);
  });

  let skipTimer = setTimeout(() => {
    if (skipBtn) skipBtn.hidden = false;
  }, 3000);

  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      clearTimeout(skipTimer);
      skipBtn.hidden = true;
      videoEl.pause();
      startCinematicZoom(videoEl, null);
    }, { once: true });
  }

  videoEl.addEventListener('ended', () => {
    clearTimeout(skipTimer);
    if (skipBtn) skipBtn.hidden = true;
    startCinematicZoom(videoEl, null);
  }, { once: true });
}

function playPlaceholder(screen) {
  const bar = document.getElementById('mp-bar');
  const duration = CONFIG.placeholderDuration;
  const start = performance.now();

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

function startCinematicZoom(videoEl, screen) {
  const zoomOverlay = document.getElementById('video-zoom-overlay');

  if (videoEl) {
    videoEl.classList.add('zoom-in');
  }

  if (zoomOverlay) {
    zoomOverlay.classList.add('fade-in');
  }

  setTimeout(() => {
    const videoScreen = document.getElementById('messi-video-screen');
    if (videoScreen) {
      videoScreen.classList.remove('active');
      videoScreen.setAttribute('aria-hidden', 'true');
    }

    const transLayer = document.getElementById('transition-layer');
    if (transLayer) transLayer.style.display = 'block';

    launchBall(() => {
      shakeScreen();
      showCrack();
    });
  }, 1100);
}

function launchBall(onImpact) {
  const ball = document.getElementById('flying-ball');
  if (!ball) { onImpact(); return; }

  const w = window.innerWidth;
  const h = window.innerHeight;
  const size = ball.offsetWidth || 90;

  const corners = [
    { x: -size * 1.6, y: -size * 1.6, rot: 400 },
    { x: w + size * 1.6, y: -size * 1.6, rot: -400 },
    { x: -size * 1.6, y: h + size * 1.6, rot: 440 },
    { x: w + size * 1.6, y: h + size * 1.6, rot: -440 },
  ];
  const start = corners[Math.floor(Math.random() * corners.length)];
  const targetX = w / 2 - size / 2;
  const targetY = h / 2 - size / 2;

  ball.style.transition = 'none';
  ball.style.opacity = '1';
  ball.style.display = 'block';
  ball.style.transform = `translate3d(${start.x}px, ${start.y}px, 0) rotate(0deg) scale(0.7)`;
  ball.style.filter = 'drop-shadow(0 4px 20px rgba(0,0,0,0.7))';

  void ball.offsetWidth;

  requestAnimationFrame(() => {
    ball.style.transition =
      'transform 0.4s cubic-bezier(0.55,0,0.85,0.15), ' +
      'filter 0.4s ease-in';
    ball.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) rotate(${start.rot}deg) scale(1.15)`;
    ball.style.filter =
      'drop-shadow(0 4px 20px rgba(0,0,0,0.7)) ' +
      'blur(1.5px) drop-shadow(0 0 18px rgba(240,208,96,0.65))';
  });

  setTimeout(() => {
    ball.style.transition = 'transform 0.16s ease-out, opacity 0.16s ease-out, filter 0.16s ease-out';
    ball.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) rotate(${start.rot}deg) scale(0.25)`;
    ball.style.opacity = '0';
    ball.style.filter = 'drop-shadow(0 0 30px rgba(240,208,96,0.9)) blur(2px)';

    onImpact();

    setTimeout(() => { ball.style.display = 'none'; }, 180);
  }, 400);
}

function shakeScreen() {
  const layer = document.getElementById('transition-layer');
  if (!layer) return;
  layer.classList.remove('shake');
  void layer.offsetWidth;
  layer.classList.add('shake');
  setTimeout(() => layer.classList.remove('shake'), 430);
}

function showCrack() {
  const canvas = document.getElementById('crack-canvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  
  const ctx = canvas.getContext('2d');
  const w = canvas.offsetWidth || window.innerWidth;
  const h = canvas.offsetHeight || window.innerHeight;
  canvas.width = w;
  canvas.height = h;

  const cx = w / 2;
  const cy = h / 2;
  const maxRadius = Math.max(w, h) * 0.7;
  
  const cracks = [];
  const numCracks = 5 + Math.floor(Math.random() * 2);
  for (let i = 0; i < numCracks; i++) {
    const angle = (Math.PI * 2 * i) / numCracks + (Math.random() - 0.5) * 0.5;
    const points = [{x: cx, y: cy}];
    let dist = 0;
    let curX = cx;
    let curY = cy;
    
    while (dist < maxRadius) {
      const stepDist = 30 + Math.random() * 40;
      dist += stepDist;
      const jitterAngle = angle + (Math.random() - 0.5) * 0.8;
      curX += Math.cos(jitterAngle) * stepDist;
      curY += Math.sin(jitterAngle) * stepDist;
      points.push({x: curX, y: curY});
    }
    
    cracks.push({
      points,
      progress: 0,
      speed: 0.08 + Math.random() * 0.04
    });
  }

  let rafId;
  const start = performance.now();
  
  function draw() {
    const now = performance.now();
    const dt = now - start;
    
    ctx.clearRect(0, 0, w, h);
    
    if (dt < 400) {
      const p = Math.min(dt / 150, 1);
      const scale = p * (dt > 150 ? 1 + (dt-150)/50 : 1);
      const alpha = Math.max(0, 1 - (dt > 150 ? (dt-150)/250 : 0));
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(cx, cy, 8 * scale, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 250, 230, 0.95)';
      ctx.shadowColor = 'rgba(240, 208, 96, 0.9)';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.restore();
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#FFF8DE';
    ctx.shadowColor = 'rgba(240, 208, 96, 0.8)';
    ctx.shadowBlur = 8;
    
    let active = false;

    cracks.forEach(c => {
      c.progress = Math.min(c.progress + c.speed, 1);
      if (c.progress < 1) active = true;
      
      const totalPts = c.points.length;
      const drawPts = Math.max(1, Math.floor(totalPts * c.progress));
      
      if (drawPts > 1) {
        ctx.beginPath();
        ctx.moveTo(c.points[0].x, c.points[0].y);
        for (let i = 1; i < drawPts; i++) {
          ctx.lineTo(c.points[i].x, c.points[i].y);
        }
        ctx.lineWidth = 2.5 * (1 - c.progress * 0.3);
        ctx.stroke();
      }
    });

    if (active || dt < 400) {
      rafId = requestAnimationFrame(draw);
    }
  }
  
  rafId = requestAnimationFrame(draw);
  setTimeout(showFlash, 460);
}

function showFlash() {
  const flash = document.getElementById('flash-overlay');
  if (flash) {
    flash.style.display = '';
    flash.classList.remove('go');
    void flash.offsetWidth;
    flash.classList.add('go');
  }
  setTimeout(revealContent, 340);
}

function revealContent() {
  const transLayer = document.getElementById('transition-layer');
  if (transLayer) transLayer.style.display = 'none';

  document.body.classList.remove('scroll-locked');

  const main = document.getElementById('main-content');
  if (main) {
    main.classList.add('visible');
    window.scrollTo({ top: 0, behavior: 'instant' });
    triggerVisibleCheck();
  }
}

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
    el.style.color = 'var(--gold-l)';
    setTimeout(() => (el.style.color = ''), 220);
  }
}

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

  const w = canvas.offsetWidth || canvas.parentElement?.offsetWidth || window.innerWidth;
  const h = canvas.offsetHeight || canvas.parentElement?.offsetHeight || window.innerHeight;
  canvas.width = w;
  canvas.height = h;

  const palette = ['#74ACDF', '#FFFFFF', '#74ACDF', '#FFFFFF', '#C9A84C', '#F0D060'];
  const parts = Array.from({ length: 130 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h - h,
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
    ctx.clearRect(0, 0, w, h);
    let alive = false;
    parts.forEach(p => {
      if (p.y < h + 10) alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.07;
      p.rot += p.rs;
      const op = Math.max(0, 1 - p.y / h * 0.6);
      ctx.save();
      ctx.globalAlpha = op;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.col;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (alive) rafId = requestAnimationFrame(draw);
    else { cancelAnimationFrame(rafId); ctx.clearRect(0, 0, w, h); }
  }
  cancelAnimationFrame(rafId);
  draw();
}