/* ===== Spelwereld: landen, competities, clubs en de spelersdatabase =====
   Alle spelers, clubs en competities zijn fictief en worden deterministisch gegenereerd. */

const NATIONS = {
  NED: { name: 'Nederland', first: ['Daan', 'Sem', 'Luuk', 'Milan', 'Jesse', 'Thijs', 'Bram', 'Stijn', 'Ruben', 'Jens', 'Niels', 'Joris', 'Tygo', 'Mats'], last: ['Bakker', 'Visser', 'Smit', 'Meijer', 'Mulder', 'Bos', 'Kramer', 'Brouwer', 'Dekker', 'Verhoeven', 'Postma', 'Kuipers', 'Hoekstra', 'van Leeuwen'] },
  ENG: { name: 'Engeland', first: ['Oliver', 'Jack', 'Callum', 'Mason', 'Reece', 'Tom', 'Ben', 'Lewis', 'Ethan', 'Kieran', 'Jamie', 'Connor', 'Ryan'], last: ['Whitfield', 'Ashworth', 'Pennington', 'Holloway', 'Barrett', 'Crowley', 'Fenwick', 'Marsh', 'Thornton', 'Langley', 'Cartwright', 'Bramwell', 'Hale'] },
  ESP: { name: 'Spanje', first: ['Álvaro', 'Iker', 'Pablo', 'Sergio', 'Javier', 'Adrián', 'Marcos', 'Rubén', 'Hugo', 'Diego', 'Unai', 'Raúl'], last: ['Morales', 'Castaño', 'Ibáñez', 'Villaverde', 'Robledo', 'Escudero', 'Lozano', 'Peralta', 'Arroyo', 'Cuesta', 'Soler', 'Medina'] },
  ITA: { name: 'Italië', first: ['Lorenzo', 'Matteo', 'Alessandro', 'Federico', 'Davide', 'Simone', 'Riccardo', 'Andrea', 'Tommaso', 'Giacomo', 'Nicolò', 'Gabriele'], last: ['Bellandi', 'Ferraro', 'Cattaneo', 'Mancuso', 'Rinaldi', 'Galli', 'Benedetti', 'Fontana', 'Marchetti', 'Orlandi', 'Sartori', 'Vitale'] },
  GER: { name: 'Duitsland', first: ['Lukas', 'Jonas', 'Leon', 'Felix', 'Niklas', 'Maximilian', 'Tim', 'Moritz', 'Julian', 'Paul', 'Fabian', 'Jannik'], last: ['Hoffmann', 'Krüger', 'Vogel', 'Hartmann', 'Schröder', 'Wolff', 'Brenner', 'Kessler', 'Seidel', 'Haas', 'Winkler', 'Ziegler'] },
  FRA: { name: 'Frankrijk', first: ['Lucas', 'Hugo', 'Mathis', 'Enzo', 'Bastien', 'Antoine', 'Yanis', 'Maxime', 'Florian', 'Rayan', 'Nathan', 'Corentin'], last: ['Lefèvre', 'Moreau', 'Girard', 'Fontaine', 'Rousseau', 'Chevalier', 'Lambert', 'Bonnet', 'Dufour', 'Mercier', 'Blanchard', 'Perrin'] },
  BRA: { name: 'Brazilië', first: ['Gabriel', 'Thiago', 'Matheus', 'Rafael', 'Caio', 'Diego', 'Bruno', 'Felipe', 'Igor', 'Renan', 'Wellington', 'Davi'], last: ['Almeida', 'Barbosa', 'Cardoso', 'Moreira', 'Teixeira', 'Rocha', 'Nogueira', 'Pires', 'Fonseca', 'Siqueira', 'Azevedo', 'Campos'] },
  ARG: { name: 'Argentinië', first: ['Santiago', 'Facundo', 'Nicolás', 'Agustín', 'Tomás', 'Joaquín', 'Franco', 'Matías', 'Gonzalo', 'Ezequiel', 'Leandro', 'Bautista'], last: ['Benítez', 'Acosta', 'Ledesma', 'Quiroga', 'Funes', 'Sosa', 'Villalba', 'Ojeda', 'Godoy', 'Ferreyra', 'Bustos', 'Arce'] },
  POR: { name: 'Portugal', first: ['João', 'Diogo', 'Tiago', 'Gonçalo', 'André', 'Rafael', 'Nuno', 'Pedro', 'Miguel', 'Vasco', 'Duarte', 'Rodrigo'], last: ['Carvalho', 'Lopes', 'Pinto', 'Correia', 'Antunes', 'Figueiredo', 'Magalhães', 'Tavares', 'Gaspar', 'Brito', 'Marques', 'Seixas'] },
  BEL: { name: 'België', first: ['Arne', 'Wout', 'Jef', 'Lander', 'Senne', 'Robbe', 'Kobe', 'Mathias', 'Tibo', 'Jarne', 'Cédric', 'Warre'], last: ['Peeters', 'Janssens', 'Maes', 'Claes', 'Wouters', 'Goossens', 'Vermeulen', 'De Smet', 'Willems', 'Lambrecht', 'Verbeke', 'Van Acker'] },
  NGA: { name: 'Nigeria', first: ['Chidi', 'Emeka', 'Tunde', 'Obinna', 'Ifeanyi', 'Segun', 'Uche', 'Chinedu', 'Ayo', 'Femi', 'Bayo', 'Kunle'], last: ['Okonkwo', 'Adebayo', 'Ogunleye', 'Ibekwe', 'Olatunji', 'Chukwu', 'Afolabi', 'Uzoma', 'Akinola', 'Nwachukwu', 'Ekwueme', 'Ojo'] },
  JPN: { name: 'Japan', first: ['Haruto', 'Sota', 'Ren', 'Yuto', 'Kaito', 'Riku', 'Daiki', 'Kenta', 'Shun', 'Hayato', 'Ryo', 'Taiga'], last: ['Takahashi', 'Kobayashi', 'Nakamura', 'Yamada', 'Sato', 'Inoue', 'Kimura', 'Hayashi', 'Shimizu', 'Fujita', 'Ogawa', 'Matsuda'] },
  USA: { name: 'Verenigde Staten', first: ['Brandon', 'Cody', 'Austin', 'Logan', 'Hunter', 'Cole', 'Chase', 'Dylan', 'Trevor', 'Garrett', 'Wyatt', 'Landon'], last: ['Henderson', 'Mitchell', 'Brooks', 'Sullivan', 'Coleman', 'Hayes', 'Porter', 'Fletcher', 'Spencer', 'Reed', 'Walsh', 'Caldwell'] },
  CRO: { name: 'Kroatië', first: ['Ivan', 'Marko', 'Ante', 'Josip', 'Mateo', 'Dario', 'Filip', 'Nikola', 'Tomislav', 'Domagoj', 'Karlo', 'Petar'], last: ['Horvat', 'Kovačević', 'Babić', 'Jurić', 'Novak', 'Knežević', 'Vuković', 'Marić', 'Pavlović', 'Božić', 'Grgić', 'Šimić'] },
  DEN: { name: 'Denemarken', first: ['Mads', 'Rasmus', 'Frederik', 'Mikkel', 'Emil', 'Kasper', 'Anders', 'Magnus', 'Viktor', 'Christian', 'Asger', 'Laurits'], last: ['Nielsen', 'Jørgensen', 'Lindholm', 'Holm', 'Dahl', 'Bruun', 'Østergaard', 'Lauridsen', 'Mogensen', 'Krogh', 'Thygesen', 'Skov'] },
  MAR: { name: 'Marokko', first: ['Youssef', 'Hamza', 'Ayoub', 'Ilias', 'Bilal', 'Anas', 'Soufiane', 'Mehdi', 'Zakaria', 'Omar', 'Nabil', 'Adam'], last: ['El Idrissi', 'Benali', 'Amrani', 'Ouazzani', 'Tahiri', 'El Mansouri', 'Bouzid', 'Lahlou', 'Chraibi', 'Haddad', 'Bennani', 'Kettani'] },
};

/* Vlaggen als SVG (werkt op elk platform, ook waar emoji-vlaggen ontbreken) */
function flagSVG(code) {
  const h3 = (a, b, c) => `<rect width="30" height="7" fill="${a}"/><rect y="6.6" width="30" height="7" fill="${b}"/><rect y="13.3" width="30" height="6.7" fill="${c}"/>`;
  const v3 = (a, b, c) => `<rect width="10.1" height="20" fill="${a}"/><rect x="10" width="10.1" height="20" fill="${b}"/><rect x="20" width="10" height="20" fill="${c}"/>`;
  const map = {
    NED: h3('#ae1c28', '#fff', '#21468b'),
    ENG: '<rect width="30" height="20" fill="#fff"/><rect x="12.5" width="5" height="20" fill="#ce1124"/><rect y="7.5" width="30" height="5" fill="#ce1124"/>',
    ESP: '<rect width="30" height="20" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/>',
    ITA: v3('#009246', '#fff', '#ce2b37'),
    GER: h3('#000', '#dd0000', '#ffce00'),
    FRA: v3('#0055a4', '#fff', '#ef4135'),
    BRA: '<rect width="30" height="20" fill="#009c3b"/><path d="M15 2.5 27 10 15 17.5 3 10z" fill="#ffdf00"/><circle cx="15" cy="10" r="4.4" fill="#002776"/>',
    ARG: '<rect width="30" height="20" fill="#74acdf"/><rect y="6.6" width="30" height="6.8" fill="#fff"/><circle cx="15" cy="10" r="2" fill="#f6b40e"/>',
    POR: '<rect width="30" height="20" fill="#ff0000"/><rect width="12" height="20" fill="#006600"/><circle cx="12" cy="10" r="3.6" fill="#ffcc00"/>',
    BEL: v3('#000', '#fae042', '#ed2939'),
    NGA: v3('#008751', '#fff', '#008751'),
    JPN: '<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="5.5" fill="#bc002d"/>',
    USA: '<rect width="30" height="20" fill="#fff"/>' + [0, 2, 4, 6, 8, 10, 12].map((i) => `<rect y="${i * 1.54}" width="30" height="1.54" fill="#b22234"/>`).join('') + '<rect width="13" height="10.8" fill="#3c3b6e"/>',
    CRO: h3('#ff0000', '#fff', '#171796') + '<rect x="12" y="5" width="6" height="7" fill="#fff" stroke="#ff0000" stroke-width=".8"/><rect x="12" y="5" width="2" height="2" fill="#ff0000"/><rect x="16" y="5" width="2" height="2" fill="#ff0000"/><rect x="14" y="7" width="2" height="2" fill="#ff0000"/><rect x="12" y="9" width="2" height="2" fill="#ff0000"/><rect x="16" y="9" width="2" height="2" fill="#ff0000"/>',
    DEN: '<rect width="30" height="20" fill="#c8102e"/><rect x="9" width="3.5" height="20" fill="#fff"/><rect y="8.2" width="30" height="3.5" fill="#fff"/>',
    MAR: '<rect width="30" height="20" fill="#c1272d"/><path d="M15 5.5 16.3 9.6H20.6L17.1 12.1 18.4 16.2 15 13.7 11.6 16.2 12.9 12.1 9.4 9.6H13.7Z" fill="none" stroke="#006233" stroke-width="1"/>',
  };
  return `<svg class="flag" viewBox="0 0 30 20" preserveAspectRatio="none"><g>${map[code] || '<rect width="30" height="20" fill="#888"/>'}</g><rect width="30" height="20" fill="none" stroke="rgba(0,0,0,.25)" stroke-width=".6"/></svg>`;
}

const LEAGUES = [
  { id: 'PK', name: 'Premier Kroon', nat: 'ENG', color: '#5b2a86', clubs: [
    ['Ashford Rovers', 'ASH', '#c8102e', '#ffffff', 84], ['Kingsbridge United', 'KBU', '#1d4ed8', '#ffffff', 82], ['Redhaven City', 'RHC', '#7dd3fc', '#0f172a', 79],
    ['Westmoor FC', 'WMR', '#111827', '#facc15', 76], ['Blackwater Town', 'BWT', '#0f766e', '#f8fafc', 72], ['Halston Albion', 'HAL', '#7c2d12', '#fbbf24', 69]] },
  { id: 'LS', name: 'Liga Sol', nat: 'ESP', color: '#e85d04', clubs: [
    ['Real Costaverde', 'RCV', '#ffffff', '#6d28d9', 85], ['Atlético Mirador', 'ATM', '#dc2626', '#ffffff', 81], ['CD Sierra Alta', 'CSA', '#16a34a', '#ffffff', 77],
    ['Unión Valdés', 'UVA', '#1e3a8a', '#fde047', 74], ['Deportivo Marisol', 'DMA', '#0ea5e9', '#ffffff', 71], ['SD Puerto Luz', 'SPL', '#f59e0b', '#1f2937', 67]] },
  { id: 'SC', name: 'Serie Corona', nat: 'ITA', color: '#0a7cff', clubs: [
    ['AC Lucerna', 'ACL', '#111111', '#e11d48', 83], ['Virtus Monteluce', 'VML', '#1e40af', '#111827', 81], ['FC Portavento', 'FCP', '#ffffff', '#111111', 78],
    ['Sporting Arcobaleno', 'SAR', '#7e22ce', '#facc15', 74], ['US Valfiore', 'USV', '#991b1b', '#fbbf24', 71], ['AS Castelrosso', 'ACR', '#b91c1c', '#ffffff', 68]] },
  { id: 'BK', name: 'Bundesklasse', nat: 'GER', color: '#d00000', clubs: [
    ['FC Eisenwald', 'FCE', '#dc2626', '#ffffff', 84], ['Borussia Hohenfels', 'BOH', '#facc15', '#111111', 80], ['SV Rheinstern', 'SVR', '#e11d48', '#111111', 77],
    ['VfB Grünberg', 'VFG', '#15803d', '#ffffff', 74], ['1. FC Adlerhorst', 'FCA', '#1f2937', '#e5e7eb', 70], ['Union Sturmhafen', 'UST', '#2563eb', '#ffffff', 67]] },
  { id: 'LE', name: 'Ligue Étoile', nat: 'FRA', color: '#1b3a8c', clubs: [
    ['Olympique Bellerive', 'OLB', '#1e3a8a', '#dc2626', 83], ['AS Montclair', 'ASM', '#dc2626', '#ffffff', 78], ['Stade Lumière', 'STL', '#ffffff', '#0284c7', 75],
    ['FC Rochenoire', 'FCR', '#111111', '#22c55e', 72], ['RC Valmont', 'RCV', '#facc15', '#b91c1c', 69], ['Racing Port-Azur', 'RPA', '#38bdf8', '#ffffff', 66]] },
  { id: 'LL', name: 'Lage Landen Liga', nat: 'NED', color: '#f97316', clubs: [
    ['SC Dijkhaven', 'SCD', '#ef4444', '#ffffff', 79], ['FC Polderstad', 'FCP', '#ffffff', '#ef4444', 76], ['Molenwijk \'08', 'MOL', '#f97316', '#111111', 73],
    ['VV Zeelicht', 'VVZ', '#1d4ed8', '#facc15', 70], ['Rapid Duinrand', 'RDU', '#16a34a', '#ffffff', 66], ['KV Scheldeburg', 'KVS', '#facc15', '#1e3a8a', 62]] },
];
const LEAGUE_NAT_EXTRA = { LL: ['BEL'], LE: ['MAR'], LS: ['ARG'], SC: ['CRO'], BK: ['DEN'], PK: ['NGA', 'USA'] };

const CLUBS = {};
LEAGUES.forEach((L) => {
  L.clubs = L.clubs.map(([name, short, c1, c2, str], i) => {
    const id = `${L.id}${i}`;
    const club = { id, name, short, c1, c2, str, league: L.id };
    CLUBS[id] = club;
    return club;
  });
});
CLUBS.ICON = { id: 'ICON', name: 'Legenden', short: '★', c1: '#f5e9c8', c2: '#b48a2c', league: 'ICON' };
CLUBS.HERO = { id: 'HERO', name: 'Helden', short: 'H', c1: '#4c1d95', c2: '#22d3ee', league: null };
const LEAGUE_BY_ID = Object.fromEntries(LEAGUES.map((l) => [l.id, l]));
LEAGUE_BY_ID.ICON = { id: 'ICON', name: 'Legenden', color: '#b48a2c' };

const POS_ORDER = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'];
const POS_GROUP = { GK: 'GK', CB: 'DEF', LB: 'DEF', RB: 'DEF', CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID', LW: 'ATT', RW: 'ATT', ST: 'ATT' };
const POS_NL = { GK: 'Keeper', CB: 'Centrale verdediger', LB: 'Linksback', RB: 'Rechtsback', CDM: 'Verdedigende middenvelder', CM: 'Centrale middenvelder', CAM: 'Aanvallende middenvelder', LM: 'Linkermiddenvelder', RM: 'Rechtermiddenvelder', LW: 'Linksbuiten', RW: 'Rechtsbuiten', ST: 'Spits' };
const ALT_POS = { GK: [], CB: ['CDM'], LB: ['LM'], RB: ['RM'], CDM: ['CM', 'CB'], CM: ['CDM', 'CAM'], CAM: ['CM', 'ST'], LM: ['LW', 'LB'], RM: ['RW', 'RB'], LW: ['LM', 'ST'], RW: ['RM', 'ST'], ST: ['CAM'] };

const STAT_LABELS = ['SNE', 'SCH', 'PAS', 'DRI', 'VER', 'FYS'];
const GK_LABELS = ['DUI', 'VAN', 'TRA', 'REF', 'SNE', 'POS'];
const STAT_NAMES = ['Snelheid', 'Schieten', 'Passen', 'Dribbelen', 'Verdedigen', 'Fysiek'];
const GK_NAMES = ['Duiken', 'Vangen', 'Trappen', 'Reflexen', 'Snelheid', 'Positie'];
const STAT_PROFILE = {
  GK: [2, 0, -6, 3, -10, 1],
  CB: [-8, -30, -10, -12, 4, 2], LB: [3, -22, -4, -2, -3, -6], RB: [3, -22, -4, -2, -3, -6],
  CDM: [-8, -14, 0, -4, 2, 3], CM: [-4, -6, 3, 1, -12, -4], CAM: [-1, -1, 2, 3, -30, -12],
  LM: [5, -5, -1, 2, -30, -12], RM: [5, -5, -1, 2, -30, -12], LW: [6, -2, -3, 4, -38, -14], RW: [6, -2, -3, 4, -38, -14],
  ST: [3, 3, -9, 0, -42, 0],
};

const RARITY = {
  bronze: { label: 'Brons', rareLabel: 'Zeldzaam brons' },
  silver: { label: 'Zilver', rareLabel: 'Zeldzaam zilver' },
  gold: { label: 'Goud', rareLabel: 'Zeldzaam goud' },
  inform: { label: 'In-Form', rareLabel: 'In-Form' },
  hero: { label: 'Held', rareLabel: 'Held' },
  icon: { label: 'Legende', rareLabel: 'Legende' },
};

const SKINS = ['#f6d3b8', '#ecbf98', '#d9a275', '#bd8458', '#9a6339', '#6f4426', '#4f2f1a'];
const HAIRS = ['#1b1209', '#2f1d10', '#4a2c16', '#7a4a22', '#b9864b', '#d8b46a', '#3b3b3b', '#a63c1a'];

/* ---------- Database genereren ---------- */
const DB = {};
const DB_LIST = [];

(function buildDB() {
  const r = U.rng(20261109);
  const usedNames = new Set();
  const natCodes = Object.keys(NATIONS);
  let pid = 0;

  function makeName(nat) {
    const N = NATIONS[nat];
    for (let i = 0; i < 30; i++) {
      const f = U.pick(N.first, r), l = U.pick(N.last, r);
      const key = f + ' ' + l;
      if (!usedNames.has(key)) { usedNames.add(key); return [f, l]; }
    }
    return [U.pick(N.first, r), U.pick(N.last, r) + ' Jr.'];
  }
  function looks(nat) {
    const darker = ['NGA', 'BRA', 'MAR', 'USA', 'FRA', 'POR'].includes(nat);
    const skin = darker ? U.ri(1, 6, r) : (nat === 'JPN' ? U.ri(0, 2, r) : U.ri(0, 3, r));
    const hairCol = skin >= 4 || nat === 'JPN' ? U.ri(0, 1, r) : U.ri(0, 7, r);
    return { skin, hair: hairCol, hs: U.ri(0, 6, r), beard: r() < 0.3 ? U.ri(1, 2, r) : 0 };
  }
  function makeStats(pos, rating, boost = 0) {
    const prof = STAT_PROFILE[pos];
    return prof.map((o) => U.clamp(Math.round(rating + o + boost + U.gauss(r) * 4 + (o < -20 ? U.gauss(r) * 6 : 0)), 18, 99));
  }
  function add(card) { DB[card.id] = card; DB_LIST.push(card); return card; }
  function tierOf(rt) { return rt >= 75 ? 'gold' : rt >= 65 ? 'silver' : 'bronze'; }

  const SQUAD_TEMPLATE = ['GK', 'GK', 'CB', 'CB', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'ST'];

  LEAGUES.forEach((L) => {
    L.clubs.forEach((club) => {
      const stars = [];
      SQUAD_TEMPLATE.forEach((pos, idx) => {
        const homeChance = 0.48;
        let nat;
        const extra = LEAGUE_NAT_EXTRA[L.id] || [];
        const x = r();
        if (x < homeChance) nat = L.nat; else if (x < homeChance + 0.14 && extra.length) nat = U.pick(extra, r); else nat = U.pick(natCodes, r);
        // Sterkte-spreiding: een paar sterren en een paar jonge talenten per club
        let rating = club.str + U.gauss(r) * 4.5 - (idx % 2 === 1 ? 3 : 0);
        if (r() < 0.12) rating += U.ri(4, 8, r);
        if (r() < 0.18) rating -= U.ri(8, 14, r);
        rating = U.clamp(Math.round(rating), 48, 92);
        const [first, last] = makeName(nat);
        const tier = tierOf(rating);
        const rareChance = tier === 'gold' ? 0.3 + (rating - 75) * 0.04 : 0.32;
        const alt = ALT_POS[pos].filter(() => r() < 0.5);
        const card = add({
          id: 'p' + (++pid), base: 'p' + pid, first, last, name: last, nat, club: club.id, league: L.id, pos, alt,
          r: rating, tier, rare: r() < rareChance, type: tier, stats: makeStats(pos, rating), look: looks(nat),
        });
        stars.push(card);
      });
    });
  });

  // In-Form kaarten: verbeterde versies van bestaande spelers
  const baseGold = DB_LIST.filter((c) => c.r >= 72);
  U.shuffle(baseGold.slice(), r).slice(0, 60).forEach((b) => {
    const boost = U.ri(2, 5, r);
    add({ ...b, id: b.id + 'IF', base: b.base, r: Math.min(97, b.r + boost), tier: 'gold', rare: true, type: 'inform', stats: b.stats.map((s) => Math.min(99, s + boost + U.ri(0, 2, r))) });
  });

  // Helden en Legenden
  const heroPos = ['CB', 'LB', 'CDM', 'CM', 'CAM', 'RM', 'LW', 'RW', 'ST', 'ST', 'GK', 'CB', 'RB', 'CM'];
  heroPos.forEach((pos) => {
    const nat = U.pick(natCodes, r);
    const [first, last] = makeName(nat);
    const rating = U.ri(85, 90, r);
    const L = U.pick(LEAGUES, r);
    add({ id: 'h' + (++pid), base: 'h' + pid, first, last, name: last, nat, club: 'HERO', league: L.id, pos, alt: ALT_POS[pos].slice(0, 1), r: rating, tier: 'gold', rare: true, type: 'hero', stats: makeStats(pos, rating, 2), look: looks(nat) });
  });
  const iconPos = ['GK', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CM', 'CAM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'ST', 'ST', 'CB'];
  iconPos.forEach((pos) => {
    const nat = U.pick(natCodes, r);
    const [first, last] = makeName(nat);
    const rating = U.ri(88, 96, r);
    add({ id: 'i' + (++pid), base: 'i' + pid, first, last, name: last, nat, club: 'ICON', league: 'ICON', pos, alt: ALT_POS[pos].slice(0, 2), r: rating, tier: 'gold', rare: true, type: 'icon', stats: makeStats(pos, rating, 3), look: { ...looks(nat), hs: U.ri(0, 6, r) } });
  });
})();

/* ---------- Visuals: avatar & clubembleem ---------- */
function avatarSVG(c) {
  const lk = c.look || { skin: 1, hair: 0, hs: 0, beard: 0 };
  const skin = SKINS[lk.skin] || SKINS[1];
  const hair = HAIRS[lk.hair] || HAIRS[0];
  const club = CLUBS[c.club] || CLUBS.HERO;
  let shirt = club.c1, trim = club.c2;
  if (c.type === 'icon') { shirt = '#fbf4e1'; trim = '#b48a2c'; }
  if (c.type === 'hero') { shirt = '#5b21b6'; trim = '#22d3ee'; }
  const uid = 'a' + c.id;
  const hairPaths = [
    'M28 36c0-16 10-25 22-25s22 9 22 25c-3-6-7-10-12-11-6 4-17 4-24 0-4 2-7 6-8 11z', // kort
    'M30 33c1-13 9-20 20-20s19 7 20 20c-4-5-11-7-20-7s-16 2-20 7z', // buzz
    'M26 38c-3-14 4-28 14-29 3-4 14-5 19-1 11 1 17 13 15 30-2-7-6-11-10-12-2-4-8-3-12-1-5-2-10-2-13 1-5 1-10 5-13 12z', // krullen
    'M26 50c-4-22 6-38 24-38s28 16 24 38c-1-12-4-18-8-21-8 3-23 3-31 0-5 3-8 9-9 21z', // lang
    '', // kaal
    'M44 8c3-1 9-1 12 0l2 22c-5-2-11-2-16 0z', // hanenkam
    'M27 37c-1-15 9-26 23-26 13 0 24 10 23 26-5-8-11-12-23-12-12 0-18 4-23 12z', // klassiek
  ];
  const hp = hairPaths[lk.hs % hairPaths.length];
  const beard = lk.beard === 1
    ? `<path d="M34 50c2 12 9 18 16 18s14-6 16-18c-3 5-8 7-16 7s-13-2-16-7z" fill="${hair}" opacity=".9"/>`
    : lk.beard === 2 ? `<path d="M42 58c3 2 13 2 16 0-1 4-4 6-8 6s-7-2-8-6z" fill="${hair}" opacity=".85"/>` : '';
  return `<svg class="avatar" viewBox="0 0 100 100">
    <defs><radialGradient id="${uid}s" cx="45%" cy="38%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></radialGradient>
    <linearGradient id="${uid}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shirt}"/><stop offset="1" stop-color="${shirt}" stop-opacity=".8"/></linearGradient></defs>
    <path d="M8 100c2-17 14-26 28-29l14 7 14-7c14 3 26 12 28 29z" fill="url(#${uid}k)"/>
    <path d="M36 71l14 9 14-9" fill="none" stroke="${trim}" stroke-width="4"/>
    <path d="M20 100c1-10 4-17 9-21M80 100c-1-10-4-17-9-21" stroke="${trim}" stroke-width="2.5" fill="none" opacity=".7"/>
    <rect x="42" y="58" width="16" height="16" rx="5" fill="${skin}"/>
    <rect x="42" y="64" width="16" height="6" fill="#000" opacity=".12"/>
    <ellipse cx="28.5" cy="44" rx="4" ry="6" fill="${skin}"/><ellipse cx="71.5" cy="44" rx="4" ry="6" fill="${skin}"/>
    <ellipse cx="50" cy="41" rx="21" ry="26" fill="${skin}"/>
    <ellipse cx="50" cy="41" rx="21" ry="26" fill="url(#${uid}s)"/>
    ${hp ? `<path d="${hp}" fill="${hair}"/>` : ''}
    <path d="M38 37.5q5-3 9 0M53 37.5q5-3 9 0" stroke="${lk.hs === 4 ? '#3a2a1c' : hair}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="42.5" cy="43" rx="2.2" ry="2.4" fill="#1d1d1d"/><ellipse cx="57.5" cy="43" rx="2.2" ry="2.4" fill="#1d1d1d"/>
    <circle cx="43.2" cy="42.2" r=".7" fill="#fff"/><circle cx="58.2" cy="42.2" r=".7" fill="#fff"/>
    <path d="M50 45l-2 7h4" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M44.5 57q5.5 3.5 11 0" fill="none" stroke="#6b2b2b" stroke-width="1.6" stroke-linecap="round"/>
    ${beard}
  </svg>`;
}

function badgeSVG(clubId, cls = '') {
  const c = CLUBS[clubId];
  if (!c) return '';
  if (clubId === 'ICON') {
    return `<svg class="badge ${cls}" viewBox="0 0 40 46"><path d="M20 2 37 8v14c0 11-7 18-17 22C10 40 3 33 3 22V8z" fill="#1c1608" stroke="#e8c76a" stroke-width="2"/><path d="M20 11l3.2 7 7.6.6-5.8 5 1.8 7.4L20 27l-6.8 4 1.8-7.4-5.8-5 7.6-.6z" fill="#e8c76a"/></svg>`;
  }
  if (clubId === 'HERO') {
    return `<svg class="badge ${cls}" viewBox="0 0 40 46"><path d="M20 2 37 8v14c0 11-7 18-17 22C10 40 3 33 3 22V8z" fill="#2e1065" stroke="#22d3ee" stroke-width="2"/><path d="M23 8 12 25h7l-3 13 12-18h-7z" fill="#22d3ee"/></svg>`;
  }
  const h = U.hash(c.id) % 3;
  const pattern = h === 0
    ? `<path d="M20 2v42" stroke="${c.c2}" stroke-width="8"/>`
    : h === 1 ? `<path d="M3 17h34" stroke="${c.c2}" stroke-width="7"/>` : `<path d="M3 8 37 36" stroke="${c.c2}" stroke-width="7"/>`;
  return `<svg class="badge ${cls}" viewBox="0 0 40 46"><defs><clipPath id="bc${c.id}${cls}"><path d="M20 2 37 8v14c0 11-7 18-17 22C10 40 3 33 3 22V8z"/></clipPath></defs>
    <g clip-path="url(#bc${c.id}${cls})"><rect width="40" height="46" fill="${c.c1}"/>${pattern}</g>
    <path d="M20 2 37 8v14c0 11-7 18-17 22C10 40 3 33 3 22V8z" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1.6"/>
    <rect x="7" y="25" width="26" height="10" rx="2" fill="rgba(0,0,0,.55)"/>
    <text x="20" y="33" text-anchor="middle" font-size="8" font-weight="800" fill="#fff" font-family="Barlow Condensed, Arial Narrow, sans-serif">${U.esc(c.short)}</text></svg>`;
}
