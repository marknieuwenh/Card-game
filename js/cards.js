/* ===== Kaarten: weergave & waarde ===== */
const Cards = {
  get(id) { return DB[id]; },

  label(c) { const R = RARITY[c.type]; return c.rare ? R.rareLabel : R.label; },

  value(c) {
    let v;
    if (c.tier === 'bronze') v = 120 + (c.r - 48) * 14;
    else if (c.tier === 'silver') v = 320 + (c.r - 65) * 55;
    else v = 750 * Math.pow(1.3, c.r - 75);
    if (c.rare) v *= 1.45;
    if (c.type === 'inform') v *= 2.3;
    if (c.type === 'hero') v *= 2.6;
    if (c.type === 'icon') v *= 3.2;
    const mag = v > 100000 ? 1000 : v > 10000 ? 100 : v > 1000 ? 50 : 10;
    return Math.round(v / mag) * mag;
  },
  sellPrice(c) { return Math.max(10, Math.round(Cards.value(c) * 0.95 / 10) * 10); },

  cls(c) {
    return `t-${c.type === 'gold' || c.type === 'silver' || c.type === 'bronze' ? c.tier : c.type}${c.rare ? ' rare' : ''}`;
  },

  /* opts: size (xs|sm|md|lg|xl), chem (0-3 | null), slotPos, extra classes, dup, isNew, attrs */
  html(c, opts = {}) {
    if (!c) return '';
    const size = opts.size || 'md';
    const gk = c.pos === 'GK';
    const labels = gk ? GK_LABELS : STAT_LABELS;
    const stats = c.stats.map((v, i) => `<div class="cs"><b>${v}</b><span>${labels[i]}</span></div>`).join('');
    const posTxt = opts.slotPos && opts.slotPos !== c.pos ? `<span class="c-pos oop">${c.pos}</span>` : `<span class="c-pos">${c.pos}</span>`;
    let chem = '';
    if (opts.chem !== undefined && opts.chem !== null) {
      chem = `<div class="c-chem chem-${opts.chem}">${[0, 1, 2].map((i) => `<i class="${i < opts.chem ? 'on' : ''}"></i>`).join('')}</div>`;
    }
    const tag = c.type === 'inform' ? '<div class="c-tag">IN-FORM</div>' : c.type === 'hero' ? '<div class="c-tag">HELD</div>' : c.type === 'icon' ? '<div class="c-tag">LEGENDE</div>' : '';
    return `<div class="card ${Cards.cls(c)} sz-${size} ${opts.cls || ''}" data-id="${c.id}" ${opts.attrs || ''}>
      <div class="card-in">
        <div class="c-pattern"></div>
        <div class="c-top">
          <div class="c-rating">${c.r}</div>
          ${posTxt}
          <div class="c-flagw">${flagSVG(c.nat)}</div>
          <div class="c-badgew">${badgeSVG(c.club, 'cb')}</div>
        </div>
        <div class="c-face">${avatarSVG(c)}</div>
        <div class="c-name">${U.esc(c.name)}</div>
        <div class="c-stats">${stats}</div>
        ${tag}
      </div>
      <div class="card-shine"></div>
      ${chem}
      ${opts.dup ? '<div class="c-flagtag dup">DUBBEL</div>' : ''}
      ${opts.isNew ? '<div class="c-flagtag new">NIEUW</div>' : ''}
    </div>`;
  },

  empty(pos, size = 'md') {
    return `<div class="card empty sz-${size}"><div class="card-in"><div class="plus">+</div><div class="epos">${pos}</div></div></div>`;
  },

  /* Groot detailvenster van een kaart */
  detail(c, actions = []) {
    const gk = c.pos === 'GK';
    const names = gk ? GK_NAMES : STAT_NAMES;
    const bars = c.stats.map((v, i) => `<div class="sbar"><span>${names[i]}</span><div class="sbar-t"><div class="sbar-f ${v >= 85 ? 'hi' : v >= 70 ? 'mid' : v >= 50 ? 'lo' : 'vlo'}" style="width:${v}%"></div></div><b>${v}</b></div>`).join('');
    const club = CLUBS[c.club], lg = LEAGUE_BY_ID[c.league];
    const m = U.modal(`
      <div class="detail">
        <div class="detail-card">${Cards.html(c, { size: 'lg' })}</div>
        <div class="detail-info">
          <div class="d-type ${Cards.cls(c)}">${Cards.label(c)}</div>
          <h2>${U.esc(c.first)} ${U.esc(c.last)}</h2>
          <div class="d-meta">
            <div><span>Positie</span><b>${POS_NL[c.pos]}${c.alt.length ? ` <small>(+ ${c.alt.join(', ')})</small>` : ''}</b></div>
            <div><span>Land</span><b>${flagSVG(c.nat)} ${NATIONS[c.nat].name}</b></div>
            <div><span>Club</span><b>${badgeSVG(c.club, 'mini')} ${club.name}</b></div>
            <div><span>Competitie</span><b>${lg ? lg.name : '—'}</b></div>
            <div><span>Marktwaarde</span><b class="coins-txt">${U.fmt(Cards.value(c))}</b></div>
          </div>
          <div class="sbars">${bars}</div>
          <div class="modal-actions left">${actions.map((a, i) => `<button class="btn ${a.cls || ''}" data-i="${i}">${a.label}</button>`).join('')}</div>
        </div>
      </div>`, { cls: 'wide' });
    m.querySelectorAll('[data-i]').forEach((b) => { b.onclick = () => { SFX.click(); actions[+b.dataset.i].fn(m); }; });
    return m;
  },
};
