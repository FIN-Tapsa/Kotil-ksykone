import type { LapsiProfiili } from '../types';
import type { NakyvaKappale } from '../content/contentApi';
import { CharacterAvatar } from '../ui/CharacterAvatar';

interface Props {
  profiili: LapsiProfiili;
  nakyvatKappaleet: NakyvaKappale[];
  onValitseKappale: (nk: NakyvaKappale) => void;
  onVaihdaProfiili: () => void;
}

export function Aiheenvalinta({ profiili, nakyvatKappaleet, onValitseKappale, onVaihdaProfiili }: Props) {
  const avoimet = nakyvatKappaleet.filter((n) => n.tila !== 'piilotettu');

  return (
    <div class="naytto">
      <CharacterAvatar hahmo={profiili.hahmo} tunnetila="neutraali" koko={100} />
      <h1 class="otsikko">Hei {profiili.nimi}! Mitä harjoitellaan?</h1>

      {avoimet.length === 0 && (
        <p class="alaotsikko">Ei vielä sisältöä {profiili.luokkaAste}:lle. Pyydä vanhempaa lisäämään kappaleita.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {avoimet.map((nk) => {
          const maara = nk.kappale.tekstiKysymykset.length + nk.kappale.kuvaKysymykset.length;
          return (
            <button
              key={nk.kappale.aine + nk.kappale.kappale}
              class={`kortti ${nk.tila === 'harmaa' ? 'harmaa' : ''}`}
              style={{ textAlign: 'left', cursor: 'pointer', border: 'none', width: '100%' }}
              onClick={() => nk.tila === 'avoin' && onValitseKappale(nk)}
              disabled={nk.tila === 'harmaa'}
            >
              <div class="alaotsikko" style={{ margin: 0 }}>
                {nk.kappale.aine}
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{nk.kappale.metadata.nimi}</div>
              <div class="alaotsikko" style={{ margin: 0 }}>
                {maara} kysymystä{nk.tila === 'harmaa' ? ' · tälle päivälle pelattu jo tarpeeksi' : ''}
              </div>
            </button>
          );
        })}
      </div>

      <button class="linkkinappi" onClick={onVaihdaProfiili}>
        Vaihda pelaajaa
      </button>
    </div>
  );
}
