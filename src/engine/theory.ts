export type Mode = 'major' | 'minor' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'locrian';
export const MODE_INTERVALS: Record<Mode, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
};
export const mod12 = (n: number): number => ((n % 12) + 12) % 12;
const NATURALS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export function noteIndex(name: string): number {
  const match = /^([A-Ga-g])([#b♯♭]{0,2})$/.exec(name);
  if (!match) throw new Error('Unknown note "' + name + '".');
  const offset = [...match[2]].reduce((n, c) => n + (c === '#' || c === '♯' ? 1 : -1), 0);
  return mod12(NATURALS[match[1].toUpperCase()] + offset);
}
export function noteName(note: number, flats = false): string {
  return (flats
    ? ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
    : ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'])[mod12(note)];
}
export function spellNote(note: number, letter: string): string {
  let accidental = mod12(note - NATURALS[letter]);
  if (accidental > 6) accidental -= 12;
  return letter + (accidental >= 0 ? '♯'.repeat(accidental) : '♭'.repeat(-accidental));
}
export function degreeLetter(rootName: string, degree: number): string {
  return LETTERS[(LETTERS.indexOf(rootName[0].toUpperCase()) + degree - 1) % 7];
}
export function scaleNotes(root: number, mode: Mode): number[] {
  return MODE_INTERVALS[mode].map(n => mod12(root + n));
}
export const majorScale = (root: number): number[] => scaleNotes(root, 'major');
export const naturalMinorScale = (root: number): number[] => scaleNotes(root, 'minor');
export type Quality = 'maj' | 'min' | 'dim' | 'aug' | 'sus2' | 'sus4';
export const TRIADS: Record<Quality, number[]> = {
  maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6],
  aug: [0, 4, 8], sus2: [0, 2, 7], sus4: [0, 5, 7],
};
export function chordTriad(root: number, quality: Quality): number[] {
  return TRIADS[quality].map(n => mod12(root + n));
}
export function intervalName(interval: number): string {
  return ['R', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♯5', '6', '♭7', '7'][mod12(interval)];
}
