export const noteNames = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

const modeIntervals = {
  ionian: [0, 2, 4, 5, 7, 9, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  minor: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
};

export function generateScale(key, mode) {
  const keyIndex = noteNames.indexOf(key);
  if (keyIndex === -1) {
    throw new Error(`Unsupported key: ${key}`);
  }
  const intervals = modeIntervals[mode.toLowerCase()];
  if (!intervals) {
    throw new Error(`Unsupported mode: ${mode}`);
  }
  return intervals.map((i) => noteNames[(keyIndex + i) % 12]);
}
