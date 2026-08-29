import type { HahmoNimi, Tunnetila } from '../types';

interface Props {
  hahmo: HahmoNimi;
  tunnetila: Tunnetila;
  koko?: number;
}

// Oikeat Gemini-generoidut hahmokuvat, ks. gemini-prompti-hahmot.md (yläkansiossa).
const PAATE = 'png';

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
