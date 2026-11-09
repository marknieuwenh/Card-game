/* ===== Squad-uitdagingen (ruil spelers in voor beloningen) ===== */
const SBC = {
  list: [
    { id: 'first', name: 'Eerste Stappen', desc: 'Lever 5 willekeurige spelers in.', n: 5, req: {}, reward: 'silver', repeat: false, color: '#22c55e' },
    { id: 'bronze', name: 'Bronzen Ruil', desc: 'Zet je bronzen spelers om in iets beters.', n: 6, req: { onlyTier: 'bronze' }, reward: 'silver', repeat: true, color: '#b07a4a' },
    { id: 'silver', name: 'Zilveren Upgrade', desc: 'Acht zilveren spelers voor een goud pack.', n: 8, req: { onlyTier: 'silver' }, reward: 'gold', repeat: true, color: '#94a3b8' },
    { id: 'nation', name: 'Landgenoten', desc: 'Bouw een team met een sterke nationale kern.', n: 11, req: { sameNation: 5, minRating: 70 }, reward: 'premium', repeat: false, color: '#ef4444' },
    { id: 'league', name: 'Competitiemeester', desc: 'Een elftal uit één competitie.', n: 11, req: { sameLeague: 7, minRating: 75 }, reward: 'mega', repeat: false, color: '#3b82f6' },
    { id: 'gold', name: 'Gouden Fusie', desc: 'Elf gouden spelers waarvan minstens 3 zeldzaam.', n: 11, req: { onlyTier: 'gold', minRare: 3, minRating: 78 }, reward: 'premium', repeat: true, color: '#e8c76a' },
    { id: 'top', name: 'Topklasse', desc: 'Een sterk elftal voor een In-Form pack.', n: 11, req: { minRating: 82, minRare: 6 }, reward: 'inform', repeat: true, color: '#111827' },
    { id: 'hero', name: 'Heldendaad', desc: 'Het ultieme offer voor een gegarandeerde Held.', n: 11, req: { minRating: 85, minSpecial: 1 }, reward: 'hero', repeat: false, color: '#7c3aed' },
    { id: 'icon', name: 'Legendarisch', desc: 'Een gegarandeerde Legende voor een topteam.', n: 11, req: { minRating: 87, minSpecial: 2 }, reward: 'icon', repeat: false, color: '#b48a2c' },
  ],

  checks(def, ids) {
    const cs = ids.map((id) => DB[id]);
    const R = def.req;
    const out = [{ label: `Precies ${def.n} spelers`, ok: cs.length === def.n, cur: `${cs.length}/${def.n}` }];
    if (R.onlyTier) out.push({ label: `Alleen ${RARITY[R.onlyTier].label.toLowerCase()}`, ok: cs.length > 0 && cs.every((c) => c.tier === R.onlyTier && c.type === R.onlyTier) });
    if (R.minRating) { const r = Squad.rating(ids); out.push({ label: `Teambeoordeling min. ${R.minRating}`, ok: r >= R.minRating, cur: r }); }
    if (R.minRare) { const n = cs.filter((c) => c.rare).length; out.push({ label: `Min. ${R.minRare} zeldzame spelers`, ok: n >= R.minRare, cur: n }); }
    if (R.sameNation) { const n = SBC.maxGroup(cs, 'nat'); out.push({ label: `Min. ${R.sameNation} spelers uit hetzelfde land`, ok: n >= R.sameNation, cur: n }); }
    if (R.sameLeague) { const n = SBC.maxGroup(cs, 'league'); out.push({ label: `Min. ${R.sameLeague} spelers uit dezelfde competitie`, ok: n >= R.sameLeague, cur: n }); }
    if (R.minSpecial) { const n = cs.filter((c) => ['inform', 'hero', 'icon'].includes(c.type)).length; out.push({ label: `Min. ${R.minSpecial} In-Form/Held/Legende`, ok: n >= R.minSpecial, cur: n }); }
    return out;
  },
  maxGroup(cs, key) { const m = {}; cs.forEach((c) => { m[c[key]] = (m[c[key]] || 0) + 1; }); return Math.max(0, ...Object.values(m)); },

  render(root) {
    root.innerHTML = `
      <div class="view-head"><div><h1>Squad-uitdagingen</h1><p class="muted">Lever spelers in die aan de eisen voldoen en ontvang een pack. Ingeleverde spelers verdwijnen uit je club.</p></div></div>
      <div class="sbc-grid">${SBC.list.map((s) => {
        const done = S.d.sbcDone[s.id] || 0;
        const locked = done && !s.repeat;
        return `<div class="sbc-card ${locked ? 'done' : ''}" style="--c:${s.color}" data-id="${s.id}">
          <div class="sbc-head"><h3>${s.name}</h3>${s.repeat ? '<span class="tag">Herhaalbaar</span>' : '<span class="tag">Eenmalig</span>'}</div>
          <p>${s.desc}</p>
          <ul>${SBC.checks(s, []).slice(0).map((c) => `<li>${c.label}</li>`).join('')}</ul>
          <div class="sbc-reward">${Packs.art(s.reward, 'xs')}<div><span class="lbl">Beloning</span><b>${PACKS[s.reward].name}</b></div></div>
          <button class="btn ${locked ? 'ghost' : 'primary'}" ${locked ? 'disabled' : ''}>${locked ? '✓ Voltooid' : done ? `Opnieuw (${done}× voltooid)` : 'Starten'}</button>
        </div>`;
      }).join('')}</div>`;
    root.querySelectorAll('.sbc-card:not(.done) button').forEach((b) => { b.onclick = () => { SFX.click(); SBC.builder(b.closest('.sbc-card').dataset.id); }; });
  },

  builder(id) {
    const def = SBC.list.find((s) => s.id === id);
    let sel = [];
    let q = '', fTier = '';
    const m = U.modal(`<h2>${def.name}</h2>
      <div class="sbc-b">
        <div class="sbc-left">
          <div class="filters"><input class="input" id="sq" placeholder="Zoek…"><select class="input" id="st"><option value="">Alle kaarten</option><option value="bronze">Brons</option><option value="silver">Zilver</option><option value="gold">Goud</option><option value="special">Speciaal</option></select>
          <button class="btn ghost sm" id="sfill">Slim aanvullen</button></div>
          <div class="pick-grid small" id="sgrid"></div>
        </div>
        <div class="sbc-right">
          <div class="lbl">Ingeleverd (<span id="scount">0</span>/${def.n})</div>
          <div class="sbc-sel" id="ssel"></div>
          <ul class="req-list" id="sreq"></ul>
          <div class="sbc-reward">${Packs.art(def.reward, 'xs')}<div><span class="lbl">Beloning</span><b>${PACKS[def.reward].name}</b></div></div>
          <button class="btn primary" id="ssubmit" disabled>Inleveren</button>
        </div>
      </div>`, { cls: 'wide' });
    const inSquad = new Set(S.d.squad.slots.filter(Boolean));
    const draw = () => {
      let list = S.ownedCards().filter((c) => !sel.includes(c.id));
      if (q) list = list.filter((c) => (c.first + ' ' + c.last).toLowerCase().includes(q));
      if (fTier === 'special') list = list.filter((c) => ['inform', 'hero', 'icon'].includes(c.type));
      else if (fTier) list = list.filter((c) => c.type === fTier);
      list.sort((a, b) => a.r - b.r);
      m.querySelector('#sgrid').innerHTML = list.slice(0, 150).map((c) => `<div class="pick" data-id="${c.id}">${Cards.html(c, { size: 'sm' })}${inSquad.has(c.id) ? '<span class="pick-tag">In selectie</span>' : ''}</div>`).join('') || '<p class="muted">Geen spelers.</p>';
      m.querySelectorAll('#sgrid .pick').forEach((el) => { el.onclick = () => { if (sel.length >= def.n) { SFX.error(); U.toast('Maximum aantal spelers bereikt', 'err'); return; } sel.push(el.dataset.id); SFX.click(); draw(); }; });
      m.querySelector('#ssel').innerHTML = Array.from({ length: def.n }, (_, i) => sel[i] ? `<div class="pick" data-id="${sel[i]}">${Cards.html(DB[sel[i]], { size: 'xs' })}</div>` : '<div class="sbc-empty"></div>').join('');
      m.querySelectorAll('#ssel .pick').forEach((el) => { el.onclick = () => { sel = sel.filter((x) => x !== el.dataset.id); SFX.click(); draw(); }; });
      const checks = SBC.checks(def, sel);
      m.querySelector('#sreq').innerHTML = checks.map((c) => `<li class="${c.ok ? 'ok' : ''}">${c.ok ? '✔' : '✖'} ${c.label}${c.cur !== undefined ? ` <em>(${c.cur})</em>` : ''}</li>`).join('');
      m.querySelector('#scount').textContent = sel.length;
      m.querySelector('#ssubmit').disabled = !checks.every((c) => c.ok);
    };
    m.querySelector('#sq').oninput = (e) => { q = e.target.value.toLowerCase().trim(); draw(); };
    m.querySelector('#st').onchange = (e) => { fTier = e.target.value; draw(); };
    m.querySelector('#sfill').onclick = () => {
      // Vul aan met de laagst beoordeelde spelers die aan de basiseis (kaarttype) voldoen
      const R = def.req;
      let pool = S.ownedCards().filter((c) => !sel.includes(c.id) && (!R.onlyTier || (c.type === R.onlyTier)));
      pool.sort((a, b) => inSquad.has(a.id) - inSquad.has(b.id) || a.r - b.r);
      if (R.minRating) pool = pool.filter((c) => c.r >= R.minRating - 4).concat(pool.filter((c) => c.r < R.minRating - 4));
      while (sel.length < def.n && pool.length) sel.push(pool.shift().id);
      SFX.shimmer(); draw();
    };
    m.querySelector('#ssubmit').onclick = async () => {
      const usedInSquad = sel.filter((x) => inSquad.has(x)).length;
      const ok = await U.confirm('Uitdaging inleveren?', `${def.n} spelers verdwijnen uit je club${usedInSquad ? ` (waarvan ${usedInSquad} uit je selectie)` : ''}. Je ontvangt een <b>${PACKS[def.reward].name}</b>.`, 'Inleveren');
      if (!ok) return;
      sel.forEach((x) => S.remove(x));
      S.d.sbcDone[def.id] = (S.d.sbcDone[def.id] || 0) + 1;
      S.addPack(def.reward);
      S.track('sbc');
      S.save();
      m.close();
      SFX.fanfare(); U.confetti();
      U.toast(`Uitdaging voltooid! <b>${PACKS[def.reward].name}</b> staat klaar in Mijn packs.`, 'ok', 4000);
      App.refresh();
    };
    draw();
  },
};
