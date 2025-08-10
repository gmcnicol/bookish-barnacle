import { create } from 'zustand'
import {
  resolveChord,
  findVoicings,
  filterPlayable,
  type Voicing,
} from '../engine'

interface AppState {
  key: string
  mode: string
  tuning: string[]
  progression: string
  voicings: Voicing[]
  selectedVoicingIdx: number
  setKey: (k: string) => void
  setMode: (m: string) => void
  setTuning: (t: string[]) => void
  setProgression: (p: string) => void
  nextVoicing: () => void
  prevVoicing: () => void
}

function computeVoicings({
  key,
  mode,
  tuning,
  progression,
}: Pick<AppState, 'key' | 'mode' | 'tuning' | 'progression'>): Voicing[] {
  const token = progression.trim().split(/\s+/)[0]
  if (!token) return []
  try {
    const chord = resolveChord(token, key, mode)
    return filterPlayable(findVoicings(chord, tuning))
  } catch {
    return []
  }
}

export const useStore = create<AppState>((set) => ({
  key: 'C',
  mode: 'major',
  tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
  progression: '',
  voicings: [],
  selectedVoicingIdx: 0,
  setKey: (key) =>
    set((state) => ({
      key,
      voicings: computeVoicings({ ...state, key }),
      selectedVoicingIdx: 0,
    })),
  setMode: (mode) =>
    set((state) => ({
      mode,
      voicings: computeVoicings({ ...state, mode }),
      selectedVoicingIdx: 0,
    })),
  setTuning: (tuning) =>
    set((state) => ({
      tuning,
      voicings: computeVoicings({ ...state, tuning }),
      selectedVoicingIdx: 0,
    })),
  setProgression: (progression) =>
    set((state) => ({
      progression,
      voicings: computeVoicings({ ...state, progression }),
      selectedVoicingIdx: 0,
    })),
  nextVoicing: () =>
    set(({ selectedVoicingIdx, voicings }) => ({
      selectedVoicingIdx: voicings.length
        ? (selectedVoicingIdx + 1) % voicings.length
        : 0,
    })),
  prevVoicing: () =>
    set(({ selectedVoicingIdx, voicings }) => ({
      selectedVoicingIdx: voicings.length
        ? (selectedVoicingIdx - 1 + voicings.length) % voicings.length
        : 0,
    })),
}))
