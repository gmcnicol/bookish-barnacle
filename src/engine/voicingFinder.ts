import { E_STANDARD, FRET_RANGE } from './tuning';
import type { Tuning } from './tuning';
import { estimateFingering } from './fingering';
import type { Barre } from './fingering';
import { mod12 } from './theory';

export type StringGroup = 'all' | 'ead' | 'adg' | 'dgb' | 'gbe' | 'dgbe';
export type VoicingOptions = {
  minFret: number;
  maxFret: number;
  maxSpan: number;
  allowOpen: boolean;
  allowGaps: boolean;
  stringGroup: StringGroup;
  size: 'all' | 'triad' | 'full';
  inversion: number;
  bass?: number;
};
export const DEFAULT_OPTIONS: VoicingOptions = {
  minFret: 0, maxFret: 12, maxSpan: 3, allowOpen: true, allowGaps: false,
  stringGroup: 'all', size: 'all', inversion: -1,
};
export const STRING_GROUPS: Record<StringGroup, number[]> = {
  all: [0, 1, 2, 3, 4, 5], ead: [0, 1, 2], adg: [1, 2, 3],
  dgb: [2, 3, 4], gbe: [3, 4, 5], dgbe: [2, 3, 4, 5],
};
export type Voicing = {
  frets: number[];
  tones: number[];
  pitches: number[]; // absolute pitches in string order, muted strings omitted
  fingers: number[];
  barres: Barre[];
  fingerCount: number;
  bass: number; // absolute MIDI pitch
  inversion: number;
  span: number;
  position: number; // average of fretted positions, zero for all-open
  score: number;
};

export const shapeKey = (v: Pick<Voicing, 'frets'>): string => v.frets.join(',');
const cache = new Map<string, Voicing[]>();
const FAMILIAR_SHAPES = new Set([
  '-1,3,2,0,1,0', '-1,0,2,2,1,0', '-1,-1,0,2,3,2', '-1,-1,0,2,3,1',
  '0,2,2,1,0,0', '0,2,2,0,0,0', '1,3,3,2,1,1', '1,3,3,1,1,1',
  '3,2,0,0,0,3', '-1,0,2,2,2,0', '-1,2,4,4,3,2', '-1,2,1,2,0,2',
  '-1,3,2,3,1,0', '-1,-1,0,2,1,2', '-1,-1,0,2,1,1', '0,2,0,1,0,0',
  '0,2,0,0,0,0', '-1,-1,3,2,1,0', '3,2,0,0,0,1', '-1,0,2,0,2,0',
  '-1,0,2,0,1,0', '-1,3,2,0,0,0', '-1,-1,0,2,2,2', '-1,0,2,1,2,0',
]);

export function findVoicings(
  chordTones: number[], tuning: Tuning = E_STANDARD, limit = 96,
  input: Partial<VoicingOptions> = {},
): Voicing[] {
  const options = { ...DEFAULT_OPTIONS, ...input };
  if (tuning.length !== 6 || tuning.some(n => !Number.isInteger(n))) throw new Error('Choose a six-string tuning with absolute MIDI pitches.');
  if (!Number.isInteger(limit) || limit < 1) return [];
  if (!Number.isInteger(options.minFret) || !Number.isInteger(options.maxFret)
    || options.minFret < 0 || options.maxFret > FRET_RANGE.max || options.minFret > options.maxFret) {
    throw new Error('Choose a fret range between 0 and ' + FRET_RANGE.max + '.');
  }
  if (![2, 3, 4].includes(options.maxSpan)) throw new Error('Choose a maximum fret spread of 2, 3 or 4.');
  if (chordTones.length < 2 || new Set(chordTones.map(mod12)).size !== chordTones.length) return [];
  const cacheKey = JSON.stringify([chordTones, tuning, options]);
  const cached = cache.get(cacheKey);
  if (cached) return cached.slice(0, limit);
  const allowed = STRING_GROUPS[options.stringGroup];
  if (!allowed) throw new Error('Unknown string group.');
  const minStrings = Math.max(options.size === 'full' ? 4 : 3, options.stringGroup === 'all' ? 0 : allowed.length);
  const maxStrings = options.size === 'triad' ? 3 : allowed.length;
  if (minStrings > maxStrings || chordTones.length > maxStrings) return [];
  const fullMask = (1 << chordTones.length) - 1;
  const toneBit = new Map(chordTones.map((tone, i) => [mod12(tone), 1 << i]));
  const results: Voicing[] = [];
  const seen = new Set<string>();
  const first = Math.max(1, options.minFret);
  // Each window has at most maxSpan + 1 frets, plus optional open strings.
  // Search every string and every window before ranking and limiting.
  const lastWindow = Math.max(first, options.maxFret);
  for (let low = first; low <= lastWindow; low++) {
    const high = Math.min(options.maxFret, low + options.maxSpan);
    const candidates = tuning.map((open, s) => {
      if (!allowed.includes(s)) return [-1];
      const frets = [-1];
      if (options.allowOpen && toneBit.has(mod12(open))) frets.push(0);
      for (let f = low; f <= high; f++) if (toneBit.has(mod12(open + f))) frets.push(f);
      return frets;
    });
    const suffixMasks = Array<number>(7).fill(0);
    for (let s = 5; s >= 0; s--) {
      suffixMasks[s] = suffixMasks[s + 1] | candidates[s].reduce((mask, f) =>
        f < 0 ? mask : mask | (toneBit.get(mod12(tuning[s] + f)) ?? 0), 0);
    }
    const current = Array<number>(6).fill(-1);
    function visit(s: number, usedMask: number, sounding: number) {
      if (sounding > maxStrings || sounding + 6 - s < minStrings || (usedMask | suffixMasks[s]) !== fullMask) return;
      if (s === 6) {
        if (sounding < minStrings || usedMask !== fullMask) return;
        const key = current.join(',');
        if (seen.has(key)) return;
        seen.add(key);
        const soundIndices = current.flatMap((f, i) => f >= 0 ? [i] : []);
        const gaps = soundIndices[soundIndices.length - 1] - soundIndices[0] + 1 - sounding;
        if (gaps > (options.allowGaps ? 1 : 0)) return;
        const pitches = current.flatMap((f, i) => f >= 0 ? [tuning[i] + f] : []);
        const bass = Math.min(...pitches);
        const inversion = chordTones.findIndex(t => mod12(t) === mod12(bass));
        if (options.inversion >= 0 && inversion !== options.inversion) return;
        if (options.bass !== undefined && mod12(bass) !== mod12(options.bass)) return;
        const fingering = estimateFingering(current);
        if (!fingering) return;
        const fretted = current.filter(f => f > 0);
        const span = fretted.length ? Math.max(...fretted) - Math.min(...fretted) : 0;
        const position = fretted.length ? fretted.reduce((a, b) => a + b, 0) / fretted.length : 0;
        const familiar = tuning.every((n, i) => n === E_STANDARD[i]) && FAMILIAR_SHAPES.has(key);
        const score = span * 1.2 + fingering.fingerCount * 0.9 + fingering.barres.length
          + gaps * 8 + position * 1.1 + (inversion === 0 ? 0 : 3.5) - sounding * 1.4 - (familiar ? 5 : 0);
        results.push({ frets: [...current], tones: [...chordTones], pitches, ...fingering, bass, inversion, span, position, score });
        return;
      }
      for (const fret of candidates[s]) {
        current[s] = fret;
        visit(s + 1, usedMask | (fret < 0 ? 0 : toneBit.get(mod12(tuning[s] + fret)) ?? 0), sounding + (fret >= 0 ? 1 : 0));
      }
    }
    visit(0, 0, 0);
  }
  results.sort((a, b) => a.score - b.score || a.position - b.position || shapeKey(a).localeCompare(shapeKey(b)));
  // Keep the complete ranked pool cached, so navigation and sequence planning
  // can use the same candidates instead of an enumeration-biased first eight.
  if (cache.size >= 128) cache.delete(cache.keys().next().value as string);
  cache.set(cacheKey, results);
  return results.slice(0, limit);
}
