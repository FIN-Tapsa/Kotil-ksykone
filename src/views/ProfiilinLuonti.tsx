import { useState } from 'preact/hooks';
import type { HahmoNimi, LapsiProfiili, TeemaNimi } from '../types';
import { CharacterAvatar } from '../ui/CharacterAvatar';
import { PinSyote } from '../ui/PinSyote';
import { MOCK_LUOKKA_ASTEET } from '../content/mockContent';

interface Props {
  onValmis: (profiili: LapsiProfiili) => void;
  onPeruuta: () => void;
}

const HAHMOT: HahmoNimi[] = ['pesukarhu', 'kettu'];
const TEEMAT: { nimi: TeemaNimi; label: string }[] = [
  { nimi: 'lila', label: 'Lila' },
  { nimi: 'sininen', label: 'Sininen' },
  { nimi: 'keltainen', label: 'Keltainen' },
  { nimi: 'vihrea', label: 'Vihreä' },
];

export function ProfiilinLuonti({ onValmis, onPeruuta }: Props) {
  const [nimi, setNimi] = useState('');
  const [hahmo, setHahmo] = useState<HahmoNimi>('pesukarhu');
  const [teema, setTeema] = useState<TeemaNimi>('lila');
  const [luokkaAste, setLuokkaAste] = useState(MOCK_LUOKKA_ASTEET[2]);
  const [vaihe, setVaihe] = useState<'tiedot' | 'pin'>('tiedot');

  function jatka() {
    if (!nimi.trim()) return;
    setVaihe('pin');
  }

  function valmis(annettuPin: string) {
    onValmis({
      id: crypto.randomUUID(),
      nimi: nimi.trim(),
      pin: annettuPin,
      hahmo,
      teema,
      luokkaAste,
    });
  }

  if (vaihe === 'pin') {
    return (
      <div class="naytto" data-teema={teema}>
        <CharacterAvatar hahmo={hahmo} tunnetila="miettiva" />
        <h1 class="otsikko">Keksi 4-numeroinen PIN</h1>
        <p class="alaotsikko">Tällä kirjaudut jatkossa sisään, {nimi}!</p>
        <PinSyote onValmis={valmis} />
        <button class="linkkinappi" onClick={() => setVaihe('tiedot')}>
          Takaisin
        </button>
      </div>
    );
  }

  return (
    <div class="naytto" data-teema={teema}>
      <h1 class="otsikko">Uusi pelaaja</h1>

      <div class="kortti" style={{ width: '100%' }}>
        <label>
          Nimi
          <br />
          <input
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 12,
              border: '2px solid var(--tausta-korostus)',
              fontSize: '1rem',
              marginTop: 6,
            }}
            value={nimi}
            onInput={(e) => setNimi((e.target as HTMLInputElement).value)}
            placeholder="Esim. Aino"
          />
        </label>
      </div>

      <div class="kortti" style={{ width: '100%' }}>
        <p class="alaotsikko" style={{ margin: '0 0 8px' }}>
          Valitse hahmo
        </p>
        <div class="vaakarivi">
          {HAHMOT.map((h) => (
            <div
              key={h}
              class={`profiilikortti ${hahmo === h ? 'profiilikortti--valittu' : ''}`}
              onClick={() => setHahmo(h)}
            >
              <CharacterAvatar hahmo={h} tunnetila="iloinen" koko={72} />
              <span style={{ textTransform: 'capitalize' }}>{h}</span>
            </div>
          ))}
        </div>
      </div>

      <div class="kortti" style={{ width: '100%' }}>
        <p class="alaotsikko" style={{ margin: '0 0 8px' }}>
          Valitse väri
        </p>
        <div class="pinorivi">
          {TEEMAT.map((t) => (
            <button
              key={t.nimi}
              class="nappi"
              data-teema={t.nimi}
              style={{
                background: teema === t.nimi ? 'var(--paavari)' : 'var(--tausta-korostus)',
                color: teema === t.nimi ? '#fff' : 'var(--teksti)',
              }}
              onClick={() => setTeema(t.nimi)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div class="kortti" style={{ width: '100%' }}>
        <p class="alaotsikko" style={{ margin: '0 0 8px' }}>
          Luokka-aste
        </p>
        <select
          style={{ width: '100%', padding: 12, borderRadius: 12, fontSize: '1rem' }}
          value={luokkaAste}
          onChange={(e) => setLuokkaAste((e.target as HTMLSelectElement).value)}
        >
          {MOCK_LUOKKA_ASTEET.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div class="vaakarivi">
        <button class="nappi nappi-toissijainen" onClick={onPeruuta}>
          Peruuta
        </button>
        <button class="nappi nappi-ensisijainen" onClick={jatka} disabled={!nimi.trim()}>
          Jatka →
        </button>
      </div>
    </div>
  );
}
