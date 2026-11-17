import React from 'react';
import { E_STANDARD } from '../engine/tuning';
import { intervalName, mod12, noteName } from '../engine/theory';
import type { Barre } from '../engine/fingering';

export type NoteLabels = 'notes' | 'intervals' | 'fingers';
type Props = {
  frets: number[]; rootNote?: number; tuning?: number[];
  fingers?: number[]; barres?: Barre[]; minFret?: number; maxFret?: number;
  labels?: NoteLabels; scale?: number[]; chordTones?: number[]; chordNoteNames?: string[]; chordIntervalNames?: string[];
};
export default function Fretboard({
  frets, rootNote, tuning = E_STANDARD, fingers = [], barres = [],
  minFret = 0, maxFret = 12, labels = 'intervals', scale = [], chordTones = [], chordNoteNames = [], chordIntervalNames = [],
}: Props) {
  const start = Math.max(1, minFret);
  const end = Math.min(22, Math.max(start, maxFret));
  const count = end - start + 1;
  const left = 78, right = 980, top = 65, row = 38;
  const cell = (right - left) / count;
  const xFor = (f: number) => left + (f - start + 0.5) * cell;
  const yFor = (s: number) => top + (5 - s) * row;
  const displayName = (pc: number) => chordNoteNames[chordTones.indexOf(pc)] ?? noteName(pc);
  const description = frets.map((f, s) => 'String ' + (6 - s) + ': ' + (f < 0 ? 'muted' : f === 0 ? 'open ' + displayName(mod12(tuning[s])) : 'fret ' + f + ', ' + displayName(mod12(tuning[s] + f)))).join('; ');
  return (
    <div className="overflow-x-auto pb-1" role="region" aria-label="Fretboard diagram" tabIndex={0}>
      <svg className="h-auto w-full min-w-[620px]" viewBox="0 0 1000 320" role="img" aria-label={description}>
        <title>{description}</title>
        {Array.from({ length: count + 1 }, (_, i) => (
          <line key={'wire-' + i} x1={left + i * cell} x2={left + i * cell} y1={top - 12} y2={top + row * 5 + 12}
            stroke={i === 0 && start === 1 ? '#a1a1aa' : '#3f3f46'} strokeWidth={i === 0 && start === 1 ? 5 : 1.5} />
        ))}
        {Array.from({ length: count }, (_, i) => start + i).map(f => (
          <g key={'number-' + f}>
            <text x={xFor(f)} y={28} textAnchor="middle" fill="#a1a1aa" fontSize={15}>{f}</text>
            {[3, 5, 7, 9, 12, 15, 17, 19, 21].includes(f) && (
              f === 12
                ? <><circle cx={xFor(f) - 5} cy={292} r={3} fill="#71717a" /><circle cx={xFor(f) + 5} cy={292} r={3} fill="#71717a" /></>
                : <circle cx={xFor(f)} cy={292} r={3} fill="#71717a" />
            )}
          </g>
        ))}
        {tuning.map((pitch, s) => (
          <g key={'string-' + s}>
            <line x1={left} x2={right} y1={yFor(s)} y2={yFor(s)} stroke="#52525b" strokeWidth={1 + (5 - s) * 0.25} />
            <text x={8} y={yFor(s) + 5} fontSize={14} fill="#a1a1aa">{noteName(pitch)}</text>
            {Array.from({ length: count }, (_, i) => start + i).filter(f => scale.includes(mod12(pitch + f))).map(f => (
              <circle key={'scale-' + f} cx={xFor(f)} cy={yFor(s)} r={3} fill="#71717a" />
            ))}
          </g>
        ))}
        {barres.filter(b => b.fret >= start && b.fret <= end).map((barre, i) => (
          <line key={'barre-' + i} x1={xFor(barre.fret)} x2={xFor(barre.fret)}
            y1={yFor(barre.fromString)} y2={yFor(barre.toString)} stroke="#6ee7b7" strokeOpacity={0.3} strokeWidth={22} strokeLinecap="round" />
        ))}
        {frets.map((f, s) => {
          const y = yFor(s);
          if (f < 0) return <text key={s} x={45} y={y + 6} textAnchor="middle" fontSize={20} fill="#a1a1aa">×</text>;
          if (f > 0 && (f < start || f > end)) return null;
          const pitch = mod12(tuning[s] + f);
          const isRoot = rootNote != null && pitch === rootNote;
          const x = f === 0 ? 45 : xFor(f);
          const label = labels === 'fingers' ? (f === 0 ? '0' : String(fingers[s] ?? '?'))
            : labels === 'notes' ? displayName(pitch) : rootNote == null ? displayName(pitch)
              : chordIntervalNames[chordTones.indexOf(pitch)] ?? intervalName(pitch - rootNote);
          return (
            <g key={s} data-string={s} data-fret={f}>
              <circle cx={x} cy={y} r={15} fill={isRoot ? '#6ee7b7' : '#e4e4e7'} stroke={f === 0 ? '#a1a1aa' : '#18181b'} strokeWidth={f === 0 ? 3 : 1} />
              <text x={x} y={y + 4} textAnchor="middle" fontSize={label.length > 2 ? 10 : 12} fontWeight={600} fill="#18181b">{label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
