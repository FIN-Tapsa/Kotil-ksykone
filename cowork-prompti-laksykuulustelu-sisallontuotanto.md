# Cowork-prompti: Läksykuulustelu-pelin sisällöntuotanto

Kopioi tämä teksti Coworkille kun haluat generoida uusia kysymyksiä.

---

## Tehtävä

Olen rakentamassa lapsilleni (7 v ja 9 v) läksyjenharjoittelupeliä. Tarvitsen sinun apuasi kysymysten generointiin oppikirjan sivukuvista, jotka olen ladannut Google Driveen. Tämä on kertaluontoinen / toistuva ylläpitoajo, jonka käynnistän itse aina kun uutta materiaalia on saatavilla.

## Kansiorakenne Drivessä

```
/Läksykuulustelu/Sisältö/{Aine}/{Kappale}/Lähdekuvat/   ← lähdekuvat (kirjan sivut)
/Läksykuulustelu/Sisältö/{Aine}/{Kappale}/Kysymykset/    ← tänne kirjoitat tulokset
```

## Mitä tehdä

1. Käy läpi kansio `/Läksykuulustelu/Sisältö/` ja tunnista kaikki `{Aine}/{Kappale}/Lähdekuvat/` -alikansiot, joissa on kuvia joita ei vielä ole käsitelty (eli `Kysymykset/`-kansiossa ei vielä ole niitä vastaavia kysymyksiä, tai pyydän sinua nimenomaisesti generoimaan LISÄÄ kysymyksiä olemassa olevaan kappaleeseen).

2. Lue jokainen sivukuva kappaleesta. Päättele kuvien sisällöstä ja kirjan aihepiiristä:
   - Onko kyseessä leipäteksti (→ tuottaa teksti-monivalintakysymyksiä)
   - Onko sivulla tunnistettavia kuvia (esim. eläimet, kasvit, historialliset esineet, kartat) (→ tuottaa kuva-tunnistuskysymyksiä)
   - Sama sivu/kappale voi tuottaa molempia tyyppejä.

3. **Generoi kaksi tiedostoa per kappale** kansioon `Kysymykset/`:

### A) `teksti_monivalinta.json`

Array-muotoinen JSON, jossa jokainen kysymys on tällainen objekti:

```json
{
  "id": "{aine_lyhenne}-{kappale}-{juokseva_numero}",
  "sivu": [60, 61],
  "vaikeustaso": 1-5,
  "kysymys": "Kysymyksen teksti",
  "oikea_vastaus": "Oikea vastaus",
  "vaarat_vastaukset": ["Väärä 1", "Väärä 2", "Väärä 3"],
  "raportoitu": false
}
```

Säännöt:
- `sivu` on lista sivunumeroita joita kysymys koskee (yleensä yksi, joskus useampi jos asia jatkuu sivulta toiselle).
- `vaikeustaso`: 1 = suora faktan toisto tekstistä, 5 = vaatii päättelyä/yhdistelyä useasta kohdasta. Jakaudu tasaisesti koko kappaleen kysymyksissä.
- Väärät vastaukset: uskottavia mutta selvästi vääriä (ei triviaalin helposti poissuljettavia, mutta ei myöskään harhaanjohtavia/moniselitteisiä).
- Tuota noin 8-15 kysymystä per kappale ensimmäisellä ajolla, ellei toisin pyydetä. Jos minä myöhemmin pyydän lisää olemassa olevaan kappaleeseen, jatka juoksevaa numerointia äläkä toista jo olemassa olevia kysymyksiä (tarkista olemassa oleva tiedosto ensin).

### B) `kuva_tunnistus.json`

Array-muotoinen JSON:

```json
{
  "id": "{aine_lyhenne}-{kappale}-img-{juokseva_numero}",
  "sivu": [62],
  "vaikeustaso": 1-5,
  "laji": "Kohteen nimi (esim. lajinimi)",
  "kuvatiedosto": "tiedostonimi_lähdekuvasta_tai_rajauksesta.jpg",
  "kysymystyyppi": "nimeä_kuvasta",
  "vaarat_vaihtoehdot": ["Väärä 1", "Väärä 2", "Väärä 3"],
  "kategoria": "looginen_ryhmä_esim_selkarangattomat_vesi",
  "raportoitu": false
}
```

Säännöt:
- `kategoria` on TÄRKEÄ: ryhmittele tunnistettavat kohteet loogisiin ryhmiin (esim. "linnut", "suurriista", "vesihyönteiset", "puulajit") niin että väärät vaihtoehdot voidaan myöhemmin arpoa SAMASTA kategoriasta. Älä koskaan tarjoa väärää vaihtoehtoa toiselta biologian osa-alueelta (esim. lintu hirven vaihtoehtona).
- `vaarat_vaihtoehdot`: valitse tässä vaiheessa 3 muuta saman kategorian kohdetta jotka esiintyvät SAMASSA lähdemateriaalissa (samasta kirjasta/kappaleesta), jos mahdollista.
- Jos sivulla on useita nimettyjä kuvia (kuten esimerkkisivulla "Selkärangattomia" jossa 8 eri lajia), tee jokaisesta oma kysymys.
- `kuvatiedosto`: koska lähdekuva on koko sivun kuva jossa useita kohteita, kuvaile tässä kentässä tarkasti MIKÄ KOHTA kuvasta ja mikä lähdetiedosto (esim. "sivu_062.jpg - oikea sarake, 2. rivi"), koska en vielä tässä vaiheessa rajaa kuvia automaattisesti. Kirjoita tarkka sijaintikuvaus, jotta pystyn myöhemmin manuaalisesti rajaamaan/nimeämään kuvatiedostot oikein.

4. **Laatutarkistus ennen kirjoittamista:**
   - Älä keksi faktoja joita lähdekuvassa ei ole.
   - Jos kuvan teksti tai laji on epäselvä/vaikeasti luettava kuvasta, merkitse kysymyksen `"raportoitu": true` ja lisää kenttä `"raportin_syy": "..."` selittäen epävarmuus — näin näen admin-työkalussa heti mitkä kysymykset kaipaavat tarkistusta.
   - Vastausten järjestystä ei tarvitse arpoa tässä vaiheessa — sovellus arpoo esitysjärjestyksen ajonaikaisesti.

5. Kun olet käsitellyt kappaleen, kirjoita molemmat JSON-tiedostot kansioon `Kysymykset/` (luo kansio jos ei ole olemassa) ja anna minulle lyhyt yhteenveto: mikä aine/kappale, montako kysymystä kumpaakin tyyppiä syntyi, ja lista mahdollisista `raportoitu: true` -kysymyksistä syineen.

## Tärkeää

- Käsittele vain ne kappaleet jotka nimeän sinulle, tai jos pyydän "käsittele kaikki uudet", käy läpi koko `/Läksykuulustelu/Sisältö/` ja raportoi mitkä kappaleet käsittelit.
- Älä ylikirjoita olemassa olevaa `Kysymykset/`-tiedostoa kokonaan, jos siellä on jo raportoituja/tarkistettuja kysymyksiä — lisää uudet kysymykset olemassa olevan listan perään, säilytä vanhat sellaisenaan.
