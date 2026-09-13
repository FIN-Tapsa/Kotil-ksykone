import type { LapsiProfiili } from '../types';
import type { NakyvaKappale } from '../content/contentApi';
import { CharacterAvatar } from '../ui/CharacterAvatar';
import { aineIkoni } from '../ui/aineIkoni';

interface Props {
  profiili: LapsiProfiili;
  nakyvatKappaleet: NakyvaKappale[];
  onValitseAine: (aine: string) => void;
  onVaihdaProfiili: () => void;
}

// Ensimmäinen vaihe: valitaan aine. Kappalevalinta (mahdollisesti useampi
// kappale kerralla) tapahtuu seuraavassa näkymässä (Kappaleenvalinta.tsx).
export function Ainevalinta({ profiili, nakyvatKappaleet, onValitseAine, onVaihdaProfiili }: Props) {
  const naytettavat = nakyvatKappaleet.filter((n) => n.tila !== 'piilotettu');
  const aineet = [...new Set(naytettavat.map((n) => n.kappale.aine))];

  return (
    <div class="naytto">
      <CharacterAvatar hahmo={profiili.hahmo} tunnetila="neutraali" koko={100} />
      <h1 class="otsikko">Hei {profiili.nimi}! Mitä ainetta harjoitellaan?</h1>

      {aineet.length === 0 && (
        <p class="alaotsikko">Ei vielä sisältöä {profiili.luokkaAste}:lle. Pyydä vanhempaa lisäämään kappaleita.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {aineet.map((aine) => {
          const kappaleitaYhteensa = naytettavat.filter((n) => n.kappale.aine === aine).length;
          return (
            <button
              key={aine}
              class="kortti"
              style={{ textAlign: 'left', cursor: 'pointer', border: 'none', width: '100%' }}
              onClick={() => onValitseAine(aine)}
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
                  {aineIkoni(aine)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{aine}</div>
                  <div class="alaotsikko" style={{ margin: 0, textAlign: 'left' }}>
                    {kappaleitaYhteensa} {kappaleitaYhteensa === 1 ? 'kappale' : 'kappaletta'}
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
