import React, { useEffect, useState } from 'react';
import Controls from './ui/Controls';
import VoicingHeader from './ui/VoicingHeader';
import Fretboard from './ui/Fretboard';
import type { NoteLabels } from './ui/Fretboard';
import Tablature from './ui/Tablature';
import VoicingCarousel from './ui/VoicingCarousel';
import VoicingInfoModal from './ui/VoicingInfoModal';
import { useApp } from './state/store';
import { noteIndex, scaleNotes } from './engine/theory';
import { DEFAULT_OPTIONS } from './engine/voicingFinder';
import { playVoicing } from './engine/audio';

export default function App() {
  const state = useApp();
  const { chords, chordIdx, voicingIdx, tuning, keyRoot, mode, options, error, notice,
    nextVoicing, prevVoicing, nextChord, prevChord, selectChord, nextInversion, moveNeck, optimise, setOptions } = state;
  const [labels, setLabels] = useState<NoteLabels>('intervals');
  const [showScale, setShowScale] = useState(false);
  const [audioError, setAudioError] = useState('');
  const chord = chords[chordIdx], voicing = chord?.voicings[voicingIdx];
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) return;
      if (event.target instanceof Element && event.target.closest('input,select,textarea,[contenteditable]:not([contenteditable="false"])')) return;
      const action = ({ ArrowRight: nextVoicing, ArrowLeft: prevVoicing, ArrowDown: nextChord, ArrowUp: prevChord } as Record<string, () => void>)[event.key];
      if (action) { event.preventDefault(); action(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nextVoicing, prevVoicing, nextChord, prevChord]);
  async function preview() {
    if (!voicing) return;
    try { setAudioError(''); await playVoicing(voicing); }
    catch (failure) { setAudioError(failure instanceof Error ? failure.message : 'Could not play this shape.'); }
  }
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-7 px-4 py-6 sm:px-6 sm:py-10">
        <header className="space-y-2">
          <div className="flex justify-end pb-2">
            <a className="btn" href="https://buymeacoffee.com/garethmcnicol" target="_blank" rel="noopener noreferrer">☕ Buy me a coffee</a>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-300">Fretboard explorer</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Find your way around a chord.</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">Explore shapes, follow inversions and connect a progression without losing your place on the neck.</p>
        </header>
        <Controls />
        {chords.length > 0 && <section aria-label="Chord progression" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {chords.map((c, i) => <button key={i} onClick={() => selectChord(i)} aria-pressed={i === chordIdx}
                className={'rounded-lg border px-4 py-2 text-left ' + (i === chordIdx ? 'border-emerald-400/60 bg-emerald-400/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600')}>
                <span className="block text-sm font-medium">{c.name}</span><span className="block text-xs text-zinc-500">{c.token}</span>
              </button>)}
            </div>
            <button className="btn" onClick={optimise} disabled={Boolean(error) || chords.some(c => !c.voicings.length)}>Smoothest progression</button>
          </div>
          <p className="text-xs text-zinc-500">The next chord starts near your current shape. Returning to a chord restores your choice. Smoothing chooses a path across the whole sequence.</p>
        </section>}
        {chord ? <section className="space-y-4">
          <VoicingHeader />
          {voicing ? <>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 sm:p-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs text-zinc-400">Dot labels
                    <select className="ml-2 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm" value={labels} onChange={e => setLabels(e.target.value as NoteLabels)}>
                      <option value="intervals">Intervals</option><option value="notes">Note names</option><option value="fingers">Finger numbers</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-zinc-400"><input className="accent-emerald-400" type="checkbox" checked={showScale} onChange={e => setShowScale(e.target.checked)} />Scale notes</label>
                </div>
                <button className="btn btn-accent" onClick={preview}>Play chord</button>
              </div>
              <Fretboard frets={voicing.frets} rootNote={chord.chordRoot} tuning={tuning} fingers={voicing.fingers} barres={voicing.barres}
                minFret={options.minFret} maxFret={options.maxFret} labels={labels} scale={showScale ? scaleNotes(noteIndex(keyRoot), mode) : []}
                chordTones={chord.tones} chordNoteNames={chord.noteNames} chordIntervalNames={chord.intervalNames} />
              <div className="mt-2 flex flex-wrap items-start justify-between gap-4 border-t border-zinc-800 pt-4">
                <div className="flex-1"><p className="mb-2 text-xs text-zinc-500"><span className="text-emerald-300">● Root</span> · pale dots = chord tones · small grey dots = scale · × = mute</p><VoicingInfoModal /></div>
                <Tablature frets={voicing.frets} tuning={tuning} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn" onClick={() => moveNeck(-1)}>Down the neck</button>
              <button className="btn" onClick={() => moveNeck(1)}>Up the neck</button>
              <button className="btn" onClick={nextInversion}>Next inversion</button>
              <div className="ml-auto flex gap-2"><button className="btn" onClick={prevChord}>Previous chord ↑</button><button className="btn" onClick={nextChord}>Next chord ↓</button></div>
            </div>
            <VoicingCarousel />
          </> : <div className="rounded-xl border border-zinc-800 p-6 text-sm text-zinc-400">
            <p>No shapes match these filters. Try a wider fret range, more strings, or a different inversion. Seventh chords need at least four sounding strings.</p>
            <button className="btn mt-4" onClick={() => setOptions({ ...DEFAULT_OPTIONS })}>Reset fretboard filters</button>
          </div>}
          <p role="status" aria-live="polite" className="min-h-5 text-sm text-emerald-200">{notice || audioError}</p>
        </section> : <p className="rounded-xl border border-zinc-800 p-6 text-sm text-zinc-400">Enter a progression to start exploring.</p>}
        <footer className="border-t border-zinc-800 pt-4 text-xs leading-relaxed text-zinc-500">Use ← → for alternative shapes and ↑ ↓ for chords. Arrow shortcuts pause while you edit a field. Audio is synthesised locally in your browser.</footer>
      </div>
    </main>
  );
}
