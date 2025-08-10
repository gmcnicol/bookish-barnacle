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

  if (!current) return <div>No voicings</div>

  return (
    <div>
      <Fretboard voicing={current} />
      <Tablature voicing={current} />
      <div>
        <button onClick={prev}>Prev</button>
        <button onClick={next}>Next</button>
      </div>
    </div>
  )
}

export default VoicingCarousel

