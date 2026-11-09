/* ===== Algemene hulpfuncties ===== */
const U = {
  rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },
  ri(a, b, r = Math.random) { return Math.floor(r() * (b - a + 1)) + a; },
  rf(a, b, r = Math.random) { return r() * (b - a) + a; },
  pick(arr, r = Math.random) { return arr[Math.floor(r() * arr.length)]; },
  wpick(items, wfn, r = Math.random) {
    let tot = 0;
    const ws = items.map((it) => { const w = Math.max(0, wfn(it)); tot += w; return w; });
    if (tot <= 0) return items[Math.floor(r() * items.length)];
    let x = r() * tot;
    for (let i = 0; i < items.length; i++) { x -= ws[i]; if (x <= 0) return items[i]; }
    return items[items.length - 1];
  },
  gauss(r = Math.random) {
    let u = 0, v = 0;
    while (u === 0) u = r();
    while (v === 0) v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  },
  shuffle(a, r = Math.random) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  },
  clamp(v, a, b) { return Math.max(a, Math.min(b, v)); },
  fmt(n) { return Math.round(n).toLocaleString('nl-NL'); },
  esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
  hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; },
  $(sel, root = document) { return root.querySelector(sel); },
  $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); },
  sleep(ms) { return new Promise((res) => setTimeout(res, ms)); },
  today() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; },

  /* ---- Toasts ---- */
  toast(msg, type = 'info', ms = 2600) {
    let wrap = U.$('#toasts');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toasts'; document.body.appendChild(wrap); }
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = msg;
    wrap.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, ms);
  },

  /* ---- Modals ---- */
  modal(html, opts = {}) {
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = `<div class="modal ${opts.cls || ''}"><button class="modal-x" aria-label="Sluiten">✕</button>${html}</div>`;
    document.body.appendChild(back);
    requestAnimationFrame(() => back.classList.add('show'));
    const close = () => {
      if (back._closed) return;
      back._closed = true;
      back.classList.remove('show');
      setTimeout(() => back.remove(), 250);
      opts.onClose && opts.onClose();
    };
    back.close = close;
    back.querySelector('.modal-x').onclick = () => { SFX.click(); close(); };
    if (!opts.sticky) back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
    return back;
  },
  confirm(title, text, okLabel = 'Bevestigen') {
    return new Promise((res) => {
      const m = U.modal(`<h2>${title}</h2><p class="muted">${text}</p>
        <div class="modal-actions"><button class="btn ghost" data-a="no">Annuleren</button><button class="btn primary" data-a="ok">${okLabel}</button></div>`,
        { cls: 'small', onClose: () => res(false) });
      m.querySelector('[data-a=ok]').onclick = () => { res(true); m.close(); };
      m.querySelector('[data-a=no]').onclick = () => m.close();
    });
  },

  confetti(colors = ['#ffd75e', '#ffffff', '#3ef0c4', '#ff5e8a'], n = 120, root = document.body) {
    const box = document.createElement('div');
    box.className = 'confetti';
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = U.pick(colors);
      p.style.animationDelay = Math.random() * 0.6 + 's';
      p.style.animationDuration = 2 + Math.random() * 2 + 's';
      p.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
      p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      p.style.width = 6 + Math.random() * 6 + 'px';
      p.style.height = 8 + Math.random() * 10 + 'px';
      box.appendChild(p);
    }
    root.appendChild(box);
    setTimeout(() => box.remove(), 4800);
  },

  countUp(el, from, to, ms = 700) {
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = U.fmt(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },
};

/* ===== Geluidseffecten (WebAudio, geen bestanden nodig) ===== */
const SFX = {
  ctx: null,
  on: true,
  init() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  tone(freq, dur, type = 'sine', vol = 0.15, slideTo = null, delay = 0) {
    if (!this.on) return;
    const c = this.init(); if (!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  },
  noise(dur, vol = 0.2, f1 = 800, f2 = null, delay = 0, q = 0.8) {
    if (!this.on) return;
    const c = this.init(); if (!c) return;
    const t = c.currentTime + delay;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q;
    f.frequency.setValueAtTime(f1, t);
    if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(c.destination);
    src.start(t); src.stop(t + dur);
  },
  click() { this.tone(900, 0.05, 'triangle', 0.06); },
  coin() { this.tone(1200, 0.08, 'square', 0.05); this.tone(1800, 0.12, 'square', 0.05, null, 0.07); },
  whoosh() { this.noise(0.5, 0.25, 300, 3000); },
  boom() { this.tone(120, 0.6, 'sine', 0.4, 40); this.noise(0.5, 0.3, 200, 60); },
  shimmer() { [0, 0.08, 0.16, 0.24, 0.32].forEach((d, i) => this.tone(1000 + i * 260, 0.25, 'sine', 0.05, null, d)); },
  drum() { this.tone(90, 0.25, 'sine', 0.35, 50); },
  whistle(long = false) { this.tone(2600, long ? 0.7 : 0.25, 'sine', 0.08, 2500); if (long) this.tone(2600, 0.25, 'sine', 0.08, 2500, 0.85); },
  cheer() { this.noise(2.2, 0.28, 900, 1400, 0, 0.4); this.noise(1.8, 0.18, 2200, 1800, 0.15, 0.6); },
  groan() { this.noise(1.1, 0.12, 500, 250, 0, 0.5); },
  fanfare() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.35, 'triangle', 0.1, null, i * 0.12)); },
  error() { this.tone(220, 0.18, 'sawtooth', 0.06); },
};
