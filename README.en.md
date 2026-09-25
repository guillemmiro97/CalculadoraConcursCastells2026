# Castells Contest Calculator 2026

[Versió en català](README.md)

An independent, unofficial calculator for the **XXX Tarragona Castells Contest 2026**. Simulate a team's five rounds and calculate its score using the official 2026 scoring table and rules.

**Try the live app:** [calculador-concurs-castells.web.app](https://calculador-concurs-castells.web.app/)

Five rounds. Three castells count. Do the maths.

## Features

- **Five-round simulation:** choose a castell and record whether it was completed, topped, attempted, or dismantled.
- **Automatic scoring:** see the live total and a breakdown of counted and excluded castells, including why each one was excluded.
- **Scoring rules:** finds the best combination of up to three valid constructions, with at most two topped castells. Attempts score no points; when a construction is repeated, only its higher-scoring result is considered.
- **Castell search:** search by code or name and view official topped/completed scores.
- **Rule validation:** checks base incompatibilities, the attempt limit per construction, compatibility exceptions, and restrictions for rounds 4 and 5.
- **Team selection:** choose from 48 available teams (42 Contest participants and 6 teams from the International Day), grouped by session.
- **Saved calculations:** save up to 100 simulations in your browser. Filter by team, sort by score or date, view, edit, rename, share, or delete them. Saved data stays in that browser and on that device.
- **Sharing:** share a summary using the device's native share sheet or clipboard. The simulation is also encoded in the URL fragment, so a link can restore it.
- **PWA and offline use:** install the app and use it offline after it has loaded.
- **Optional analytics:** Google Analytics is enabled only after cookie consent; you can change your choice in the app.

## Rules and sources

Implemented scores and rules are based on these official sources:

- [Basic Rules 2026](https://www.concursdecastells.cat/normes-basiques-2026-cdc)
- [Plaza Protocol 2026](https://www.concursdecastells.cat/protocol-de-placa-2026-cdc)
- [Scoring Table 2026](https://www.concursdecastells.cat/taula-de-puntuacions-2026-cdc)

The calculator includes all 47 constructions in the scoring table. It applies the best-three scoring rule, the limit of two topped castells, deduplication of repeated constructions, incompatibilities and exceptions from the Plaza Protocol, a maximum of two attempts per construction, and the restrictions for rounds 4 and 5.

The app does not simulate the jury's technical assessment or penalties, the draw and performance order, the Estrella Ranking, closing pillars, or time limits. Penalties may affect tie-breakers; the app does not subtract them or replace the jury. Official rules take precedence if there is any discrepancy.

## Local development

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Open the local address printed by Vite (http://localhost:5173 by default).

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |
| `npm test` | Run the tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run Oxlint |

## Technology

- React 19 and TypeScript
- Vite 8
- Vitest and Testing Library
- Oxlint
- PWA with `vite-plugin-pwa` and Workbox
- Firebase Hosting

## Deployment

```bash
npm run build
firebase deploy --only hosting
```

## Credits and license

Developed by [Guillem Miró](https://github.com/guillemmiro97/CalculadoraConcursCastells2026). This is an independent, unofficial app and is not affiliated with Tarragona City Council or the Castells Contest organizers. See the [license](LICENSE).
