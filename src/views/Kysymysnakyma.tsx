import { useState } from 'preact/hooks';
import type { HahmoNimi, Kysymys } from '../types';
import { kayta5050, kuvaVaihtoehdot, tekstiVaihtoehdot, type KuvaVaihtoehto, type Vaihtoehto } from '../game/engine';
import { CharacterAvatar } from '../ui/CharacterAvatar';
import { PlaceholderKuva } from '../ui/PlaceholderKuva';

interface Props {
  kysymys: Kysymys;
  hahmo: HahmoNimi;
  jokereitaJaljella: number;
  onKaytaJokeri: () => void;
  onVastaa: (oikein: boolean, valittuTeksti: string) => void;
  onRaportoi: (kysymysId: string) => void;
  elamat?: number;
  korkeus?: number;
  jarjestys: string; // "3/10" tms. näyttöä varten
}

export function Kysymysnakyma({
  kysymys,
  hahmo,
  jokereitaJaljella,
  onKaytaJokeri,
  onVastaa,
  onRaportoi,
  elamat,
  korkeus,
  jarjestys,
}: Props) {
  const [vastattu, setVastattu] = useState<string | null>(null);
  const [viisikymmentaKaytetty, setViisikymmentaKaytetty] = useState(false);
  const [raportoitu, setRaportoitu] = useState(false);

  const tekstiVaihtoehdotArr =
    kysymys.tyyppi === 'teksti' ? tekstiVaihtoehdot(kysymys) : [];
  const kuvaVaihtoehdotArr = kysymys.tyyppi === 'kuva' ? kuvaVaihtoehdot(kysymys) : [];

  const [naytettavatKuva, setNaytettavatKuva] = useState<KuvaVaihtoehto[]>(kuvaVaihtoehdotArr);
  const [naytettavatTeksti] = useState<Vaihtoehto[]>(tekstiVaihtoehdotArr);

  function kaytaJokeri() {
    if (jokereitaJaljella <= 0 || viisikymmentaKaytetty || vastattu) return;
    setViisikymmentaKaytetty(true);
    onKaytaJokeri();
    if (kysymys.tyyppi === 'kuva') {
      setNaytettavatKuva((nyk) => kayta5050(nyk));
    }
  }

  function valitse(teksti: string, oikea: boolean) {
    if (vastattu) return;
    setVastattu(teksti);
    setTimeout(() => onVastaa(oikea, teksti), 700);
  }

  function raportoi() {
    setRaportoitu(true);
    onRaportoi(kysymys.id);
  }

  const tunnetila = vastattu
    ? (kysymys.tyyppi === 'teksti'
        ? naytettavatTeksti.find((v) => v.teksti === vastattu)?.oikea
        : naytettavatKuva.find((v) => v.nimi === vastattu)?.oikea)
      ? 'iloinen'
      : 'pettynyt'
    : 'miettiva';

  return (
    <div class="naytto">
      <div class="vaakarivi" style={{ justifyContent: 'space-between', width: '100%' }}>
        <span class="alaotsikko">{jarjestys}</span>
        {elamat !== undefined && (
          <span>
            {'❤️'.repeat(Math.max(elamat, 0))}
            {'🤍'.repeat(Math.max(3 - elamat, 0))}
          </span>
        )}
        {korkeus !== undefined && <span class="alaotsikko">🏔️ {korkeus}</span>}
        <button class="lippu-nappi" onClick={raportoi} disabled={raportoitu} title="Raportoi kysymys">
          {raportoitu ? '✅' : '🚩'}
        </button>
      </div>

      <CharacterAvatar hahmo={hahmo} tunnetila={tunnetila} koko={96} />

      {kysymys.tyyppi === 'teksti' && (
        <>
          <h2 class="otsikko">{kysymys.kysymys}</h2>
          <div class="vastausrivi">
            {naytettavatTeksti.map((v) => (
              <button
                key={v.teksti}
                class={`vastausnappi ${
                  vastattu === v.teksti ? (v.oikea ? 'vastausnappi--oikein' : 'vastausnappi--vaarin') : ''
                } ${vastattu && vastattu !== v.teksti && v.oikea ? 'vastausnappi--oikein' : ''}`}
                onClick={() => valitse(v.teksti, v.oikea)}
                disabled={!!vastattu}
              >
                {v.teksti}
              </button>
            ))}
          </div>
        </>
      )}

      {kysymys.tyyppi === 'kuva' && kysymys.kysymystyyppi === 'nimea_kuvasta' && (
        <>
          <p class="alaotsikko">Tunnista:</p>
          <div class="kortti" style={{ width: 200, height: 200, padding: 0, overflow: 'hidden' }}>
            <PlaceholderKuva laji={kysymys.laji} kategoria={kysymys.kategoria} />
          </div>
          <div class="vastausrivi">
            {naytettavatKuva.map((v) => (
              <button
                key={v.nimi}
                class={`vastausnappi ${
                  vastattu === v.nimi ? (v.oikea ? 'vastausnappi--oikein' : 'vastausnappi--vaarin') : ''
                } ${vastattu && vastattu !== v.nimi && v.oikea ? 'vastausnappi--oikein' : ''}`}
                onClick={() => valitse(v.nimi, v.oikea)}
                disabled={!!vastattu}
              >
                {v.nimi}
              </button>
            ))}
          </div>
        </>
      )}

      {kysymys.tyyppi === 'kuva' && kysymys.kysymystyyppi === 'neljä_kuvaa' && (
        <>
          <h2 class="otsikko">Mikä näistä on {kysymys.laji.toLowerCase()}?</h2>
          <div class="kuvaruudukko">
            {naytettavatKuva.map((v) => (
              <button
                key={v.nimi}
                class={`kuvaruutu ${
                  vastattu ? (v.oikea ? 'kuvaruutu--oikein' : v.nimi === vastattu ? 'kuvaruutu--vaarin' : '') : ''
                }`}
                style={{ border: 'none', padding: 0 }}
                onClick={() => valitse(v.nimi, v.oikea)}
                disabled={!!vastattu}
              >
                <PlaceholderKuva laji={v.nimi} kategoria={kysymys.kategoria} />
              </button>
            ))}
          </div>
        </>
      )}

      {kysymys.tyyppi === 'kuva' && (
        <button
          class="nappi nappi-toissijainen"
          onClick={kaytaJokeri}
          disabled={viisikymmentaKaytetty || jokereitaJaljella <= 0 || !!vastattu}
        >
          50/50 ({jokereitaJaljella} jäljellä)
        </button>
      )}
    </div>
  );
}
