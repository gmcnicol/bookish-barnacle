import { degreeLetter, majorScale, mod12, noteIndex, spellNote, TRIADS } from './theory';
import type { Quality } from './theory';
export type { Mode } from './theory';

const DEGREES: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7 };
export type ResolvedChord = {
  token: string;
  chordRoot: number;
  rootName: string;
  name: string;
  quality: Quality;
  intervals: number[];
  intervalNames: string[];
  tones: number[];
  noteNames: string[];
  bass?: number;
};

export function parseProgression(input: string): string[] {
  return input.replace(/[|\-–—_,;]+/g, ' ').trim().split(/\s+/).filter(Boolean);
}
export function degreeFromRoman(token: string): number {
  const match = /^[b#♭♯]{0,2}(vii|vi|iv|v|iii|ii|i)(.*)$/i.exec(token);
  if (!match) throw new Error('Unsupported chord "' + token + '".');
  resolveChord(token, 'C');
  return DEGREES[match[1].toLowerCase()];
}

function formula(suffix: string, defaultQuality: Quality): { quality: Quality; intervals: number[]; label: string } {
  let quality = defaultQuality;
  if (suffix === 'm' || suffix === 'min' || suffix === 'm7' || suffix === 'min7') quality = 'min';
  if (suffix === 'dim' || suffix === '°' || suffix === 'dim7' || suffix === '°7' || suffix === 'ø' || suffix === 'ø7' || suffix === 'm7b5') quality = 'dim';
  if (suffix === '+' || suffix === 'aug') quality = 'aug';
  if (suffix === 'sus2' || suffix === 'sus4') quality = suffix;
  const intervals = [...TRIADS[quality]];
  let extension = '';
  if (suffix === 'maj7' || suffix === 'M7') { intervals.push(11); extension = 'maj7'; }
  else if (suffix === 'dim7' || suffix === '°7') { intervals.push(9); extension = '7'; }
  else if (['7', 'm7', 'min7', 'ø', 'ø7', 'm7b5'].includes(suffix)) { intervals.push(10); extension = '7'; }
  else if (suffix === '6') { intervals.push(9); extension = '6'; }
  else if (suffix === 'add9') { intervals.push(14); extension = 'add9'; }
  else if (!['', 'm', 'min', 'dim', '°', '+', 'aug', 'sus2', 'sus4'].includes(suffix)) {
    throw new Error('Unsupported chord suffix "' + suffix + '". Try 7, maj7, m7, dim7, sus2, sus4 or add9.');
  }
  let label = quality === 'maj' ? '' : quality === 'min' ? 'm' : quality === 'dim' ? 'dim' : quality === 'aug' ? 'aug' : quality;
  if (['ø', 'ø7', 'm7b5'].includes(suffix)) return { quality, intervals, label: 'm7♭5' };
  if (extension === 'maj7' && quality === 'maj') label = '';
  return { quality, intervals, label: label + extension };
}

// Major-reference Roman notation: i iv V7 ♭VI ♭VII in a minor key.
// Scale overlays are independent; changing an overlay never rewrites a chord.
export function resolveChord(token: string, tonicName: string): ResolvedChord {
  const roman = /^([b#♭♯]{0,2})(vii|vi|iv|v|iii|ii|i)(.*)$/i.exec(token);
  let root: number;
  let rootName: string;
  let suffix: string;
  let quality: Quality;
  let bass: number | undefined;
  let bassName: string | undefined;
  let figureInversion: number | undefined;
  if (roman) {
    const [, accidental, numeral, tail] = roman;
    if (numeral !== numeral.toUpperCase() && numeral !== numeral.toLowerCase()) {
      throw new Error('Use consistent case in "' + token + '".');
    }
    const degree = DEGREES[numeral.toLowerCase()];
    const offset = [...accidental].reduce((n, c) => n + (c === '#' || c === '♯' ? 1 : -1), 0);
    root = mod12(majorScale(noteIndex(tonicName))[degree - 1] + offset);
    rootName = spellNote(root, degreeLetter(tonicName, degree));
    suffix = tail;
    quality = numeral === numeral.toUpperCase() ? 'maj' : 'min';
    if (tail === '6' || tail === '64') {
      figureInversion = tail === '6' ? 1 : 2;
      suffix = '';
    } else if (tail === '65' || tail === '43' || tail === '42') {
      figureInversion = tail === '65' ? 1 : tail === '43' ? 2 : 3;
      suffix = '7';
    }
  } else {
    const named = /^([A-G](?:[#b♯♭]{0,2}))([^/]*)(?:\/([A-G](?:[#b♯♭]{0,2})))?$/.exec(token);
    if (!named) throw new Error('Unsupported chord "' + token + '". Use ii V I, i iv V7, or Dm7 G7 Cmaj7.');
    root = noteIndex(named[1]);
    rootName = named[1].replace(/#/g, '♯').replace(/b/g, '♭');
    suffix = named[2];
    quality = 'maj';
    if (named[3]) { bass = noteIndex(named[3]); bassName = named[3].replace(/#/g, '♯').replace(/b/g, '♭'); }
  }
  suffix = suffix.replace(/♭/g, 'b').replace(/♯/g, '#');
  const resolved = formula(suffix, quality);
  const tones = resolved.intervals.map(n => mod12(root + n));
  if (bass !== undefined && !tones.includes(bass)) {
    throw new Error('Slash bass ' + bassName + ' is not a chord tone of ' + rootName + resolved.label + '.');
  }
  const degrees = resolved.quality === 'sus2' ? [1, 2, 5] : resolved.quality === 'sus4' ? [1, 4, 5] : [1, 3, 5];
  if (resolved.intervals.length > 3) degrees.push(suffix === 'add9' ? 2 : suffix === '6' ? 6 : 7);
  const names = tones.map((tone, i) => spellNote(tone, degreeLetter(rootName, degrees[i])));
  const intervalNames = resolved.intervals.map((interval, i) => {
    if (i === 0) return 'R';
    let difference = mod12(interval - majorScale(0)[degrees[i] - 1]);
    if (difference > 6) difference -= 12;
    const accidental = difference >= 0 ? '♯'.repeat(difference) : '♭'.repeat(-difference);
    return accidental + String(degrees[i] + (interval >= 12 ? 7 : 0));
  });
  if (figureInversion !== undefined) {
    bass = tones[figureInversion];
    bassName = names[figureInversion];
  }
  return {
    token, chordRoot: root, rootName, name: rootName + resolved.label + (bassName ? '/' + bassName : ''),
    quality: resolved.quality, intervals: resolved.intervals, intervalNames, tones, noteNames: names, bass,
  };
}
