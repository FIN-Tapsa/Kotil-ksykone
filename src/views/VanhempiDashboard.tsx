import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Asetukset, Kappale, KysymysRaportti, LapsiData, LapsiProfiili, VastausTapahtuma } from '../types';
import { haeKaikkiKappaleet } from '../content/contentApi';
import {
  haeAsetukset,
  haeLapsiData,
  haeProfiilit,
  haeRaportit,
  merkitseRaporttiKasitellyksi,
  tallennaAsetukset,
} from '../state/storage';

interface Props {
  onSulje: () => void;
}

type Valilehti = 'yleiskatsaus' | 'lapsi' | 'raportit' | 'asetukset';

function avain(aine: string, kappale: string) {
  return `${aine}::${kappale}`;
}

function pelipaivatViikolla(data: LapsiData): number {
  const seitsemanPaivaaSitten = Date.now() - 7 * 86400000;
  const paivat = new Set(
    data.historia.filter((h) => new Date(h.aika).getTime() >= seitsemanPaivaaSitten).map((h) => h.aika.slice(0, 10)),
  );
  return paivat.size;
}

export function VanhempiDashboard({ onSulje }: Props) {
  const [valilehti, setValilehti] = useState<Valilehti>('yleiskatsaus');
  const [profiilit, setProfiilit] = useState<LapsiProfiili[]>([]);
  const [asetukset, setAsetukset] = useState<Asetukset | null>(null);
  const [kappaleet, setKappaleet] = useState<Kappale[]>([]);
  const [lapsiDatat, setLapsiDatat] = useState<Record<string, LapsiData>>({});
  const [raportit, setRaportit] = useState<KysymysRaportti[]>([]);
  const [valittuLapsi, setValittuLapsi] = useState<string | null>(null);
  const [valittuKappale, setValittuKappale] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [p, a, k, r] = await Promise.all([haeProfiilit(), haeAsetukset(), haeKaikkiKappaleet(), haeRaportit()]);
      setProfiilit(p);
      setAsetukset(a);
      setKappaleet(k);
      setRaportit(r);
      const datat: Record<string, LapsiData> = {};
      for (const profiili of p) datat[profiili.id] = await haeLapsiData(profiili.id);
      setLapsiDatat(datat);
    })();
  }, []);

  const raportoidutSisallosta = useMemo(
    () =>
      kappaleet.flatMap((k) => [
        ...k.tekstiKysymykset
          .filter((q) => q.raportoitu)
          .map((q) => ({ aine: k.aine, kappale: k.kappale, id: q.id, teksti: q.kysymys, syy: q.raportin_syy })),
        ...k.kuvaKysymykset
          .filter((q) => q.raportoitu)
          .map((q) => ({ aine: k.aine, kappale: k.kappale, id: q.id, teksti: q.laji, syy: q.raportin_syy })),
      ]),
    [kappaleet],
  );

  async function vaihdaFokus(aine: string, kappale: string, tyyppi: 'kova' | 'pehmea' | null) {
    if (!asetukset) return;
    const muut = asetukset.fokusrajoitukset.filter((f) => !(f.aine === aine && f.kappale === kappale));
    const uudet =
      tyyppi === null
        ? muut
        : [...muut, { aine, kappale, tyyppi, asetettu: new Date().toISOString().slice(0, 10) }];
    const uusiAsetukset = { ...asetukset, fokusrajoitukset: uudet };
    setAsetukset(uusiAsetukset);
    await tallennaAsetukset(uusiAsetukset);
  }

  async function vaihdaPiilotus(aine: string, kappale: string) {
    if (!asetukset) return;
    const a = avain(aine, kappale);
    const piilossa = asetukset.piilotetutKappaleet.includes(a);
    const uudet = piilossa
      ? asetukset.piilotetutKappaleet.filter((x) => x !== a)
      : [...asetukset.piilotetutKappaleet, a];
    const uusiAsetukset = { ...asetukset, piilotetutKappaleet: uudet };
    setAsetukset(uusiAsetukset);
    await tallennaAsetukset(uusiAsetukset);
  }

  async function vaihdaRanking() {
    if (!asetukset) return;
    const uusiAsetukset = { ...asetukset, rankingPaalla: !asetukset.rankingPaalla };
    setAsetukset(uusiAsetukset);
    await tallennaAsetukset(uusiAsetukset);
  }

  async function kasitteleRaportti(r: KysymysRaportti) {
    await merkitseRaporttiKasitellyksi(r.kysymysId, r.profiiliNimi);
    setRaportit(await haeRaportit());
  }

  const lapsi = profiilit.find((p) => p.id === valittuLapsi) ?? null;
  const lapsiData = lapsi ? lapsiDatat[lapsi.id] : null;
  const lapsenKappaleet = kappaleet.filter((k) => k.metadata.luokkaAste === lapsi?.luokkaAste);
  const drillKappale = kappaleet.find((k) => avain(k.aine, k.kappale) === valittuKappale) ?? null;

  return (
    <div class="naytto" data-teema="aikuinen" style={{ maxWidth: 720 }}>
      <div class="vaakarivi" style={{ justifyContent: 'space-between', width: '100%' }}>
        <h1 class="otsikko" style={{ margin: 0 }}>
          Vanhemman näkymä
        </h1>
        <button class="linkkinappi" onClick={onSulje}>
          Sulje
        </button>
      </div>

      <div class="pinorivi">
        {(['yleiskatsaus', 'raportit', 'asetukset'] as Valilehti[]).map((v) => (
          <button
            key={v}
            class="nappi"
            style={{
              background: valilehti === v ? 'var(--paavari)' : 'var(--tausta-korostus)',
              color: valilehti === v ? '#fff' : 'var(--teksti)',
            }}
            onClick={() => setValilehti(v)}
          >
            {v === 'yleiskatsaus' ? 'Yleiskatsaus' : v === 'raportit' ? 'Raportit' : 'Asetukset'}
          </button>
        ))}
      </div>

      {valilehti === 'yleiskatsaus' && !lapsi && (
        <div class="dashboard-osio">
          {profiilit.map((p) => {
            const data = lapsiDatat[p.id];
            return (
              <button
                key={p.id}
                class="kortti"
                style={{ textAlign: 'left', border: 'none', cursor: 'pointer' }}
                onClick={() => setValittuLapsi(p.id)}
              >
                <strong>{p.nimi}</strong> <span class="alaotsikko">({p.luokkaAste})</span>
                {data && (
                  <div class="pinorivi" style={{ marginTop: 10 }}>
                    <div class="tilastokortti">
                      <span class="tilastokortti-luku">{pelipaivatViikolla(data)}/7</span>
                      <span class="tilastokortti-teksti">pelipäivää</span>
                    </div>
                    <div class="tilastokortti">
                      <span class="tilastokortti-luku">{data.streak.nykyinen}</span>
                      <span class="tilastokortti-teksti">päivän putki</span>
                    </div>
                    <div class="tilastokortti">
                      <span class="tilastokortti-luku">{data.historia.length}</span>
                      <span class="tilastokortti-teksti">vastausta yht.</span>
                    </div>
                    <div class="tilastokortti">
                      <span class="tilastokortti-luku">{data.badget.length}</span>
                      <span class="tilastokortti-teksti">mitalia</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
          {profiilit.length === 0 && <p class="alaotsikko">Ei vielä lapsiprofiileja.</p>}
        </div>
      )}

      {valilehti === 'yleiskatsaus' && lapsi && lapsiData && !drillKappale && (
        <div class="dashboard-osio">
          <button class="linkkinappi" onClick={() => setValittuLapsi(null)}>
            ← Kaikki lapset
          </button>
          <h2 class="otsikko">{lapsi.nimi}</h2>
          {lapsenKappaleet.map((k) => {
            const vastaukset = lapsiData.historia.filter((h) => h.aine === k.aine && h.kappale === k.kappale);
            const oikein = vastaukset.filter((v) => v.oikein).length;
            const tarkkuus = vastaukset.length > 0 ? Math.round((oikein / vastaukset.length) * 100) : null;
            return (
              <button
                key={avain(k.aine, k.kappale)}
                class="kortti"
                style={{ textAlign: 'left', border: 'none', cursor: 'pointer' }}
                onClick={() => setValittuKappale(avain(k.aine, k.kappale))}
              >
                <strong>
                  {k.aine} · {k.metadata.nimi}
                </strong>
                <div class="alaotsikko">
                  {vastaukset.length === 0
                    ? 'Ei vielä pelattu'
                    : `${tarkkuus}% oikein (${vastaukset.length} vastausta)`}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {valilehti === 'yleiskatsaus' && lapsi && lapsiData && drillKappale && (
        <div class="dashboard-osio">
          <button class="linkkinappi" onClick={() => setValittuKappale(null)}>
            ← Takaisin
          </button>
          <h2 class="otsikko">
            {drillKappale.aine} · {drillKappale.metadata.nimi}
          </h2>
          {(() => {
            const vastaukset = lapsiData.historia.filter(
              (h) => h.aine === drillKappale.aine && h.kappale === drillKappale.kappale,
            );
            const kysymysJarjestys = [...drillKappale.tekstiKysymykset, ...drillKappale.kuvaKysymykset].map(
              (k) => k.id,
            );
            const vastauksetPerKysymys = new Map<string, VastausTapahtuma[]>();
            for (const v of vastaukset) {
              if (!vastauksetPerKysymys.has(v.kysymysId)) vastauksetPerKysymys.set(v.kysymysId, []);
              vastauksetPerKysymys.get(v.kysymysId)!.push(v);
            }
            const kysymyksetJoihinVastattu = kysymysJarjestys.filter((id) => vastauksetPerKysymys.has(id));
            const vaaratRyhmiteltyina = new Map<string, Map<string, number>>();
            for (const v of vastaukset.filter((v) => !v.oikein)) {
              if (!vaaratRyhmiteltyina.has(v.kysymysTeksti)) vaaratRyhmiteltyina.set(v.kysymysTeksti, new Map());
              const m = vaaratRyhmiteltyina.get(v.kysymysTeksti)!;
              m.set(v.valittuVastaus, (m.get(v.valittuVastaus) ?? 0) + 1);
            }
            const kategoriat = new Map<string, { oikein: number; yht: number }>();
            for (const kq of drillKappale.kuvaKysymykset) {
              const vv = vastaukset.filter((v) => v.kysymysId === kq.id);
              if (vv.length === 0) continue;
              const c = kategoriat.get(kq.kategoria) ?? { oikein: 0, yht: 0 };
              c.oikein += vv.filter((v) => v.oikein).length;
              c.yht += vv.length;
              kategoriat.set(kq.kategoria, c);
            }
            return (
              <>
                <div class="kortti">
                  <p class="alaotsikko" style={{ margin: '0 0 10px' }}>
                    Vastaushistoria kysymyksittäin (viimeisimmät 10 per kysymys)
                  </p>
                  {kysymyksetJoihinVastattu.length === 0 && <p class="alaotsikko">Ei vielä vastauksia.</p>}
                  {kysymyksetJoihinVastattu.map((id) => {
                    const vv = vastauksetPerKysymys.get(id)!;
                    const viimeiset = vv.slice(-10);
                    return (
                      <div key={id} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{vv[0].kysymysTeksti}</div>
                        <div style={{ fontSize: '1.1rem', letterSpacing: 2 }}>
                          {viimeiset.map((v) => (v.oikein ? '✅' : '❌')).join(' ')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {vaaratRyhmiteltyina.size > 0 && (
                  <div class="kortti">
                    <p class="alaotsikko" style={{ margin: '0 0 6px' }}>
                      Yleisimmät sekaannukset
                    </p>
                    {[...vaaratRyhmiteltyina.entries()].map(([kysymys, vastausMap]) => (
                      <div key={kysymys} style={{ marginBottom: 8 }}>
                        <strong style={{ fontSize: '0.85rem' }}>{kysymys}</strong>
                        {[...vastausMap.entries()].map(([vastaus, maara]) => (
                          <div class="alaotsikko" key={vastaus}>
                            vastattu "{vastaus}" {maara}×
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {kategoriat.size > 0 && (
                  <div class="kortti">
                    <p class="alaotsikko" style={{ margin: '0 0 6px' }}>
                      Kategoriakohtainen osaaminen
                    </p>
                    {[...kategoriat.entries()].map(([kat, c]) => (
                      <div key={kat} class="alaotsikko">
                        {kat}: {Math.round((c.oikein / c.yht) * 100)}% oikein
                      </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {valilehti === 'raportit' && (
        <div class="dashboard-osio">
          <p class="alaotsikko">Coworkin oma laadunvalvonta (kappaleen luonnissa merkityt):</p>
          {raportoidutSisallosta.length === 0 && <p class="alaotsikko">Ei raportoituja kysymyksiä sisällössä.</p>}
          {raportoidutSisallosta.map((r) => (
            <div class="kortti" key={r.id}>
              <strong>{r.teksti}</strong>
              <div class="alaotsikko">
                {r.aine} · {r.kappale}
              </div>
              {r.syy && <div class="alaotsikko">Syy: {r.syy}</div>}
            </div>
          ))}

          <p class="alaotsikko" style={{ marginTop: 16 }}>
            Lasten raportoimat pelin aikana:
          </p>
          {raportit.length === 0 && <p class="alaotsikko">Ei vielä lasten raportteja.</p>}
          {raportit.map((r) => (
            <div class="kortti" key={r.kysymysId + r.profiiliNimi + r.aika} style={{ opacity: r.kasitelty ? 0.5 : 1 }}>
              <strong>{r.kysymysId}</strong>
              <div class="alaotsikko">
                {r.aine} · {r.kappale} · raportoinut {r.profiiliNimi}
              </div>
              {!r.kasitelty && (
                <button class="linkkinappi" onClick={() => kasitteleRaportti(r)}>
                  Merkitse käsitellyksi
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {valilehti === 'asetukset' && asetukset && (
        <div class="dashboard-osio">
          <div class="kortti">
            <label class="vaakarivi" style={{ justifyContent: 'space-between' }}>
              Näytä sisarusvertailu (ranking)
              <input type="checkbox" checked={asetukset.rankingPaalla} onChange={vaihdaRanking} />
            </label>
          </div>

          {kappaleet.map((k) => {
            const a = avain(k.aine, k.kappale);
            const rajoitus = asetukset.fokusrajoitukset.find((f) => f.aine === k.aine && f.kappale === k.kappale);
            const piilossa = asetukset.piilotetutKappaleet.includes(a);
            return (
              <div class="kortti" key={a}>
                <strong>
                  {k.aine} · {k.metadata.nimi}
                </strong>
                <div class="alaotsikko">{k.metadata.luokkaAste}</div>
                <div class="pinorivi" style={{ marginTop: 8 }}>
                  <button
                    class="nappi"
                    style={{
                      background: rajoitus?.tyyppi === 'kova' ? 'var(--paavari)' : 'var(--tausta-korostus)',
                      color: rajoitus?.tyyppi === 'kova' ? '#fff' : 'var(--teksti)',
                    }}
                    onClick={() => vaihdaFokus(k.aine, k.kappale, rajoitus?.tyyppi === 'kova' ? null : 'kova')}
                  >
                    Kova fokus tänään
                  </button>
                  <button
                    class="nappi"
                    style={{
                      background: rajoitus?.tyyppi === 'pehmea' ? 'var(--paavari)' : 'var(--tausta-korostus)',
                      color: rajoitus?.tyyppi === 'pehmea' ? '#fff' : 'var(--teksti)',
                    }}
                    onClick={() => vaihdaFokus(k.aine, k.kappale, rajoitus?.tyyppi === 'pehmea' ? null : 'pehmea')}
                  >
                    Pehmeä fokus viikoksi
                  </button>
                  <button
                    class="nappi"
                    style={{
                      background: piilossa ? 'var(--vaarin)' : 'var(--tausta-korostus)',
                      color: piilossa ? '#fff' : 'var(--teksti)',
                    }}
                    onClick={() => vaihdaPiilotus(k.aine, k.kappale)}
                  >
                    {piilossa ? 'Piilotettu' : 'Piilota'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
