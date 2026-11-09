/* ===== Spelmodi: Snelle wedstrijd, Divisies, Toernooien ===== */
const DIFFICULTIES = [
  { id: 'beg', name: 'Beginner', rating: 60, win: 400, color: '#22c55e' },
  { id: 'ama', name: 'Amateur', rating: 67, win: 700, color: '#84cc16' },
  { id: 'semi', name: 'Semi-Pro', rating: 73, win: 1100, color: '#eab308' },
  { id: 'pro', name: 'Profi', rating: 78, win: 1700, color: '#f97316' },
  { id: 'wk', name: 'Wereldklasse', rating: 83, win: 2600, color: '#ef4444' },
  { id: 'leg', name: 'Legendarisch', rating: 87, win: 3800, color: '#a855f7' },
  { id: 'ult', name: 'Ultiem', rating: 90, win: 5500, color: '#e8c76a' },
];

const CUPS = [
  { id: 'reg', name: 'Regionale Beker', fee: 1000, ratings: [64, 68, 71, 74], rewards: [{ coins: 300 }, { coins: 900 }, { coins: 2000, packs: ['silver'] }, { coins: 3500, packs: ['gold'] }, { coins: 6000, packs: ['premium'] }], color: '#22c55e' },
  { id: 'nat', name: 'Nationale Beker', fee: 3500, ratings: [74, 77, 80, 82], rewards: [{ coins: 800 }, { coins: 2500 }, { coins: 5000, packs: ['gold'] }, { coins: 8000, packs: ['premium'] }, { coins: 15000, packs: ['mega'] }], color: '#3b82f6' },
  { id: 'cont', name: 'Continentale Cup', fee: 9000, ratings: [81, 84, 86, 88], rewards: [{ coins: 2000 }, { coins: 6000 }, { coins: 12000, packs: ['premium'] }, { coins: 20000, packs: ['mega'] }, { coins: 35000, packs: ['mega', 'inform'] }], color: '#a855f7' },
  { id: 'world', name: 'Wereldbeker der Clubs', fee: 20000, ratings: [86, 88, 90, 92], rewards: [{ coins: 4000 }, { coins: 12000 }, { coins: 25000, packs: ['mega'] }, { coins: 45000, packs: ['inform'] }, { coins: 80000, packs: ['ultimate', 'hero'] }], color: '#e8c76a' },
];
const ROUND_NAMES = ['Achtste finale', 'Kwartfinale', 'Halve finale', 'Finale'];

const Modes = {
  needSquad() {
    if (!Squad.full()) {
      SFX.error();
      U.confirm('Selectie niet compleet', 'Je hebt 11 spelers nodig om te spelen. Wil je automatisch je beste elftal opstellen?', 'Automatisch opstellen').then((ok) => {
        if (ok) { Squad.autoFill(); App.refresh(); U.toast('Elftal opgesteld — je kunt nu spelen!', 'ok'); }
      });
      return false;
    }
    return true;
  },

  render(root) {
    const div = S.d.division;
    const t = S.d.tournament;
    const team = Match.teamFromSquad();
    root.innerHTML = `
      <div class="view-head"><div><h1>Spelen</h1><p class="muted">Jouw team: <b>${team.rating}</b> beoordeling · <b>${team.chem}</b> chemie</p></div></div>
      <div class="mode-grid">
        <div class="mode-card m-quick" data-go="quick">
          <div class="mc-ic">⚡</div><h2>Snelle wedstrijd</h2><p>Kies een tegenstander en niveau. Hoe moeilijker, hoe meer munten.</p>
          <div class="mc-foot">Tot ${U.fmt(DIFFICULTIES[DIFFICULTIES.length - 1].win)} munten per zege</div>
        </div>
        <div class="mode-card m-div" data-go="div">
          <div class="mc-ic">🏆</div><h2>Divisies</h2><p>Klim van Divisie 10 naar de top. Seizoenen van 7 wedstrijden met promotie & degradatie.</p>
          <div class="mc-foot">Nu: <b>Divisie ${div.level}</b> · ${div.season.pts} pnt (${div.season.played}/7)</div>
        </div>
        <div class="mode-card m-cup" data-go="cup">
          <div class="mc-ic">🥇</div><h2>Toernooien</h2><p>Knock-out bekers met inleg. Overleef 4 rondes voor grote prijzen.</p>
          <div class="mc-foot">${t ? `Actief: <b>${CUPS.find((c) => c.id === t.cup).name}</b> — ${ROUND_NAMES[t.round]}` : 'Geen actief toernooi'}</div>
        </div>
        <div class="mode-card m-sbc" data-go="sbc">
          <div class="mc-ic">🧩</div><h2>Squad-uitdagingen</h2><p>Ruil spelers in voor packs door aan de eisen te voldoen.</p>
          <div class="mc-foot">${SBC.list.filter((s) => !S.d.sbcDone[s.id] || s.repeat).length} uitdagingen beschikbaar</div>
        </div>
      </div>`;
    root.querySelectorAll('[data-go]').forEach((el) => {
      el.onclick = () => {
        SFX.click();
        const go = el.dataset.go;
        if (go === 'quick') Modes.quick();
        else if (go === 'div') App.go('divisions');
        else if (go === 'cup') App.go('tournaments');
        else App.go('sbc');
      };
    });
  },

  /* ---------- Snelle wedstrijd ---------- */
  quick() {
    if (!Modes.needSquad()) return;
    const seedBase = Date.now() & 0xffff;
    const opps = DIFFICULTIES.map((d, i) => ({ d, team: Match.aiTeam(d.rating, seedBase + i * 97) }));
    const my = Squad.rating(S.d.squad.slots);
    const m = U.modal(`<h2>Snelle wedstrijd</h2><p class="muted">Jouw team: <b>${my}</b>. Kies een tegenstander.</p>
      <div class="opp-list">${opps.map((o, i) => `
        <button class="opp" data-i="${i}" style="--c:${o.d.color}">
          <div class="opp-badge">${o.team.badge}</div>
          <div class="opp-info"><b>${U.esc(o.team.name)}</b><span>${o.d.name} · ${o.team.formation}</span></div>
          <div class="opp-rt">${o.team.rating}</div>
          <div class="opp-rw"><span class="coin-ic"></span>${U.fmt(o.d.win)}</div>
        </button>`).join('')}</div>`, { cls: 'mid' });
    m.querySelectorAll('.opp').forEach((b) => {
      b.onclick = async () => {
        const o = opps[+b.dataset.i];
        m.close();
        await Match.play(o.team, {
          title: 'Snelle wedstrijd', subtitle: o.d.name,
          reward: (res) => {
            const base = res.result === 'W' ? o.d.win : res.result === 'D' ? Math.round(o.d.win * 0.4) : Math.round(o.d.win * 0.15);
            const coins = base + res.gf * 50 + (res.ga === 0 ? 100 : 0);
            const packs = res.result === 'W' && Math.random() < 0.15 + DIFFICULTIES.indexOf(o.d) * 0.04 ? [DIFFICULTIES.indexOf(o.d) >= 4 ? 'premium' : 'gold'] : [];
            return { coins, packs, lines: [`Doelpuntenbonus: ${res.gf} × 50`].concat(res.ga === 0 ? ['De nul gehouden: +100'] : []) };
          },
        });
        App.refresh();
      };
    });
  },

  /* ---------- Divisies ---------- */
  divRating(level) { return 60 + (10 - level) * 3.2; },
  divRewards(level, outcome) {
    const base = 800 + (10 - level) * 700;
    const coins = outcome === 'promo' ? base * 2 : outcome === 'stay' ? base : Math.round(base * 0.4);
    let packs = [];
    if (outcome !== 'releg') {
      if (level >= 8) packs = ['silver'];
      else if (level >= 5) packs = ['gold'];
      else if (level >= 3) packs = ['premium'];
      else packs = ['mega'];
      if (outcome === 'promo' && level <= 3) packs.push('premium');
      if (outcome === 'title') packs = ['mega', 'inform'];
    }
    return { coins: outcome === 'title' ? base * 3 : coins, packs };
  },

  renderDivisions(root) {
    const D = S.d.division, se = D.season;
    const promoPts = 13, relegPts = 5;
    const ladder = Array.from({ length: 10 }, (_, i) => 10 - i);
    root.innerHTML = `
      <div class="view-head"><div><h1>Divisies</h1><p class="muted">Seizoen van 7 wedstrijden · ${promoPts}+ punten = promotie · ${relegPts - 1} of minder = degradatie</p></div>
      <button class="btn ghost" onclick="App.go('play')">← Terug</button></div>
      <div class="div-wrap">
        <div class="panel div-main">
          <div class="div-badge lvl-${D.level}"><span>DIVISIE</span><b>${D.level}</b></div>
          <div class="div-progress">
            <div class="dp-head"><span>Punten dit seizoen</span><b>${se.pts}</b></div>
            <div class="dp-bar"><i style="width:${(se.pts / 21) * 100}%"></i><em class="mk releg" style="left:${(relegPts / 21) * 100}%"><span>Handhaving ${relegPts}</span></em><em class="mk promo" style="left:${(promoPts / 21) * 100}%"><span>${D.level === 1 ? 'Titel' : 'Promotie'} ${promoPts}</span></em></div>
            <div class="dp-results">${Array.from({ length: 7 }, (_, i) => { const r = se.results[i]; return `<i class="${r ? 'r-' + r.res : ''}" title="${r ? r.score : ''}">${r ? r.res.replace('W', 'W').replace('D', 'G').replace('L', 'V') : i + 1}</i>`; }).join('')}</div>
            <div class="muted small">W ${se.w} · G ${se.d} · V ${se.l} — gespeeld ${se.played}/7</div>
          </div>
          <div class="div-next">
            <div><div class="lbl">Tegenstanders in deze divisie</div><b>± ${Math.round(Modes.divRating(D.level))} beoordeling</b></div>
            <button class="btn primary big" id="divPlay">Speel wedstrijd ${se.played + 1}/7 ▶</button>
          </div>
          <div class="div-rw">
            <div><span class="lbl">Seizoensbeloning (handhaving)</span>${Modes.rwTxt(Modes.divRewards(D.level, 'stay'))}</div>
            <div><span class="lbl">${D.level === 1 ? 'Kampioen' : 'Promotie'}</span>${Modes.rwTxt(Modes.divRewards(D.level, D.level === 1 ? 'title' : 'promo'))}</div>
          </div>
        </div>
        <div class="panel ladder">${ladder.map((l) => `<div class="ld ${l === D.level ? 'cur' : ''} ${l >= D.level ? '' : 'locked'} ${l === D.best ? 'best' : ''}"><b>${l}</b><span>Divisie ${l}</span><em>${Math.round(Modes.divRating(l))}</em></div>`).join('')}
          <p class="muted small">Hoogst behaald: Divisie ${D.best} · Seizoenen: ${D.seasons}</p></div>
      </div>`;
    root.querySelector('#divPlay').onclick = () => Modes.playDivision();
  },

  rwTxt(rw) { return `<div class="rw-line"><span class="coin-ic"></span>${U.fmt(rw.coins)}${rw.packs.map((p) => ` + ${PACKS[p].name}`).join('')}</div>`; },

  async playDivision() {
    if (!Modes.needSquad()) return;
    const D = S.d.division;
    const opp = Match.aiTeam(Math.round(Modes.divRating(D.level) + U.gauss() * 1.5), Date.now() & 0xffffff, `${U.pick(AI_NAMES)}`);
    const res = await Match.play(opp, {
      title: `Divisie ${D.level}`, subtitle: `Wedstrijd ${D.season.played + 1}/7`,
      reward: (r) => ({ coins: (r.result === 'W' ? 500 : r.result === 'D' ? 250 : 100) + (10 - D.level) * 80, lines: [r.result === 'W' ? '+3 divisiepunten' : r.result === 'D' ? '+1 divisiepunt' : '0 divisiepunten'] }),
    });
    const se = D.season;
    se.played++;
    se.results.push({ res: res.result, score: `${res.gf}-${res.ga}` });
    if (res.result === 'W') { se.w++; se.pts += 3; } else if (res.result === 'D') { se.d++; se.pts += 1; } else se.l++;
    S.track('div');
    S.save();
    if (se.played >= 7) Modes.endSeason();
    App.refresh();
  },

  endSeason() {
    const D = S.d.division, se = D.season;
    let outcome = se.pts >= 13 ? (D.level === 1 ? 'title' : 'promo') : se.pts <= 4 && D.level < 10 ? 'releg' : 'stay';
    const rw = Modes.divRewards(D.level, outcome);
    const oldLvl = D.level;
    if (outcome === 'promo') D.level--;
    if (outcome === 'releg') D.level++;
    D.best = Math.min(D.best, D.level);
    D.seasons++;
    if (outcome === 'title') S.d.stats.trophies++;
    D.season = { played: 0, pts: 0, w: 0, d: 0, l: 0, results: [] };
    S.addCoins(rw.coins);
    rw.packs.forEach((p) => S.addPack(p));
    S.save();
    const txt = { promo: `🎉 PROMOTIE naar Divisie ${D.level}!`, title: '🏆 KAMPIOEN van Divisie 1!', stay: `Gehandhaafd in Divisie ${D.level}`, releg: `Gedegradeerd naar Divisie ${D.level}` }[outcome];
    const m = U.modal(`<div class="center"><div class="big-emoji">${outcome === 'promo' || outcome === 'title' ? '🏆' : outcome === 'stay' ? '🛡️' : '📉'}</div>
      <h2>Seizoen afgelopen</h2><p class="lead">${txt}</p><p class="muted">${se.pts} punten uit 7 wedstrijden in Divisie ${oldLvl}</p>
      <div class="me-rewards center">${Modes.rwTxt(rw)}</div>
      <div class="modal-actions"><button class="btn primary" id="okS">Geweldig!</button></div></div>`, { cls: 'small' });
    if (outcome === 'promo' || outcome === 'title') { SFX.fanfare(); U.confetti(); }
    m.querySelector('#okS').onclick = () => m.close();
  },

  /* ---------- Toernooien ---------- */
  renderTournaments(root) {
    const t = S.d.tournament;
    if (t) return Modes.renderActiveCup(root, t);
    root.innerHTML = `
      <div class="view-head"><div><h1>Toernooien</h1><p class="muted">Betaal de inleg, win 4 knock-outwedstrijden en pak de beker. Gelijkspel = strafschoppen.</p></div>
      <button class="btn ghost" onclick="App.go('play')">← Terug</button></div>
      <div class="cup-grid">${CUPS.map((c) => `
        <div class="cup-card" style="--c:${c.color}">
          <div class="cup-trophy">${Modes.trophySVG(c.color)}</div>
          <h2>${c.name}</h2>
          <div class="cup-meta"><span>Tegenstanders</span><b>${c.ratings[0]} → ${c.ratings[3]}</b></div>
          <div class="cup-meta"><span>Winnaar</span><b>${Modes.rwTxt({ coins: c.rewards[4].coins, packs: c.rewards[4].packs || [] })}</b></div>
          <button class="btn primary" data-cup="${c.id}">Inschrijven · <span class="coin-ic"></span>${U.fmt(c.fee)}</button>
        </div>`).join('')}</div>`;
    root.querySelectorAll('[data-cup]').forEach((b) => {
      b.onclick = () => {
        if (!Modes.needSquad()) return;
        const c = CUPS.find((x) => x.id === b.dataset.cup);
        if (!S.spend(c.fee)) return;
        SFX.coin();
        const seed = Date.now() & 0xffffff;
        S.d.tournament = { cup: c.id, round: 0, seed, opps: c.ratings.map((rt, i) => ({ name: U.pick(AI_NAMES, U.rng(seed + i * 31)), rt })), results: [] };
        S.save();
        U.toast(`Ingeschreven voor de <b>${c.name}</b>!`, 'ok');
        App.refresh();
      };
    });
  },

  trophySVG(color) {
    return `<svg viewBox="0 0 64 64"><path d="M20 8h24v12c0 9-5 16-12 16s-12-7-12-16z" fill="${color}"/><path d="M20 12h-8c0 8 4 12 9 13M44 12h8c0 8-4 12-9 13" fill="none" stroke="${color}" stroke-width="3"/><rect x="29" y="35" width="6" height="10" fill="${color}"/><rect x="22" y="45" width="20" height="6" rx="1" fill="${color}"/><rect x="18" y="51" width="28" height="5" rx="1" fill="${color}" opacity=".7"/><path d="M26 12v8c0 5 2 9 5 10" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"/></svg>`;
  },

  renderActiveCup(root, t) {
    const c = CUPS.find((x) => x.id === t.cup);
    root.innerHTML = `
      <div class="view-head"><div><h1>${c.name}</h1><p class="muted">Win elke ronde om door te gaan. Verlies = uitgeschakeld.</p></div>
      <button class="btn ghost" onclick="App.go('play')">← Terug</button></div>
      <div class="panel bracket">
        ${ROUND_NAMES.map((rn, i) => {
          const r = t.results[i];
          const st = r ? (r.result === 'W' ? 'won' : 'lost') : i === t.round ? 'cur' : 'todo';
          return `<div class="br-round ${st}"><div class="br-name">${rn}</div><div class="br-match"><span>${U.esc(S.d.clubName)}</span><b>${r ? r.score : 'vs'}</b><span>${U.esc(t.opps[i].name)} <em>${t.opps[i].rt}</em></span></div>
            <div class="br-rw">${Modes.rwTxt({ coins: c.rewards[i + 1].coins, packs: c.rewards[i + 1].packs || [] })}</div></div>`;
        }).join('<div class="br-arrow">›</div>')}
      </div>
      <div class="cup-actions">
        <button class="btn primary big" id="cupPlay">Speel ${ROUND_NAMES[t.round]} ▶</button>
        <button class="btn ghost" id="cupQuit">Toernooi verlaten (beloning ronde ${t.round} innen)</button>
      </div>`;
    root.querySelector('#cupPlay').onclick = () => Modes.playCup();
    root.querySelector('#cupQuit').onclick = async () => {
      if (await U.confirm('Toernooi verlaten?', `Je ontvangt de beloning voor ${t.round} gewonnen ronde(s) en het toernooi stopt.`, 'Verlaten')) Modes.endCup(false);
    };
  },

  async playCup() {
    if (!Modes.needSquad()) return;
    const t = S.d.tournament;
    const c = CUPS.find((x) => x.id === t.cup);
    const o = t.opps[t.round];
    const team = Match.aiTeam(o.rt, t.seed + t.round * 1009, o.name);
    const res = await Match.play(team, { title: c.name, subtitle: ROUND_NAMES[t.round], knockout: true, reward: (r) => ({ coins: 0, lines: [r.result === 'W' ? (t.round === 3 ? '🏆 Toernooi gewonnen!' : 'Door naar de volgende ronde!') : 'Uitgeschakeld…'] }) });
    t.results.push({ result: res.result, score: `${res.gf}-${res.ga}${res.pens ? ` (${res.pens.sc[0]}-${res.pens.sc[1]} ns)` : ''}` });
    if (res.result === 'W') { S.track('cup'); t.round++; }
    S.save();
    if (res.result !== 'W') Modes.endCup(false);
    else if (t.round >= 4) Modes.endCup(true);
    App.refresh();
  },

  endCup(champion) {
    const t = S.d.tournament;
    const c = CUPS.find((x) => x.id === t.cup);
    const wins = t.results.filter((r) => r.result === 'W').length;
    const rw = { coins: c.rewards[wins].coins, packs: c.rewards[wins].packs || [] };
    S.addCoins(rw.coins);
    rw.packs.forEach((p) => S.addPack(p));
    if (champion) S.d.stats.trophies++;
    S.d.tournament = null;
    S.save();
    const m = U.modal(`<div class="center"><div class="cup-trophy big">${Modes.trophySVG(champion ? c.color : '#64748b')}</div>
      <h2>${champion ? `Winnaar van de ${c.name}!` : 'Toernooi voorbij'}</h2>
      <p class="muted">${wins} van 4 rondes gewonnen</p>
      <div class="me-rewards center">${Modes.rwTxt(rw)}</div>
      <div class="modal-actions"><button class="btn primary" id="okC">Doorgaan</button></div></div>`, { cls: 'small' });
    if (champion) { SFX.fanfare(); SFX.cheer(); U.confetti(); }
    m.querySelector('#okC').onclick = () => m.close();
    App.refresh();
  },
};
