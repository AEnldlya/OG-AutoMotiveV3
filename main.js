/* ═══════════════════════════════════════════════════════
   O.G. AUTOMOTIVE — SHARED JS
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── YEAR ─────────────────────────────────────── */
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── CURSOR ───────────────────────────────────── */
  const dot  = document.getElementById('c-dot');
  const ring = document.getElementById('c-ring');
  if (dot && ring && window.matchMedia('(hover: hover)').matches) {
    let rx = 0, ry = 0, mx = 0, my = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    (function loop() {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, .svc-card, .stat-cell, .feature-item').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('ch'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('ch'));
    });
    document.addEventListener('mouseleave', () => { dot.style.opacity = 0; ring.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = 1; ring.style.opacity = 1; });
  }

  /* ── SCROLL PROGRESS ──────────────────────────── */
  const sbar = document.getElementById('sbar');
  if (sbar) {
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
      sbar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── NAV ──────────────────────────────────────── */
  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const mobile = document.getElementById('nav-mobile');
  if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
  if (toggle && mobile) {
    function openMenu() {
      toggle.classList.add('open');
      mobile.style.display = 'flex';
      mobile.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      toggle.classList.remove('open');
      mobile.classList.remove('open');
      mobile.style.display = 'none';
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    toggle.addEventListener('click', () => {
      toggle.classList.contains('open') ? closeMenu() : openMenu();
    });
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle && mobile) closeMenu();
  });

  /* ── ACTIVE NAV LINK ──────────────────────────── */
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').replace(/\/$/, '') || '/';
    if (path === href || (href !== '/' && path.startsWith(href))) {
      a.classList.add('active');
    }
  });

  /* ── GSAP SCROLL REVEALS ──────────────────────── */
  if (typeof gsap !== 'undefined' && !reduced) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.reveal').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: .85, ease: 'power3.out',
        delay: (i % 4) * 0.08,
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      });
    });
  } else {
    document.querySelectorAll('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
  }

  /* ── TESTIMONIALS SLIDER ──────────────────────── */
  const track = document.getElementById('slider-track');
  const dots  = document.querySelectorAll('.slider-dot');
  if (track && dots.length) {
    let cur = 0, timer;
    function goTo(i) {
      cur = ((i % dots.length) + dots.length) % dots.length;
      track.style.transform = `translateX(-${cur * 100}%)`;
      dots.forEach((d, j) => { d.classList.toggle('active', j === cur); d.setAttribute('aria-selected', j === cur); });
    }
    function start() { timer = setInterval(() => goTo(cur + 1), 5000); }
    function stop()  { clearInterval(timer); }
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => { stop(); goTo(cur - 1); start(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stop(); goTo(cur + 1); start(); });
    dots.forEach(d => d.addEventListener('click', () => { stop(); goTo(+d.dataset.i); start(); }));
    let ts = 0;
    track.addEventListener('touchstart', e => ts = e.touches[0].clientX, { passive: true });
    track.addEventListener('touchend',   e => { const df = ts - e.changedTouches[0].clientX; if (Math.abs(df) > 40) { stop(); goTo(df > 0 ? cur + 1 : cur - 1); start(); } });
    start();
  }

  /* ── CONTACT FORM ─────────────────────────────── */
  const form = document.getElementById('contact-form');
  const msg  = document.getElementById('form-msg');
  if (form && msg) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach(f => {
        if (!f.value.trim()) { valid = false; f.style.borderColor = 'rgba(244,67,54,.6)'; f.addEventListener('input', () => f.style.borderColor = '', { once: true }); }
      });
      if (!valid) { msg.className = 'form-msg err'; msg.textContent = 'Please fill in all required fields.'; return; }
      const btn = form.querySelector('.btn-primary');
      const orig = btn.innerHTML;
      btn.innerHTML = '<span>Sending...</span>'; btn.style.pointerEvents = 'none';
      // Replace YOUR_FORM_ID with your Formspree ID from formspree.io
      const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
      if (FORM_ENDPOINT.includes('YOUR_FORM_ID')) {
        btn.innerHTML = orig; btn.style.pointerEvents = '';
        msg.className = 'form-msg ok';
        msg.textContent = "Got your info! For the fastest response call (802) 478-2224.";
        form.reset();
        return;
      }
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }
        });
        if (res.ok) { msg.className = 'form-msg ok'; msg.textContent = "Got it — we'll be in touch. Or call (802) 478-2224."; form.reset(); }
        else throw new Error();
      } catch(err) { msg.className = 'form-msg err'; msg.textContent = 'Something went wrong. Call (802) 478-2224.'; }
      btn.innerHTML = orig; btn.style.pointerEvents = '';
    });
  }

  /* ── COUNT UP ─────────────────────────────────── */
  if (typeof gsap !== 'undefined' && !reduced) {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count);
      const numEl  = el.querySelector('.count-num');
      if (!numEl) return;
      gsap.fromTo({ v: 0 }, { v: target }, {
        v: target, duration: 2, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: function () {
          numEl.textContent = target >= 1000
            ? Math.floor(this.targets()[0].v).toLocaleString()
            : Math.floor(this.targets()[0].v);
        }
      });
    });
  }

})();
