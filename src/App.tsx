import React, { useEffect } from 'react';
import Controls from './ui/Controls';
import VoicingHeader from './ui/VoicingHeader';
import Fretboard from './ui/Fretboard';
import Tablature from './ui/Tablature';
import { useApp } from './state/store';

export default function App() {
  const { chords, chordIdx, voicingIdx, nextVoicing, prevVoicing, nextChord, prevChord, tuning } = useApp();

  const chord = chords[chordIdx];
  const voicing = chord?.voicings?.[voicingIdx];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextVoicing();
      if (e.key === 'ArrowLeft') prevVoicing();
      if (e.key === 'ArrowDown') nextChord();
      if (e.key === 'ArrowUp') prevChord();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nextVoicing, prevVoicing, nextChord, prevChord]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Chord Shapes & Tabs</h1>
          <p className="text-sm opacity-70">Type a progression, pick a key/mode. Use ←/→ for voicings, ↑/↓ for chords.</p>
        </header>

        <section className="mb-6">
          <Controls />
        </section>

        <section className="space-y-4">
          <VoicingHeader />
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
            {voicing
              ? <Fretboard frets={voicing.frets} rootNote={chord?.tones?.[0]} tuning={tuning} />
              : <div className="p-6 text-sm opacity-80">No voicings for this chord with current filters.</div>
            }
          </div>
          {voicing && (
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
              <Tablature frets={voicing.frets} />
            </div>
          )}

          <div className="flex items-center gap-2">
            <button onClick={prevChord} className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700">Prev Chord ↑</button>
            <button onClick={nextChord} className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700">Next Chord ↓</button>
            <div className="opacity-50">|</div>
            <button onClick={prevVoicing} className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700">Prev Voicing ←</button>
            <button onClick={nextVoicing} className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700">Next Voicing →</button>
          </div>
        </section>
      </div>
    </div>
  );
}
