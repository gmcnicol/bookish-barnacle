import { Tuning, E_STANDARD, fretMatches, FRET_RANGE } from './tuning';

export type Voicing = {
  frets: number[]; // length 6; -1 = muted; 0..12 = fret
  tones: number[]; // chord tones used (mod 12)
  span: number;    // max fret - min fret (ignoring -1)
};

// Heuristic knobs (relax to debug)
const MAX_SPAN = 4;
const MIN_SOUNDING_STRINGS = 3;
const MAX_SKIPPED_STRING_GAPS = 1;

export function findVoicings(chordTones: number[], tuning: Tuning = E_STANDARD, limit = 8): Voicing[] {
  // Precompute candidate frets per string for ANY chord tone (+ muted option)
  const candidatesPerString: number[][] = tuning.map(open => {
    const set = new Set<number>();
    for (const t of chordTones) fretMatches(open, t).forEach(f => set.add(f));
    return [-1, ...Array.from(set).sort((a,b)=>a-b)];
  });

  const results: Voicing[] = [];
  // Explore windows of 4 adjacent strings to reduce combinatorics
  for (let start = 0; start <= 2; start++) { // windows: [0..3], [1..4], [2..5]
    backtrack(start, start+3, Array(6).fill(-1));
    if (results.length >= limit) break;
  }
  return results.slice(0, limit);

  function backtrack(s: number, e: number, cur: number[], idx = s) {
    if (results.length >= limit) return;
    if (idx > e) {
      const sounding = cur.filter(f => f >= 0);
      if (sounding.length < MIN_SOUNDING_STRINGS) return;

      const minF = Math.min(...sounding);
      const maxF = Math.max(...sounding);
      const span = maxF - minF;
      if (span > MAX_SPAN) return;

      // Count gaps: muted between sounding strings
      let gaps = 0, seenSounding = false;
      for (let i = 0; i < cur.length; i++) {
        if (cur[i] >= 0) { seenSounding = true; }
        else if (seenSounding && cur.slice(i+1).some(f=>f>=0)) gaps++;
      }
      if (gaps > MAX_SKIPPED_STRING_GAPS) return;

      // Ensure ≥3 distinct chord tones present (or all if <3 tones)
      const used = new Set<number>();
      for (let i = 0; i < cur.length; i++) {
        const f = cur[i];
        if (f < 0) continue;
        const note = (tuning[i] + f) % 12;
        if (chordTones.includes(note)) used.add(note);
      }
      if (used.size < Math.min(3, chordTones.length)) return;

      results.push({ frets: cur.slice(), tones: Array.from(used), span });
      return;
    }
    for (const f of candidatesPerString[idx]) {
      cur[idx] = f;
      backtrack(s, e, cur, idx+1);
      if (results.length >= limit) return;
    }
  }
}
