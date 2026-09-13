// Aineen ikoni ainevalinnan/aiheenvalinnan korteille. Jaettu useamman näkymän
// kesken (Ainevalinta.tsx, Kappaleenvalinta.tsx).
export function aineIkoni(aine: string): string {
  const t = aine.toLowerCase();
  if (t.includes('biolog')) return '🌿';
  if (t.includes('histor')) return '🏺';
  if (t.includes('ruotsi')) return '🇸🇪';
  if (t.includes('äidinkiel') || t.includes('kieli')) return '🔤';
  if (t.includes('uskonto')) return '🙏';
  if (t.includes('fysiik')) return '⚛️';
  if (t.includes('terveys')) return '❤️';
  return '📘';
}
