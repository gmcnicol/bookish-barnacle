import React from 'react';
import { useApp } from '../state/store';
import { mod12, noteName } from '../engine/theory';

export const inversionName = (index: number): string => ['Root position', 'First inversion', 'Second inversion', 'Third inversion'][index] ?? 'Inversion';
export default function VoicingHeader() {
  const { chords, chordIdx, voicingIdx } = useApp();
  const chord = chords[chordIdx], voicing = chord?.voicings[voicingIdx];
  if (!chord) return null;
  const bass = voicing ? chord.noteNames[chord.tones.indexOf(mod12(voicing.bass))] ?? noteName(voicing.bass) : '';
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-baseline gap-3"><h2 className="text-3xl font-semibold tracking-tight">{chord.name}</h2><span className="text-sm text-zinc-500">{chord.token}</span></div>
        <p className="mt-1 text-sm text-zinc-400">{chord.noteNames.join(' · ')}</p>
      </div>
      {voicing && <div className="text-sm text-zinc-400 sm:text-right">
        <p className="text-zinc-200">{inversionName(voicing.inversion)} · {bass} in the bass</p>
        <p className="mt-1">Shape {voicingIdx + 1} of {chord.voicings.length} · fret spread {voicing.span}</p>
      </div>}
    </div>
  );
}
