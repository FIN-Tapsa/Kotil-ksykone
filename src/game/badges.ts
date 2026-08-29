// Badge-tarkistuslogiikka. Neljä kategoriaa design-promptin mukaan:
// jatkuvuus, osaaminen (per aine), täydellisyys (täysi sarja), kiipeily-ennätys.
import type { Badge, LapsiData, VastausTapahtuma } from '../types';

export interface SessioTulos {
  aine: string;
  kappale: string;
  vastaukset: VastausTapahtuma[];
  pelitilaTyyppi: 'kiinteä' | 'loputon';
  loputonKorkeus?: number;
}

function jo(lapsiData: LapsiData, id: string): boolean {
  return lapsiData.badget.some((b) => b.id === id);
}

const STREAK_RAJAT = [3, 7, 30];
const OSAAMINEN_RAJA = 100;
const KIIPEILY_RAJA = 20;

export function paivitaStreak(lapsiData: LapsiData): LapsiData {
  const tanaan = new Date().toISOString().slice(0, 10);
  if (lapsiData.streak.viimeisinPelipaiva === tanaan) return lapsiData;

  const eilen = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const nykyinen =
    lapsiData.streak.viimeisinPelipaiva === eilen ? lapsiData.streak.nykyinen + 1 : 1;

  return {
    ...lapsiData,
    streak: {
      nykyinen,
      pisin: Math.max(nykyinen, lapsiData.streak.pisin),
      viimeisinPelipaiva: tanaan,
    },
  };
}

/** Palauttaa päivitetyn LapsiData:n sekä tässä sessiossa juuri saavutetut uudet badget. */
export function tarkistaBadget(lapsiDataAlussa: LapsiData, tulos: SessioTulos): { data: LapsiData; uudet: Badge[] } {
  let data = paivitaStreak(lapsiDataAlussa);
  const uudet: Badge[] = [];
  const nyt = new Date().toISOString();

  for (const raja of STREAK_RAJAT) {
    const id = `jatkuvuus-${raja}`;
    if (data.streak.nykyinen >= raja && !jo(data, id)) {
      uudet.push({
        id,
        kategoria: 'jatkuvuus',
        nimi: `${raja} päivän putki`,
        kuvaus: `Pelasit ${raja} päivänä peräkkäin!`,
        saavutettu: nyt,
      });
    }
  }

  const oikeinYhteensaAineessa =
    data.historia.filter((h) => h.aine === tulos.aine && h.oikein).length +
    tulos.vastaukset.filter((v) => v.oikein).length;
  const osaamisId = `osaaminen-${tulos.aine}-${OSAAMINEN_RAJA}`;
  if (oikeinYhteensaAineessa >= OSAAMINEN_RAJA && !jo(data, osaamisId)) {
    uudet.push({
      id: osaamisId,
      kategoria: 'osaaminen',
      nimi: `${OSAAMINEN_RAJA} oikein - ${tulos.aine}`,
      kuvaus: `Olet vastannut oikein ${OSAAMINEN_RAJA} kertaa aineessa ${tulos.aine}!`,
      saavutettu: nyt,
    });
  }

  if (
    tulos.pelitilaTyyppi === 'kiinteä' &&
    tulos.vastaukset.length > 0 &&
    tulos.vastaukset.every((v) => v.oikein)
  ) {
    const id = `taydellisyys-${tulos.vastaukset.length}`;
    if (!jo(data, id)) {
      uudet.push({
        id,
        kategoria: 'taydellisyys',
        nimi: `Täysi ${tulos.vastaukset.length} sarja`,
        kuvaus: `Vastasit oikein kaikkiin ${tulos.vastaukset.length} kysymykseen!`,
        saavutettu: nyt,
      });
    }
  }

  if (tulos.pelitilaTyyppi === 'loputon' && (tulos.loputonKorkeus ?? 0) >= KIIPEILY_RAJA) {
    const id = `kiipeily-${KIIPEILY_RAJA}`;
    if (!jo(data, id)) {
      uudet.push({
        id,
        kategoria: 'kiipeily',
        nimi: `${KIIPEILY_RAJA} oikein putkeen`,
        kuvaus: `Kiipesit ${KIIPEILY_RAJA} oikean vastauksen korkeuteen!`,
        saavutettu: nyt,
      });
    }
  }

  data = {
    ...data,
    historia: [...data.historia, ...tulos.vastaukset],
    badget: [...data.badget, ...uudet],
  };

  return { data, uudet };
}
