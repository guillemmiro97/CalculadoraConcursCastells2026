# Calculadora Concurs de Castells 2026

Calculadora no oficial del **XXX Concurs de Castells de Tarragona 2026**.

Cinc rondes. Tres castells que compten. Fes números.

## Inici ràpid

```bash
npm install
npm run dev
```

Obre http://localhost:5173 al navegador.

## Comandes

| Comanda | Descripció |
|---|---|
| `npm run dev` | Servidor de desenvolupament |
| `npm run build` | Build de producció |
| `npm run preview` | Previsualització del build |
| `npm test` | Executa els tests |
| `npm run test:watch` | Tests en mode watch |
| `npm run lint` | Linter (oxlint) |

## Funcionalitats

- **Calculadora en temps real**: Introdueix els resultats de cada ronda i veu la puntuació total instantàniament.
- **Millors tres castells**: Només compten les tres millors construccions vàlides, amb desglossament de comptats i exclosos.
- **Selecció ràpida**: Picker de castells amb cerca per codi, nom o tipus.
- **Validació de regles**: Bloqueja combinacions invàlides segons el Protocol de Plaça 2026.
- **Selecció de colla**: 42 colles participants amb cerca i agrupació per sessió.
- **Taula de puntuacions**: Consulta les 47 construccions oficials amb punts carregat/descarregat.
- **Normes resum**: Resum de les regles clau amb enllaços a les fonts oficials.
- **Desament**: Fins a 100 càlculs desats amb filtre, ordenació, rebombrament i restauració.
- **Comparteix**: Genera un text resum de la simulació (Web Share API o portapapers).
- **URL amb estat**: L'estat de la calculadora es codifica a la URL per compartir simulacions.
- **PWA**: Funciona offline després de la primera visita.
- **Persistència**: L'estat es guarda a localStorage.

## Normativa implementada

### Fonts oficials

Totes les puntuacions i regles provenen de:

- [Normes bàsiques 2026](https://www.concursdecastells.cat/normes-basiques-2026-cdc)
- [Protocol de Plaça 2026](https://www.concursdecastells.cat/protocol-de-placa-2026-cdc)
- [Taula de puntuacions 2026](https://www.concursdecastells.cat/taula-de-puntuacions-2026-cdc) (Ajuntament de Tarragona)

### Regles implementades

- **Puntuació**: Taula de 47 construccions amb punts carregat i descarregat oficials 2026.
- **Millors tres castells**: La puntuació final és la suma de les tres millors construccions vàlides.
- **Màxim dos carregats**: Com a màxim dos castells carregats contribueixen a la puntuació final.
- **Castells duplicats**: Si un castell s'ha assolit dues vegades, només compta el de major puntuació.
- **Intent i intent desmuntat**: No sumen cap punt.
- **Màxim dos intents per construcció**: Una colla pot intentar una construcció com a màxim dues vegades.
- **Incompatibilitat de base idèntica**: Llistat oficial d'incompatibilitats del Protocol de Plaça.
- **Compatibilitats especials**: Excepcions oficials (ex: 4de9f compatible amb 4de9sf).
- **Rondes 4 i 5**: Restriccions segons Article 8 de les Normes Bàsiques (castells superiors o reintents de carregats).
- **Penalitzacions**: S'informa que afecten el desempat, però no se'n resten punts.

### Regles NO simulades

- Valoració tècnica del Jurat (penalitzacions per execució).
- Patró d'actuació i sorteig de plaça.
- Rànquing Estrella (sistema de classificació diferent del Concurs).
- Pilars de comiat.
- Temps màxims d'execució.

## Estructura del projecte

```
src/
├── main.tsx                 # Punt d'entrada
├── App.tsx                  # Component arrel
├── index.css                # Estils
├── domain/                  # Lògica de negoci (pura, sense React)
│   ├── types.ts             # Tipus: CastellCode, Round, ScoringResult...
│   ├── scoring.ts           # Càlcul de puntuació, deduplicació, combinacions
│   └── rules.ts             # Restriccions d'incompatibilitat, intents, rondes 4/5
├── data/                    # Dades estàtiques
│   ├── castells2026.ts      # 47 construccions amb punts
│   └── colles2026.ts        # 42 colles per sessió
├── hooks/
│   └── useCalculator.ts     # Hook principal d'estat
├── storage/
│   └── savedCalculations.ts # CRUD de càlculs desats (localStorage)
├── utils/
│   ├── share.ts             # Codificació d'estat a URL hash
│   ├── format.ts            # Format de punts (ca-ES)
│   └── color.ts             # Contrast de color WCAG
├── components/              # Components React
│   ├── RoundCard.tsx
│   ├── CastellPicker.tsx
│   ├── CollaPicker.tsx
│   ├── CollaBadge.tsx
│   ├── CollaAvatar.tsx
│   ├── ScoreBreakdown.tsx
│   ├── Taula.tsx
│   ├── Normes.tsx
│   ├── SavedCalculationsList.tsx
│   └── SavedCalculationDetail.tsx
└── __tests__/               # Tests
    ├── scoring.test.ts
    ├── savedCalculations.test.ts
    └── colles2026.test.ts
```

## Tecnologia

- **Frontend**: React 19 + TypeScript
- **Build**: Vite 8
- **Tests**: Vitest + Testing Library
- **Lint**: oxlint
- **PWA**: vite-plugin-pwa + Workbox
- **Icones**: lucide-react
- **Hosting**: Firebase Hosting (estàtic)

## Desplegament

```bash
npm run build
firebase deploy --only hosting
```

## Llicència

Aquesta és una calculadora no oficial. No està afiliada a l'Ajuntament de Tarragona ni al Concurs de Castells.

En cas de discrepància, preval sempre la normativa oficial del Concurs de Castells.
