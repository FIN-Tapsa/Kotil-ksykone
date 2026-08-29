import { useRef, useState } from 'preact/hooks';
import type { JSX } from 'preact';

interface Props {
  pituus?: number;
  onValmis: (pin: string) => void;
  virhe?: string;
}

export function PinSyote({ pituus = 4, onValmis, virhe }: Props) {
  const [arvot, setArvot] = useState<string[]>(Array(pituus).fill(''));
  const refit = useRef<(HTMLInputElement | null)[]>([]);

  function paivita(i: number, merkki: string) {
    const numero = merkki.replace(/\D/g, '').slice(-1);
    const uudet = [...arvot];
    uudet[i] = numero;
    setArvot(uudet);
    if (numero && i < pituus - 1) {
      refit.current[i + 1]?.focus();
    }
    if (uudet.every((a) => a !== '')) {
      onValmis(uudet.join(''));
    }
  }

  function nappainAlas(i: number, e: JSX.TargetedKeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !arvot[i] && i > 0) {
      refit.current[i - 1]?.focus();
    }
  }

  return (
    <div>
      <div class="pin-syote">
        {arvot.map((arvo, i) => (
          <input
            key={i}
            ref={(el) => {
              refit.current[i] = el;
            }}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={arvo}
            onInput={(e) => paivita(i, (e.target as HTMLInputElement).value)}
            onKeyDown={(e) => nappainAlas(i, e)}
          />
        ))}
      </div>
      {virhe && <p style={{ color: 'var(--vaarin)', textAlign: 'center', fontWeight: 700 }}>{virhe}</p>}
    </div>
  );
}
