// Sisältörajapinta. V1 lukee MOCK_KAPPALEET-taulukosta; kun Drive-integraatio
// rakennetaan, tässä tiedostossa vaihdetaan lähde Drive-API-kutsuihin - kutsujien
// (näkymien) ei tarvitse muuttua, koska ne käyttävät vain näitä funktioita.
import { MOCK_KAPPALEET } from './mockContent';
import type { Asetukset, Kappale, LapsiData } from '../types';

export async function haeKaikkiKappaleet(): Promise<Kappale[]> {
  return MOCK_KAPPALEET;
}

export interface NakyvaKappale {
  kappale: Kappale;
  tila: 'avoin' | 'harmaa' | 'piilotettu';
}

const PEHMEA_KIERROSRAJA = 2;

function avain(aine: string, kappale: string) {
  return `${aine}::${kappale}`;
}

/** Suodattaa ja tilaa kappaleet lapsen luokka-asteen ja vanhemman asettamien
 * fokusrajoitusten mukaan. Kova fokus tänään -> vain se kappale näkyy.
 * Pehmeä fokus tällä viikolla -> muut näkyvät mutta harmaantuvat kun niitä
 * on pelattu PEHMEA_KIERROSRAJA kierrosta tänään. */
export function suodataNakyvatKappaleet(
  kaikki: Kappale[],
  luokkaAste: string,
  asetukset: Asetukset,
  lapsiData: LapsiData,
): NakyvaKappale[] {
  const tanaan = new Date().toISOString().slice(0, 10);
  const omaLuokka = kaikki.filter((k) => k.metadata.luokkaAste === luokkaAste && !k.metadata.piilotettu);
  const eiKasin = omaLuokka.filter((k) => !asetukset.piilotetutKappaleet.includes(avain(k.aine, k.kappale)));

  const kovaFokus = asetukset.fokusrajoitukset.find(
    (f) => f.tyyppi === 'kova' && f.asetettu === tanaan,
  );
  if (kovaFokus) {
    return eiKasin.map((k) => ({
      kappale: k,
      tila:
        k.aine === kovaFokus.aine && k.kappale === kovaFokus.kappale
          ? 'avoin'
          : 'piilotettu',
    }));
  }

  const pehmeatAvaimet = new Set(
    asetukset.fokusrajoitukset.filter((f) => f.tyyppi === 'pehmea').map((f) => avain(f.aine, f.kappale)),
  );

  return eiKasin.map((k) => {
    const a = avain(k.aine, k.kappale);
    if (pehmeatAvaimet.size === 0 || pehmeatAvaimet.has(a)) {
      return { kappale: k, tila: 'avoin' };
    }
    const laskuri = lapsiData.fokusLaskurit[a];
    const kierroksiaTanaan = laskuri?.paiva === tanaan ? laskuri.kierroksia : 0;
    return { kappale: k, tila: kierroksiaTanaan >= PEHMEA_KIERROSRAJA ? 'harmaa' : 'avoin' };
  });
}

/** Kutsutaan kun sessio kyseiselle (ei-prioriteetti) kappaleelle päättyy,
 * jotta pehmeän fokuksen kierroslaskuri kasvaa. */
export function kirjaaFokusKierros(lapsiData: LapsiData, aine: string, kappale: string): LapsiData {
  const tanaan = new Date().toISOString().slice(0, 10);
  const a = avain(aine, kappale);
  const nykyinen = lapsiData.fokusLaskurit[a];
  const kierroksia = nykyinen?.paiva === tanaan ? nykyinen.kierroksia + 1 : 1;
  return {
    ...lapsiData,
    fokusLaskurit: { ...lapsiData.fokusLaskurit, [a]: { paiva: tanaan, kierroksia } },
  };
}
