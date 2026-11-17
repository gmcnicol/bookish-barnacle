import React from 'react';
import { useApp } from '../state/store';
import { mod12 } from '../engine/theory';

export default function VoicingInfoModal() {
  const { chords, chordIdx, voicingIdx, tuning } = useApp();
  const chord = chords[chordIdx], voicing = chord?.voicings[voicingIdx];
  if (!voicing) return null;
  const notes = voicing.frets.map((f, s) => f < 0 ? '×' : chord.noteNames[chord.tones.indexOf(mod12(tuning[s] + f))]);
  return <details className="text-xs text-zinc-400">
    <summary className="cursor-pointer py-2">Fingering &amp; sounding notes</summary>
    <div className="space-y-2 pb-2 pt-1">
      <p>Low → high: {notes.join(' · ')}</p>
      <p>Fingers: {voicing.fingers.map(f => f < 0 ? '×' : f === 0 ? 'open' : f).join(' · ')}. 1 = index, 2 = middle, 3 = ring, 4 = little finger.</p>
      {voicing.barres.map((b, i) => <p key={i}>Finger {b.finger}: barre fret {b.fret}, strings {6 - b.fromString}–{6 - b.toString}.</p>)}
      <p>Fingerings are conservative estimates: up to four fingers, with barres and no thumb-over. Fret spread excludes open strings and is not a difficulty rating.</p>
    </div>
  </details>;
}

