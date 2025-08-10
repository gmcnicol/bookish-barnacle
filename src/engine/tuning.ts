export type Tuning = number[]; // modulo-12 note indices, low→high
export const E_STANDARD: Tuning = [4, 9, 2, 7, 11, 4]; // E A D G B E (mod 12)

export const FRET_RANGE = { min: 0, max: 12 };

export function fretMatches(stringOpen: number, target: number): number[] {
  const res: number[] = [];
  for (let f = FRET_RANGE.min; f <= FRET_RANGE.max; f++) {
    if ((stringOpen + f) % 12 === target) res.push(f);
  }
  return res;
}
