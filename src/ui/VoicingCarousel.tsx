import React from 'react';
import { useApp } from '../state/store';
import { inversionName } from './VoicingHeader';
import { shapeKey } from '../engine/voicingFinder';

export default function VoicingCarousel() {
  const { chords, chordIdx, voicingIdx, selectVoicing, prevVoicing, nextVoicing } = useApp();
  const voicings = chords[chordIdx]?.voicings ?? [];
  if (!voicings.length) return null;
  const start = Math.floor(voicingIdx / 8) * 8;
  return (
    <section aria-label="Alternative shapes" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-400">Alternative shapes · ranked for ease</h3>
        <div className="flex gap-2"><button className="btn" onClick={prevVoicing}>Previous ←</button><button className="btn" onClick={nextVoicing}>Next →</button></div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {voicings.slice(start, start + 8).map((v, offset) => {
          const index = start + offset;
          return <button key={shapeKey(v)} aria-pressed={index === voicingIdx} onClick={() => selectVoicing(index)}
            className={'rounded-xl border p-3 text-left transition-colors ' + (index === voicingIdx ? 'border-emerald-400/60 bg-emerald-400/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600')}>
            <span className="block font-mono text-sm text-zinc-200">{v.frets.map(f => f < 0 ? 'x' : f).join(' ')}</span>
            <span className="mt-1 block text-xs text-zinc-400">{inversionName(v.inversion)}</span>
            <span className="mt-1 block text-xs text-zinc-500">{v.fingerCount} fingers{v.barres.length ? ' · barre' : ''}</span>
          </button>;
        })}
      </div>
      <p className="text-xs text-zinc-500">Frets run from the lowest string to the highest. Shape order favours familiar fingerings, a comfortable spread and root-position basses.</p>
    </section>
  );
}

