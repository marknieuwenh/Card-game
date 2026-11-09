/* ===== App: navigatie, home, club & opstart ===== */
const VIEWS = {
  home: { label: 'Home', ic: '🏠', render: (r) => App.renderHome(r) },
  squad: { label: 'Selectie', ic: '📋', render: (r) => Squad.render(r) },
  club: { label: 'Club', ic: '🗂️', render: (r) => App.renderClub(r) },
  play: { label: 'Spelen', ic: '⚽', render: (r) => Modes.render(r) },
  store: { label: 'Store', ic: '🛒', render: (r) => Store.render(r) },
  packs: { label: 'Packs', ic: '🎁', render: (r) => Store.renderMyPacks(r) },
  sbc: { label: 'Uitdagingen', ic: '🧩', render: (r) => SBC.render(r), hidden: true },
  divisions: { label: 'Divisies', render: (r) => Modes.renderDivisions(r), hidden: true },
  tournaments: { label: 'Toernooien', render: (r) => Modes.renderTournaments(r), hidden: true },
};
const NAV_PARENT = { divisions: 'play', tournaments: 'play', sbc: 'play' };

const App = {
  view: 'home',

  init() {
    U.$('#app').innerHTML = `
      <header class="topbar">
        <div class="logo" onclick="App.go('home')"><span class="logo-mark">UE</span><span class="logo-txt">ULTIMATE <b>ELFTAL</b></span></div>
        <nav class="nav">${Object.entries(VIEWS).filter(([, v]) => !v.hidden).map(([k, v]) => `<button class="nav-b" data-v="${k}"><span class="nic">${v.ic}</span><span class="nl">${v.label}</span><em class="nbadge" id="nb-${k}"></em></button>`).join('')}</nav>
        <div class="top-right">
          <div class="coins" id="coins" title="Munten"><span class="coin-ic"></span><b id="coinTxt">0</b></div>
          <button class="icon-btn" id="sndBtn" title="Geluid">🔊</button>
          <button class="icon-btn" id="setBtn" title="Instellingen">⚙️</button>
        </div>
      </header>
      <main id="view" class="view"></main>`;
    U.$$('.nav-b').forEach((b) => { b.onclick = () => { SFX.click(); App.go(b.dataset.v); }; });
    U.$('#sndBtn').onclick = () => { S.d.settings.sound = !S.d.settings.sound; SFX.on = S.d.settings.sound; S.save(); App.updateSound(); SFX.click(); };
    U.$('#setBtn').onclick = () => App.settings();
    document.addEventListener('pointerdown', () => SFX.init(), { once: true });

    if (!S.load()) return App.onboarding();
    App.start();
  },

  start() {
    SFX.on = S.d.settings.sound !== false;
    S.ensureObjectives();
    U.$('#coinTxt').textContent = U.fmt(S.d.coins);
    App.updateSound();
    App.updateBadges();
    const h = location.hash.replace('#', '');
    App.go(VIEWS[h] ? h : 'home');
    window.addEventListener('hashchange', () => { const v = location.hash.replace('#', ''); if (VIEWS[v] && v !== App.view) App.go(v); });
  },

  go(v) {
    App.view = v;
    if (location.hash !== '#' + v) history.replaceState(null, '', '#' + v);
    U.$$('.nav-b').forEach((b) => b.classList.toggle('on', b.dataset.v === (NAV_PARENT[v] || v)));
    const root = U.$('#view');
    root.classList.remove('enter'); void root.offsetWidth; root.classList.add('enter');
    VIEWS[v].render(root);
    window.scrollTo({ top: 0 });
  },
  refresh() { if (S.d) { const y = window.scrollY; VIEWS[App.view].render(U.$('#view')); window.scrollTo({ top: y }); App.updateBadges(); } },

  updateCoins(before) {
    const el = U.$('#coinTxt');
    if (!el) return;
    U.countUp(el, before ?? S.d.coins, S.d.coins);
    const box = U.$('#coins');
    box.classList.remove('bump', 'down'); void box.offsetWidth;
    box.classList.add(before !== undefined && S.d.coins < before ? 'down' : 'bump');
  },
  updateBadges() {
    if (!S.d) return;
    const nb = U.$('#nb-packs');
    if (nb) { nb.textContent = S.d.packs.length || ''; nb.classList.toggle('show', S.d.packs.length > 0); }
    const claim = S.d.objectives ? S.d.objectives.list.filter((o) => o.prog >= o.goal && !o.claimed).length + (App.giftReady() ? 1 : 0) : 0;
    const nh = U.$('#nb-home');
    if (nh) { nh.textContent = claim || ''; nh.classList.toggle('show', claim > 0); }
  },
  updateSound() { U.$('#sndBtn').textContent = S.d.settings.sound !== false ? '🔊' : '🔇'; },

  myBadge() {
    const name = (S.d && S.d.clubName) || 'Club';
    const short = name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, '').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 3).toUpperCase() || 'UE';
    return `<svg class="badge" viewBox="0 0 40 46"><defs><linearGradient id="myb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3ef0c4"/><stop offset="1" stop-color="#0b6e8a"/></linearGradient></defs><path d="M20 2 37 8v14c0 11-7 18-17 22C10 40 3 33 3 22V8z" fill="url(#myb)" stroke="#0a1628" stroke-width="1.6"/><path d="M20 8l2.4 5 5.6.5-4.3 3.7 1.3 5.4L20 19.8l-5 2.8 1.3-5.4L12 13.5l5.6-.5z" fill="#0a1628" opacity=".8"/><rect x="7" y="26" width="26" height="10" rx="2" fill="#0a1628"/><text x="20" y="34" text-anchor="middle" font-size="8" font-weight="800" fill="#3ef0c4" font-family="Barlow Condensed, Arial Narrow, sans-serif">${U.esc(short)}</text></svg>`;
  },

  /* ---------- Onboarding ---------- */
  onboarding() {
    const back = document.createElement('div');
    back.className = 'onboard';
    back.innerHTML = `
      <div class="ob-box">
        <div class="ob-cards">${['i', 'h', 'p'].map((pre, k) => { const c = DB_LIST.filter((x) => x.id.startsWith(pre) && x.r >= 86)[k * 3] || DB_LIST[k]; return Cards.html(c, { size: 'md', cls: 'ob-c' + k }); }).join('')}</div>
        <h1 class="ob-title">ULTIMATE <b>ELFTAL</b></h1>
        <p class="ob-sub">Open packs, verzamel spelers, bouw je droomteam en domineer de competitie.</p>
        <label class="lbl">Hoe heet jouw club?</label>
        <input class="input big" id="obName" maxlength="22" placeholder="Bijv. FC Oranjeboven" value="">
        <button class="btn primary big" id="obGo">Start je avontuur →</button>
        <p class="muted small">Je krijgt 10.000 munten, een startersteam en 2 welkomstpacks.</p>
      </div>`;
    document.body.appendChild(back);
    const go = () => {
      const name = U.$('#obName').value.trim() || 'FC Ultimate';
      SFX.init(); SFX.fanfare();
      S.d = S.fresh(name);
      App.giveStarter();
      S.save();
      back.classList.add('out');
      setTimeout(() => back.remove(), 500);
      App.start();
      setTimeout(() => U.toast('Welkom! Open je <b>welkomstpacks</b> via “Packs” 🎁', 'ok', 4500), 600);
    };
    U.$('#obGo').onclick = go;
    U.$('#obName').onkeydown = (e) => { if (e.key === 'Enter') go(); };
    setTimeout(() => U.$('#obName').focus(), 100);
  },

  giveStarter() {
    // Startersteam: brons/zilver spelers uit één competitie voor wat chemie
    const lg = U.pick(LEAGUES);
    const slots = Squad.slots('4-3-3');
    const used = new Set();
    const pickFor = (pos, filter) => {
      const cands = DB_LIST.filter((c) => c.type !== 'inform' && c.type !== 'hero' && c.type !== 'icon' && c.pos === pos && !used.has(c.base) && filter(c));
      const c = U.pick(cands);
      if (c) { used.add(c.base); S.own(c.id); }
      return c;
    };
    slots.forEach((s, i) => {
      const c = pickFor(s.pos, (x) => x.league === lg.id && x.r >= 60 && x.r <= 70) || pickFor(s.pos, (x) => x.r >= 58 && x.r <= 70);
      S.d.squad.slots[i] = c ? c.id : null;
    });
    ['GK', 'CB', 'CM', 'ST', 'RW', 'LB', 'CAM'].forEach((p) => pickFor(p, (x) => x.r >= 55 && x.r <= 68));
    S.d.packs = ['gold', 'premium'];
  },

  /* ---------- Home ---------- */
  giftReady() { return S.d && Date.now() - (S.d.giftAt || 0) >= 4 * 3600 * 1000; },

  renderHome(root) {
    S.ensureObjectives();
    const st = S.d.stats;
    const team = Match.teamFromSquad();
    const top = S.ownedCards().sort((a, b) => Packs.rank(b) - Packs.rank(a)).slice(0, 5);
    const best = st.bestPull ? DB[st.bestPull] : null;
    const giftLeft = Math.max(0, 4 * 3600 * 1000 - (Date.now() - (S.d.giftAt || 0)));
    root.innerHTML = `
      <section class="hero">
        <div class="hero-l">
          <div class="hero-badge">${App.myBadge()}</div>
          <div><div class="lbl">Jouw club</div><h1 class="hero-name">${U.esc(S.d.clubName)}</h1>
          <div class="hero-meta"><span>Beoordeling <b>${team.rating}</b></span><span>Chemie <b>${team.chem}/33</b></span><span>Divisie <b>${S.d.division.level}</b></span><span>🏆 <b>${st.trophies}</b></span></div></div>
        </div>
        <div class="hero-cta">
          <button class="btn primary big" onclick="App.go('play')">⚽ Spelen</button>
          <button class="btn gold big" onclick="App.go('${S.d.packs.length ? 'packs' : 'store'}')">🎁 ${S.d.packs.length ? `Open packs (${S.d.packs.length})` : 'Packs kopen'}</button>
        </div>
      </section>

      <div class="home-grid">
        <div class="panel">
          <div class="panel-h"><h3>Dagelijkse doelen</h3><span class="muted small">vernieuwt elke dag</span></div>
          <div class="objectives">${S.d.objectives.list.map((o, i) => {
            const done = o.prog >= o.goal;
            const rw = o.reward.coins ? `<span class="coin-ic"></span>${U.fmt(o.reward.coins)}` : `🎁 ${PACKS[o.reward.pack].name}`;
            return `<div class="obj ${o.claimed ? 'claimed' : done ? 'done' : ''}"><div class="obj-t"><b>${o.txt}</b><span>${rw}</span></div>
              <div class="obj-bar"><i style="width:${(o.prog / o.goal) * 100}%"></i></div>
              <div class="obj-f"><span>${o.prog}/${o.goal}</span>${o.claimed ? '<em>✓ Geclaimd</em>' : done ? `<button class="btn primary sm" data-claim="${i}">Claimen</button>` : ''}</div></div>`;
          }).join('')}</div>
        </div>

        <div class="panel gift ${App.giftReady() ? 'ready' : ''}">
          <div class="panel-h"><h3>Gratis cadeau</h3></div>
          <div class="gift-box">🎁</div>
          ${App.giftReady() ? '<button class="btn gold" id="giftBtn">Open je cadeau!</button>' : `<p class="muted">Volgende cadeau over <b>${Math.floor(giftLeft / 3600000)}u ${Math.floor((giftLeft % 3600000) / 60000)}m</b></p>`}
        </div>

        <div class="panel stats-p">
          <div class="panel-h"><h3>Statistieken</h3></div>
          <div class="stat-grid">
            <div><b>${st.played}</b><span>Gespeeld</span></div><div><b>${st.won}</b><span>Gewonnen</span></div>
            <div><b>${st.drawn}</b><span>Gelijk</span></div><div><b>${st.lost}</b><span>Verloren</span></div>
            <div><b>${st.gf}</b><span>Voor</span></div><div><b>${st.ga}</b><span>Tegen</span></div>
            <div><b>${st.packsOpened}</b><span>Packs</span></div><div><b>${S.d.owned.length}</b><span>Spelers</span></div>
          </div>
        </div>

        <div class="panel wide-p">
          <div class="panel-h"><h3>Topspelers in je club</h3><button class="link" onclick="App.go('club')">Hele club →</button></div>
          <div class="card-row">${top.map((c) => Cards.html(c, { size: 'md' })).join('')}</div>
        </div>

        ${best ? `<div class="panel best-p"><div class="panel-h"><h3>Beste pack-trekking</h3></div><div class="center">${Cards.html(best, { size: 'md' })}</div></div>` : ''}
      </div>`;
    root.querySelectorAll('[data-claim]').forEach((b) => {
      b.onclick = () => {
        const o = S.d.objectives.list[+b.dataset.claim];
        if (o.claimed || o.prog < o.goal) return;
        o.claimed = true;
        if (o.reward.coins) { S.addCoins(o.reward.coins); SFX.coin(); }
        if (o.reward.pack) { S.addPack(o.reward.pack); SFX.shimmer(); }
        S.save();
        U.toast(`Beloning geclaimd: ${o.reward.coins ? U.fmt(o.reward.coins) + ' munten' : PACKS[o.reward.pack].name}`, 'ok');
        App.refresh();
      };
    });
    const gb = root.querySelector('#giftBtn');
    if (gb) gb.onclick = () => {
      S.d.giftAt = Date.now();
      const roll = Math.random();
      let msg;
      if (roll < 0.5) { const n = U.pick([1000, 1500, 2000, 2500, 5000]); S.addCoins(n); msg = `<span class="coin-ic"></span> <b>${U.fmt(n)}</b> munten`; SFX.coin(); }
      else { const p = roll < 0.8 ? 'silver' : roll < 0.96 ? 'gold' : 'premium'; S.addPack(p); msg = `🎁 <b>${PACKS[p].name}</b>`; }
      S.save();
      SFX.fanfare(); U.confetti();
      const m = U.modal(`<div class="center"><div class="big-emoji">🎉</div><h2>Je cadeau</h2><p class="lead">${msg}</p><div class="modal-actions"><button class="btn primary" id="gOk">Top!</button></div></div>`, { cls: 'small' });
      m.querySelector('#gOk').onclick = () => m.close();
      App.refresh();
    };
    root.querySelectorAll('.card[data-id]').forEach((el) => { el.onclick = () => App.cardActions(el.dataset.id); });
  },

  /* ---------- Club ---------- */
  cf: { q: '', pos: '', tier: '', sort: 'rt', league: '' },

  renderClub(root) {
    const f = App.cf;
    let list = S.ownedCards();
    const total = list.length;
    if (f.q) list = list.filter((c) => (c.first + ' ' + c.last).toLowerCase().includes(f.q));
    if (f.pos) list = list.filter((c) => POS_GROUP[c.pos] === f.pos);
    if (f.tier) list = list.filter((c) => (f.tier === 'special' ? ['inform', 'hero', 'icon'].includes(c.type) : c.type === f.tier));
    if (f.league) list = list.filter((c) => c.league === f.league);
    list.sort((a, b) => (f.sort === 'rt' ? b.r - a.r : f.sort === 'val' ? Cards.value(b) - Cards.value(a) : f.sort === 'pos' ? POS_ORDER.indexOf(a.pos) - POS_ORDER.indexOf(b.pos) || b.r - a.r : a.r - b.r));
    const inSquad = new Set(S.d.squad.slots.filter(Boolean));
    const worth = S.ownedCards().reduce((s, c) => s + Cards.value(c), 0);
    root.innerHTML = `
      <div class="view-head"><div><h1>Club</h1><p class="muted">${total} spelers · totale waarde <b class="coins-txt">${U.fmt(worth)}</b></p></div></div>
      <div class="filters bar">
        <input class="input" id="cq" placeholder="Zoek speler…" value="${U.esc(f.q)}">
        <select class="input" id="cpos"><option value="">Alle posities</option><option value="GK">Keepers</option><option value="DEF">Verdedigers</option><option value="MID">Middenvelders</option><option value="ATT">Aanvallers</option></select>
        <select class="input" id="ctier"><option value="">Alle kaarten</option><option value="bronze">Brons</option><option value="silver">Zilver</option><option value="gold">Goud</option><option value="special">Speciaal</option></select>
        <select class="input" id="clg"><option value="">Alle competities</option>${LEAGUES.map((l) => `<option value="${l.id}">${l.name}</option>`).join('')}</select>
        <select class="input" id="csort"><option value="rt">Hoogste beoordeling</option><option value="low">Laagste beoordeling</option><option value="val">Waarde</option><option value="pos">Positie</option></select>
      </div>
      <div class="club-grid">${list.map((c) => `<div class="club-item">${Cards.html(c, { size: 'md' })}${inSquad.has(c.id) ? '<span class="pick-tag">In selectie</span>' : ''}</div>`).join('') || '<p class="muted">Geen spelers gevonden.</p>'}</div>`;
    U.$('#cpos').value = f.pos; U.$('#ctier').value = f.tier; U.$('#csort').value = f.sort; U.$('#clg').value = f.league;
    U.$('#cq').oninput = (e) => { f.q = e.target.value.toLowerCase().trim(); clearTimeout(App._t); App._t = setTimeout(() => { App.renderClub(root); const i = U.$('#cq'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 250); };
    U.$('#cpos').onchange = (e) => { f.pos = e.target.value; App.renderClub(root); };
    U.$('#ctier').onchange = (e) => { f.tier = e.target.value; App.renderClub(root); };
    U.$('#clg').onchange = (e) => { f.league = e.target.value; App.renderClub(root); };
    U.$('#csort').onchange = (e) => { f.sort = e.target.value; App.renderClub(root); };
    root.querySelectorAll('.club-item .card').forEach((el) => { el.onclick = () => { SFX.click(); App.cardActions(el.dataset.id); }; });
  },

  cardActions(id) {
    const c = DB[id];
    if (!S.has(id)) { Cards.detail(c, [{ label: 'Sluiten', cls: 'ghost', fn: (m) => m.close() }]); return; }
    Cards.detail(c, [
      { label: '📋 In selectie plaatsen', cls: 'primary', fn: (m) => { m.close(); Squad.placeCard(id); } },
      { label: `💰 Verkopen (${U.fmt(Cards.sellPrice(c))})`, cls: 'gold', fn: async (m) => {
        if (!(await U.confirm('Speler verkopen?', `Verkoop ${U.esc(c.first)} ${U.esc(c.last)} op de transfermarkt voor <b class="coins-txt">${U.fmt(Cards.sellPrice(c))}</b> munten (na 5% belasting).`, 'Verkopen'))) return;
        S.remove(id); S.addCoins(Cards.sellPrice(c)); S.save(); SFX.coin();
        U.toast(`${U.esc(c.name)} verkocht voor ${U.fmt(Cards.sellPrice(c))} munten`, 'ok');
        m.close(); App.refresh();
      } },
      { label: 'Sluiten', cls: 'ghost', fn: (m) => m.close() },
    ]);
  },

  settings() {
    SFX.click();
    const m = U.modal(`<h2>Instellingen</h2>
      <label class="lbl">Clubnaam</label><input class="input" id="sName" maxlength="22" value="${U.esc(S.d.clubName)}">
      <div class="modal-actions left"><button class="btn primary" id="sSave">Opslaan</button></div>
      <hr><h3>Spel resetten</h3><p class="muted">Begin helemaal opnieuw. Al je spelers, munten en voortgang gaan verloren.</p>
      <button class="btn danger" id="sReset">Alles resetten</button>
      <hr><p class="muted small">Ultimate Elftal is een fanproject. Alle spelers, clubs en competities zijn fictief.</p>`, { cls: 'small' });
    m.querySelector('#sSave').onclick = () => { S.d.clubName = m.querySelector('#sName').value.trim() || S.d.clubName; S.save(); m.close(); App.refresh(); U.toast('Opgeslagen', 'ok'); };
    m.querySelector('#sReset').onclick = async () => { if (await U.confirm('Weet je het zeker?', 'Dit kan niet ongedaan worden gemaakt.', 'Ja, reset alles')) S.reset(); };
  },
};

window.addEventListener('DOMContentLoaded', () => App.init());
