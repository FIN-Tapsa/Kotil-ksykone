// Yhteiset tyypit koko sovellukselle.
// Kysymystyyppien kentät noudattavat design-promptin ja Cowork-sisällöntuotantopromptin
// sopimaa JSON-muotoa (ks. juuren *.md-tiedostot) — näitä TÄYTYY pitää synkassa jos
// Drive-sisällön muotoa muutetaan.

export type HahmoNimi = 'pesukarhu' | 'kettu';
export type Tunnetila = 'neutraali' | 'iloinen' | 'pettynyt' | 'juhliva' | 'miettiva';
export type TeemaNimi = 'lila' | 'sininen' | 'keltainen' | 'vihrea';

export interface LapsiProfiili {
  id: string;
  nimi: string;
  pin: string; // 4 numeroa, selväkielinen (perhesisäinen Drive-kansio, ei julkinen palvelu)
  hahmo: HahmoNimi;
  teema: TeemaNimi;
  luokkaAste: string; // esim. "3lk"
}

export interface Fokusrajoitus {
  aine: string;
  kappale: string;
  tyyppi: 'kova' | 'pehmea';
  asetettu: string; // ISO-päivämäärä jolloin rajoitus asetettiin
}

export interface Asetukset {
  vanhempiPin: string;
  rankingPaalla: boolean;
  fokusrajoitukset: Fokusrajoitus[];
  piilotetutKappaleet: string[]; // muotoa "{aine}::{kappale}"
}

export interface TekstiKysymys {
  id: string;
  sivu: number[];
  vaikeustaso: number;
  kysymys: string;
  oikea_vastaus: string;
  vaarat_vastaukset: string[];
  raportoitu: boolean;
  raportin_syy?: string;
}

export type KuvaKysymysTyyppi = 'nimea_kuvasta' | 'neljä_kuvaa';

export interface KuvaKysymys {
  id: string;
  sivu: number[];
  vaikeustaso: number;
  laji: string;
  kuvatiedosto: string;
  kysymystyyppi: KuvaKysymysTyyppi;
  vaarat_vaihtoehdot: string[];
  kategoria: string;
  raportoitu: boolean;
  raportin_syy?: string;
}

export type Kysymys =
  | ({ tyyppi: 'teksti' } & TekstiKysymys)
  | ({ tyyppi: 'kuva' } & KuvaKysymys);

export interface KappaleMetadata {
  luokkaAste: string;
  nimi: string;
  piilotettu?: boolean;
}

export interface Kappale {
  aine: string;
  kappale: string;
  metadata: KappaleMetadata;
  tekstiKysymykset: TekstiKysymys[];
  kuvaKysymykset: KuvaKysymys[];
}

export type Pelitila =
  | { tyyppi: 'kiinteä'; maara: 5 | 10 | 15 }
  | { tyyppi: 'loputon' };

export interface VastausTapahtuma {
  aika: string; // ISO-aikaleima
  aine: string;
  kappale: string;
  kysymysId: string;
  kysymysTeksti: string;
  oikein: boolean;
  valittuVastaus: string;
}

export interface Badge {
  id: string;
  kategoria: 'jatkuvuus' | 'osaaminen' | 'taydellisyys' | 'kiipeily';
  nimi: string;
  kuvaus: string;
  saavutettu: string; // ISO-aikaleima
}

export interface LapsiData {
  profiiliId: string;
  historia: VastausTapahtuma[];
  badget: Badge[];
  streak: {
    pisin: number;
    nykyinen: number;
    viimeisinPelipaiva: string; // ISO-päivämäärä
  };
  fokusLaskurit: Record<string, { paiva: string; kierroksia: number }>; // avain "aine::kappale"
}

// Lapsen pelin aikana tekemät raportit tallennetaan ERILLÄÄN sisältötiedostoista,
// koska sovellus ei koskaan kirjoita Kysymykset/-JSON-tiedostoihin (vain Cowork tekee
// niin) - ks. design-prompti. Vanhemman dashboard yhdistää nämä Coworkin omiin
// raportoitu:true-kysymyksiin samaan näkymään.
export interface KysymysRaportti {
  kysymysId: string;
  aine: string;
  kappale: string;
  profiiliNimi: string;
  aika: string; // ISO-aikaleima
  kasitelty: boolean;
}
