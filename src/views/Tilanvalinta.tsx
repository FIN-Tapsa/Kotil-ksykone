import type { Kappale, Pelitila } from '../types';

interface Props {
  kappale: Kappale;
  onValitse: (tila: Pelitila) => void;
  onTakaisin: () => void;
}

export function Tilanvalinta({ kappale, onValitse, onTakaisin }: Props) {
  const maara = kappale.tekstiKysymykset.length + kappale.kuvaKysymykset.length;

  return (
    <div class="naytto">
      <h1 class="otsikko">{kappale.metadata.nimi}</h1>
      <p class="alaotsikko">Valitse pelitila</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {[5, 10, 15].map((n) => (
          <button
            key={n}
            class="nappi nappi-ensisijainen"
            disabled={maara < 1}
            onClick={() => onValitse({ tyyppi: 'kiinteä', maara: n as 5 | 10 | 15 })}
          >
            {n} kysymystä
          </button>
        ))}
        <button class="nappi nappi-toissijainen" onClick={() => onValitse({ tyyppi: 'loputon' })}>
          🧗 Loputon kiipeily (3 elämää)
        </button>
      </div>

      <button class="linkkinappi" onClick={onTakaisin}>
        Vaihda aihetta
      </button>
    </div>
  );
}
