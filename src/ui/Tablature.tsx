import React from 'react';
import { noteName } from '../engine/theory';
import { E_STANDARD } from '../engine/tuning';

export default function Tablature({ frets, tuning = E_STANDARD }: { frets: number[]; tuning?: number[] }) {
  const lines = [...frets].reverse().map((f, i) => {
    const name = noteName(tuning[5 - i]);
    return name.padEnd(2) + '|' + (f < 0 ? 'x' : String(f)).padEnd(3, '-') + '----|';
  });
  return <pre aria-label="Tablature, highest string first" className="overflow-auto font-mono text-xs leading-5 text-zinc-300">{lines.join('\n')}</pre>;
}
