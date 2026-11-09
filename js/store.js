/* ===== Store: packs kopen & transfermarkt ===== */
const Store = {
  tab: 'packs',
  oddsCache: {},

  render(root) {
    root.innerHTML = `
      <div class="view-head"><div><h1>Store</h1><p class="muted">Koop packs of zoek gericht naar spelers op de transfermarkt.</p></div>
      <div class="tabs"><button class="tab ${Store.tab === 'packs' ? 'on' : ''}" data-t="packs">Packs</button><button class="tab ${Store.tab === 'market' ? 'on' : ''}" data-t="market">Transfermarkt</button></div></div>
      <div id="storeBody"></div>`;
    root.querySelectorAll('[data-t]').forEach((b) => { b.onclick = () => { Store.tab = b.dataset.t; SFX.click(); Store.render(root); }; });
    const body = root.querySelector('#storeBody');
    if (Store.tab === 'packs') Store.renderPacks(body); else Store.renderMarket(body);
  },

  renderPacks(body) {
    body.innerHTML = `<div class="store-grid">${STORE_ORDER.map((id) => {
      const P = PACKS[id];
      const afford = S.d.coins >= P.price;
      return `<div class="store-item">
        <div class="si-art">${Packs.art(id, 'md')}</div>
        <div class="si-info"><h3>${P.name}</h3><p>${P.desc}</p>
          <button class="link" data-odds="${id}">Kansen bekijken</button></div>
        <div class="si-price ${afford ? '' : 'no'}"><span class="coin-ic"></span>${U.fmt(P.price)}</div>
        <div class="si-btns"><button class="btn primary" data-open="${id}" ${afford ? '' : 'disabled'}>Kopen & openen</button><button class="btn ghost sm" data-buy="${id}" ${afford ? '' : 'disabled'}>Bewaren</button></div>
      </div>`;
    }).join('')}</div>`;
    body.querySelectorAll('[data-open]').forEach((b) => { b.onclick = () => Packs.buy(b.dataset.open, true); });
    body.querySelectorAll('[data-buy]').forEach((b) => { b.onclick = () => Packs.buy(b.dataset.buy, false); });
    body.querySelectorAll('[data-odds]').forEach((b) => {
      b.onclick = () => {
        const id = b.dataset.odds;
        const o = Store.oddsCache[id] || (Store.oddsCache[id] = Packs.odds(id));
        const W = PACKS[id].w; const tot = Object.values(W).reduce((a, c) => a + c, 0);
        const nm = { b: 'Brons', br: 'Zeldzaam brons', s: 'Zilver', sr: 'Zeldzaam zilver', g: 'Goud', gr: 'Zeldzaam goud', gr83: 'Zeldzaam goud 83+', if: 'In-Form', hero: 'Held', icon: 'Legende' };
        U.modal(`<h2>Kansen — ${PACKS[id].name}</h2>
          ${PACKS[id].guar.length ? `<p><b>Gegarandeerd:</b> ${PACKS[id].guar.map((g) => nm[g]).join(', ')}</p>` : ''}
          <p class="muted">Overige plekken, per speler:</p>
          <div class="odds">${Object.entries(W).map(([k, w]) => `<div><span>${nm[k]}</span><b>${((w / tot) * 100).toFixed(1)}%</b></div>`).join('')}</div>
          <p class="muted">Per pack: <b>${o.w84.toFixed(1)}%</b> kans op een 84+ speler · <b>${o.special.toFixed(1)}%</b> kans op In-Form/Held/Legende.</p>`, { cls: 'small' });
      };
    });
  },

  /* ---- Transfermarkt ---- */
  ensureMarket(force) {
    const mk = S.d.market;
    if (!force && mk && Date.now() - mk.at < 10 * 60 * 1000 && mk.listings.length) return;
    const pool = DB_LIST.filter((c) => c.type !== 'icon' || Math.random() < 0.3);
    const listings = [];
    const used = new Set();
    while (listings.length < 30) {
      const c = U.wpick(pool, (x) => (x.type === 'gold' ? (x.r >= 84 ? 0.4 : 1.6) : x.type === 'silver' ? 0.9 : x.type === 'bronze' ? 0.5 : 0.25));
      if (used.has(c.id)) continue;
      used.add(c.id);
      listings.push({ id: c.id, price: Math.round((Cards.value(c) * U.rf(1.0, 1.3)) / 50) * 50 || 50 });
    }
    S.d.market = { at: Date.now(), listings };
    S.save();
  },

  mf: { q: '', pos: '', tier: '', sort: 'rt' },

  renderMarket(body) {
    Store.ensureMarket();
    const f = Store.mf;
    let list = S.d.market.listings.map((l) => ({ ...l, c: DB[l.id] }));
    if (f.q) list = list.filter((l) => (l.c.first + ' ' + l.c.last).toLowerCase().includes(f.q));
    if (f.pos) list = list.filter((l) => POS_GROUP[l.c.pos] === f.pos);
    if (f.tier) list = list.filter((l) => (f.tier === 'special' ? ['inform', 'hero', 'icon'].includes(l.c.type) : l.c.type === f.tier));
    list.sort((a, b) => (f.sort === 'rt' ? b.c.r - a.c.r : f.sort === 'lo' ? a.price - b.price : b.price - a.price));
    const left = Math.max(0, 10 * 60 - Math.floor((Date.now() - S.d.market.at) / 1000));
    body.innerHTML = `
      <div class="filters bar">
        <input class="input" id="mq" placeholder="Zoek speler…" value="${U.esc(f.q)}">
        <select class="input" id="mpos"><option value="">Alle posities</option><option value="GK">Keepers</option><option value="DEF">Verdedigers</option><option value="MID">Middenvelders</option><option value="ATT">Aanvallers</option></select>
        <select class="input" id="mtier"><option value="">Alle kaarten</option><option value="bronze">Brons</option><option value="silver">Zilver</option><option value="gold">Goud</option><option value="special">Speciaal</option></select>
        <select class="input" id="msort"><option value="rt">Beoordeling</option><option value="lo">Prijs laag-hoog</option><option value="hi">Prijs hoog-laag</option></select>
        <button class="btn ghost sm" id="mref">↻ Nieuwe aanbiedingen (250)</button>
        <span class="muted small">Gratis verversing over ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</span>
      </div>
      <div class="market-grid">${list.map((l) => {
        const owned = S.has(l.id);
        return `<div class="mk-item ${owned ? 'owned' : ''}">${Cards.html(l.c, { size: 'md' })}
          <div class="mk-price"><span class="coin-ic"></span>${U.fmt(l.price)}</div>
          <button class="btn ${owned ? 'ghost' : 'primary'} sm" data-buyp="${l.id}" ${owned ? 'disabled' : ''}>${owned ? 'Al in bezit' : 'Kopen'}</button></div>`;
      }).join('') || '<p class="muted">Geen spelers gevonden met deze filters.</p>'}</div>`;
    body.querySelector('#mpos').value = f.pos; body.querySelector('#mtier').value = f.tier; body.querySelector('#msort').value = f.sort;
    body.querySelector('#mq').oninput = (e) => { f.q = e.target.value.toLowerCase().trim(); clearTimeout(Store._t); Store._t = setTimeout(() => { Store.renderMarket(body); const i = body.querySelector('#mq'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 250); };
    body.querySelector('#mpos').onchange = (e) => { f.pos = e.target.value; Store.renderMarket(body); };
    body.querySelector('#mtier').onchange = (e) => { f.tier = e.target.value; Store.renderMarket(body); };
    body.querySelector('#msort').onchange = (e) => { f.sort = e.target.value; Store.renderMarket(body); };
    body.querySelector('#mref').onclick = () => { if (!S.spend(250)) return; Store.ensureMarket(true); SFX.whoosh(); Store.renderMarket(body); };
    body.querySelectorAll('.mk-item .card').forEach((el) => { el.onclick = () => Cards.detail(DB[el.dataset.id], [{ label: 'Sluiten', cls: 'ghost', fn: (m) => m.close() }]); });
    body.querySelectorAll('[data-buyp]').forEach((b) => {
      b.onclick = async () => {
        const l = S.d.market.listings.find((x) => x.id === b.dataset.buyp);
        const c = DB[l.id];
        if (!(await U.confirm('Speler kopen?', `${c.r} ${U.esc(c.first)} ${U.esc(c.last)} voor <b class="coins-txt">${U.fmt(l.price)}</b> munten.`, 'Kopen'))) return;
        if (!S.spend(l.price)) return;
        S.own(l.id);
        S.d.market.listings = S.d.market.listings.filter((x) => x.id !== l.id);
        S.save();
        SFX.coin(); SFX.shimmer();
        U.toast(`<b>${U.esc(c.name)}</b> is toegevoegd aan je club!`, 'ok');
        Store.renderMarket(body);
      };
    });
  },

  /* ---- Mijn packs ---- */
  renderMyPacks(root) {
    const counts = {};
    S.d.packs.forEach((p) => { counts[p] = (counts[p] || 0) + 1; });
    const ids = STORE_ORDER.filter((p) => counts[p]);
    root.innerHTML = `
      <div class="view-head"><div><h1>Mijn packs</h1><p class="muted">${S.d.packs.length ? `${S.d.packs.length} ongeopende pack(s). Veel succes!` : 'Je hebt geen ongeopende packs. Verdien ze in wedstrijden of koop ze in de store.'}</p></div>
      ${S.d.packs.length ? '' : '<button class="btn primary" onclick="App.go(\'store\')">Naar de store →</button>'}</div>
      <div class="mypacks">${ids.map((id) => `
        <div class="mp-item" data-p="${id}">${Packs.art(id, 'md')}${counts[id] > 1 ? `<span class="mp-count">×${counts[id]}</span>` : ''}<button class="btn primary">Openen</button></div>`).join('')}</div>`;
    root.querySelectorAll('.mp-item').forEach((el) => {
      el.onclick = () => { SFX.click(); Packs.openFromInventory(S.d.packs.indexOf(el.dataset.p)); };
    });
  },
};
