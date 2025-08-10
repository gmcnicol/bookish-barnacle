import { create } from 'zustand';
import { computeVoicings } from '../engine';
import type { Mode } from '../engine/roman';
import type { ChordOut } from '../engine';
import { E_STANDARD } from '../engine/tuning';

type AppState = {
  keyRoot: string;
  mode: Mode;
  tuning: number[];
  progression: string;

  chords: ChordOut[];
  chordIdx: number;
  voicingIdx: number;

  setKey: (k: string) => void;
  setMode: (m: Mode) => void;
  setTuning: (t: number[]) => void;
  setProgression: (p: string) => void;
  nextVoicing: () => void;
  prevVoicing: () => void;
  nextChord: () => void;
  prevChord: () => void;
  recompute: () => void;
};

export const useApp = create<AppState>((set, get) => ({
  keyRoot: 'C',
  mode: 'major',
  tuning: E_STANDARD,
  progression: 'ii V I',

  chords: [],
  chordIdx: 0,
  voicingIdx: 0,

  setKey: (k) => { set({ keyRoot: k }); get().recompute(); },
  setMode: (m) => { set({ mode: m }); get().recompute(); },
  setTuning: (t) => { set({ tuning: t }); get().recompute(); },
  setProgression: (p) => { set({ progression: p }); get().recompute(); },

  nextVoicing: () => {
    const { chords, chordIdx, voicingIdx } = get();
    const vCount = chords[chordIdx]?.voicings.length ?? 0;
    if (!vCount) return;
    set({ voicingIdx: (voicingIdx + 1) % vCount });
  },
  prevVoicing: () => {
    const { chords, chordIdx, voicingIdx } = get();
    const vCount = chords[chordIdx]?.voicings.length ?? 0;
    if (!vCount) return;
    set({ voicingIdx: (voicingIdx - 1 + vCount) % vCount });
  },

  nextChord: () => {
    const { chords, chordIdx } = get();
    if (!chords.length) return;
    set({ chordIdx: (chordIdx + 1) % chords.length, voicingIdx: 0 });
  },
  prevChord: () => {
    const { chords, chordIdx } = get();
    if (!chords.length) return;
    set({ chordIdx: (chordIdx - 1 + chords.length) % chords.length, voicingIdx: 0 });
  },

  recompute: () => {
    const { keyRoot, mode, tuning, progression } = get();
    const chords = computeVoicings({ key: keyRoot, mode, tuning, progression });
    set({ chords, chordIdx: 0, voicingIdx: 0 });
  },
}));

// Prime store on import
useApp.getState().recompute();

// Backwards compat
export const useStore = useApp;
