import { useState } from 'preact/hooks';
import type { LapsiProfiili } from '../types';
import { CharacterAvatar } from '../ui/CharacterAvatar';
import { PinSyote } from '../ui/PinSyote';

interface Props {
  profiilit: LapsiProfiili[];
  onKirjaudu: (profiili: LapsiProfiili) => void;
  onUusiProfiili: () => void;
  onVanhempi: () => void;
}

export function ProfiilinValinta({ profiilit, onKirjaudu, onUusiProfiili, onVanhempi }: Props) {
  const [valittu, setValittu] = useState<LapsiProfiili | null>(null);
  const [virhe, setVirhe] = useState<string | undefined>();

  function tarkistaPin(pin: string) {
    if (!valittu) return;
    if (pin === valittu.pin) {
      onKirjaudu(valittu);
    } else {
      setVirhe('Väärä PIN, yritä uudelleen');
    }
  }

  return (
    <div class="naytto">
      <h1 class="otsikko">Kuka pelaa? 🎮</h1>
      <div class="vaakarivi">
        {profiilit.map((p) => (
          <div
            key={p.id}
            class={`profiilikortti ${valittu?.id === p.id ? 'profiilikortti--valittu' : ''}`}
            data-teema={p.teema}
            onClick={() => {
              setValittu(p);
              setVirhe(undefined);
            }}
          >
            <div class="hahmokeha">
              <CharacterAvatar hahmo={p.hahmo} tunnetila="neutraali" koko={72} />
            </div>
            <strong>{p.nimi}</strong>
            <span class="alaotsikko">{p.luokkaAste}</span>
          </div>
        ))}
        <div class="profiilikortti" onClick={onUusiProfiili}>
          <div style={{ fontSize: '2.2rem' }}>➕</div>
          <strong>Uusi pelaaja</strong>
        </div>
      </div>

      {valittu && (
        <div class="kortti" style={{ width: '100%' }}>
          <p class="alaotsikko">Anna {valittu.nimi}:n PIN-koodi</p>
          <PinSyote onValmis={tarkistaPin} virhe={virhe} />
        </div>
      )}

      <button class="linkkinappi" onClick={onVanhempi} style={{ marginTop: 24 }}>
        Vanhemman asetukset
      </button>
    </div>
  );
}
