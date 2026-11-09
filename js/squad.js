/* ===== Opstelling, chemie & teambeoordeling ===== */
const FORMATIONS = {
  '4-3-3': [['GK', 50, 89], ['LB', 12, 66], ['CB', 37, 70], ['CB', 63, 70], ['RB', 88, 66], ['CM', 22, 45], ['CDM', 50, 52], ['CM', 78, 45], ['LW', 15, 18], ['ST', 50, 12], ['RW', 85, 18]],
  '4-4-2': [['GK', 50, 89], ['LB', 12, 66], ['CB', 37, 70], ['CB', 63, 70], ['RB', 88, 66], ['LM', 12, 40], ['CM', 37, 46], ['CM', 63, 46], ['RM', 88, 40], ['ST', 35, 14], ['ST', 65, 14]],
  '4-2-3-1': [['GK', 50, 89], ['LB', 12, 66], ['CB', 37, 70], ['CB', 63, 70], ['RB', 88, 66], ['CDM', 35, 52], ['CDM', 65, 52], ['LM', 14, 30], ['CAM', 50, 32], ['RM', 86, 30], ['ST', 50, 10]],
  '3-5-2': [['GK', 50, 89], ['CB', 25, 70], ['CB', 50, 73], ['CB', 75, 70], ['LM', 10, 42], ['CDM', 36, 52], ['CDM', 64, 52], ['RM', 90, 42], ['CAM', 50, 32], ['ST', 35, 12], ['ST', 65, 12]],
  '4-1-2-1-2': [['GK', 50, 89], ['LB', 12, 66], ['CB', 37, 70], ['CB', 63, 70], ['RB', 88, 66], ['CDM', 50, 54], ['CM', 22, 42], ['CM', 78, 42], ['CAM', 50, 31], ['ST', 35, 12], ['ST', 65, 12]],
  '5-3-2': [['GK', 50, 89], ['LB', 8, 58], ['CB', 29, 71], ['CB', 50, 74], ['CB', 71, 71], ['RB', 92, 58], ['CM', 25, 42], ['CDM', 50, 48], ['CM', 75, 42], ['ST', 35, 13], ['ST', 65, 13]],
};

const Squad = {
  slots(formation) { return FORMATIONS[formation || S.d.squad.formation].map(([pos, x, y]) => ({ pos, x, y })); },

  fits(c, pos) { return c && (c.pos === pos || c.alt.includes(pos)); },

  /* Chemie volgens drempels voor club / land / competitie */
  chem(cardIds, formation) {
    const slots = Squad.slots(formation);
    const cards = cardIds.map((id) => (id ? DB[id] : null));
    const inPos = cards.map((c, i) => !!c && Squad.fits(c, slots[i].pos));
    const cnt = { club: {}, nat: {}, lg: {} };
    cards.forEach((c, i) => {
      if (!c || !inPos[i]) return;
      const inc = (o, k, n = 1) => { if (k) o[k] = (o[k] || 0) + n; };
      if (c.type !== 'icon' && c.type !== 'hero') inc(cnt.club, c.club);
      inc(cnt.nat, c.nat, c.type === 'icon' ? 2 : 1);
      if (c.type !== 'icon') inc(cnt.lg, c.league, c.type === 'hero' ? 2 : 1);
    });
    const pts = (n, th) => (n >= th[2] ? 3 : n >= th[1] ? 2 : n >= th[0] ? 1 : 0);
    const per = cards.map((c, i) => {
      if (!c || !inPos[i]) return 0;
      if (c.type === 'icon') return 3;
      const p = (c.type !== 'hero' ? pts(cnt.club[c.club] || 0, [2, 4, 7]) : 0) + pts(cnt.nat[c.nat] || 0, [2, 5, 8]) + pts(cnt.lg[c.league] || 0, [3, 5, 8]);
      return Math.min(3, p);
    });
    return { per, total: per.reduce((a, b) => a + b, 0), inPos };
  },

  rating(cardIds) {
    const rs = cardIds.map((id) => (id ? DB[id].r : 0));
    if (!rs.length) return 0;
    const n = rs.length;
    const sum = rs.reduce((a, b) => a + b, 0);
    const avg = sum / n;
    const excess = rs.reduce((a, r) => a + Math.max(0, r - avg), 0);
    return Math.min(99, Math.floor((sum + excess) / n));
  },

  full() { return S.d.squad.slots.every(Boolean); },

  /* Automatisch beste elftal kiezen (hebzuchtig, met chemie-voorkeur) */
  autoFill() {
    const slots = Squad.slots();
    const owned = S.ownedCards();
    let best = null;
    // Probeer basis-elftallen rondom de grootste competities/landen en houd de beste over
    const anchors = [null];
    const lgCount = {};
    owned.forEach((c) => { lgCount[c.league] = (lgCount[c.league] || 0) + 1; });
    Object.entries(lgCount).sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([lg]) => anchors.push({ lg }));
    anchors.forEach((anchor) => {
      const used = new Set(); const pick = Array(11).fill(null);
      const order = slots.map((s, i) => i).sort((a, b) => (slots[a].pos === 'GK' ? -1 : 0) - (slots[b].pos === 'GK' ? -1 : 0));
      order.forEach((i) => {
        const pos = slots[i].pos;
        const cands = owned.filter((c) => !used.has(c.base) && Squad.fits(c, pos));
        if (!cands.length) return;
        cands.sort((a, b) => score(b, pos) - score(a, pos));
        pick[i] = cands[0].id; used.add(cands[0].base);
      });
      // vul gaten met wie er nog is
      pick.forEach((p, i) => {
        if (p) return;
        const c = owned.filter((x) => !used.has(x.base) && (slots[i].pos === 'GK') === (x.pos === 'GK')).sort((a, b) => b.r - a.r)[0]
          || owned.filter((x) => !used.has(x.base)).sort((a, b) => b.r - a.r)[0];
        if (c) { pick[i] = c.id; used.add(c.base); }
      });
      const ch = Squad.chem(pick);
      const val = Squad.rating(pick) * 3 + ch.total;
      if (!best || val > best.val) best = { pick, val };
      function score(c, pos) { return c.r + (c.pos === pos ? 1 : 0) + (anchor && c.league === anchor.lg ? 4 : 0); }
    });
    if (best) S.d.squad.slots = best.pick;
    S.save();
  },

  setFormation(f) {
    const old = S.d.squad.slots.slice();
    const oldF = S.d.squad.formation;
    const oldSlots = Squad.slots(oldF);
    const newSlots = Squad.slots(f);
    const out = Array(11).fill(null);
    const left = old.map((id, i) => ({ id, pos: oldSlots[i].pos })).filter((x) => x.id);
    // eerst exacte posities, dan passende, dan de rest
    [(c, p) => c.pos === p, (c, p) => Squad.fits(c, p), () => true].forEach((test) => {
      newSlots.forEach((s, i) => {
        if (out[i]) return;
        const k = left.findIndex((x) => test(DB[x.id], s.pos));
        if (k >= 0) { out[i] = left[k].id; left.splice(k, 1); }
      });
    });
    S.d.squad.formation = f;
    S.d.squad.slots = out;
    S.save();
  },

  /* ---------- Weergave ---------- */
  render(root) {
    const sq = S.d.squad;
    const slots = Squad.slots();
    const ch = Squad.chem(sq.slots);
    const rating = Squad.rating(sq.slots);
    const filled = sq.slots.filter(Boolean).length;
    root.innerHTML = `
      <div class="view-head"><div><h1>Selectie</h1><p class="muted">Klik op een positie om een speler te kiezen. Spelers op hun eigen positie krijgen chemie.</p></div></div>
      <div class="squad-wrap">
        <div class="pitch-box">
          <div class="pitch">
            <div class="pitch-lines"><i class="half"></i><i class="circle"></i><i class="box top"></i><i class="box bot"></i><i class="six top"></i><i class="six bot"></i></div>
            ${slots.map((s, i) => {
              const id = sq.slots[i];
              const c = id ? DB[id] : null;
              return `<div class="slot" data-i="${i}" style="left:${s.x}%;top:${s.y}%">
                ${c ? Cards.html(c, { size: 'sm', chem: ch.per[i], slotPos: s.pos }) : Cards.empty(s.pos, 'sm')}
                <div class="slot-pos ${c && !ch.inPos[i] ? 'bad' : ''}">${s.pos}</div></div>`;
            }).join('')}
          </div>
        </div>
        <aside class="squad-side">
          <div class="panel team-panel">
            <div class="tp-row"><div class="tp-stat"><span>Beoordeling</span><b class="big">${rating}</b><div class="stars">${Squad.starsHTML(rating)}</div></div>
            <div class="tp-stat"><span>Chemie</span><b class="big">${ch.total}<small>/33</small></b><div class="chem-bar"><i style="width:${(ch.total / 33) * 100}%"></i></div></div></div>
            <label class="lbl">Formatie</label>
            <select id="formSel" class="input">${Object.keys(FORMATIONS).map((f) => `<option ${f === sq.formation ? 'selected' : ''}>${f}</option>`).join('')}</select>
            <div class="btn-col">
              <button class="btn primary" id="autoBtn">⚡ Automatisch opstellen</button>
              <button class="btn ghost" id="clearBtn">Selectie leegmaken</button>
            </div>
            <p class="muted small">${filled}/11 spelers opgesteld</p>
          </div>
          <div class="panel">
            <h3>Teamsterkte</h3>
            ${Squad.strengthHTML()}
          </div>
          <div class="panel">
            <h3>Chemie uitgelegd</h3>
            <ul class="chem-help">
              <li><b>Club</b> 2 / 4 / 7 spelers → +1 / +2 / +3</li>
              <li><b>Land</b> 2 / 5 / 8 spelers → +1 / +2 / +3</li>
              <li><b>Competitie</b> 3 / 5 / 8 spelers → +1 / +2 / +3</li>
              <li><b>Legenden</b> hebben altijd 3 chemie en tellen dubbel voor hun land. <b>Helden</b> tellen dubbel voor hun competitie.</li>
            </ul>
          </div>
        </aside>
      </div>`;
    root.querySelectorAll('.slot').forEach((el) => { el.onclick = () => { SFX.click(); Squad.pickFor(+el.dataset.i); }; });
    root.querySelector('#formSel').onchange = (e) => { Squad.setFormation(e.target.value); SFX.click(); Squad.render(root); };
    root.querySelector('#autoBtn').onclick = () => { Squad.autoFill(); SFX.shimmer(); U.toast('Beste elftal opgesteld!', 'ok'); Squad.render(root); };
    root.querySelector('#clearBtn').onclick = () => { S.d.squad.slots = Array(11).fill(null); S.save(); Squad.render(root); };
  },

  starsHTML(r) {
    const s = r >= 85 ? 5 : r >= 82 ? 4.5 : r >= 79 ? 4 : r >= 76 ? 3.5 : r >= 73 ? 3 : r >= 70 ? 2.5 : r >= 66 ? 2 : r >= 60 ? 1.5 : 1;
    let h = '';
    for (let i = 1; i <= 5; i++) h += `<i class="${s >= i ? 'on' : s >= i - 0.5 ? 'half' : ''}">★</i>`;
    return h;
  },

  strengthHTML() {
    const t = Match.teamFromSquad();
    const row = (n, v) => `<div class="str-row"><span>${n}</span><div class="sbar-t"><div class="sbar-f ${v >= 85 ? 'hi' : v >= 75 ? 'mid' : 'lo'}" style="width:${U.clamp(v, 0, 100)}%"></div></div><b>${Math.round(v)}</b></div>`;
    return row('Aanval', t.att) + row('Middenveld', t.mid) + row('Verdediging', t.def) + row('Keeper', t.gk);
  },

  /* Spelerkeuze voor een positie */
  pickFor(i, preselectId = null) {
    const slots = Squad.slots();
    const pos = slots[i].pos;
    const cur = S.d.squad.slots[i];
    let showAll = false;
    let q = '';
    const m = U.modal(`<h2>Kies speler voor <span class="accent">${pos}</span></h2>
      <div class="filters"><input class="input" id="pq" placeholder="Zoek op naam…"><label class="chk"><input type="checkbox" id="pall"> Alle posities</label>
      ${cur ? '<button class="btn ghost sm" id="premove">Verwijder uit selectie</button>' : ''}</div>
      <div class="pick-grid" id="pgrid"></div>`, { cls: 'wide' });
    const grid = m.querySelector('#pgrid');
    const draw = () => {
      const inSquad = new Set(S.d.squad.slots.filter(Boolean));
      const usedBase = new Set(S.d.squad.slots.filter((x, k) => x && k !== i).map((x) => DB[x].base));
      let list = S.ownedCards().filter((c) => (showAll || Squad.fits(c, pos)) && c.id !== cur);
      if (q) list = list.filter((c) => (c.first + ' ' + c.last).toLowerCase().includes(q));
      list.sort((a, b) => (b.pos === pos) - (a.pos === pos) || b.r - a.r);
      grid.innerHTML = list.length ? list.slice(0, 120).map((c) => {
        const blocked = usedBase.has(c.base) && !inSquad.has(c.id);
        return `<div class="pick ${blocked ? 'blocked' : ''}" data-id="${c.id}">${Cards.html(c, { size: 'sm', slotPos: pos })}
          ${inSquad.has(c.id) ? '<span class="pick-tag">In selectie · wissel</span>' : blocked ? '<span class="pick-tag bad">Al opgesteld</span>' : ''}</div>`;
      }).join('') : '<p class="muted">Geen spelers gevonden. Open packs of koop spelers op de transfermarkt!</p>';
      grid.querySelectorAll('.pick:not(.blocked)').forEach((el) => {
        el.onclick = () => {
          const id = el.dataset.id;
          const j = S.d.squad.slots.indexOf(id);
          if (j >= 0) S.d.squad.slots[j] = S.d.squad.slots[i];
          S.d.squad.slots[i] = id;
          S.save(); SFX.whoosh(); m.close();
          App.refresh();
        };
      });
    };
    m.querySelector('#pq').oninput = (e) => { q = e.target.value.toLowerCase().trim(); draw(); };
    m.querySelector('#pall').onchange = (e) => { showAll = e.target.checked; draw(); };
    const rm = m.querySelector('#premove');
    if (rm) rm.onclick = () => { S.d.squad.slots[i] = null; S.save(); m.close(); App.refresh(); };
    draw();
  },

  /* Vanuit club: kies een positie voor een speler */
  placeCard(id) {
    const c = DB[id];
    const slots = Squad.slots();
    const m = U.modal(`<h2>Plaats ${U.esc(c.name)} in je selectie</h2><p class="muted">Kies een positie (${c.pos}${c.alt.length ? ', ' + c.alt.join(', ') : ''} geven chemie).</p>
      <div class="place-grid">${slots.map((s, i) => {
        const cur = S.d.squad.slots[i] ? DB[S.d.squad.slots[i]] : null;
        return `<button class="place ${Squad.fits(c, s.pos) ? 'fit' : ''}" data-i="${i}"><b>${s.pos}</b><span>${cur ? `${cur.r} ${U.esc(cur.name)}` : 'leeg'}</span></button>`;
      }).join('')}</div>`);
    m.querySelectorAll('.place').forEach((b) => {
      b.onclick = () => {
        const i = +b.dataset.i;
        const other = S.d.squad.slots.findIndex((x, k) => x && k !== i && DB[x].base === c.base && x !== id);
        if (other >= 0) { U.toast('Deze speler staat al (in een andere versie) in je selectie', 'err'); return; }
        const j = S.d.squad.slots.indexOf(id);
        if (j >= 0) S.d.squad.slots[j] = S.d.squad.slots[i];
        S.d.squad.slots[i] = id;
        S.save(); SFX.whoosh(); m.close();
        U.toast(`${U.esc(c.name)} staat nu op ${slots[i].pos}`, 'ok');
        App.refresh();
      };
    });
  },
};
