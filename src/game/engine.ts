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

export function rakennaKysymysPino(kappale: Kappale, maara?: number): Kysymys[] {
  const teksti: Kysymys[] = kappale.tekstiKysymykset.map((k) => ({ tyyppi: 'teksti', ...k }));
  const kuva: Kysymys[] = kappale.kuvaKysymykset.map((k) => ({ tyyppi: 'kuva', ...k }));
  const kaikki = sekoita([...teksti, ...kuva]);
  return maara ? kaikki.slice(0, maara) : kaikki;
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
