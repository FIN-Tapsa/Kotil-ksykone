import { useState } from 'preact/hooks';
import { PinSyote } from '../ui/PinSyote';

interface Props {
  oikeaPin: string;
  onOnnistui: () => void;
  onPeruuta: () => void;
}

export function VanhempiKirjautuminen({ oikeaPin, onOnnistui, onPeruuta }: Props) {
  const [virhe, setVirhe] = useState<string | undefined>();

  function tarkista(pin: string) {
    if (pin === oikeaPin) onOnnistui();
    else setVirhe('Väärä PIN');
  }

  return (
    <div class="naytto">
      <h1 class="otsikko">Vanhemman PIN</h1>
      <PinSyote onValmis={tarkista} virhe={virhe} />
      <button class="linkkinappi" onClick={onPeruuta}>
        Takaisin
      </button>
    </div>
  );
}
