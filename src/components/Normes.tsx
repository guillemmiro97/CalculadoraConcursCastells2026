import { ExternalLink } from 'lucide-react'

interface Props {
  onShowAbout?: () => void
}

export function Normes({ onShowAbout }: Props) {
  return (
    <div className="normes-section">
      <section>
        <h2>Taula de puntuacions</h2>
        <p>
          Les 47 construccions incloses a la taula oficial del XXX Concurs de Castells
          tenen dues puntuacions: carregat (C) i descarregat (D). Els intents i intents
          desmuntats no sumen punts.
        </p>
      </section>

      <section>
        <h2>Cinc rondes. Tres que compten.</h2>
        <p>
          Cada colla fa cinc rondes. La puntuació final és la suma de les <strong>tres
          millors construccions</strong> vàlides. Si n'hi ha menys de tres, es sumen les
          que s'hagin aconseguit.
        </p>
      </section>

      <section>
        <h2>Màxim dos carregats</h2>
        <p>
          Com a màxim <strong>dos castells carregats</strong> poden contribuir a la
          puntuació final. Si una colla en té més, només compten els dos amb més punts.
        </p>
      </section>

      <section>
        <h2>Castells duplicats</h2>
        <p>
          Si un mateix castell s'ha assolit més d'una vegada, només compta el de major
          puntuació. Per exemple, si has fet un 3de9f carregat i després un 3de9f
          descarregat, només compta el descarregat.
        </p>
      </section>

      <section>
        <h2>Intents i reintents</h2>
        <p>
          Una colla pot intentar una construcció com a màxim <strong>dues vegades</strong>.
          Un peu desmuntat no compta com a intent separat dins de la mateixa ronda.
        </p>
      </section>

      <section>
        <h2>Rondes 4 i 5</h2>
        <p>
          A les rondes 4 i 5, les colles poden actuar si:
        </p>
        <ul>
          <li>Han assolit menys de tres construccions en les rondes anteriors.</li>
          <li>Intenten un castell superior als que han descarregat.</li>
          <li>Tornen a intentar un castell que ja han carregat.</li>
        </ul>
      </section>

      <section>
        <h2>Compatibilitat de base</h2>
        <p>
          No es pot combinar un castell amb un altre de base idèntica (excepte si són
          compatibles segons el Protocol de Plaça). Per exemple, el 4de8 i el 4de9f
          són incompatibles, però el 4de9f i el 4de9sf sí que són compatibles.
        </p>
      </section>

      <section>
        <h2>Penalitzacions</h2>
        <p>
          Les penalitzacions poden intervenir en els criteris de desempat. Aquesta
          calculadora no substitueix la valoració del Jurat.
        </p>
      </section>

      <section className="normes-sources">
        <h2>Fonts oficials</h2>
        <ul>
          <li>
            <a href="https://www.concursdecastells.cat/normes-basiques-2026-cdc" target="_blank" rel="noopener noreferrer">
              Normes bàsiques 2026 <ExternalLink size={14} />
            </a>
          </li>
          <li>
            <a href="https://www.concursdecastells.cat/protocol-de-placa-2026-cdc" target="_blank" rel="noopener noreferrer">
              Protocol de Plaça 2026 <ExternalLink size={14} />
            </a>
          </li>
          <li>
            <a href="https://www.concursdecastells.cat/taula-de-puntuacions-2026-cdc" target="_blank" rel="noopener noreferrer">
              Taula de puntuacions 2026 <ExternalLink size={14} />
            </a>
          </li>
        </ul>
        <p className="normes-disclaimer">
          En cas de discrepància, preval sempre la normativa oficial del Concurs de Castells.
        </p>
      </section>

      <section className="normes-about">
        <p>
          Calculadora independent i no oficial del Concurs de Castells 2026.
          Desenvolupament: Guillem Miró.
          Fonts de puntuacions i normativa: Concurs de Castells / fonts oficials.
        </p>
        {onShowAbout && (
          <p>
            <button className="normes-about-link" onClick={onShowAbout}>
              Sobre la calculadora
            </button>
          </p>
        )}
      </section>
    </div>
  )
}
