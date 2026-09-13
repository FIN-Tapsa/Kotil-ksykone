import type { Kappale, Pelitila } from '../types';

interface Props {
  kappaleet: Kappale[]; // yksi tai useampi valittu kappale (sama aine)
  onValitse: (tila: Pelitila) => void;
  onTakaisin: () => void;
}

export function Tilanvalinta({ kappaleet, onValitse, onTakaisin }: Props) {
  const maara = kappaleet.reduce((s, k) => s + k.tekstiKysymykset.length + k.kuvaKysymykset.length, 0);
  const otsikko =
    kappaleet.length === 1 ? kappaleet[0].metadata.nimi : `${kappaleet.length} kappaletta valittu`;

  return (
    <div class="naytto">
      <h1 class="otsikko">{otsikko}</h1>
      {kappaleet.length > 1 && (
        <p class="alaotsikko">{kappaleet.map((k) => k.metadata.nimi).join(' · ')}</p>
      )}
      <p class="alaotsikko">Valitse pelitila ({maara} kysymystä yhteensä saatavilla)</p>

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
        Vaihda kappaletta
      </button>
    </div>
  );
}
