# Ultimate Elftal ⚽

Een kaartspel in de browser: open packs, verzamel spelers, bouw je droomteam en speel gesimuleerde wedstrijden tegen de computer om munten en packs te verdienen.

Alle spelers, clubs en competities zijn fictief en worden in de code gegenereerd.

## Spelen

Er is geen build-stap. Open `index.html` in een browser, of start een lokale server:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Je voortgang wordt opgeslagen in `localStorage` van je browser. Via ⚙️ kun je het spel resetten.

## Wat zit erin

- **Pack-openingen**: 9 soorten packs, van Brons tot Legende. Een topspeler (84+, In-Form, Held of Legende) krijgt een walkout: eerst het land, dan de positie, dan de club en tot slot de kaart, met lichtshow, confetti en geluid.
- **Kaarten**: brons, zilver en goud (gewoon en zeldzaam), plus In-Form, Helden en Legenden, elk met een eigen ontwerp en een gegenereerd portret.
- **Selectie**: 6 formaties, chemie per club, land en competitie (0–3 per speler, maximaal 33), teambeoordeling en automatisch opstellen.
- **Wedstrijdsimulatie**: een live verslag minuut voor minuut met commentaar, balbezit, xG, kaarten, momentum, doelpuntanimaties en strafschoppen. Je kunt tijdens de wedstrijd van mentaliteit wisselen. Na afloop krijg je spelerscijfers en een Man van de Wedstrijd.
- **Spelmodi**
  - *Snelle wedstrijd*: 7 moeilijkheidsniveaus met oplopende beloningen.
  - *Divisies*: seizoenen van 7 wedstrijden met promotie en degradatie, van Divisie 10 tot 1.
  - *Toernooien*: 4 knock-outbekers met inleg en prijzen per ronde.
  - *Squad-uitdagingen*: lever spelers in die aan de eisen voldoen en krijg er packs voor terug.
- **Store en transfermarkt**: packs kopen of bewaren, met kansen per pack. Op de transfermarkt koop je gericht spelers en verkoop je spelers uit je club.
- **Dagelijkse doelen** en elke 4 uur een **gratis cadeau**.
- Geluidseffecten via WebAudio (geen audiobestanden nodig) en een layout die ook op mobiel werkt.

## Structuur

| Bestand | Inhoud |
|---|---|
| `js/util.js` | Hulpfuncties, modals, toasts, confetti, geluid |
| `js/data.js` | Landen, competities, clubs, spelersdatabase, portretten en emblemen |
| `js/cards.js` | Kaartweergave, waarde en detailvenster |
| `js/state.js` | Spelstatus, opslag en dagelijkse doelen |
| `js/squad.js` | Formaties, chemie, teambeoordeling en het selectiescherm |
| `js/packs.js` | Packdefinities, kansen en de openingsshow |
| `js/match.js` | Simulatie-engine en wedstrijdscherm |
| `js/modes.js` | Snelle wedstrijd, divisies en toernooien |
| `js/sbc.js` | Squad-uitdagingen |
| `js/store.js` | Store, transfermarkt en Mijn packs |
| `js/app.js` | Navigatie, home, club, onboarding en instellingen |
