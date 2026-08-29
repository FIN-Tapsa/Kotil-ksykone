import type { HahmoNimi, Tunnetila } from '../types';

interface Props {
  hahmo: HahmoNimi;
  tunnetila: Tunnetila;
  koko?: number;
}

// Placeholder-hahmot ovat .svg-tiedostoja (ks. scripts/generoi-placeholder-hahmot.mjs).
// Kun oikeat Gemini-kuvat ladataan Driveen .png-muodossa, vaihda pääte tässä yhdessä
// paikassa - muu koodi ei tiedä lähteestä mitään.
const PAATE = 'svg';

export function CharacterAvatar({ hahmo, tunnetila, koko = 140 }: Props) {
  return (
    <img
      class="hahmo"
      style={{ width: koko, height: koko }}
      src={`${import.meta.env.BASE_URL}hahmot/${hahmo}_${tunnetila}.${PAATE}`}
      alt={`${hahmo} - ${tunnetila}`}
    />
  );
}
