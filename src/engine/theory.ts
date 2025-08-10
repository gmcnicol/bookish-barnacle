const NOTE_INDEX: Record<string, number> = {
  C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11
};

export function noteIndex(name: string): number {
  if (!(name in NOTE_INDEX)) throw new Error(`Unknown note ${name}`);
  return NOTE_INDEX[name];
}

export function majorScale(root: number): number[] {
  return [0,2,4,5,7,9,11].map(s => (root + s) % 12);
}
export function naturalMinorScale(root: number): number[] {
  return [0,2,3,5,7,8,10].map(s => (root + s) % 12);
}

// Triads only (extend to 7ths later if desired)
export function chordTriad(root: number, quality: 'maj'|'min'|'dim'): number[] {
  if (quality === 'maj') return [root, (root+4)%12, (root+7)%12];
  if (quality === 'min') return [root, (root+3)%12, (root+7)%12];
  return [root, (root+3)%12, (root+6)%12]; // dim
}
