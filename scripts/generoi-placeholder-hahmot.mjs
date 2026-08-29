// Kertakäyttöinen skripti: generoi yksinkertaiset SVG-placeholder-hahmot
// /public/hahmot/-kansioon, samoilla tiedostonimillä joita design-prompti
// ja gemini-prompti-hahmot.md odottavat (vain .png -> .svg, ks. README).
// Korvaa nämä oikeilla Gemini-generoiduilla PNG-kuvilla kun ne on valmiit -
// koodi ei muutu, vain tiedostopääte pitää päivittää characterAvatar.tsx:ssä.
import { writeFileSync } from 'node:fs';

const HAHMOT = {
  pesukarhu: { turkki: '#c9cdd6', turkkiTumma: '#8b8f9a', naama: '#f2f1ef' },
  kettu: { turkki: '#e8935c', turkkiTumma: '#c96e34', naama: '#fbe6d3' },
};

const TEEMAVARIT = {
  neutraali: '#9b6bd6',
  iloinen: '#9b6bd6',
  pettynyt: '#9b6bd6',
  juhliva: '#9b6bd6',
  miettiva: '#9b6bd6',
};

function suu(tunnetila) {
  switch (tunnetila) {
    case 'iloinen':
      return '<path d="M70 145 Q100 175 130 145" stroke="#33293f" stroke-width="5" fill="none" stroke-linecap="round"/>';
    case 'pettynyt':
      return '<path d="M75 155 Q100 140 125 155" stroke="#33293f" stroke-width="5" fill="none" stroke-linecap="round"/>';
    case 'juhliva':
      return '<path d="M65 140 Q100 185 135 140" stroke="#33293f" stroke-width="6" fill="none" stroke-linecap="round"/>';
    case 'miettiva':
      return '<circle cx="100" cy="150" r="5" fill="#33293f"/>';
    default:
      return '<path d="M78 148 Q100 162 122 148" stroke="#33293f" stroke-width="5" fill="none" stroke-linecap="round"/>';
  }
}

function silmat(tunnetila) {
  if (tunnetila === 'juhliva') {
    // tähtisilmät
    return `
      <path d="M75 105 l4 9 10 1 -7 7 2 10 -9 -5 -9 5 2 -10 -7 -7 10 -1z" fill="#33293f"/>
      <path d="M125 105 l4 9 10 1 -7 7 2 10 -9 -5 -9 5 2 -10 -7 -7 10 -1z" fill="#33293f"/>`;
  }
  if (tunnetila === 'miettiva') {
    return '<circle cx="78" cy="108" r="7" fill="#33293f"/><circle cx="122" cy="108" r="7" fill="#33293f"/>';
  }
  return '<circle cx="78" cy="108" r="9" fill="#33293f"/><circle cx="122" cy="108" r="9" fill="#33293f"/>';
}

function lisaelementti(tunnetila) {
  if (tunnetila === 'juhliva') {
    return `
      <circle cx="30" cy="40" r="5" fill="#ffd166"/>
      <circle cx="170" cy="55" r="4" fill="#9b6bd6"/>
      <circle cx="45" cy="200" r="4" fill="#52b788"/>
      <circle cx="160" cy="195" r="5" fill="#ffd166"/>`;
  }
  return '';
}

function svgHahmo(hahmo, tunnetila) {
  const v = HAHMOT[hahmo];
  const maski =
    hahmo === 'pesukarhu'
      ? `<ellipse cx="78" cy="108" rx="16" ry="11" fill="${v.turkkiTumma}" opacity="0.55"/>
         <ellipse cx="122" cy="108" rx="16" ry="11" fill="${v.turkkiTumma}" opacity="0.55"/>`
      : '';
  const korvat =
    hahmo === 'pesukarhu'
      ? `<circle cx="55" cy="55" r="22" fill="${v.turkki}"/><circle cx="145" cy="55" r="22" fill="${v.turkki}"/>
         <circle cx="55" cy="55" r="11" fill="${v.turkkiTumma}"/><circle cx="145" cy="55" r="11" fill="${v.turkkiTumma}"/>`
      : `<polygon points="45,70 30,20 75,55" fill="${v.turkki}"/><polygon points="155,70 170,20 125,55" fill="${v.turkki}"/>
         <polygon points="48,65 40,35 68,55" fill="${v.turkkiTumma}"/><polygon points="152,65 160,35 132,55" fill="${v.turkkiTumma}"/>`;
  const hupparinvari = TEEMAVARIT[tunnetila];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260" width="200" height="260">
  ${korvat}
  <ellipse cx="100" cy="120" rx="70" ry="65" fill="${v.turkki}"/>
  <ellipse cx="100" cy="130" rx="48" ry="42" fill="${v.naama}"/>
  ${maski}
  ${silmat(tunnetila)}
  ${suu(tunnetila)}
  <path d="M40 190 Q100 165 160 190 L170 250 Q100 270 30 250 Z" fill="${hupparinvari}"/>
  <circle cx="100" cy="200" r="7" fill="#ffffff" opacity="0.85"/>
  ${lisaelementti(tunnetila)}
</svg>`;
}

const tunnetilat = ['neutraali', 'iloinen', 'pettynyt', 'juhliva', 'miettiva'];
for (const hahmo of Object.keys(HAHMOT)) {
  for (const tunnetila of tunnetilat) {
    const svg = svgHahmo(hahmo, tunnetila);
    writeFileSync(`public/hahmot/${hahmo}_${tunnetila}.svg`, svg, 'utf8');
  }
}
console.log('Placeholder-hahmot generoitu public/hahmot/-kansioon.');
