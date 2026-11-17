import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeVoicings } from './index';
import { findVoicings } from './voicingFinder';
import { E_STANDARD, DROP_D, DADGAD } from './tuning';
import { estimateFingering } from './fingering';
import { mod12 } from './theory';

test('familiar open and full barre shapes appear among the default suggestions', () => {
  const shapes: [number[], number[]][] = [
    [[0, 4, 7], [-1, 3, 2, 0, 1, 0]],
    [[2, 5, 9], [-1, -1, 0, 2, 3, 1]],
    [[5, 9, 0], [1, 3, 3, 2, 1, 1]],
    [[11, 2, 6], [-1, 2, 4, 4, 3, 2]],
  ];
  for (const [tones, target] of shapes) {
    assert.ok(findVoicings(tones, E_STANDARD, 8).some(v => v.frets.join() === target.join()), target.join());
  }
});
test('all returned shapes have precisely the requested tones, feasible finger estimates and true bass inversions', () => {
  let count = 0;
  for (const tuning of [E_STANDARD, DROP_D, DADGAD]) {
    for (const key of ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']) {
      for (const chord of computeVoicings({ key, mode: 'major', tuning, progression: 'I ii iii IV V vi vii° V7' })) {
        assert.ok(chord.voicings.length >= 4, key + ' ' + chord.name);
        for (const shape of chord.voicings) {
          count++;
          const pitches = shape.frets.flatMap((f, i) => f < 0 ? [] : [tuning[i] + f]);
          assert.deepEqual(new Set(pitches.map(mod12)), new Set(chord.tones));
          assert.equal(shape.bass, Math.min(...pitches));
          assert.equal(chord.tones[shape.inversion], mod12(shape.bass));
          assert.ok(shape.fingerCount <= 4);
          assert.ok(shape.span <= 3);
          shape.frets.forEach((f, s) => assert.ok(f <= 0 || shape.fingers[s] >= 1 && shape.fingers[s] <= 4));
          for (const b of shape.barres) {
            for (let s = b.fromString; s <= b.toString; s++) assert.ok(shape.frets[s] >= b.fret);
          }
        }
      }
    }
  }
  assert.ok(count > 10000);
});
test('neck, string-group, inversion and open-string filters constrain the actual pitches', () => {
  const shapes = findVoicings([0, 4, 7], E_STANDARD, 10000, {
    minFret: 5, maxFret: 12, allowOpen: false, stringGroup: 'gbe', inversion: 1,
  });
  assert.ok(shapes.length > 0);
  for (const v of shapes) {
    assert.deepEqual(v.frets.slice(0, 3), [-1, -1, -1]);
    assert.ok(v.frets.slice(3).every(f => f >= 5 && f <= 12));
    assert.equal(mod12(v.bass), 4);
  }
  assert.deepEqual(findVoicings([0, 4, 7, 11], E_STANDARD, 100, { stringGroup: 'gbe' }), []);
  assert.deepEqual(findVoicings([0, 4, 7], E_STANDARD, 100, { stringGroup: 'gbe', size: 'full' }), []);
  const highOpen = findVoicings([2, 5, 9], E_STANDARD, 10000, { minFret: 10, maxFret: 12, allowGaps: true });
  const crossed = highOpen.find(v => v.frets.join() === '-1,12,0,10,-1,-1');
  assert.ok(crossed);
  assert.equal(crossed.bass, 50);
  assert.equal(crossed.inversion, 0);
});
test('slash basses and figured inversions constrain every suggestion', () => {
  for (const token of ['C/E', 'I6', 'V42']) {
    const [chord] = computeVoicings({ key: 'C', mode: 'major', progression: token });
    assert.ok(chord.voicings.length);
    assert.ok(chord.voicings.every(v => mod12(v.bass) === chord.bass));
  }
});
test('barre estimation accepts F and Bm but rejects shapes requiring five separate fingers', () => {
  assert.equal(estimateFingering([1, 3, 3, 2, 1, 1])?.fingerCount, 3);
  assert.ok(estimateFingering([-1, 2, 4, 4, 3, 2]));
  assert.equal(estimateFingering([1, 2, 3, 4, 5, -1]), null);
});
test('empty searches and invalid ranges fail safely', () => {
  assert.deepEqual(findVoicings([0, 4, 7], E_STANDARD, 0), []);
  assert.throws(() => findVoicings([0, 4, 7], E_STANDARD, 8, { minFret: 12, maxFret: 5 }), /fret range/);
});
