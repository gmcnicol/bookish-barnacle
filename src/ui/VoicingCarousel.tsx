import React from 'react'
import { useStore } from '../state/store'
import Fretboard from './Fretboard'
import Tablature from './Tablature'

export function VoicingCarousel() {
  const voicings = useStore((s) => s.voicings)
  const idx = useStore((s) => s.selectedVoicingIdx)
  const next = useStore((s) => s.nextVoicing)
  const prev = useStore((s) => s.prevVoicing)
  const current = voicings[idx]

  if (!current) return <div className="text-muted">No voicings</div>

  return (
    <div className="space-y-4">
      <Fretboard voicing={current} />
      <Tablature voicing={current} />
      <div className="flex gap-2">
        <button
          className="border border-muted text-foreground px-3 py-1 rounded-2xl"
          onClick={prev}
        >
          Prev
        </button>
        <button
          className="border border-muted text-foreground px-3 py-1 rounded-2xl"
          onClick={next}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default VoicingCarousel

