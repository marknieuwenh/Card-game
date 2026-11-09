/* ===== Wedstrijdsimulatie ===== */
const W_ATT = { ST: 3, LW: 2.2, RW: 2.2, CAM: 2, LM: 1.4, RM: 1.4, CM: 0.9, CDM: 0.3, LB: 0.4, RB: 0.4, CB: 0.1, GK: 0 };
const W_MID = { CM: 3, CDM: 2.5, CAM: 2.5, LM: 2, RM: 2, LW: 1, RW: 1, ST: 0.5, LB: 0.7, RB: 0.7, CB: 0.3, GK: 0 };
const W_DEF = { CB: 3, LB: 2, RB: 2, CDM: 2, CM: 0.7, LM: 0.4, RM: 0.4, CAM: 0.2, ST: 0.1, LW: 0.1, RW: 0.1, GK: 0 };
const W_SHOOT = { ST: 6, LW: 3.2, RW: 3.2, CAM: 3, LM: 2, RM: 2, CM: 1.4, CDM: 0.6, LB: 0.4, RB: 0.4, CB: 0.6, GK: 0 };
const W_ASSIST = { CAM: 4, CM: 3, LW: 3, RW: 3, LM: 3, RM: 3, ST: 1.6, CDM: 1.2, LB: 1.5, RB: 1.5, CB: 0.3, GK: 0.05 };

const MENTALITY = {
  park: { name: 'Bus parkeren', att: -7, def: 6, tempo: -0.08 },
  def: { name: 'Verdedigend', att: -3, def: 3, tempo: -0.04 },
  bal: { name: 'Gebalanceerd', att: 0, def: 0, tempo: 0 },
  att: { name: 'Aanvallend', att: 3, def: -3, tempo: 0.05 },
  allout: { name: 'Alles of niets', att: 6, def: -7, tempo: 0.09 },
};

const AI_NAMES = ['Stormvogels', 'Rode Leeuwen', 'Noorderlicht', 'Zilvermeeuwen', 'Oranjegarde', 'De Tijgers', 'Kustwacht United', 'IJzeren Wolven', 'Zwarte Zwanen', 'Vuurvogels', 'Groene Draken', 'Atlas FC', 'Titanen', 'Blauwe Haaien', 'Sterrenstad', 'Valkenburcht', 'Donderdal', 'Koningsvaart', 'Wilde Paarden', 'De Kanonnen', 'Gouden Arenden', 'Nachtwacht FC', 'Polarstern', 'Bergwind', 'Havenmeesters'];
const AI_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316', '#06b6d4', '#ec4899', '#64748b', '#14b8a6'];

const Match = {
  buildTeam(name, ids, formation, chemPer, extra = {}) {
    const slots = Squad.slots(formation);
    const players = slots.map((s, i) => {
      const c = ids[i] ? DB[ids[i]] : null;
      if (!c) return { c: null, pos: s.pos, eff: 30, chem: 0 };
      const fit = Squad.fits(c, s.pos);
      const chem = chemPer[i] || 0;
      let eff = fit ? c.r * (0.9 + 0.0334 * chem) : c.r * 0.78;
      if (s.pos === 'GK' && c.pos !== 'GK') eff = c.r * 0.45;
      if (s.pos !== 'GK' && c.pos === 'GK') eff = c.r * 0.5;
      return { c, pos: s.pos, eff, chem };
    });
    const wavg = (W, flavor) => {
      let s = 0, w = 0;
      players.forEach((p) => { const k = W[p.pos]; if (!k) return; let v = p.eff; if (p.c && p.c.pos !== 'GK') v += flavor(p.c) * (p.eff / p.c.r); s += v * k; w += k; });
      return w ? s / w : 30;
    };
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const att = wavg(W_ATT, (c) => (avg([c.stats[0], c.stats[1], c.stats[3]]) - c.r) * 0.25);
    const mid = wavg(W_MID, (c) => (avg([c.stats[2], c.stats[3]]) - c.r) * 0.25);
    const def = wavg(W_DEF, (c) => (avg([c.stats[4], c.stats[5]]) - c.r) * 0.25);
    const gkP = players[slots.findIndex((s) => s.pos === 'GK')];
    const gk = gkP ? gkP.eff : 30;
    return {
      name, players, att, mid, def, gk, formation,
      rating: Squad.rating(ids), chem: chemPer.reduce((a, b) => a + b, 0),
      color: extra.color || '#22d3ee', badge: extra.badge || '', short: extra.short || name.slice(0, 3).toUpperCase(), user: !!extra.user,
    };
  },

  teamFromSquad() {
    const sq = S.d.squad;
    const ch = Squad.chem(sq.slots);
    return Match.buildTeam(S.d.clubName, sq.slots, sq.formation, ch.per, { color: '#3ef0c4', user: true, badge: App.myBadge(), short: S.d.clubName.slice(0, 3).toUpperCase() });
  },

  aiTeam(target, seed, nameOverride) {
    const r = U.rng(seed);
    const formation = U.pick(Object.keys(FORMATIONS), r);
    const slots = Squad.slots(formation);
    const used = new Set();
    const pool = DB_LIST.filter((c) => c.type !== 'icon' || target >= 88);
    const ids = slots.map((s) => {
      const want = target + U.gauss(r) * 2.2;
      let cands = pool.filter((c) => c.pos === s.pos && !used.has(c.base) && Math.abs(c.r - want) <= 2.5);
      if (!cands.length) cands = pool.filter((c) => c.pos === s.pos && !used.has(c.base)).sort((a, b) => Math.abs(a.r - want) - Math.abs(b.r - want)).slice(0, 4);
      const c = U.pick(cands, r);
      used.add(c.base);
      return c.id;
    });
    const chem = slots.map(() => (r() < 0.75 ? 3 : 2));
    const name = nameOverride || U.pick(AI_NAMES, r);
    const color = U.pick(AI_COLORS, r);
    const t = Match.buildTeam(name, ids, formation, chem, { color, short: name.replace(/^(De|FC) /, '').slice(0, 3).toUpperCase() });
    t.badge = Match.aiBadge(t.short, color);
    return t;
  },

  aiBadge(short, color) {
    return `<svg class="badge" viewBox="0 0 40 46"><path d="M20 2 37 8v14c0 11-7 18-17 22C10 40 3 33 3 22V8z" fill="${color}" stroke="rgba(0,0,0,.4)" stroke-width="1.6"/><circle cx="20" cy="18" r="8" fill="rgba(255,255,255,.25)"/><rect x="7" y="25" width="26" height="10" rx="2" fill="rgba(0,0,0,.55)"/><text x="20" y="33" text-anchor="middle" font-size="8" font-weight="800" fill="#fff" font-family="Barlow Condensed, Arial Narrow, sans-serif">${U.esc(short)}</text></svg>`;
  },

  /* ---------- Simulatie-engine ---------- */
  Sim: class {
    constructor(home, away) {
      this.t = [home, away];
      this.score = [0, 0];
      this.st = [0, 1].map(() => ({ shots: 0, onT: 0, xg: 0, poss: 0, fouls: 0, yel: 0, red: 0, corners: 0 }));
      this.ment = ['bal', 'bal'];
      this.clock = 0; this.half = 1; this.done = false;
      this.st1 = U.ri(1, 3); this.st2 = U.ri(2, 6);
      this.perf = new Map();
      this.yellows = new Set();
      this.sentOff = new Set();
      this.goals = [];
      this.ball = 50;
      this.momentum = 0;
      this.t.forEach((t) => t.players.forEach((p) => { if (p.c) this.perf.set(p.c.id + '@' + t.name, { g: 0, a: 0, sv: 0 }); }));
    }
    pf(side, p) { return this.perf.get(p.c.id + '@' + this.t[side].name) || { g: 0, a: 0, sv: 0 }; }
    minuteLabel() {
      if (this.half === 1 && this.clock > 45) return `45+${this.clock - 45}'`;
      if (this.half === 2 && this.clock > 90) return `90+${this.clock - 90}'`;
      return `${this.clock}'`;
    }
    active(side) { return this.t[side].players.filter((p) => p.c && !this.sentOff.has(p.c.id + side)); }
    str(side, k) {
      const t = this.t[side], m = MENTALITY[this.ment[side]];
      const redPen = 1 - 0.08 * this.st[side].red;
      return (t[k] + (k === 'att' ? m.att : k === 'def' ? m.def : 0)) * redPen;
    }
    tick() {
      if (this.done) return [];
      this.clock++;
      if (this.half === 1 && this.clock > 45 + this.st1) { this.half = 2; this.clock = 45; return [{ type: 'ht' }]; }
      if (this.half === 2 && this.clock > 90 + this.st2) { this.done = true; this.clock = 90 + this.st2; return [{ type: 'ft' }]; }
      if (this.clock === 46 && this.half === 2) { /* tweede helft begint */ }
      this.aiThink();
      const ev = [];
      const midDiff = this.str(0, 'mid') - this.str(1, 'mid');
      const pH = 1 / (1 + Math.exp(-midDiff / 9));
      this.st[0].poss += pH; this.st[1].poss += 1 - pH;
      const tempo = 0.32 + MENTALITY[this.ment[0]].tempo + MENTALITY[this.ment[1]].tempo;
      this.ball = 50 + (Math.random() - 0.5) * 20 + (pH - 0.5) * 30;
      if (Math.random() < tempo) {
        const side = Math.random() < pH ? 0 : 1;
        this.attack(side, ev);
      }
      if (Math.random() < 0.03) this.foul(ev);
      this.momentum = this.momentum * 0.85 + (pH - 0.5) * 0.3;
      return ev;
    }
    aiThink() {
      const m = this.clock + (this.half === 2 ? 0 : 0);
      const diff = this.score[1] - this.score[0];
      if (this.half === 2 && m >= 70) this.ment[1] = diff < 0 ? (m >= 82 ? 'allout' : 'att') : diff > 0 ? (m >= 82 ? 'park' : 'def') : 'bal';
    }
    attack(side, ev) {
      const o = 1 - side, T = this.t[side];
      const diff = this.str(side, 'att') - this.str(o, 'def');
      const chanceP = U.clamp(0.5 + diff * 0.015, 0.15, 0.85);
      this.ball = side === 0 ? 70 + Math.random() * 22 : 8 + Math.random() * 22;
      this.momentum += side === 0 ? 0.25 : -0.25;
      if (Math.random() < chanceP) return this.shot(side, ev);
      if (Math.random() < 0.22) {
        this.st[side].corners++;
        ev.push({ type: 'corner', side, text: `🚩 Hoekschop voor ${U.esc(T.name)}.` });
      } else if (Math.random() < 0.3) {
        const d = U.wpick(this.active(o), (p) => W_DEF[p.pos] || 0.1);
        if (d) ev.push({ type: 'info', side: o, text: `🛡️ ${U.esc(d.c.name)} onderschept een gevaarlijke aanval van ${U.esc(T.name)}.` });
      }
    }
    shot(side, ev) {
      const o = 1 - side, T = this.t[side];
      const act = this.active(side).filter((p) => p.pos !== 'GK');
      if (!act.length) return;
      const shooter = U.wpick(act, (p) => (W_SHOOT[p.pos] || 0.5) * (p.c.stats[1] / 70));
      const gkP = this.active(o).find((p) => p.pos === 'GK');
      const gkv = this.t[o].gk * (gkP ? 1 : 0.4);
      const pen = Math.random() < 0.035;
      const quality = shooter.eff + (shooter.c.stats[1] - shooter.c.r) * 0.3;
      let xg = pen ? 0.76 : U.clamp(0.06 + (quality - gkv) * 0.006 + Math.random() * 0.2, 0.03, 0.65);
      const st = this.st[side];
      st.shots++; st.xg += xg;
      const roll = Math.random();
      const sn = U.esc(shooter.c.name), tn = U.esc(T.name);
      const gkName = gkP ? U.esc(gkP.c.name) : 'de keeper';
      const mins = this.minuteLabel();
      if (pen) ev.push({ type: 'info', side, text: `⚠️ Strafschop voor ${tn}! ${sn} legt aan…` });
      if (roll < xg) {
        st.onT++;
        this.score[side]++;
        this.pf(side, shooter).g++;
        let assist = null;
        if (!pen && Math.random() < 0.72) {
          const mates = act.filter((p) => p !== shooter);
          assist = U.wpick(mates, (p) => (W_ASSIST[p.pos] || 0.5) * (p.c.stats[2] / 70));
          if (assist) this.pf(side, assist).a++;
        }
        const an = assist ? U.esc(assist.c.name) : '';
        const txt = pen ? `⚽ GOAL! ${sn} schiet de strafschop onberispelijk binnen!` : U.pick([
          `⚽ GOAL! ${sn} schiet raak${assist ? ` na een heerlijke pass van ${an}` : ''}!`,
          `⚽ GOAL! ${sn} kopt ${assist ? `de voorzet van ${an}` : 'de bal'} keihard binnen!`,
          `⚽ GOAL! Wat een knal van ${sn} — vol in de kruising!`,
          `⚽ GOAL! ${sn} blijft ijskoud in de één-op-één${assist ? ` (assist: ${an})` : ''}.`,
          `⚽ GOAL! ${sn} krult hem prachtig in de verre hoek!`,
        ]);
        this.goals.push({ side, min: mins, name: shooter.c.name });
        this.momentum += side === 0 ? 1 : -1;
        ev.push({ type: 'goal', side, text: txt, scorer: shooter.c.name, assist: assist && assist.c.name });
      } else if (roll < xg + 0.3) {
        st.onT++;
        if (gkP) this.pf(o, gkP).sv++;
        ev.push({ type: 'save', side, text: U.pick([
          `🧤 Redding! ${gkName} houdt het schot van ${sn} tegen.`,
          `🧤 ${gkName} tikt de inzet van ${sn} over de lat.`,
          `🧤 Wereldredding van ${gkName} op een kopbal van ${sn}!`,
        ]) });
      } else if (roll < xg + 0.36) {
        ev.push({ type: 'post', side, text: `🥅 Paal! ${sn} raakt het aluminium!` });
      } else {
        ev.push({ type: 'miss', side, text: U.pick([`❌ ${sn} schiet naast.`, `❌ ${sn} mikt over het doel.`, `❌ ${sn} krijgt een kans maar raakt de bal niet goed.`, `❌ Afstandsschot van ${sn} gaat ruim voorlangs.`]) });
      }
    }
    foul(ev) {
      const side = Math.random() < 0.5 ? 0 : 1;
      const act = this.active(side).filter((p) => p.pos !== 'GK');
      const p = U.wpick(act, (x) => (W_DEF[x.pos] || 0.3) + 0.3);
      if (!p) return;
      this.st[side].fouls++;
      const key = p.c.id + side;
      const n = U.esc(p.c.name), tn = U.esc(this.t[side].name);
      if (Math.random() < 0.45) {
        if (this.yellows.has(key) || Math.random() < 0.035) {
          this.sentOff.add(key); this.st[side].red++;
          ev.push({ type: 'red', side, text: `🟥 Rode kaart! ${n} (${tn}) moet eraf.` });
        } else {
          this.yellows.add(key); this.st[side].yel++;
          ev.push({ type: 'yellow', side, text: `🟨 Gele kaart voor ${n} (${tn}).` });
        }
      }
    }
    runToEnd() { while (!this.done) this.tick(); }
    ratings(side) {
      const won = this.score[side] > this.score[1 - side], lost = this.score[side] < this.score[1 - side];
      const clean = this.score[1 - side] === 0;
      return this.t[side].players.filter((p) => p.c).map((p) => {
        const f = this.pf(side, p);
        let r = 6.2 + f.g * 1.1 + f.a * 0.7 + f.sv * 0.3 + (won ? 0.4 : lost ? -0.3 : 0) + (p.eff - 75) * 0.02 + (Math.random() * 1 - 0.4);
        if (clean && ['GK', 'CB', 'LB', 'RB', 'CDM'].includes(p.pos)) r += 0.6;
        if (this.sentOff.has(p.c.id + side)) r -= 2;
        return { p, f, r: U.clamp(Math.round(r * 10) / 10, 3, 10) };
      }).sort((a, b) => b.r - a.r);
    }
  },

  penalties(sim) {
    const lines = [];
    const sc = [0, 0];
    const kick = (side, i) => {
      const takers = sim.active(side).filter((p) => p.pos !== 'GK').sort((a, b) => b.c.stats[1] - a.c.stats[1]);
      const tk = takers[i % takers.length];
      const ok = Math.random() < U.clamp(0.75 + (tk.eff - sim.t[1 - side].gk) * 0.006, 0.55, 0.92);
      if (ok) sc[side]++;
      lines.push({ side, ok, text: `${ok ? '✅' : '❌'} ${U.esc(tk.c.name)} (${U.esc(sim.t[side].name)})` });
    };
    for (let i = 0; i < 5; i++) {
      kick(0, i); if (sc[0] > sc[1] + (5 - i) || sc[1] > sc[0] + (5 - i - 1)) break;
      kick(1, i); if (sc[0] > sc[1] + (5 - i - 1) || sc[1] > sc[0] + (5 - i - 1)) break;
    }
    let i = 5;
    while (sc[0] === sc[1]) { kick(0, i); kick(1, i); i++; }
    return { sc, lines, winner: sc[0] > sc[1] ? 0 : 1 };
  },

  /* ---------- Wedstrijdscherm ---------- */
  play(away, opts = {}) {
    return new Promise((resolve) => {
      const home = Match.teamFromSquad();
      const sim = new Match.Sim(home, away);
      let speed = S.d.settings.speed || 2;
      let skipping = false;
      const ov = document.createElement('div');
      ov.className = 'match-ov';
      ov.innerHTML = `
        <div class="m-top"><span class="m-mode">${opts.title || 'Wedstrijd'}</span><span class="m-sub">${opts.subtitle || ''}</span></div>
        <div class="scoreboard">
          <div class="sb-team home"><div class="sb-badge">${home.badge}</div><div><div class="sb-name">${U.esc(home.name)}</div><div class="sb-rt">${home.rating} · chemie ${home.chem}</div></div></div>
          <div class="sb-mid"><div class="sb-score"><span id="sc0">0</span><i>-</i><span id="sc1">0</span></div><div class="sb-clock" id="clk">0'</div></div>
          <div class="sb-team away"><div><div class="sb-name">${U.esc(away.name)}</div><div class="sb-rt">${away.rating} · ${away.formation}</div></div><div class="sb-badge">${away.badge}</div></div>
        </div>
        <div class="m-scorers"><div id="gs0"></div><div id="gs1"></div></div>
        <div class="m-main">
          <div class="m-left">
            <div class="mini-pitch"><div class="mp-lines"><i class="half"></i><i class="circle"></i><i class="box l"></i><i class="box r"></i></div><div class="mp-ball" id="ball"></div><div class="mp-flash" id="mflash"></div></div>
            <div class="momentum"><span>${U.esc(home.short)}</span><div class="mom-bar"><i id="mom"></i></div><span>${U.esc(away.short)}</span></div>
            <div class="m-stats" id="mstats"></div>
          </div>
          <div class="m-feed" id="feed"><div class="ev info"><b>0'</b><span>De scheidsrechter fluit en de wedstrijd is begonnen!</span></div></div>
        </div>
        <div class="m-ctrl">
          <div class="ctrl-group"><span class="lbl">Mentaliteit</span>${Object.entries(MENTALITY).map(([k, m]) => `<button class="chip ${k === 'bal' ? 'on' : ''}" data-m="${k}">${m.name}</button>`).join('')}</div>
          <div class="ctrl-group"><span class="lbl">Snelheid</span>${[1, 2, 4].map((s) => `<button class="chip ${s === speed ? 'on' : ''}" data-s="${s}">${s}×</button>`).join('')}<button class="chip skip" id="skipBtn">Naar einde ⏭</button></div>
        </div>
        <div class="goal-pop" id="goalPop"></div>`;
      document.body.appendChild(ov);
      requestAnimationFrame(() => ov.classList.add('show'));
      SFX.whistle(true);

      ov.querySelectorAll('[data-m]').forEach((b) => { b.onclick = () => { sim.ment[0] = b.dataset.m; ov.querySelectorAll('[data-m]').forEach((x) => x.classList.toggle('on', x === b)); SFX.click(); addFeed({ type: 'info', text: `📋 Tactiek gewijzigd: <b>${MENTALITY[b.dataset.m].name}</b>` }); }; });
      ov.querySelectorAll('[data-s]').forEach((b) => { b.onclick = () => { speed = +b.dataset.s; S.d.settings.speed = speed; S.save(); ov.querySelectorAll('[data-s]').forEach((x) => x.classList.toggle('on', x === b)); SFX.click(); }; });
      ov.querySelector('#skipBtn').onclick = () => { skipping = true; SFX.click(); };

      const feed = ov.querySelector('#feed');
      const addFeed = (e) => {
        const d = document.createElement('div');
        d.className = `ev ${e.type} ${e.side === 0 ? 'us' : e.side === 1 ? 'them' : ''}`;
        d.innerHTML = `<b>${e.min || sim.minuteLabel()}</b><span>${e.text}</span>`;
        feed.prepend(d);
        while (feed.children.length > 80) feed.lastChild.remove();
      };
      const renderStats = () => {
        const a = sim.st[0], b = sim.st[1];
        const tp = a.poss + b.poss || 1;
        const rows = [
          ['Balbezit', Math.round((a.poss / tp) * 100), Math.round((b.poss / tp) * 100), '%'],
          ['Schoten', a.shots, b.shots], ['Op doel', a.onT, b.onT], ['xG', a.xg.toFixed(1), b.xg.toFixed(1)],
          ['Hoekschoppen', a.corners, b.corners], ['Kaarten', a.yel + a.red, b.yel + b.red],
        ];
        ov.querySelector('#mstats').innerHTML = rows.map(([n, x, y, u = '']) => {
          const tot = (+x) + (+y) || 1;
          return `<div class="ms-row"><b>${x}${u}</b><div class="ms-mid"><span>${n}</span><div class="ms-bar"><i class="l" style="width:${(x / tot) * 100}%"></i><i class="r" style="width:${(y / tot) * 100}%"></i></div></div><b>${y}${u}</b></div>`;
        }).join('');
      };
      const renderBoard = () => {
        ov.querySelector('#sc0').textContent = sim.score[0];
        ov.querySelector('#sc1').textContent = sim.score[1];
        ov.querySelector('#clk').textContent = sim.done ? 'EINDE' : sim.minuteLabel();
        ov.querySelector('#ball').style.left = sim.ball + '%';
        ov.querySelector('#ball').style.top = 30 + Math.random() * 40 + '%';
        ov.querySelector('#mom').style.left = U.clamp(50 + sim.momentum * 25, 4, 96) + '%';
        [0, 1].forEach((s) => { ov.querySelector('#gs' + s).innerHTML = sim.goals.filter((g) => g.side === s).map((g) => `⚽ ${U.esc(g.name)} ${g.min}`).join('<br>'); });
        renderStats();
      };
      renderStats();

      const goalPop = async (side, text) => {
        const gp = ov.querySelector('#goalPop');
        gp.className = `goal-pop show ${side === 0 ? 'us' : 'them'}`;
        gp.innerHTML = `<div class="gp-word">GOAL!</div><div class="gp-team">${U.esc(sim.t[side].name)}</div>`;
        const fl = ov.querySelector('#mflash'); fl.classList.remove('on'); void fl.offsetWidth; fl.classList.add('on');
        if (side === 0) { SFX.cheer(); U.confetti(['#3ef0c4', '#fff', '#ffd75e'], 70, ov); } else SFX.groan();
        await U.sleep(1500 / Math.sqrt(speed));
        gp.className = 'goal-pop';
      };

      const loop = async () => {
        while (!sim.done) {
          if (skipping) {
            sim.runToEnd();
            addFeed({ type: 'info', text: '⏭ Wedstrijd doorgespoeld naar het eindsignaal.' });
            break;
          }
          const evs = sim.tick();
          for (const e of evs) {
            if (e.type === 'ht') { addFeed({ type: 'whistle', text: `⏸ Rust! Tussenstand ${sim.score[0]}-${sim.score[1]}.`, min: 'RUST' }); SFX.whistle(true); renderBoard(); await U.sleep(1200 / speed); continue; }
            if (e.type === 'ft') continue;
            addFeed(e);
            if (e.type === 'goal') { renderBoard(); await goalPop(e.side, e.text); }
            else if (e.type === 'save' && Math.random() < 0.5) SFX.groan();
            else if (e.type === 'red' || e.type === 'yellow') SFX.whistle();
          }
          renderBoard();
          await U.sleep({ 1: 420, 2: 190, 4: 70 }[speed] || 190);
        }
        renderBoard();
        SFX.whistle(true);
        addFeed({ type: 'whistle', text: `🏁 Einde wedstrijd: ${U.esc(home.name)} ${sim.score[0]} - ${sim.score[1]} ${U.esc(away.name)}`, min: 'EINDE' });
        let pens = null;
        if (opts.knockout && sim.score[0] === sim.score[1]) {
          addFeed({ type: 'info', text: '🎯 Gelijkspel — strafschoppen!', min: 'PEN' });
          pens = Match.penalties(sim);
          for (const l of pens.lines) {
            if (!skipping) await U.sleep(550);
            addFeed({ type: l.ok ? 'goal-pen' : 'miss', side: l.side, text: l.text, min: 'PEN' });
            if (!skipping) (l.ok ? SFX.drum() : SFX.groan());
          }
          addFeed({ type: 'whistle', text: `Strafschoppen: ${pens.sc[0]} - ${pens.sc[1]}`, min: 'PEN' });
        }
        await U.sleep(700);
        finish(pens);
      };

      const finish = (pens) => {
        const gf = sim.score[0], ga = sim.score[1];
        let result = gf > ga ? 'W' : gf < ga ? 'L' : 'D';
        if (pens) result = pens.winner === 0 ? 'W' : 'L';
        const st = S.d.stats;
        st.played++; st.gf += gf; st.ga += ga;
        if (result === 'W') st.won++; else if (result === 'L') st.lost++; else st.drawn++;
        S.track('play');
        if (result === 'W') S.track('win');
        if (gf) S.track('goal', gf);
        if (ga === 0) S.track('clean');
        const res = { result, gf, ga, pens, sim };
        const reward = opts.reward ? opts.reward(res) : { coins: 0 };
        if (reward.coins) S.addCoins(reward.coins);
        (reward.packs || []).forEach((p) => S.addPack(p));
        S.save();
        const ratings = sim.ratings(0);
        const motmAll = [...ratings.map((x) => ({ ...x, side: 0 })), ...sim.ratings(1).map((x) => ({ ...x, side: 1 }))].sort((a, b) => b.r - a.r)[0];
        const titles = { W: 'OVERWINNING', D: 'GELIJKSPEL', L: 'NEDERLAAG' };
        const end = document.createElement('div');
        end.className = `m-end res-${result}`;
        end.innerHTML = `<div class="me-box">
          <div class="me-title">${titles[result]}</div>
          <div class="me-score">${gf} - ${ga}${pens ? `<small> (${pens.sc[0]}-${pens.sc[1]} n.s.)</small>` : ''}</div>
          <div class="me-grid">
            <div class="me-motm"><div class="lbl">Man van de wedstrijd</div>${Cards.html(motmAll.p.c, { size: 'md' })}<div class="me-motm-r">${motmAll.r.toFixed(1)} · ${U.esc(sim.t[motmAll.side].name)}</div></div>
            <div class="me-right">
              <div class="me-rewards"><div class="lbl">Beloningen</div>
                ${reward.coins ? `<div class="rw"><span class="coin-ic"></span><b>+${U.fmt(reward.coins)}</b> munten</div>` : ''}
                ${(reward.packs || []).map((p) => `<div class="rw">🎁 <b>${PACKS[p].name}</b></div>`).join('')}
                ${(reward.lines || []).map((l) => `<div class="rw note">${l}</div>`).join('')}
                ${!reward.coins && !(reward.packs || []).length && !(reward.lines || []).length ? '<div class="rw note">Geen beloning deze keer.</div>' : ''}
              </div>
              <div class="me-ratings"><div class="lbl">Spelerscijfers</div>${ratings.map((x) => `<div class="pr"><span class="pr-pos">${x.p.pos}</span><span class="pr-n">${U.esc(x.p.c.name)}${x.f.g ? ' ' + '⚽'.repeat(x.f.g) : ''}${x.f.a ? ' 👟'.repeat(x.f.a) : ''}</span><b class="pr-r ${x.r >= 8 ? 'hi' : x.r >= 6.5 ? 'mid' : 'lo'}">${x.r.toFixed(1)}</b></div>`).join('')}</div>
            </div>
          </div>
          <button class="btn primary" id="endBtn">Doorgaan →</button>
        </div>`;
        ov.appendChild(end);
        requestAnimationFrame(() => end.classList.add('show'));
        if (result === 'W') { SFX.fanfare(); U.confetti(undefined, 120, end); }
        if (reward.coins) SFX.coin();
        end.querySelector('#endBtn').onclick = () => {
          SFX.click();
          ov.classList.remove('show');
          setTimeout(() => ov.remove(), 300);
          resolve(res);
        };
      };
      setTimeout(loop, 900);
    });
  },
};
