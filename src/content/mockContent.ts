// Paikallinen esimerkkisisältö kehitystä ja testausta varten.
// Muoto matkii TARKALLEEN sitä JSON-rakennetta jonka Cowork tuottaa Driveen
// (ks. juuren yläkansiossa oleva design-prompti ja cowork-sisällöntuotantoprompti).
// Kun Drive-integraatio (contentApi.ts) otetaan käyttöön, tämä tiedosto voidaan
// poistaa käytöstä muuttamatta yhtään muuta koodia — contentApi tarjoaa saman
// rajapinnan riippumatta lähteestä.
import type { Kappale } from '../types';

export const MOCK_KAPPALEET: Kappale[] = [
  {
    aine: 'Biologia',
    kappale: '7 - Selkärangattomat',
    metadata: { luokkaAste: '7lk', nimi: 'Selkärangattomat' },
    tekstiKysymykset: [
      {
        id: 'bio-7-1',
        sivu: [60],
        vaikeustaso: 1,
        kysymys: 'Mikä on yhteistä kaikille selkärangattomille eläimille?',
        oikea_vastaus: 'Niillä ei ole sisäistä luurankoa',
        vaarat_vastaukset: ['Ne elävät vain vedessä', 'Niillä on kuusi jalkaa', 'Ne ovat aina pieniä'],
        raportoitu: false,
      },
      {
        id: 'bio-7-2',
        sivu: [61],
        vaikeustaso: 2,
        kysymys: 'Mihin ryhmään hyönteiset kuuluvat?',
        oikea_vastaus: 'Niveljalkaiset',
        vaarat_vastaukset: ['Nilviäiset', 'Madot', 'Piikkinahkaiset'],
        raportoitu: false,
      },
      {
        id: 'bio-7-3',
        sivu: [62],
        vaikeustaso: 3,
        kysymys: 'Miksi kotilolla on kova kuori?',
        oikea_vastaus: 'Suojaksi vihollisia ja kuivumista vastaan',
        vaarat_vastaukset: ['Uidakseen nopeammin', 'Kuullakseen paremmin', 'Nähdäkseen pimeässä'],
        raportoitu: false,
      },
    ],
    kuvaKysymykset: [
      {
        id: 'bio-7-img-1',
        sivu: [62],
        vaikeustaso: 2,
        laji: 'Etana',
        kuvatiedosto: 'sivu_062.jpg - vasen sarake, 1. rivi',
        kysymystyyppi: 'nimea_kuvasta',
        vaarat_vaihtoehdot: ['Kotilo', 'Simpukka', 'Toukka'],
        kategoria: 'selkarangattomat_maa',
        raportoitu: false,
      },
      {
        id: 'bio-7-img-2',
        sivu: [62],
        vaikeustaso: 2,
        laji: 'Kotilo',
        kuvatiedosto: 'sivu_062.jpg - vasen sarake, 2. rivi',
        kysymystyyppi: 'nimea_kuvasta',
        vaarat_vaihtoehdot: ['Etana', 'Simpukka', 'Rapu'],
        kategoria: 'selkarangattomat_maa',
        raportoitu: false,
      },
      {
        id: 'bio-7-img-3',
        sivu: [63],
        vaikeustaso: 3,
        laji: 'Rapu',
        kuvatiedosto: 'sivu_063.jpg - oikea sarake, 1. rivi',
        kysymystyyppi: 'neljä_kuvaa',
        vaarat_vaihtoehdot: ['Katkarapu', 'Hämähäkki', 'Simpukka'],
        kategoria: 'selkarangattomat_vesi',
        raportoitu: true,
        raportin_syy: 'Kuvan tarkkuus heikko, lajin tunnistus epävarma',
      },
    ],
  },
  {
    aine: 'Historia',
    kappale: '3 - Muinainen Egypti',
    metadata: { luokkaAste: '9lk', nimi: 'Muinainen Egypti' },
    tekstiKysymykset: [
      {
        id: 'his-3-1',
        sivu: [40],
        vaikeustaso: 1,
        kysymys: 'Mikä joki oli tärkeä muinaiselle Egyptille?',
        oikea_vastaus: 'Niili',
        vaarat_vastaukset: ['Eufrat', 'Tiber', 'Volga'],
        raportoitu: false,
      },
      {
        id: 'his-3-2',
        sivu: [41],
        vaikeustaso: 2,
        kysymys: 'Miksi pyramidit rakennettiin?',
        oikea_vastaus: 'Faaraoiden hautapaikoiksi',
        vaarat_vastaukset: ['Varastoiksi viljalle', 'Puolustuslinnoituksiksi', 'Temppeleiksi jumalille'],
        raportoitu: false,
      },
      {
        id: 'his-3-3',
        sivu: [42],
        vaikeustaso: 4,
        kysymys: 'Miten Niilin vuositulvat vaikuttivat maanviljelyyn?',
        oikea_vastaus: 'Ne toivat hedelmällistä mutaa pelloille',
        vaarat_vastaukset: ['Ne tuhosivat sadon aina', 'Ne pakottivat muuttamaan', 'Niillä ei ollut vaikutusta'],
        raportoitu: false,
      },
    ],
    kuvaKysymykset: [],
  },
];

export const MOCK_LUOKKA_ASTEET = ['1lk', '2lk', '3lk', '4lk', '5lk', '6lk', '7lk', '8lk', '9lk'];
