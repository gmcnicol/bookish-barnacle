import { create } from 'zustand';
import { computeVoicings } from '../engine';
import type { ChordOut } from '../engine';
import type { Mode } from '../engine/theory';
import { E_STANDARD } from '../engine/tuning';
import { DEFAULT_OPTIONS, shapeKey } from '../engine/voicingFinder';
import type { VoicingOptions } from '../engine/voicingFinder';
import { movementCost, nearestVoicing, smoothestSequence } from '../engine/voiceLeading';

type AppState = {
  keyRoot: string; mode: Mode; tuning: number[]; progression: string;
  options: VoicingOptions; chords: ChordOut[]; chordIdx: number; voicingIdx: number;
  selections: number[]; error: string | null; notice: string;
  setKey: (key: string) => void; setMode: (mode: Mode) => void;
  setTuning: (tuning: number[]) => void; setProgression: (progression: string) => void;
  setOptions: (options: Partial<VoicingOptions>) => void;
  selectVoicing: (index: number) => void; selectChord: (index: number) => void;
  nextVoicing: () => void; prevVoicing: () => void;
  nextChord: () => void; prevChord: () => void;
  moveNeck: (direction: -1 | 1) => void; nextInversion: () => void;
  optimise: () => void; recompute: () => void;
};
export const useApp = create<AppState>((set, get) => ({
  keyRoot: 'C', mode: 'major', tuning: E_STANDARD, progression: 'ii V I',
  options: { ...DEFAULT_OPTIONS }, chords: [], chordIdx: 0, voicingIdx: 0,
  selections: [], error: null, notice: '',
  setKey: keyRoot => { set({ keyRoot }); get().recompute(); },
  setMode: mode => set({ mode }),
  setTuning: tuning => { set({ tuning }); get().recompute(); },
  setProgression: progression => { set({ progression }); get().recompute(); },
  setOptions: options => { set(state => ({ options: { ...state.options, ...options } })); get().recompute(); },
  selectVoicing: voicingIdx => {
    const { chords, chordIdx, selections } = get();
    if (!chords[chordIdx]?.voicings[voicingIdx]) return;
    const next = [...selections]; next[chordIdx] = voicingIdx;
    set({ voicingIdx, selections: next, notice: '' });
  },
  selectChord: chordIdx => {
    const { chords, chordIdx: previous, voicingIdx, selections } = get();
    if (!chords[chordIdx]) return;
    const current = chords[previous]?.voicings[voicingIdx];
    const saved = selections[chordIdx];
    const index = saved >= 0 && chords[chordIdx].voicings[saved]
      ? saved : nearestVoicing(current, chords[chordIdx].voicings);
    const next = [...selections]; next[chordIdx] = index;
    set({ chordIdx, voicingIdx: Math.max(0, index), selections: next, notice: '' });
  },
  nextVoicing: () => {
    const { chords, chordIdx, voicingIdx } = get();
    const count = chords[chordIdx]?.voicings.length ?? 0;
    if (count) get().selectVoicing((voicingIdx + 1) % count);
  },
  prevVoicing: () => {
    const { chords, chordIdx, voicingIdx } = get();
    const count = chords[chordIdx]?.voicings.length ?? 0;
    if (count) get().selectVoicing((voicingIdx - 1 + count) % count);
  },
  nextChord: () => { const { chords, chordIdx } = get(); if (chords.length) get().selectChord((chordIdx + 1) % chords.length); },
  prevChord: () => { const { chords, chordIdx } = get(); if (chords.length) get().selectChord((chordIdx - 1 + chords.length) % chords.length); },
  moveNeck: direction => {
    const { chords, chordIdx, voicingIdx } = get();
    const voicings = chords[chordIdx]?.voicings ?? [];
    const current = voicings[voicingIdx];
    if (!current) return;
    const candidates = voicings.map((v, i) => ({ v, i }))
      .filter(({ v }) => (v.position - current.position) * direction > 0.5);
    const sameInversion = candidates.filter(({ v }) => v.inversion === current.inversion);
    const pool = sameInversion.length ? sameInversion : candidates;
    pool.sort((a, b) => movementCost(current, a.v) - movementCost(current, b.v) || a.v.score - b.v.score);
    if (pool.length) get().selectVoicing(pool[0].i);
    else set({ notice: 'No ' + (direction > 0 ? 'higher' : 'lower') + ' shape within these filters. Widen the fret range to explore further.' });
  },
  nextInversion: () => {
    const { chords, chordIdx, voicingIdx, options } = get();
    const chord = chords[chordIdx], current = chord?.voicings[voicingIdx];
    if (!current) return;
    if (options.inversion >= 0) { set({ notice: 'Choose “Any inversion” to cycle through inversions.' }); return; }
    for (let step = 1; step < chord.tones.length; step++) {
      const inversion = (current.inversion + step) % chord.tones.length;
      const candidates = chord.voicings.map((v, i) => ({ v, i })).filter(({ v }) => v.inversion === inversion);
      candidates.sort((a, b) => movementCost(current, a.v) - movementCost(current, b.v));
      if (candidates.length) { get().selectVoicing(candidates[0].i); return; }
    }
    set({ notice: 'No other inversion within these filters.' });
  },
  optimise: () => {
    const { chords, chordIdx } = get();
    const selections = smoothestSequence(chords);
    if (!selections.length) { set({ notice: 'Every chord needs at least one shape. Widen the filters before smoothing the progression.' }); return; }
    set({ selections, voicingIdx: selections[chordIdx], notice: 'Selected a smooth path through the progression. Your choices are remembered as you change chords.' });
  },
  recompute: () => {
    const state = get();
    try {
      const chords = computeVoicings({ key: state.keyRoot, mode: state.mode, tuning: state.tuning, progression: state.progression, options: state.options });
      const selections = chords.map((chord, i) => {
        const oldChord = state.chords[i];
        const old = oldChord?.token === chord.token ? oldChord.voicings[state.selections[i]] : undefined;
        if (!old) return i === 0 && chord.voicings.length ? 0 : -1;
        const exact = chord.voicings.findIndex(v => shapeKey(v) === shapeKey(old));
        return exact >= 0 ? exact : nearestVoicing(old, chord.voicings);
      });
      const chordIdx = Math.min(state.chordIdx, Math.max(0, chords.length - 1));
      if (chords[chordIdx]?.voicings.length && selections[chordIdx] < 0) selections[chordIdx] = 0;
      set({ chords, selections, chordIdx, voicingIdx: Math.max(0, selections[chordIdx] ?? 0), error: null, notice: '' });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Could not read that progression.', notice: '' });
    }
  },
}));
useApp.getState().recompute();
export const useStore = useApp;
