import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeVoicings } from './index';
import { movementCost, nearestVoicing, smoothestSequence } from './voiceLeading';

test('sequence planning finds the minimum total cost across the candidate pool', () => {
  const chords = computeVoicings({ key: 'C', mode: 'major', progression: 'ii V I', options: { stringGroup: 'gbe', allowOpen: false, maxFret: 9 } });
  const selected = smoothestSequence(chords);
  function cost(indices: number[]) {
    return indices.reduce((total, index, c) => total + chords[c].voicings[index].score * 0.15
      + (c ? movementCost(chords[c - 1].voicings[indices[c - 1]], chords[c].voicings[index]) : 0), 0);
  }
  let minimum = Infinity;
  chords[0].voicings.forEach((_, a) => chords[1].voicings.forEach((_, b) => chords[2].voicings.forEach((_, c) => {
    minimum = Math.min(minimum, cost([a, b, c]));
  })));
  assert.ok(Math.abs(cost(selected) - minimum) < 1e-9);
});
test('nearest shapes minimise movement and planning handles impossible filters', () => {
  const [dm, g] = computeVoicings({ key: 'C', mode: 'major', progression: 'ii V' });
  const selected = nearestVoicing(dm.voicings[0], g.voicings);
  const cost = (i: number) => movementCost(dm.voicings[0], g.voicings[i]) + g.voicings[i].score * 0.15;
  assert.ok(g.voicings.every((_, i) => cost(selected) <= cost(i)));
  assert.equal(nearestVoicing(dm.voicings[0], []), -1);
  assert.deepEqual(smoothestSequence([{ voicings: [] }]), []);
  assert.deepEqual(smoothestSequence([]), []);
});
