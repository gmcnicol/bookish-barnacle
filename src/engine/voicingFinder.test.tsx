import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findVoicings } from './voicingFinder';
import { E_STANDARD } from './tuning';

test('includes open strings when available', () => {
  const cMajor = [0, 4, 7];
  const voicings = findVoicings(cMajor, E_STANDARD, 200);
  const target = [-1, 3, 2, 0, 1, 0].join(',');
  const hasOpen = voicings.some(v => v.frets.join(',') === target);
  assert.ok(hasOpen);
});
