import { Tuning, E_STANDARD, fretMatches, FRET_RANGE } from './tuning';

export type Voicing = {
  frets: number[]; // length 6; -1 = muted; 0..12 = fret
  tones: number[]; // chord tones used (mod 12)
  span: number;    // max fret - min fret (ignoring -1 and opens)
};

// Heuristic knobs (relax to debug)
const MAX_SPAN = 3;
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
  const seen = new Set<string>();

  // Explore windows of 4 adjacent strings to reduce combinatorics
  for (let start = 0; start <= 2; start++) { // windows: [0..3], [1..4], [2..5]
    const end = start + 3;
    const outside: number[] = [];
    for (let i = 0; i < 6; i++) {
      if (i < start || i > end) outside.push(i);
    }

    const base = Array(6).fill(-1);
    assignOutside(0, base);
    if (results.length >= limit) break;

    function assignOutside(i: number, cur: number[]) {
      if (results.length >= limit) return;
      if (i >= outside.length) {
        backtrack(start, end, cur, start);
        return;
      }
      const idx = outside[i];
      const opts = candidatesPerString[idx].filter(f => f <= 0); // allow mute or open only
      for (const f of opts) {
        const next = cur.slice();
        next[idx] = f;
        assignOutside(i + 1, next);
        if (results.length >= limit) return;
      }
    }
  }
  return results.slice(0, limit);

  function backtrack(s: number, e: number, cur: number[], idx = s) {
    if (results.length >= limit) return;
    if (idx > e) {
      const sounding = cur.filter(f => f >= 0);
      if (sounding.length < MIN_SOUNDING_STRINGS) return;

      const fretted = sounding.filter(f => f > 0);
      const span = fretted.length ? Math.max(...fretted) - Math.min(...fretted) : 0;
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

      const key = cur.join(',');
      if (seen.has(key)) return;
      seen.add(key);

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
