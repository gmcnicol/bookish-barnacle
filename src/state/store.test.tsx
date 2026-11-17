import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useApp } from './store';
import { DEFAULT_OPTIONS } from '../engine/voicingFinder';
import { E_STANDARD } from '../engine/tuning';
import { nearestVoicing } from '../engine/voiceLeading';

beforeEach(() => {
  useApp.setState({ keyRoot: 'C', mode: 'major', tuning: E_STANDARD, progression: 'ii V I', options: { ...DEFAULT_OPTIONS }, chords: [], chordIdx: 0, voicingIdx: 0, selections: [], error: null, notice: '' });
  useApp.getState().recompute();
});
test('changing chords chooses a nearby shape and remembers deliberate choices', () => {
  const before = useApp.getState();
  const expected = nearestVoicing(before.chords[0].voicings[0], before.chords[1].voicings);
  before.nextChord();
  assert.equal(useApp.getState().voicingIdx, expected);
  useApp.getState().selectVoicing(4);
  useApp.getState().prevChord();
  useApp.getState().nextChord();
  assert.equal(useApp.getState().voicingIdx, 4);
});
test('invalid input preserves the last valid progression and recovers without throwing', () => {
  const previous = useApp.getState().chords;
  assert.doesNotThrow(() => useApp.getState().setProgression('ii V#'));
  assert.ok(useApp.getState().error);
  assert.equal(useApp.getState().chords, previous);
  useApp.getState().setProgression('i iv V7');
  useApp.getState().setKey('A');
  assert.equal(useApp.getState().error, null);
  assert.deepEqual(useApp.getState().chords.map(c => c.name), ['Am', 'Dm', 'E7']);
});
test('neck movement and inversion cycling respect the selected string group', () => {
  useApp.getState().setOptions({ stringGroup: 'gbe', allowOpen: false });
  let state = useApp.getState();
  const initial = state.chords[0].voicings[state.voicingIdx];
  state.moveNeck(1);
  state = useApp.getState();
  assert.ok(state.chords[0].voicings[state.voicingIdx].position > initial.position);
  const inversion = state.chords[0].voicings[state.voicingIdx].inversion;
  state.nextInversion();
  state = useApp.getState();
  assert.notEqual(state.chords[0].voicings[state.voicingIdx].inversion, inversion);
  assert.deepEqual(state.chords[0].voicings[state.voicingIdx].frets.slice(0, 3), [-1, -1, -1]);
});
test('smoothing selects a remembered path and impossible filters do not break navigation', () => {
  useApp.getState().optimise();
  const choices = [...useApp.getState().selections];
  useApp.getState().nextChord();
  assert.equal(useApp.getState().voicingIdx, choices[1]);
  useApp.getState().setProgression('Cmaj7');
  useApp.getState().setOptions({ stringGroup: 'gbe' });
  assert.equal(useApp.getState().chords[0].voicings.length, 0);
  assert.doesNotThrow(() => { useApp.getState().nextVoicing(); useApp.getState().nextChord(); useApp.getState().optimise(); });
  assert.match(useApp.getState().notice, /Every chord/);
});
test('changing the scale overlay preserves chord meanings and selected fingerings', () => {
  useApp.getState().selectVoicing(3);
  const before = useApp.getState().chords;
  useApp.getState().setMode('minor');
  assert.equal(useApp.getState().chords, before);
  assert.equal(useApp.getState().voicingIdx, 3);
});
