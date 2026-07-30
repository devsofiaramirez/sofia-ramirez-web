export function buildWhatsappUrl(number: string, message: string): string {
  const digits = number.replace(/[^0-9]/g, '');
  const params = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${params}`;
}

export function sanitizeFolderName(input: string): string {
  return input.replace(/[^a-z0-9-_]/gi, '').toLowerCase() || 'misc';
}

// Rango Unicode de diacríticos combinantes (U+0300–U+036F), en escape numérico para evitar
// caracteres invisibles ambiguos en el código fuente.
const DIACRITICS_RANGE = new RegExp('[̀-ͯ]', 'g');

export function slugify(input: string): string {
  return (
    input
      .normalize('NFD')
      .replace(DIACRITICS_RANGE, '') // quita tildes tras normalize('NFD')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'item'
  );
}

/** Swap-ea el id clickeado con su vecino (dirección -1 o +1) dentro de un array de ids ordenado. */
export function swapNeighbor(ids: number[], id: number, direction: -1 | 1): number[] {
  const index = ids.indexOf(id);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= ids.length) return ids;
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
