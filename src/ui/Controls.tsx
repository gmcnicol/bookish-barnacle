import React from 'react';
import { useApp } from '../state/store';
import { DADGAD, DROP_D, E_STANDARD } from '../engine/tuning';
import { MODE_INTERVALS } from '../engine/theory';
import type { Mode } from '../engine/theory';
import type { StringGroup } from '../engine/voicingFinder';

const KEYS = ['C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const TUNINGS = [{ name: 'Standard · E A D G B e', pitches: E_STANDARD }, { name: 'Drop D · D A D G B e', pitches: DROP_D }, { name: 'DADGAD', pitches: DADGAD }];
const inputClass = 'rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400';
const labelClass = 'flex flex-col gap-1.5 text-xs text-zinc-400';

export default function Controls() {
  const state = useApp();
  const { keyRoot, mode, progression, tuning, options, error, setKey, setMode, setTuning, setProgression, setOptions } = state;
  const tuningIndex = Math.max(0, TUNINGS.findIndex(t => t.pitches.join() === tuning.join()));
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className={labelClass}>Tonic
          <select className={inputClass} value={keyRoot} onChange={e => setKey(e.target.value)}>
            {KEYS.map(key => <option key={key}>{key}</option>)}
          </select>
        </label>
        <label className={labelClass}>Scale overlay
          <select className={inputClass} value={mode} onChange={e => setMode(e.target.value as Mode)}>
            {Object.keys(MODE_INTERVALS).map(m => <option key={m} value={m}>{m === 'minor' ? 'Natural minor' : m[0].toUpperCase() + m.slice(1)}</option>)}
          </select>
        </label>
        <label className={labelClass}>Tuning
          <select className={inputClass} value={tuningIndex} onChange={e => setTuning(TUNINGS[Number(e.target.value)].pitches)}>
            {TUNINGS.map((t, i) => <option key={t.name} value={i}>{t.name}</option>)}
          </select>
        </label>
        <label className={labelClass + ' min-w-[240px] flex-1'}>Progression
          <input className={inputClass} value={progression} aria-invalid={Boolean(error)} aria-describedby="progression-help progression-error"
            placeholder="ii V I · or Dm7 G7 Cmaj7" onChange={e => setProgression(e.target.value)} />
        </label>
      </div>
      <div id="progression-help" className="space-y-2 text-xs leading-relaxed text-zinc-400">
        <p>Capitals = major; lowercase = minor. Roman roots use major-scale degrees: try <button className="text-emerald-300 underline underline-offset-4" onClick={() => setProgression('i iv V7 ♭VI ♭VII i')}>i iv V7 ♭VI ♭VII i</button>. The scale overlay highlights notes without changing your chords.</p>
        <p>Named chords work too: Dm7 G7 Cmaj7, Fsus4, Bdim7, C/E. Use spaces or bars between chords.</p>
      </div>
      {error && <div role="alert" id="progression-error" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{error} {state.chords.length > 0 && <span>Showing the last valid progression.</span>}</div>}
      <fieldset className="rounded-xl border border-zinc-800 p-4">
        <legend className="px-2 text-xs font-medium uppercase tracking-widest text-zinc-400">Explore the neck</legend>
        <div className="flex flex-wrap items-end gap-3">
          <label className={labelClass}>From fret
            <input className={inputClass + ' w-24'} type="number" min={0} max={options.maxFret} value={options.minFret}
              onChange={e => { if (e.target.value !== '') setOptions({ minFret: Math.max(0, Math.min(options.maxFret, Number(e.target.value))) }); }} />
          </label>
          <label className={labelClass}>To fret
            <input className={inputClass + ' w-24'} type="number" min={options.minFret} max={22} value={options.maxFret}
              onChange={e => { if (e.target.value !== '') setOptions({ maxFret: Math.min(22, Math.max(options.minFret, Number(e.target.value))) }); }} />
          </label>
          <label className={labelClass}>String group
            <select className={inputClass} value={options.stringGroup} onChange={e => setOptions({ stringGroup: e.target.value as StringGroup })}>
              <option value="all">All six strings</option><option value="gbe">G B e · top three</option>
              <option value="dgb">D G B</option><option value="adg">A D G</option><option value="ead">E A D · bottom three</option>
              <option value="dgbe">D G B e · top four</option>
            </select>
          </label>
          <label className={labelClass}>Shape size
            <select className={inputClass} value={options.size} onChange={e => setOptions({ size: e.target.value as typeof options.size })}>
              <option value="all">Any · 3–6 strings</option><option value="triad">Three strings</option><option value="full">Full · 4–6 strings</option>
            </select>
          </label>
          <label className={labelClass}>Bass / inversion
            <select className={inputClass} value={options.inversion} onChange={e => setOptions({ inversion: Number(e.target.value) })}>
              <option value={-1}>Any inversion</option><option value={0}>Root position</option>
              <option value={1}>First inversion</option><option value={2}>Second inversion</option><option value={3}>Third inversion · sevenths</option>
            </select>
          </label>
          <label className={labelClass}>Max fret spread
            <select className={inputClass} value={options.maxSpan} onChange={e => setOptions({ maxSpan: Number(e.target.value) })}>
              <option value={2}>2 · compact</option><option value={3}>3 · standard</option><option value={4}>4 · wider reach</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-5 text-sm text-zinc-300">
          <label className="flex items-center gap-2"><input className="accent-emerald-400" type="checkbox" checked={options.allowOpen} onChange={e => setOptions({ allowOpen: e.target.checked })} />Allow open strings outside the fret region</label>
          <label className="flex items-center gap-2"><input className="accent-emerald-400" type="checkbox" checked={options.allowGaps} onChange={e => setOptions({ allowGaps: e.target.checked })} />Allow one muted string inside a shape</label>
        </div>
        <p className="mt-3 text-xs text-zinc-500">Every chord tone is included. Three-string groups cannot fit a four-note seventh chord. String-group names refer to standard-tuning string positions.</p>
      </fieldset>
    </div>
  );
}
