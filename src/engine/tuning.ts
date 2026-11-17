export type Tuning = number[]; // absolute MIDI pitches, low string to high string
export const E_STANDARD: Tuning = [40, 45, 50, 55, 59, 64];
export const DROP_D: Tuning = [38, 45, 50, 55, 59, 64];
export const DADGAD: Tuning = [38, 45, 50, 55, 57, 62];
export const FRET_RANGE = { min: 0, max: 22 };
export function fretMatches(stringOpen: number, target: number): number[] {
  const res: number[] = [];
  for (let f = FRET_RANGE.min; f <= FRET_RANGE.max; f++) {
    if ((stringOpen + f) % 12 === target) res.push(f);
  }
  return res;
}
