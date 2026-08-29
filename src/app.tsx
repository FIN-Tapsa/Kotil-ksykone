import { useEffect, useState } from 'preact/hooks';
import './theme/theme.css';
import type { Asetukset, Kappale, KuvaKysymys, Kysymys, LapsiData, LapsiProfiili, Pelitila, TekstiKysymys, VastausTapahtuma } from './types';
import { haeKaikkiKappaleet, kirjaaFokusKierros, suodataNakyvatKappaleet } from './content/contentApi';
import { haeAsetukset, haeLapsiData, haeProfiilit, lisaaRaportti, tallennaLapsiData, tallennaProfiilit } from './state/storage';
import { ALKUELAMAT_LOPUTON, JOKEREITA_PER_SESSIO, rakennaKysymysPino } from './game/engine';
import { tarkistaBadget, type SessioTulos } from './game/badges';
import type { Badge } from './types';

import { ProfiilinValinta } from './views/ProfiilinValinta';
import { ProfiilinLuonti } from './views/ProfiilinLuonti';
import { VanhempiKirjautuminen } from './views/VanhempiKirjautuminen';
import { VanhempiDashboard } from './views/VanhempiDashboard';
import { Aiheenvalinta } from './views/Aiheenvalinta';
import { Tilanvalinta } from './views/Tilanvalinta';
import { Kysymysnakyma } from './views/Kysymysnakyma';
import { Yhteenveto } from './views/Yhteenveto';

type Nakyma =
  | 'lataus'
  | 'profiilinvalinta'
  | 'profiilinluonti'
  | 'vanhempikirjautuminen'
  | 'vanhempidashboard'
  | 'aiheenvalinta'
  | 'tilanvalinta'
  | 'kysymys'
  | 'yhteenveto';

function kysymysTeksti(k: Kysymys): string {
  return k.tyyppi === 'teksti' ? (k as { tyyppi: 'teksti' } & TekstiKysymys).kysymys : (k as { tyyppi: 'kuva' } & KuvaKysymys).laji;
}

export function App() {
  const [nakyma, setNakyma] = useState<Nakyma>('lataus');
  const [profiilit, setProfiilit] = useState<LapsiProfiili[]>([]);
  const [asetukset, setAsetukset] = useState<Asetukset | null>(null);
  const [kaikkiKappaleet, setKaikkiKappaleet] = useState<Kappale[]>([]);

  const [aktiiviProfiili, setAktiiviProfiili] = useState<LapsiProfiili | null>(null);
  const [lapsiData, setLapsiData] = useState<LapsiData | null>(null);

  const [valittuKappale, setValittuKappale] = useState<Kappale | null>(null);
  const [pelitila, setPelitila] = useState<Pelitila | null>(null);
  const [kysymysPino, setKysymysPino] = useState<Kysymys[]>([]);
  const [indeksi, setIndeksi] = useState(0);
  const [sessioVastaukset, setSessioVastaukset] = useState<VastausTapahtuma[]>([]);
  const [elamat, setElamat] = useState(ALKUELAMAT_LOPUTON);
  const [korkeus, setKorkeus] = useState(0);
  const [jokereitaJaljella, setJokereitaJaljella] = useState(JOKEREITA_PER_SESSIO);
  const [uudetBadget, setUudetBadget] = useState<Badge[]>([]);

  useEffect(() => {
    (async () => {
      const [p, a, k] = await Promise.all([haeProfiilit(), haeAsetukset(), haeKaikkiKappaleet()]);
      setProfiilit(p);
      setAsetukset(a);
      setKaikkiKappaleet(k);
      setNakyma('profiilinvalinta');
    })();
  }, []);

  async function kirjaudu(profiili: LapsiProfiili) {
    setAktiiviProfiili(profiili);
    setLapsiData(await haeLapsiData(profiili.id));
    setNakyma('aiheenvalinta');
  }

  async function luoProfiili(profiili: LapsiProfiili) {
    const uudet = [...profiilit, profiili];
    setProfiilit(uudet);
    await tallennaProfiilit(uudet);
    await kirjaudu(profiili);
  }

  function aloitaSessio(kappale: Kappale, tila: Pelitila) {
    setValittuKappale(kappale);
    setPelitila(tila);
    const maara = tila.tyyppi === 'kiinteä' ? tila.maara : undefined;
    setKysymysPino(rakennaKysymysPino(kappale, maara));
    setIndeksi(0);
    setSessioVastaukset([]);
    setElamat(ALKUELAMAT_LOPUTON);
    setKorkeus(0);
    setJokereitaJaljella(JOKEREITA_PER_SESSIO);
    setNakyma('kysymys');
  }

  async function paataSessio(vastaukset: VastausTapahtuma[], loputonKorkeus?: number) {
    if (!lapsiData || !valittuKappale || !pelitila) return;
    const tulos: SessioTulos = {
      aine: valittuKappale.aine,
      kappale: valittuKappale.kappale,
      vastaukset,
      pelitilaTyyppi: pelitila.tyyppi,
      loputonKorkeus,
    };
    const { data, uudet } = tarkistaBadget(lapsiData, tulos);
    const dataFokusPaivitetty = kirjaaFokusKierros(data, valittuKappale.aine, valittuKappale.kappale);
    setLapsiData(dataFokusPaivitetty);
    await tallennaLapsiData(dataFokusPaivitetty);
    setUudetBadget(uudet);
    setNakyma('yhteenveto');
  }

  function kasitteleVastaus(kysymys: Kysymys, oikein: boolean, valittuTeksti: string) {
    if (!valittuKappale) return;
    const tapahtuma: VastausTapahtuma = {
      aika: new Date().toISOString(),
      aine: valittuKappale.aine,
      kappale: valittuKappale.kappale,
      kysymysId: kysymys.id,
      kysymysTeksti: kysymysTeksti(kysymys),
      oikein,
      valittuVastaus: valittuTeksti,
    };
    const uudetVastaukset = [...sessioVastaukset, tapahtuma];
    setSessioVastaukset(uudetVastaukset);

    if (pelitila?.tyyppi === 'loputon') {
      const uudetElamat = oikein ? elamat : elamat - 1;
      const uusiKorkeus = oikein ? korkeus + 1 : korkeus;
      setElamat(uudetElamat);
      setKorkeus(uusiKorkeus);
      if (uudetElamat <= 0) {
        paataSessio(uudetVastaukset, uusiKorkeus);
        return;
      }
      const seuraavaIndeksi = indeksi + 1;
      if (seuraavaIndeksi >= kysymysPino.length) {
        // kysymyspino loppui - sekoitetaan sama kappale uudestaan jatkoa varten
        setKysymysPino(rakennaKysymysPino(valittuKappale));
        setIndeksi(0);
      } else {
        setIndeksi(seuraavaIndeksi);
      }
    } else {
      const seuraavaIndeksi = indeksi + 1;
      if (seuraavaIndeksi >= kysymysPino.length) {
        paataSessio(uudetVastaukset);
      } else {
        setIndeksi(seuraavaIndeksi);
      }
    }
  }

  async function raportoiKysymys(kysymysId: string) {
    if (!aktiiviProfiili || !valittuKappale) return;
    await lisaaRaportti({
      kysymysId,
      aine: valittuKappale.aine,
      kappale: valittuKappale.kappale,
      profiiliNimi: aktiiviProfiili.nimi,
      aika: new Date().toISOString(),
      kasitelty: false,
    });
  }

  const teemaJuureen = aktiiviProfiili?.teema ?? 'lila';

  if (nakyma === 'lataus') {
    return <div class="naytto" data-teema="lila" />;
  }

  return (
    <div data-teema={teemaJuureen} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {nakyma === 'profiilinvalinta' && (
        <ProfiilinValinta
          profiilit={profiilit}
          onKirjaudu={kirjaudu}
          onUusiProfiili={() => setNakyma('profiilinluonti')}
          onVanhempi={() => setNakyma('vanhempikirjautuminen')}
        />
      )}

      {nakyma === 'profiilinluonti' && (
        <ProfiilinLuonti onValmis={luoProfiili} onPeruuta={() => setNakyma('profiilinvalinta')} />
      )}

      {nakyma === 'vanhempikirjautuminen' && asetukset && (
        <VanhempiKirjautuminen
          oikeaPin={asetukset.vanhempiPin}
          onOnnistui={() => setNakyma('vanhempidashboard')}
          onPeruuta={() => setNakyma('profiilinvalinta')}
        />
      )}

      {nakyma === 'vanhempidashboard' && (
        <VanhempiDashboard
          onSulje={async () => {
            // Dashboard muokkaa asetuksia/profiileja omassa tilassaan - ladataan
            // tuoreet arvot pääsovellukseen ettei aiheenvalinta jää käyttämään
            // vanhentunutta kopiota (esim. juuri asetettu fokusrajoitus).
            const [p, a] = await Promise.all([haeProfiilit(), haeAsetukset()]);
            setProfiilit(p);
            setAsetukset(a);
            setNakyma('profiilinvalinta');
          }}
        />
      )}

      {nakyma === 'aiheenvalinta' && aktiiviProfiili && asetukset && lapsiData && (
        <Aiheenvalinta
          profiili={aktiiviProfiili}
          nakyvatKappaleet={suodataNakyvatKappaleet(kaikkiKappaleet, aktiiviProfiili.luokkaAste, asetukset, lapsiData)}
          onValitseKappale={(nk) => {
            setValittuKappale(nk.kappale);
            setNakyma('tilanvalinta');
          }}
          onVaihdaProfiili={() => {
            setAktiiviProfiili(null);
            setNakyma('profiilinvalinta');
          }}
        />
      )}

      {nakyma === 'tilanvalinta' && valittuKappale && (
        <Tilanvalinta
          kappale={valittuKappale}
          onValitse={(tila) => aloitaSessio(valittuKappale, tila)}
          onTakaisin={() => setNakyma('aiheenvalinta')}
        />
      )}

      {nakyma === 'kysymys' && aktiiviProfiili && kysymysPino[indeksi] && (
        <Kysymysnakyma
          key={kysymysPino[indeksi].id + indeksi}
          kysymys={kysymysPino[indeksi]}
          hahmo={aktiiviProfiili.hahmo}
          jokereitaJaljella={jokereitaJaljella}
          onKaytaJokeri={() => setJokereitaJaljella((n) => n - 1)}
          onVastaa={(oikein, valittu) => kasitteleVastaus(kysymysPino[indeksi], oikein, valittu)}
          onRaportoi={raportoiKysymys}
          elamat={pelitila?.tyyppi === 'loputon' ? elamat : undefined}
          korkeus={pelitila?.tyyppi === 'loputon' ? korkeus : undefined}
          jarjestys={pelitila?.tyyppi === 'kiinteä' ? `${indeksi + 1}/${kysymysPino.length}` : `Kysymys ${indeksi + 1}`}
        />
      )}

      {nakyma === 'yhteenveto' && aktiiviProfiili && (
        <Yhteenveto
          hahmo={aktiiviProfiili.hahmo}
          vastaukset={sessioVastaukset}
          uudetBadget={uudetBadget}
          loputonKorkeus={pelitila?.tyyppi === 'loputon' ? korkeus : undefined}
          onRaportoi={raportoiKysymys}
          onUudestaan={() => valittuKappale && pelitila && aloitaSessio(valittuKappale, pelitila)}
          onValitseToinenAihe={() => setNakyma('aiheenvalinta')}
        />
      )}
    </div>
  );
}
