// Kokoaa kaikkien aineiden oikean sisällön yhteen listaan. Sisältö on jaettu
// aineittain omiin tiedostoihinsa (src/content/aineet/) koska yhden ison
// tiedoston ylläpito kävi mahdottomaksi useamman aineen/kappaleen myötä.
// mockContent.ts säilyy erillään kehityksen/testauksen referenssinä, mutta
// contentApi.ts lukee TÄSTÄ tiedostosta live-sovelluksessa.
import type { Kappale } from '../types';
import { BIOLOGIA_KAPPALEET } from './aineet/biologia';
import { RUOTSI_KAPPALEET } from './aineet/ruotsi';
import { USKONTO_KAPPALEET } from './aineet/uskonto';
import { TERVEYSTIETO_KAPPALEET } from './aineet/terveystieto';
import { FYSIIKKA_KAPPALEET } from './aineet/fysiikka';

export const REAL_KAPPALEET: Kappale[] = [
  ...BIOLOGIA_KAPPALEET,
  ...RUOTSI_KAPPALEET,
  ...USKONTO_KAPPALEET,
  ...TERVEYSTIETO_KAPPALEET,
  ...FYSIIKKA_KAPPALEET,
];
