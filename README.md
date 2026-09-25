# Calculadora Concurs de Castells 2026

[English version](README.en.md)

Calculadora independent i no oficial del **XXX Concurs de Castells de Tarragona 2026**. Simula les cinc rondes d'una colla i calcula la puntuació segons la taula i les normes oficials de 2026.

**Prova l'app en directe:** [calculador-concurs-castells.web.app](https://calculador-concurs-castells.web.app/)

Cinc rondes. Tres castells que compten. Fes números.

## Funcionalitats

- **Simulació de cinc rondes:** tria un castell i indica si s'ha descarregat, carregat, ha estat un intent o un intent desmuntat.
- **Puntuació automàtica:** mostra el total en temps real i el desglossament dels castells que compten i els exclosos, amb el motiu de l'exclusió.
- **Còmput de puntuació:** selecciona la millor combinació de fins a tres construccions vàlides, amb un màxim de dos carregats; els intents no puntuen i, si es repeteix una construcció, es considera el resultat que dona més punts.
- **Cercador de castells:** cerca per codi o nom i consulta'n les puntuacions oficials carregat/descarregat.
- **Validació de regles:** informa de les incompatibilitats de base, dels intents màxims per construcció, de les excepcions de compatibilitat i de les restriccions de les rondes 4 i 5.
- **Selecció de colla:** tria entre les 48 colles disponibles (42 participants del Concurs i 6 colles de la Diada Internacional), agrupades per sessió.
- **Càlculs desats:** desa fins a 100 simulacions en el navegador. Es poden filtrar per colla, ordenar per puntuació o data, consultar, modificar, reanomenar, compartir o eliminar. Les dades desades són locals al navegador i dispositiu.
- **Compartició:** comparteix un resum amb l'API nativa del dispositiu o el porta-retalls. La simulació també queda codificada al fragment de la URL, de manera que es pot compartir un enllaç que la restaura.
- **PWA i mode sense connexió:** es pot instal·lar com a aplicació i, després de carregar-la, funciona sense connexió.
- **Analítica opcional:** Google Analytics només s'activa si s'accepten les cookies; la decisió es pot canviar des de l'aplicació.

## Normativa

Les puntuacions i les regles implementades es basen en aquestes fonts oficials:

- [Normes bàsiques 2026](https://www.concursdecastells.cat/normes-basiques-2026-cdc)
- [Protocol de Plaça 2026](https://www.concursdecastells.cat/protocol-de-placa-2026-cdc)
- [Taula de puntuacions 2026](https://www.concursdecastells.cat/taula-de-puntuacions-2026-cdc)

La calculadora inclou les 47 construccions de la taula de puntuacions. Aplica el còmput de les tres millors, el límit de dos castells carregats, la deduplicació de construccions repetides, les incompatibilitats i excepcions del Protocol de Plaça, el màxim de dos intents per construcció i les restriccions de les rondes 4 i 5.

No simula la valoració tècnica del Jurat ni les penalitzacions, el sorteig i patró d'actuació, el Rànquing Estrella, els pilars de comiat ni els temps màxims d'execució. Les penalitzacions poden afectar els desempats; l'app no les resta ni substitueix el Jurat. En cas de discrepància, preval la normativa oficial.

## Desenvolupament local

Requisits: Node.js i npm.

```bash
npm install
npm run dev
```

Obre l'adreça local que indiqui Vite (per defecte, http://localhost:5173).

| Comanda | Descripció |
|---|---|
| `npm run dev` | Inicia el servidor de desenvolupament |
| `npm run build` | Genera el build de producció |
| `npm run preview` | Previsualitza el build de producció |
| `npm test` | Executa els tests |
| `npm run test:watch` | Executa els tests en mode watch |
| `npm run lint` | Executa Oxlint |

## Tecnologia

- React 19 i TypeScript
- Vite 8
- Vitest i Testing Library
- Oxlint
- PWA amb `vite-plugin-pwa` i Workbox
- Firebase Hosting

## Desplegament

```bash
npm run build
firebase deploy --only hosting
```

## Crèdits i llicència

Desenvolupament: [Guillem Miró](https://github.com/guillemmiro97/CalculadoraConcursCastells2026). Aplicació independent i no oficial, no afiliada a l'Ajuntament de Tarragona ni a l'organització del Concurs de Castells. Consulta la [llicència](LICENSE).
