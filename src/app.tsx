import { useEffect, useState } from 'preact/hooks';
import './theme/theme.css';
import type { Asetukset, Kappale, KuvaKysymys, Kysymys, LapsiData, LapsiProfiili, Pelitila, TekstiKysymys, VastausTapahtuma } from './types';
import { haeKaikkiKappaleet, kirjaaFokusKierros, suodataNakyvatKappaleet } from './content/contentApi';
import { haeAsetukset, haeLapsiData, haeProfiilit, lisaaRaportti, tallennaLapsiData, tallennaProfiilit } from './state/storage';
import { ALKUELAMAT_LOPUTON, JOKEREITA_PER_SESSIO, rakennaKysymysPino, type KysymysLahteet } from './game/engine';
import { tarkistaBadget, type SessioTulos } from './game/badges';
import type { Badge } from './types';

import { ProfiilinValinta } from './views/ProfiilinValinta';
import { ProfiilinLuonti } from './views/ProfiilinLuonti';
import { VanhempiKirjautuminen } from './views/VanhempiKirjautuminen';
import { VanhempiDashboard } from './views/VanhempiDashboard';
import { Ainevalinta } from './views/Ainevalinta';
import { Kappaleenvalinta } from './views/Kappaleenvalinta';
import { Tilanvalinta } from './views/Tilanvalinta';
import { Kysymysnakyma } from './views/Kysymysnakyma';
import { Yhteenveto } from './views/Yhteenveto';

type Nakyma =
  | 'lataus'
  | 'profiilinvalinta'
  | 'profiilinluonti'
  | 'vanhempikirjautuminen'
  | 'vanhempidashboard'
  | 'ainevalinta'
  | 'kappaleenvalinta'
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

  const [valittuAine, setValittuAine] = useState<string | null>(null);
  // Yksi tai useampi kappale voi olla valittuna kerralla (esim. laajempi koealue) -
  // kaikki valitut kappaleet ovat aina samasta aineesta, koska aine valitaan ensin.
  const [valitutKappaleet, setValitutKappaleet] = useState<Kappale[]>([]);
  const [pelitila, setPelitila] = useState<Pelitila | null>(null);
  const [kysymysPino, setKysymysPino] = useState<Kysymys[]>([]);
  const [kysymysLahteet, setKysymysLahteet] = useState<KysymysLahteet>({});
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
    setNakyma('ainevalinta');
  }

  async function luoProfiili(profiili: LapsiProfiili) {
    const uudet = [...profiilit, profiili];
    setProfiilit(uudet);
    await tallennaProfiilit(uudet);
    await kirjaudu(profiili);
  }

  function aloitaSessio(kappaleet: Kappale[], tila: Pelitila) {
    setValitutKappaleet(kappaleet);
    setPelitila(tila);
    const maara = tila.tyyppi === 'kiinteä' ? tila.maara : undefined;
    const { pino, lahteet } = rakennaKysymysPino(kappaleet, maara);
    setKysymysPino(pino);
    setKysymysLahteet(lahteet);
    setIndeksi(0);
    setSessioVastaukset([]);
    setElamat(ALKUELAMAT_LOPUTON);
    setKorkeus(0);
    setJokereitaJaljella(JOKEREITA_PER_SESSIO);
    setNakyma('kysymys');
  }

  async function paataSessio(vastaukset: VastausTapahtuma[], loputonKorkeus?: number) {
    if (!lapsiData || valitutKappaleet.length === 0 || !pelitila) return;
    const tulos: SessioTulos = {
      aine: valitutKappaleet[0].aine,
      kappale: valitutKappaleet.map((k) => k.kappale).join(' + '),
      vastaukset,
      pelitilaTyyppi: pelitila.tyyppi,
      loputonKorkeus,
    };
    const { data, uudet } = tarkistaBadget(lapsiData, tulos);
    let dataFokusPaivitetty = data;
    for (const k of valitutKappaleet) {
      dataFokusPaivitetty = kirjaaFokusKierros(dataFokusPaivitetty, k.aine, k.kappale);
    }
    setLapsiData(dataFokusPaivitetty);
    await tallennaLapsiData(dataFokusPaivitetty);
    setUudetBadget(uudet);
    setNakyma('yhteenveto');
  }

  function lahdeKysymykselle(kysymysId: string) {
    return kysymysLahteet[kysymysId] ?? { aine: valitutKappaleet[0]?.aine ?? '', kappale: valitutKappaleet[0]?.kappale ?? '' };
  }

  function kasitteleVastaus(kysymys: Kysymys, oikein: boolean, valittuTeksti: string) {
    if (valitutKappaleet.length === 0) return;
    const lahde = lahdeKysymykselle(kysymys.id);
    const tapahtuma: VastausTapahtuma = {
      aika: new Date().toISOString(),
      aine: lahde.aine,
      kappale: lahde.kappale,
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
        // kysymyspino loppui - sekoitetaan samat kappaleet uudestaan jatkoa varten
        setKysymysPino(rakennaKysymysPino(valitutKappaleet).pino);
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
    if (!aktiiviProfiili || valitutKappaleet.length === 0) return;
    const lahde = lahdeKysymykselle(kysymysId);
    await lisaaRaportti({
      kysymysId,
      aine: lahde.aine,
      kappale: lahde.kappale,
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

      {nakyma === 'ainevalinta' && aktiiviProfiili && asetukset && lapsiData && (
        <Ainevalinta
          profiili={aktiiviProfiili}
          nakyvatKappaleet={suodataNakyvatKappaleet(kaikkiKappaleet, aktiiviProfiili.luokkaAste, asetukset, lapsiData)}
          onValitseAine={(aine) => {
            setValittuAine(aine);
            setNakyma('kappaleenvalinta');
          }}
          onVaihdaProfiili={() => {
            setAktiiviProfiili(null);
            setNakyma('profiilinvalinta');
          }}
        />
      )}

      {nakyma === 'kappaleenvalinta' && valittuAine && asetukset && lapsiData && aktiiviProfiili && (
        <Kappaleenvalinta
          aine={valittuAine}
          nakyvatKappaleet={suodataNakyvatKappaleet(kaikkiKappaleet, aktiiviProfiili.luokkaAste, asetukset, lapsiData)}
          onJatka={(kappaleet) => {
            setValitutKappaleet(kappaleet);
            setNakyma('tilanvalinta');
          }}
          onTakaisin={() => setNakyma('ainevalinta')}
        />
      )}

      {nakyma === 'tilanvalinta' && valitutKappaleet.length > 0 && (
        <Tilanvalinta
          kappaleet={valitutKappaleet}
          onValitse={(tila) => aloitaSessio(valitutKappaleet, tila)}
          onTakaisin={() => setNakyma('kappaleenvalinta')}
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
          indeksi={indeksi}
          yhteensa={pelitila?.tyyppi === 'kiinteä' ? kysymysPino.length : undefined}
          kappaleenKuvaKysymykset={valitutKappaleet.flatMap((k) => k.kuvaKysymykset)}
        />
      )}

      {nakyma === 'yhteenveto' && aktiiviProfiili && (
        <Yhteenveto
          hahmo={aktiiviProfiili.hahmo}
          vastaukset={sessioVastaukset}
          uudetBadget={uudetBadget}
          loputonKorkeus={pelitila?.tyyppi === 'loputon' ? korkeus : undefined}
          onRaportoi={raportoiKysymys}
          onUudestaan={() => valitutKappaleet.length > 0 && pelitila && aloitaSessio(valitutKappaleet, pelitila)}
          onValitseToinenAihe={() => setNakyma('ainevalinta')}
        />
      )}
    </div>
  );
}
