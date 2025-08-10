import React, { useState } from 'react'
import { useStore } from '../state/store'

export function VoicingInfoModal() {
  const [open, setOpen] = useState(false)
  const voicing = useStore((s) => s.voicings[s.selectedVoicingIdx])

  if (!voicing) return null

  return (
    <div>
      <button onClick={() => setOpen(true)}>Info</button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
        >
          <div className="bg-white p-4" data-testid="voicing-info">
            <p>{voicing.notes.filter(Boolean).join(', ')}</p>
            <button onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoicingInfoModal

