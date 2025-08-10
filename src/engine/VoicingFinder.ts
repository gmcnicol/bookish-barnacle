import { Chord } from './ChordResolver';
import { noteNames } from './ScaleGenerator';

export interface Voicing {
  frets: number[];
  notes: (string | null)[];
}

const voicingDB: Record<string, number[][]> = {
  'D minor': [
    [1, -1, 0, 2, 3, 1],
    [-1, 5, 7, 7, 6, 5],
    [5, 5, 7, 7, 6, 5],
    [10, 12, 12, 10, 10, 10],
  ],
  'G major': [
    [3, 2, 0, 0, 0, 3],
    [3, 5, 5, 4, 3, 3],
    [7, 10, 9, 7, 8, 7],
    [10, 10, 12, 12, 12, 10],
  ],
  'C major': [
    [-1, 3, 2, 0, 1, 0],
    [3, 3, 2, 0, 1, 0],
    [-1, 3, 5, 5, 5, 3],
    [8, 10, 10, 9, 8, 8],
  ],
};

const noteIndex: Record<string, number> = noteNames.reduce(
  (acc, n, i) => ({ ...acc, [n]: i }),
  {} as Record<string, number>,
);

export function findVoicings(chord: Chord, tuning: string[]): Voicing[] {
  const key = `${chord.root} ${chord.quality}`;
  const candidates = voicingDB[key] || [];
  return candidates.map((frets) => ({
    frets,
    notes: frets.map((f, idx) =>
      f >= 0 ? noteNames[(noteIndex[tuning[idx]] + f) % 12] : null,
    ),
  }));
}
