import React from 'react';
import { useApp } from '../state/store';

export default function VoicingHeader() {
  const { chords, chordIdx, voicingIdx } = useApp();
  const chord = chords[chordIdx];
  const vCount = chord?.voicings.length ?? 0;
  const v = chord?.voicings?.[voicingIdx];

  const title = chord ? `${chord.token} (${chord.quality})` : '—';
  const sub = v ? `Voicing ${voicingIdx + 1}/${vCount} • Span ${v.span} frets` : 'No voicings';

  return (
    <div className="flex items-baseline justify-between">
      <div>
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-sm opacity-70">{sub}</div>
      </div>
      <Legend />
    </div>
  );
}

function Legend() {
  return (
    <div className="text-xs opacity-80 flex items-center gap-3">
      <span className="inline-flex items-center gap-1">
        <span className="inline-block w-3 h-3 rounded-full bg-white/90" /> note
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block w-3 h-3 rounded-full bg-emerald-400" /> root
      </span>
      <span className="inline-flex items-center gap-1">0 open</span>
      <span className="inline-flex items-center gap-1">x mute</span>
    </div>
  );
}
