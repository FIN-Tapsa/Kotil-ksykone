// Kuva-tunnistuskysymysten oikeat rajatut kuvatiedostot eivät ole vielä olemassa
// (vanhempi rajaa ne käsin myöhemmin Coworkin antaman sijaintikuvauksen perusteella,
// ks. design-prompti). Tämä komponentti piirtää siihen asti neutraalin paikkamerkin
// jossa näkyy lajin nimi - näin peli-mekaniikkaa voi testata täydestä päästä päähän.
interface Props {
  laji: string;
  kategoria: string;
}

function vari(kategoria: string): string {
  let h = 0;
  for (const c of kategoria) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `hsl(${h}, 55%, 80%)`;
}

export function PlaceholderKuva({ laji, kategoria }: Props) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: vari(kategoria),
        color: '#33293f',
        fontWeight: 700,
        fontSize: '0.9rem',
        textAlign: 'center',
        padding: 8,
      }}
      title="Väliaikainen paikkamerkkikuva - korvataan oikealla rajatulla kuvalla"
    >
      🖼️ {laji}
    </div>
  );
}
