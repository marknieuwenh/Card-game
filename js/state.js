/* ===== Spelstatus & opslag (localStorage) ===== */
const SAVE_KEY = 'ultimate-elftal-save-v1';

const S = {
  d: null,

  fresh(clubName) {
    return {
      v: 1,
      clubName: clubName || 'Mijn Club',
      coins: 10000,
      owned: [],
      squad: { formation: '4-3-3', slots: Array(11).fill(null) },
      packs: [],
      stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, packsOpened: 0, bestPull: null, trophies: 0 },
      division: { level: 10, best: 10, season: { played: 0, pts: 0, w: 0, d: 0, l: 0, results: [] }, seasons: 0 },
      tournament: null,
      sbcDone: {},
      objectives: null,
      giftAt: 0,
      market: null,
      settings: { sound: true, speed: 2 },
      created: Date.now(),
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (!d || d.v !== 1) return false;
      d.owned = d.owned.filter((id) => DB[id]);
      d.squad.slots = d.squad.slots.map((id) => (id && DB[id] && d.owned.includes(id) ? id : null));
      this.d = d;
      return true;
    } catch (e) { return false; }
  },
  save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.d)); } catch (e) { /* opslag vol of geblokkeerd */ } },
  reset() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* opslag geblokkeerd */ } location.reload(); },

  /* ---- munten ---- */
  addCoins(n) {
    const before = this.d.coins;
    this.d.coins += Math.round(n);
    this.save();
    App.updateCoins(before);
  },
  spend(n) {
    if (this.d.coins < n) { SFX.error(); U.toast(`Niet genoeg munten — je mist ${U.fmt(n - this.d.coins)}`, 'err'); return false; }
    const before = this.d.coins;
    this.d.coins -= n;
    this.save();
    App.updateCoins(before);
    return true;
  },

  /* ---- spelers ---- */
  has(id) { return this.d.owned.includes(id); },
  own(id) { if (!this.has(id)) this.d.owned.push(id); },
  remove(id) {
    this.d.owned = this.d.owned.filter((x) => x !== id);
    this.d.squad.slots = this.d.squad.slots.map((x) => (x === id ? null : x));
    if (this.d.market) this.d.market.listings = this.d.market.listings || [];
  },
  ownedCards() { return this.d.owned.map((id) => DB[id]).filter(Boolean); },

  /* ---- packs ---- */
  addPack(id, n = 1) { for (let i = 0; i < n; i++) this.d.packs.push(id); this.save(); App.updateBadges(); },

  /* ---- dagelijkse doelen ---- */
  ensureObjectives() {
    const today = U.today();
    if (this.d.objectives && this.d.objectives.date === today) return;
    const pool = [
      { id: 'win2', txt: 'Win 2 wedstrijden', ev: 'win', goal: 2, reward: { coins: 1500 } },
      { id: 'goals6', txt: 'Scoor 6 doelpunten', ev: 'goal', goal: 6, reward: { coins: 1000 } },
      { id: 'packs3', txt: 'Open 3 packs', ev: 'pack', goal: 3, reward: { pack: 'silver' } },
      { id: 'sbc1', txt: 'Voltooi een squad-uitdaging', ev: 'sbc', goal: 1, reward: { pack: 'gold' } },
      { id: 'div2', txt: 'Speel 2 divisiewedstrijden', ev: 'div', goal: 2, reward: { coins: 1200 } },
      { id: 'clean1', txt: 'Houd de nul in een wedstrijd', ev: 'clean', goal: 1, reward: { coins: 800 } },
      { id: 'play3', txt: 'Speel 3 wedstrijden', ev: 'play', goal: 3, reward: { pack: 'gold' } },
      { id: 'cup1', txt: 'Win een toernooiwedstrijd', ev: 'cup', goal: 1, reward: { coins: 1500 } },
    ];
    const r = U.rng(U.hash(today));
    const list = U.shuffle(pool.slice(), r).slice(0, 4).map((o) => ({ ...o, prog: 0, claimed: false }));
    this.d.objectives = { date: today, list };
    this.save();
  },
  track(ev, n = 1) {
    this.ensureObjectives();
    let done = false;
    this.d.objectives.list.forEach((o) => {
      if (o.ev === ev && o.prog < o.goal) { o.prog = Math.min(o.goal, o.prog + n); if (o.prog >= o.goal) done = o; }
    });
    if (done) U.toast(`🎯 Doel voltooid: <b>${done.txt}</b> — claim je beloning!`, 'ok', 3500);
    this.save();
    App.updateBadges();
  },
};
