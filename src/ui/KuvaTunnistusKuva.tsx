import { useState } from 'preact/hooks';
import { PlaceholderKuva } from './PlaceholderKuva';

interface Props {
  kysymysId: string;
  laji: string;
  kategoria: string;
}

// Yrittää näyttää oikean rajatun kuvan (public/kuvat/{kysymysId}.jpg). Jos
// tiedostoa ei löydy (kuvaa ei ole vielä rajattu/ladattu), pudotaan takaisin
// PlaceholderKuvaan. Tiedostopolku tehdään aina id:n perusteella jotta
// useamman aineen/kappaleen sisältö ei voi törmätä samassa kansiossa.
export function KuvaTunnistusKuva({ kysymysId, laji, kategoria }: Props) {
  const [virhe, setVirhe] = useState(false);

  if (virhe) {
    return <PlaceholderKuva laji={laji} kategoria={kategoria} />;
  }

  return (
    <img
      src={`${import.meta.env.BASE_URL}kuvat/${kysymysId}.jpg`}
      alt={laji}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      onError={() => setVirhe(true)}
    />
  );
}
