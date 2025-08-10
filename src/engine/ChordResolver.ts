import { generateScale, noteNames } from './ScaleGenerator';

export interface Chord {
  root: string;
  quality: 'major' | 'minor';
  tones: string[];
}

const romanMap: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
};

export function resolveChord(
  romanNumeral: string,
  key: string,
  mode: string,
): Chord {
  const degree = romanMap[romanNumeral.replace(/[^IVX]/gi, '').toUpperCase()];
  if (!degree) {
    throw new Error(`Unsupported roman numeral: ${romanNumeral}`);
  }
  const scale = generateScale(key, mode);
  const root = scale[degree - 1];
  const quality: 'major' | 'minor' =
    romanNumeral === romanNumeral.toUpperCase() ? 'major' : 'minor';
  const intervals = quality === 'major' ? [0, 4, 7] : [0, 3, 7];
  const rootIndex = noteNames.indexOf(root);
  const tones = intervals.map((i) => noteNames[(rootIndex + i) % 12]);
  return { root, quality, tones };
}
