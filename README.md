# Läksykuulustelu

Läksyjenharjoittelupeli perhekäyttöön (design-prompti ks. yläkansiossa
`design-prompti-laksykuulustelu-sovellus.md`). Staattinen web-sovellus,
tarkoitus julkaista GitHub Pagesilla ja pelata kännykällä selaimessa.

## Tila (v1, kehitysvaihe)

Pelattava koko silmukka on toteutettu ja testattu paikallisesti
**mock-datalla** (`src/content/mockContent.ts`), ilman Drive-yhteyttä:

- Profiilinluonti + PIN-kirjautuminen, hahmon/värin/luokka-asteen valinta
- Aiheenvalinta luokka-asteen ja vanhemman fokusrajoitusten mukaan suodatettuna
- Pelitilat: kiinteä sarja (5/10/15) ja loputon kiipeily (3 elämää)
- Molemmat kysymystyypit: teksti-monivalinta ja kuva-tunnistus
  (`nimea_kuvasta` + `neljä_kuvaa`), 50/50-jokeri, kysymyksen raportointi
- Sessioyhteenveto, badge-tarkistus, streak
- Vanhemman dashboard: yleiskatsaus, per-aine/kappale syväsukellus
  (O/V-historia, väärien vastausten ryhmittely, kategoriakohtainen
  osaaminen), fokusrajoitusten/piilotusten hallinta, raportoidut kysymykset

**Puuttuu vielä / ei toteutettu:**
- Google Drive -integraatio (sisällön luku + tulosten kirjoitus). Kaikki
  data on toistaiseksi `localStorage`:ssa selaimessa.
- Oikeat hahmokuvat (ks. alla, placeholder-SVG:t käytössä)
- Rajatut kuvatunnistuskysymysten lähdekuvat (näytetään väliaikaisena
  paikkamerkkinä lajin nimellä)

## Kehitys

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tuottaa dist/ - staattinen sivusto GitHub Pagesille
```

Oletus-PIN vanhemman dashboardiin uudella asennuksella: `0000`
(vaihdettavissa myöhemmin dashboardista/asetuksista kun se toteutetaan).

## Arkkitehtuuri lyhyesti

- **Vite + Preact + TypeScript**, ei muita ajonaikaisia riippuvuuksia.
- `vite.config.ts`: `base: './'` — build toimii sellaisenaan missä
  tahansa GitHub Pages -aliportaalissa ilman repon nimen kovakoodausta.
- Kaikki tallennus kulkee `src/state/storage.ts`:n ja
  `src/content/contentApi.ts`:n läpi. Kun Drive-integraatio rakennetaan,
  näiden SISÄLTÖ vaihtuu Drive API -kutsuiksi, mutta rajapinta (funktioiden
  nimet/signatuurit) pysyy samana — mikään näkymä ei muutu.
- Kysymysten JSON-muoto (`src/types.ts`: `TekstiKysymys`, `KuvaKysymys`)
  noudattaa tarkalleen Cowork-sisällöntuotantopromptin tuottamaa muotoa.
- Lasten pelin aikana tekemät raportit (`KysymysRaportti`) tallennetaan
  ERI paikkaan kuin sisältö, koska sovellus ei koskaan kirjoita
  `Kysymykset/*.json`-tiedostoihin (vain Cowork tekee niin) — dashboard
  yhdistää nämä Coworkin omiin `raportoitu:true`-kysymyksiin samassa
  näkymässä.

## Seuraavat askeleet (vaativat sinulta jotain)

### 1. Google Drive -integraatio

Tarvitaan Google Cloud -projekti ja OAuth-client-ID:
1. [Google Cloud Console](https://console.cloud.google.com/) → uusi projekti
2. "APIs & Services" → ota käyttöön **Google Drive API**
3. "OAuth consent screen" → tyyppi "External", tila jää "Testing"
   (ei vaadi Googlen verifiointia niin kauan kuin käyttäjiä on <100)
   → lisää testikäyttäjiksi perheenne Google-tilien sähköpostit
4. "Credentials" → luo **OAuth client ID**, tyyppi "Web application",
   lisää sallituksi origin-osoitteeksi sekä `http://localhost:5173`
   (kehitys) että lopullinen GitHub Pages -osoite
5. Anna client ID minulle (ei ole salainen tieto tässä flow'ssa, mutta
   voit myös laittaa sen suoraan `.env`-tiedostoon jonka luon)

Kun tämä on tehty, rakennan `src/drive/`-kerroksen joka korvaa
mock-datan.

### 2. Hahmokuvat

`gemini-prompti-hahmot.md` (yläkansiossa) sisältää valmiit promptit.
Kun kuvat on generoitu ja tallennettu, lataa ne Google Driveen
`/Läksykuulustelu/Hahmot/`-kansioon Drive-integraation valmistuttua,
TAI pudota ne suoraan `public/hahmot/`-kansioon paikallista kehitystä
varten samoilla tiedostonimillä (`pesukarhu_neutraali.png` jne.) — vaihda
tällöin `PAATE`-vakio arvoon `'png'` tiedostossa `src/ui/CharacterAvatar.tsx`.

### 3. GitHub-julkaisu

Kun olet valmis: luo GitHub-repo, lisää remote (`git remote add origin ...`),
push, ja ota käyttöön GitHub Pages (Settings → Pages → Deploy from a
branch tai GitHub Actions -workflow joka ajaa `npm run build` ja
julkaisee `dist/`-kansion). Voin tehdä tämän kun repo on olemassa.

## Tunnetut rajoitteet (v1, tarkoituksella jätetty pois — ks. design-prompti)

- Ei PWA-ominaisuuksia (ei offline-tukea)
- Ei erillistä maksullista backendia
- Kuvien käyttöoikeudet kaupallista käyttöä varten ei ratkaistu
- Vapaa sana-, raahaus- ja matematiikkatehtävät eivät ole mukana,
  mutta datamalli (`kysymystyyppi: string`, ei enum) ei estä lisäämästä
  niitä myöhemmin
