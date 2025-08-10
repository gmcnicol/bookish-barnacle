import React from 'react';
import { useApp } from '../state/store';

const KEYS = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'] as const;
const MODES = ['major','minor'] as const;

export default function Controls() {
  const { keyRoot, setKey, mode, setMode, progression, setProgression } = useApp();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col">
        <label className="text-xs uppercase tracking-wide opacity-70">Key</label>
        <select
          className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
          value={keyRoot}
          onChange={(e)=> setKey(e.target.value)}
        >
          {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs uppercase tracking-wide opacity-70">Mode</label>
        <select
          className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
          value={mode}
          onChange={(e)=> setMode(e.target.value as any)}
        >
          {MODES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="flex-1 min-w-[240px] flex flex-col">
        <label className="text-xs uppercase tracking-wide opacity-70">Progression (Roman numerals)</label>
        <input
          className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
          placeholder="ii V I | vi"
          value={progression}
          onChange={(e)=> setProgression(e.target.value)}
        />
      </div>
    </div>
  );
}
