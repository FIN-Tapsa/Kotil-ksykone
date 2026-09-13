// Sessioiden pelilogiikka: kysymysjärjestyksen arvonta, vastausvaihtoehtojen
// sekoitus (kuva-kysymyksissä SAMASTA kategoriasta, ks. design-prompti), sekä
// loputon-tilan elämälaskuri.
import type { Kappale, KuvaKysymys, Kysymys, TekstiKysymys } from '../types';

function sekoita<T>(lista: T[]): T[] {
  const kopio = [...lista];
  for (let i = kopio.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopio[i], kopio[j]] = [kopio[j], kopio[i]];
  }
  return kopio;
}

export interface KysymysLahde {
  aine: string;
  kappale: string;
}

/** Kysymyksen id -> mistä valitusta kappaleesta se on peräisin. Tarvitaan kun
 * pelaaja valitsee useamman kappaleen kerralla (esim. laajempi koealue) -
 * jokainen vastaustapahtuma pitää silti kirjata OIKEALLE aine/kappale-parille
 * vanhemman dashboardin per-kappale-tilastoja varten, ei sille mikä tahansa
 * yksi kappaleista olisi "valittu". */
export type KysymysLahteet = Record<string, KysymysLahde>;

/** Rakentaa sekoitetun kysymyspinon yhdestä TAI USEAMMASTA kappaleesta.
 * Palauttaa myös lähdetiedot per kysymys-id. */
export function rakennaKysymysPino(
  kappaleet: Kappale[],
  maara?: number,
): { pino: Kysymys[]; lahteet: KysymysLahteet } {
  const kaikki: Kysymys[] = [];
  const lahteet: KysymysLahteet = {};
  for (const kappale of kappaleet) {
    for (const k of kappale.tekstiKysymykset) {
      kaikki.push({ tyyppi: 'teksti', ...k });
      lahteet[k.id] = { aine: kappale.aine, kappale: kappale.kappale };
    }
    for (const k of kappale.kuvaKysymykset) {
      kaikki.push({ tyyppi: 'kuva', ...k });
      lahteet[k.id] = { aine: kappale.aine, kappale: kappale.kappale };
    }
  }
  const sekoitettu = sekoita(kaikki);
  return { pino: maara ? sekoitettu.slice(0, maara) : sekoitettu, lahteet };
}

export interface Vaihtoehto {
  teksti: string;
  oikea: boolean;
}

export function tekstiVaihtoehdot(k: TekstiKysymys): Vaihtoehto[] {
  return sekoita([
    { teksti: k.oikea_vastaus, oikea: true },
    ...k.vaarat_vastaukset.map((v) => ({ teksti: v, oikea: false })),
  ]);
}

export interface KuvaVaihtoehto {
  nimi: string;
  oikea: boolean;
}

export function kuvaVaihtoehdot(k: KuvaKysymys): KuvaVaihtoehto[] {
  return sekoita([
    { nimi: k.laji, oikea: true },
    ...k.vaarat_vaihtoehdot.map((v) => ({ nimi: v, oikea: false })),
  ]);
}

/** Poistaa satunnaisesti 2 väärää vaihtoehtoa - "50/50"-jokeri. */
export function kayta5050<T extends { oikea: boolean }>(vaihtoehdot: T[]): T[] {
  const oikeat = vaihtoehdot.filter((v) => v.oikea);
  const vaarat = sekoita(vaihtoehdot.filter((v) => !v.oikea)).slice(0, 1);
  return sekoita([...oikeat, ...vaarat]);
}

export const ALKUELAMAT_LOPUTON = 3;
export const JOKEREITA_PER_SESSIO = 2;
