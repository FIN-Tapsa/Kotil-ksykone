import type { Badge, HahmoNimi, VastausTapahtuma } from '../types';
import { CharacterAvatar } from '../ui/CharacterAvatar';

interface Props {
  hahmo: HahmoNimi;
  vastaukset: VastausTapahtuma[];
  uudetBadget: Badge[];
  loputonKorkeus?: number;
  onRaportoi: (kysymysId: string) => void;
  onUudestaan: () => void;
  onValitseToinenAihe: () => void;
}

export function Yhteenveto({
  hahmo,
  vastaukset,
  uudetBadget,
  loputonKorkeus,
  onRaportoi,
  onUudestaan,
  onValitseToinenAihe,
}: Props) {
  const oikein = vastaukset.filter((v) => v.oikein).length;
  const yhteensa = vastaukset.length;
  const hyvaTulos = yhteensa > 0 && oikein / yhteensa >= 0.7;

  return (
    <div class="naytto">
      <CharacterAvatar hahmo={hahmo} tunnetila={uudetBadget.length > 0 || hyvaTulos ? 'juhliva' : 'neutraali'} koko={150} />
      <h1 class="otsikko">
        {oikein} / {yhteensa} oikein!
      </h1>
      {loputonKorkeus !== undefined && <p class="alaotsikko">Kiipesit korkeuteen {loputonKorkeus} 🏔️</p>}

      {uudetBadget.length > 0 && (
        <div class="kortti" style={{ width: '100%' }}>
          <p class="alaotsikko" style={{ margin: '0 0 8px' }}>
            Uusia mitaleita!
          </p>
          <div class="pinorivi">
            {uudetBadget.map((b) => (
              <div class="badge" key={b.id}>
                <div class="badge-ikoni">🏅</div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{b.nimi}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div class="kortti" style={{ width: '100%' }}>
        <p class="alaotsikko" style={{ margin: '0 0 8px' }}>
          Käydyt kysymykset
        </p>
        <table class="ov-taulu">
          <tbody>
            {vastaukset.map((v, i) => (
              <tr key={v.kysymysId + i}>
                <td>{v.oikein ? '✅' : '❌'}</td>
                <td style={{ width: '100%' }}>{v.kysymysTeksti}</td>
                <td>
                  <button class="lippu-nappi" onClick={() => onRaportoi(v.kysymysId)} title="Raportoi kysymys">
                    🚩
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div class="vaakarivi">
        <button class="nappi nappi-toissijainen" onClick={onValitseToinenAihe}>
          Vaihda aihetta
        </button>
        <button class="nappi nappi-ensisijainen" onClick={onUudestaan}>
          Pelaa uudestaan
        </button>
      </div>
    </div>
  );
}
