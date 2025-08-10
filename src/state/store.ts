import { create } from 'zustand'
import { computeVoicings as engineComputeVoicings, type Voicing } from '../engine'

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
  progression,
}: Pick<AppState, 'key' | 'mode' | 'progression'>): Voicing[] {
  if (!progression.trim()) return []
  try {
    const chords = engineComputeVoicings({
      key,
      mode: mode as any,
      progression,
    })
    return chords[0]?.voicings ?? []
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
      voicings: computeVoicings({ key, mode: state.mode, progression: state.progression }),
      selectedVoicingIdx: 0,
    })),
  setMode: (mode) =>
    set((state) => ({
      mode,
      voicings: computeVoicings({ key: state.key, mode, progression: state.progression }),
      selectedVoicingIdx: 0,
    })),
  setTuning: (tuning) =>
    set((state) => ({
      tuning,
      voicings: computeVoicings({ key: state.key, mode: state.mode, progression: state.progression }),
      selectedVoicingIdx: 0,
    })),
  setProgression: (progression) =>
    set((state) => ({
      progression,
      voicings: computeVoicings({ key: state.key, mode: state.mode, progression }),
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
