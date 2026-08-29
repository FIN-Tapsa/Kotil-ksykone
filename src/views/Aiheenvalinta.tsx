import type { LapsiProfiili } from '../types';
import type { NakyvaKappale } from '../content/contentApi';
import { CharacterAvatar } from '../ui/CharacterAvatar';

interface Props {
  profiili: LapsiProfiili;
  nakyvatKappaleet: NakyvaKappale[];
  onValitseKappale: (nk: NakyvaKappale) => void;
  onVaihdaProfiili: () => void;
}

function aineIkoni(aine: string): string {
  const t = aine.toLowerCase();
  if (t.includes('biolog')) return '🌿';
  if (t.includes('histor')) return '🏺';
  if (t.includes('äidinkiel') || t.includes('kieli')) return '🔤';
  return '📘';
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
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    flexShrink: 0,
                    borderRadius: 20,
                    background: 'var(--paavari-vaalea, var(--tausta-korostus))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    boxShadow: 'inset 0 -4px 8px rgba(122, 88, 196, .18)',
                  }}
                >
                  {aineIkoni(nk.kappale.aine)}
                </div>
                <div>
                  <div class="alaotsikko" style={{ margin: 0, textAlign: 'left' }}>
                    {nk.kappale.aine}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{nk.kappale.metadata.nimi}</div>
                  <div class="alaotsikko" style={{ margin: 0, textAlign: 'left' }}>
                    {maara} kysymystä{nk.tila === 'harmaa' ? ' · tälle päivälle pelattu jo tarpeeksi' : ''}
                  </div>
                </div>
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
