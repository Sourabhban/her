/* ==========================================================================
   PURE ENCHANTMENT — CLICK-TO-PLAY AUDIO & VIDEO ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundVideo();
  initClickToPlayAudio();
  initBackgroundCanvas();
});

/* ==========================================================================
   0. AUTO-PLAY BACKGROUND VIDEO ENGINE
   ========================================================================== */
function initBackgroundVideo() {
  const video = document.getElementById('bgVideo');
  if (!video) return;

  video.muted = true;
  video.loop = true;
  
  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      const forcePlay = () => {
        video.play();
      };
      window.addEventListener('click', forcePlay, { once: true });
      window.addEventListener('touchstart', forcePlay, { once: true });
      window.addEventListener('mousemove', forcePlay, { once: true });
    });
  }
}

/* ==========================================================================
   1. ZERO-INTERACTION AUTO-PLAY AUDIO
   The <audio autoplay muted> tag starts playing immediately (always allowed).
   JS instantly unmutes it with a smooth fade-in — no click/touch needed.
   ========================================================================== */
function initClickToPlayAudio() {
  const audio = document.getElementById('bgAudio');
  const audioBtn = document.getElementById('audioToggle');
  if (!audio || !audioBtn) return;

  audio.loop = true;

  function setPlayingState() {
    audioBtn.classList.add('playing');
    audioBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i><span class="music-btn-label">Playing 🎶</span><span class="audio-pulse-ring"></span>';
  }

  function setPausedState() {
    audioBtn.classList.remove('playing');
    audioBtn.innerHTML = '<i class="fa-solid fa-music"></i><span class="music-btn-label">Paused</span><span class="audio-pulse-ring"></span>';
  }

  // Unmute the already-playing audio and fade volume up smoothly
  function unmuteAndFadeIn() {
    audio.muted  = false;
    audio.volume = 0;
    setPlayingState();
    let vol = 0;
    const target = 0.65;
    const step = target / 80;
    const fade = setInterval(() => {
      vol = Math.min(vol + step, target);
      audio.volume = vol;
      if (vol >= target) clearInterval(fade);
    }, 20);
  }

  // Audio is already playing (muted) via HTML autoplay attribute.
  // Just unmute it immediately.
  if (!audio.paused) {
    unmuteAndFadeIn();
  } else {
    // Fallback: audio hasn't started yet — play it now
    audio.play().then(unmuteAndFadeIn).catch(() => {
      // Absolute last resort: first touch/click
      setPausedState();
      const unlock = () => {
        audio.play().then(unmuteAndFadeIn).catch(() => {});
        ['click', 'touchstart'].forEach(e => document.removeEventListener(e, unlock));
      };
      ['click', 'touchstart'].forEach(e => document.addEventListener(e, unlock, { once: true }));
    });
  }

  // Manual button — pause / resume
  audioBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audio.paused) {
      audio.muted  = false;
      audio.volume = 0.65;
      audio.play().then(setPlayingState).catch(() => {});
    } else {
      audio.pause();
      setPausedState();
    }
  });
}


/* ==========================================================================
   2. FAINT FLOATING PARTICLE SPARKLES (BACKGROUND)
   ========================================================================== */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const particleCount = 55;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.8,
      vy: -Math.random() * 0.35 - 0.1,
      vx: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.5 + 0.1,
      maxAlpha: Math.random() * 0.6 + 0.3,
      alphaSpeed: 0.004 + Math.random() * 0.004
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha += p.alphaSpeed;

      if (p.alpha <= 0.1 || p.alpha >= p.maxAlpha) {
        p.alphaSpeed = -p.alphaSpeed;
      }

      if (p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = '#f9b8d0';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#f9b8d0';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }

  draw();
}
