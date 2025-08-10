export type Mode = 'major' | 'minor';

const DEGREE_MAP: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7
};

// Treat | - _ , ; as separators, collapse whitespace.
export function parseProgression(input: string): string[] {
  return input
    .replace(/[|\-_,;]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function degreeFromRoman(token: string): number {
  const t = token.toLowerCase().replace(/[^iv]/g, '');
  const n = DEGREE_MAP[t as keyof typeof DEGREE_MAP];
  if (!n) throw new Error(`Bad numeral: "${token}"`);
  return n;
}

// Diatonic triads—no sevenths. Extend later if needed.
export function qualityForDegree(mode: Mode, degree: number): 'maj'|'min'|'dim' {
  const major = ['maj','min','min','maj','maj','min','dim'];
  const minor = ['min','dim','maj','min','min','maj','maj'];
  return (mode === 'major' ? major : minor)[degree - 1] as any;
}
