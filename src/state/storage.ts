// Tallennuskerroksen rajapinta. V1: localStorage (toimii heti, ei vaadi Drive-kirjautumista
// kehityksen aikana). Kun Drive-integraatio rakennetaan, tämä tiedosto korvataan
// drive.ts-toteutuksella jolla on SAMA rajapinta (get/set async-funktiot) - mikään muu
// koodi ei muutu, koska kaikki muu käyttää vain näitä funktioita.
import type { Asetukset, KysymysRaportti, LapsiData, LapsiProfiili } from '../types';

const AVAIN_PROFIILIT = 'laksykuulustelu:profiilit';
const AVAIN_ASETUKSET = 'laksykuulustelu:asetukset';
const AVAIN_DATA_PREFIX = 'laksykuulustelu:data:';
const AVAIN_RAPORTIT = 'laksykuulustelu:raportit';

function lueJson<T>(avain: string, oletus: T): T {
  try {
    const raaka = localStorage.getItem(avain);
    if (!raaka) return oletus;
    return JSON.parse(raaka) as T;
  } catch {
    return oletus;
  }
}

function kirjoitaJson<T>(avain: string, arvo: T): void {
  localStorage.setItem(avain, JSON.stringify(arvo));
}

export async function haeProfiilit(): Promise<LapsiProfiili[]> {
  return lueJson(AVAIN_PROFIILIT, []);
}

export async function tallennaProfiilit(profiilit: LapsiProfiili[]): Promise<void> {
  kirjoitaJson(AVAIN_PROFIILIT, profiilit);
}

const OLETUS_ASETUKSET: Asetukset = {
  vanhempiPin: '0000',
  rankingPaalla: true,
  fokusrajoitukset: [],
  piilotetutKappaleet: [],
};

export async function haeAsetukset(): Promise<Asetukset> {
  return lueJson(AVAIN_ASETUKSET, OLETUS_ASETUKSET);
}

export async function tallennaAsetukset(asetukset: Asetukset): Promise<void> {
  kirjoitaJson(AVAIN_ASETUKSET, asetukset);
}

function oletusLapsiData(profiiliId: string): LapsiData {
  return {
    profiiliId,
    historia: [],
    badget: [],
    streak: { pisin: 0, nykyinen: 0, viimeisinPelipaiva: '' },
    fokusLaskurit: {},
  };
}

export async function haeLapsiData(profiiliId: string): Promise<LapsiData> {
  return lueJson(AVAIN_DATA_PREFIX + profiiliId, oletusLapsiData(profiiliId));
}

export async function tallennaLapsiData(data: LapsiData): Promise<void> {
  kirjoitaJson(AVAIN_DATA_PREFIX + data.profiiliId, data);
}

export async function haeRaportit(): Promise<KysymysRaportti[]> {
  return lueJson(AVAIN_RAPORTIT, []);
}

export async function lisaaRaportti(raportti: KysymysRaportti): Promise<void> {
  const nykyiset = await haeRaportit();
  kirjoitaJson(AVAIN_RAPORTIT, [...nykyiset, raportti]);
}

export async function merkitseRaporttiKasitellyksi(kysymysId: string, profiiliNimi: string): Promise<void> {
  const nykyiset = await haeRaportit();
  kirjoitaJson(
    AVAIN_RAPORTIT,
    nykyiset.map((r) =>
      r.kysymysId === kysymysId && r.profiiliNimi === profiiliNimi ? { ...r, kasitelty: true } : r,
    ),
  );
}
