/* ===== Packs: inhoud, kansen en de openingsshow ===== */
const POOLS = {
  b: (c) => c.type === 'bronze' && !c.rare,
  br: (c) => c.type === 'bronze' && c.rare,
  s: (c) => c.type === 'silver' && !c.rare,
  sr: (c) => c.type === 'silver' && c.rare,
  g: (c) => c.type === 'gold' && !c.rare,
  gr: (c) => c.type === 'gold' && c.rare,
  gr83: (c) => c.type === 'gold' && c.rare && c.r >= 83,
  if: (c) => c.type === 'inform',
  hero: (c) => c.type === 'hero',
  icon: (c) => c.type === 'icon',
};
const POOL_CACHE = {};
function poolList(k) {
  if (!POOL_CACHE[k]) {
    const list = DB_LIST.filter(POOLS[k]);
    const min = Math.min(...list.map((c) => c.r));
    POOL_CACHE[k] = { list, min };
  }
  return POOL_CACHE[k];
}

const PACKS = {
  bronze: { name: 'Brons Pack', price: 750, count: 6, theme: 'bronze', desc: '6 bronzen spelers, kans op zilver', guar: [], w: { b: 68, br: 26, s: 6 } },
  silver: { name: 'Zilver Pack', price: 2500, count: 6, theme: 'silver', desc: '6 zilveren spelers, kans op goud', guar: ['sr'], w: { s: 64, sr: 28, g: 8 } },
  gold: { name: 'Goud Pack', price: 7500, count: 6, theme: 'gold', desc: '6 gouden spelers, kans op zeldzaam', guar: ['g'], w: { g: 68, gr: 26, s: 5.5, if: 0.5 } },
  premium: { name: 'Premium Goud', price: 15000, count: 8, theme: 'premium', desc: '8 gouden spelers, minimaal 1 zeldzaam', guar: ['gr'], w: { g: 58, gr: 40.8, if: 0.9, hero: 0.18, icon: 0.08 } },
  mega: { name: 'Mega Pack', price: 40000, count: 12, theme: 'mega', desc: '12 gouden spelers, minimaal 3 zeldzaam', guar: ['gr', 'gr', 'gr'], w: { g: 46, gr: 51.5, if: 2, hero: 0.35, icon: 0.15 } },
  inform: { name: 'In-Form Pack', price: 60000, count: 6, theme: 'inform', desc: '1 gegarandeerde In-Form + 5 zeldzaam goud', guar: ['if'], w: { gr: 96, if: 3, hero: 0.6, icon: 0.3 } },
  ultimate: { name: 'Ultiem Pack', price: 125000, count: 20, theme: 'ultimate', desc: '20 zeldzaam goud, 1 gegarandeerd 83+', guar: ['gr83'], w: { gr: 93, if: 5, hero: 1.2, icon: 0.6 } },
  hero: { name: 'Helden Pack', price: 160000, count: 4, theme: 'hero', desc: '1 gegarandeerde Held + 3 zeldzaam goud', guar: ['hero'], w: { gr: 94, if: 6 } },
  icon: { name: 'Legende Pack', price: 275000, count: 3, theme: 'icon', desc: '1 gegarandeerde Legende + 2 zeldzaam goud 83+', guar: ['icon'], w: { gr83: 100 } },
};
const STORE_ORDER = ['bronze', 'silver', 'gold', 'premium', 'mega', 'inform', 'ultimate', 'hero', 'icon'];

const Packs = {
  draw(k, used, r = Math.random) {
    const { list, min } = poolList(k);
    const decay = k === 'icon' || k === 'hero' ? 0.85 : k === 'if' ? 0.8 : 0.74;
    for (let t = 0; t < 40; t++) {
      const c = U.wpick(list, (x) => Math.pow(decay, x.r - min), r);
      if (!used.has(c.base)) { used.add(c.base); return c; }
    }
    return U.pick(list, r);
  },

  generate(packId) {
    const P = PACKS[packId];
    const used = new Set();
    const out = [];
    P.guar.forEach((k) => out.push(Packs.draw(k, used)));
    const keys = Object.keys(P.w);
    while (out.length < P.count) {
      const k = U.wpick(keys, (x) => P.w[x]);
      out.push(Packs.draw(k, used));
    }
    return out.sort((a, b) => Packs.rank(b) - Packs.rank(a));
  },

  rank(c) { return c.r + (c.type === 'icon' ? 30 : c.type === 'hero' ? 22 : c.type === 'inform' ? 15 : 0) + (c.rare ? 0.5 : 0); },

  isWalkout(c) { return c.r >= 84 || ['inform', 'hero', 'icon'].includes(c.type); },

  art(packId, size = 'md') {
    const P = PACKS[packId];
    return `<div class="pack pk-${P.theme} ps-${size}">
      <div class="pack-shine"></div>
      <div class="pack-top">ULTIMATE ELFTAL</div>
      <div class="pack-emblem"><svg viewBox="0 0 60 60"><path d="M30 4 52 12v18c0 14-9 22-22 27C17 52 8 44 8 30V12z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M30 16l4 9 10 .8-7.6 6.5 2.4 9.7L30 37l-8.8 5 2.4-9.7L16 25.8l10-.8z" fill="currentColor"/></svg></div>
      <div class="pack-name">${P.name}</div>
      <div class="pack-count">${P.count} spelers</div>
    </div>`;
  },

  /* Koop pack in de store */
  buy(packId, openNow) {
    const P = PACKS[packId];
    if (!S.spend(P.price)) return;
    SFX.coin();
    if (openNow) Packs.open(packId);
    else { S.addPack(packId); U.toast(`${P.name} toegevoegd aan <b>Mijn packs</b>`, 'ok'); App.refresh(); }
  },

  /* Pack uit inventaris openen */
  openFromInventory(idx) {
    const id = S.d.packs[idx];
    if (!id) return;
    S.d.packs.splice(idx, 1);
    S.save();
    App.updateBadges();
    Packs.open(id);
  },

  /* ---------- De openingsshow ---------- */
  open(packId) {
    const P = PACKS[packId];
    const cards = Packs.generate(packId);
    S.d.stats.packsOpened++;
    S.track('pack');
    const best = cards[0];
    if (!S.d.stats.bestPull || Packs.rank(best) > Packs.rank(DB[S.d.stats.bestPull])) S.d.stats.bestPull = best.id;
    // Pack telt direct als geopend: spelers worden meteen opgeslagen zodat niets verloren gaat bij herladen
    const dups = cards.map((c) => S.has(c.id));
    cards.forEach((c, i) => { if (!dups[i]) S.own(c.id); });
    S.save();

    const glow = best.type === 'icon' ? 'icon' : best.type === 'hero' ? 'hero' : best.type === 'inform' ? 'inform' : best.r >= 84 ? 'walkout' : best.tier;
    const ov = document.createElement('div');
    ov.className = `pack-ov glow-${glow}`;
    ov.innerHTML = `
      <div class="po-bg"><div class="po-rays"></div><div class="po-lights"><i></i><i></i><i></i></div></div>
      <div class="po-stage">
        <div class="po-pack">${Packs.art(packId, 'lg')}</div>
        <div class="po-hint">Tik op het pack om te openen</div>
      </div>
      <button class="po-skip btn ghost sm">Overslaan ⏭</button>`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add('show'));
    SFX.whoosh();

    let skipped = false, phase = 'idle';
    const stage = ov.querySelector('.po-stage');
    const skipBtn = ov.querySelector('.po-skip');
    const showSummary = () => {
      if (phase === 'summary') return;
      phase = 'summary';
      skipBtn.remove();
      Packs.summary(ov, P, cards, dups);
    };
    skipBtn.onclick = () => { skipped = true; SFX.click(); showSummary(); };

    const packEl = ov.querySelector('.po-pack');
    const run = async () => {
      if (phase !== 'idle') return;
      phase = 'opening';
      ov.querySelector('.po-hint').remove();
      SFX.init();
      packEl.classList.add('shake');
      for (let i = 0; i < 3; i++) { SFX.drum(); await U.sleep(330); if (skipped) return; }
      ov.classList.add('charged');
      SFX.shimmer();
      await U.sleep(700); if (skipped) return;
      packEl.classList.add('burst');
      SFX.boom();
      ov.classList.add('flash');
      await U.sleep(600); if (skipped) return;
      packEl.remove();

      if (Packs.isWalkout(best)) {
        // Walkout: land → positie → club → kaart
        ov.classList.add('walkout');
        const steps = [
          `<div class="wo-item wo-flag">${flagSVG(best.nat)}<div class="wo-txt">${NATIONS[best.nat].name}</div></div>`,
          `<div class="wo-item wo-pos"><div class="wo-big">${best.pos}</div><div class="wo-txt">${POS_NL[best.pos]}</div></div>`,
          `<div class="wo-item wo-club">${badgeSVG(best.club, 'wo')}<div class="wo-txt">${CLUBS[best.club].name}</div></div>`,
        ];
        for (const s of steps) {
          stage.innerHTML = s;
          SFX.drum(); SFX.whoosh();
          await U.sleep(1500); if (skipped) return;
        }
      }
      stage.innerHTML = `<div class="reveal">${Cards.html(best, { size: 'xl', cls: 'flipin' })}<div class="reveal-name">${U.esc(best.first)} ${U.esc(best.last)}</div><div class="reveal-type">${Cards.label(best)}</div></div>`;
      ov.classList.add('flash2');
      SFX.boom();
      if (Packs.isWalkout(best)) {
        SFX.cheer(); SFX.fanfare();
        U.confetti(best.type === 'icon' ? ['#f5e9c8', '#e8c76a', '#fff'] : best.type === 'hero' ? ['#a855f7', '#22d3ee', '#fff'] : ['#ffd75e', '#fff', '#ff9f1c'], 160, ov);
      } else SFX.shimmer();
      phase = 'revealed';
      const btn = document.createElement('button');
      btn.className = 'btn primary po-next';
      btn.textContent = cards.length > 1 ? `Bekijk alle ${cards.length} spelers →` : 'Doorgaan →';
      stage.appendChild(btn);
      btn.onclick = () => { SFX.click(); showSummary(); };
    };
    packEl.onclick = run;
  },

  summary(ov, P, cards, dups) {
    ov.classList.add('summary-mode');
    ov.classList.remove('flash', 'flash2');
    const dupTotal = cards.reduce((s, c, i) => s + (dups[i] ? Cards.sellPrice(c) : 0), 0);
    ov.querySelector('.po-stage').innerHTML = `
      <div class="sum">
        <h2>${P.name} — jouw spelers</h2>
        <div class="sum-grid">${cards.map((c, i) => `<div class="sum-item" style="animation-delay:${i * 0.06}s">${Cards.html(c, { size: 'md', dup: dups[i], isNew: !dups[i] })}
          <div class="sum-val">${dups[i] ? `Verkoop: <b class="coins-txt">${U.fmt(Cards.sellPrice(c))}</b>` : `Waarde <span class="coins-txt">${U.fmt(Cards.value(c))}</span>`}</div></div>`).join('')}</div>
        <div class="sum-actions">
          ${dupTotal ? `<p class="muted">${dups.filter(Boolean).length} dubbele speler(s) worden automatisch verkocht voor <b class="coins-txt">${U.fmt(dupTotal)}</b></p>` : '<p class="muted">Alle spelers zijn toegevoegd aan je club.</p>'}
          <button class="btn primary" id="sumDone">Opslaan in club ✓</button>
        </div>
      </div>`;
    ov.querySelectorAll('.sum-item .card').forEach((el) => { el.onclick = () => Cards.detail(DB[el.dataset.id], [{ label: 'Sluiten', cls: 'ghost', fn: (m) => m.close() }]); });
    ov.querySelector('#sumDone').onclick = () => {
      SFX.click();
      if (dupTotal) { S.addCoins(dupTotal); SFX.coin(); }
      ov.classList.remove('show');
      setTimeout(() => ov.remove(), 300);
      App.refresh();
    };
  },

  /* Kansen schatten via simulatie (voor de store) */
  odds(packId) {
    const P = PACKS[packId];
    let w84 = 0, special = 0;
    const N = 600;
    for (let i = 0; i < N; i++) {
      const cs = Packs.generate(packId);
      if (cs.some((c) => c.r >= 84)) w84++;
      if (cs.some((c) => ['inform', 'hero', 'icon'].includes(c.type))) special++;
    }
    return { w84: (w84 / N) * 100, special: (special / N) * 100, P };
  },
};
