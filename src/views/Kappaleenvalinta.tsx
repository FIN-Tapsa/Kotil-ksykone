import { useState } from 'preact/hooks';
import type { Kappale } from '../types';
import type { NakyvaKappale } from '../content/contentApi';

interface Props {
  aine: string;
  nakyvatKappaleet: NakyvaKappale[];
  onJatka: (valitutKappaleet: Kappale[]) => void;
  onTakaisin: () => void;
}

// Toinen vaihe: valitaan yksi TAI USEAMPI kappale samasta aineesta (esim.
// laajempi koealue) - kysymykset arvotaan kaikkien valittujen kappaleiden
// yhteisestä kysymyspoolista (ks. game/engine.ts rakennaKysymysPino).
export function Kappaleenvalinta({ aine, nakyvatKappaleet, onJatka, onTakaisin }: Props) {
  const kappaleetTassaAineessa = nakyvatKappaleet.filter((n) => n.kappale.aine === aine && n.tila !== 'piilotettu');
  const [valitutAvaimet, setValitutAvaimet] = useState<Set<string>>(new Set());

  function avain(nk: NakyvaKappale) {
    return nk.kappale.aine + '::' + nk.kappale.kappale;
  }

  function vaihdaValinta(nk: NakyvaKappale) {
    if (nk.tila !== 'avoin') return;
    setValitutAvaimet((edelliset) => {
      const uudet = new Set(edelliset);
      const a = avain(nk);
      if (uudet.has(a)) uudet.delete(a);
      else uudet.add(a);
      return uudet;
    });
  }

  const valitut = kappaleetTassaAineessa.filter((nk) => valitutAvaimet.has(avain(nk)));
  const kysymyksiaYhteensa = valitut.reduce(
    (summa, nk) => summa + nk.kappale.tekstiKysymykset.length + nk.kappale.kuvaKysymykset.length,
    0,
  );

  return (
    <div class="naytto">
      <h1 class="otsikko">{aine}</h1>
      <p class="alaotsikko">Valitse yksi tai useampi kappale — voit valita monta jos koealue on laaja.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {kappaleetTassaAineessa.map((nk) => {
          const maara = nk.kappale.tekstiKysymykset.length + nk.kappale.kuvaKysymykset.length;
          const onValittu = valitutAvaimet.has(avain(nk));
          return (
            <button
              key={avain(nk)}
              class={`kortti ${nk.tila === 'harmaa' ? 'harmaa' : ''}`}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                border: onValittu ? '3px solid var(--paavari)' : '3px solid transparent',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
              onClick={() => vaihdaValinta(nk)}
              disabled={nk.tila === 'harmaa'}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  borderRadius: 9,
                  background: onValittu ? 'var(--paavari)' : 'var(--tausta-korostus)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 800,
                }}
              >
                {onValittu ? '✓' : ''}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{nk.kappale.metadata.nimi}</div>
                <div class="alaotsikko" style={{ margin: 0, textAlign: 'left' }}>
                  {maara} kysymystä{nk.tila === 'harmaa' ? ' · tälle päivälle pelattu jo tarpeeksi' : ''}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div class="vaakarivi">
        <button class="nappi nappi-toissijainen" onClick={onTakaisin}>
          ← Vaihda ainetta
        </button>
        <button
          class="nappi nappi-ensisijainen"
          disabled={valitut.length === 0}
          onClick={() => onJatka(valitut.map((nk) => nk.kappale))}
        >
          Jatka {valitut.length > 0 ? `(${kysymyksiaYhteensa} kysymystä)` : ''}
        </button>
      </div>
    </div>
  );
}
