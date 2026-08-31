// Tallennuskerros. Firestore-pohjainen (ks. firebase.ts) - data on jaettu KAIKKIEN
// perheen laitteiden kesken (ei enää laitekohtainen localStorage). Rajapinta
// (funktioiden nimet/signatuurit) on sama kuin aiemmassa localStorage-versiossa,
// joten mikään näkymä ei tiedä/välitä mistä data oikeasti tulee.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, varmistaKirjautuminen } from './firebase';
import type { Asetukset, KysymysRaportti, LapsiData, LapsiProfiili } from '../types';

export async function haeProfiilit(): Promise<LapsiProfiili[]> {
  await varmistaKirjautuminen();
  const snap = await getDocs(collection(db, 'profiilit'));
  return snap.docs.map((d) => d.data() as LapsiProfiili);
}

export async function tallennaProfiilit(profiilit: LapsiProfiili[]): Promise<void> {
  await varmistaKirjautuminen();
  await Promise.all(profiilit.map((p) => setDoc(doc(db, 'profiilit', p.id), p)));
}

const OLETUS_ASETUKSET: Asetukset = {
  vanhempiPin: '0000',
  rankingPaalla: true,
  fokusrajoitukset: [],
  piilotetutKappaleet: [],
};

const ASETUKSET_DOC_ID = 'perhe';

export async function haeAsetukset(): Promise<Asetukset> {
  await varmistaKirjautuminen();
  const snap = await getDoc(doc(db, 'asetukset', ASETUKSET_DOC_ID));
  return snap.exists() ? (snap.data() as Asetukset) : OLETUS_ASETUKSET;
}

export async function tallennaAsetukset(asetukset: Asetukset): Promise<void> {
  await varmistaKirjautuminen();
  await setDoc(doc(db, 'asetukset', ASETUKSET_DOC_ID), asetukset);
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
  await varmistaKirjautuminen();
  const snap = await getDoc(doc(db, 'lapsidata', profiiliId));
  return snap.exists() ? (snap.data() as LapsiData) : oletusLapsiData(profiiliId);
}

export async function tallennaLapsiData(data: LapsiData): Promise<void> {
  await varmistaKirjautuminen();
  await setDoc(doc(db, 'lapsidata', data.profiiliId), data);
}

export async function haeRaportit(): Promise<KysymysRaportti[]> {
  await varmistaKirjautuminen();
  const snap = await getDocs(collection(db, 'raportit'));
  return snap.docs.map((d) => d.data() as KysymysRaportti);
}

export async function lisaaRaportti(raportti: KysymysRaportti): Promise<void> {
  await varmistaKirjautuminen();
  await addDoc(collection(db, 'raportit'), raportti);
}

export async function merkitseRaporttiKasitellyksi(kysymysId: string, profiiliNimi: string): Promise<void> {
  await varmistaKirjautuminen();
  const snap = await getDocs(collection(db, 'raportit'));
  const paivitykset = snap.docs
    .filter((d) => {
      const r = d.data() as KysymysRaportti;
      return r.kysymysId === kysymysId && r.profiiliNimi === profiiliNimi;
    })
    .map((d) => updateDoc(d.ref, { kasitelty: true }));
  await Promise.all(paivitykset);
}
