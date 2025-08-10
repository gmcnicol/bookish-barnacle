import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateScale,
  resolveChord,
  findVoicings,
  filterPlayable,
} from './index.js';

test('C major ii-V-I has at least four playable voicings per chord', () => {
  const tuning = ['E', 'A', 'D', 'G', 'B', 'E'];
  const progression = ['ii', 'V', 'I'];
  progression.forEach((rn) => {
    generateScale('C', 'major');
    const chord = resolveChord(rn, 'C', 'major');
    const voicings = findVoicings(chord, tuning);
    const playable = filterPlayable(voicings);
    assert.ok(
      playable.length >= 4,
      `${rn} expected ≥4 playable voicings, got ${playable.length}`,
    );
  });
});
