import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useApp } from './store';

const sampleChords: any = [
  { token: 'I', quality: 'maj', chordRoot: 0, tones: [], voicings: [{ frets: [0,2,2,1,0,0], span: 4 }] },
  { token: 'V', quality: 'maj', chordRoot: 7, tones: [], voicings: [
    { frets: [0,2,3,2,0,0], span: 3 },
    { frets: [3,2,0,0,0,3], span: 3 }
  ] }
];

beforeEach(() => {
  useApp.setState({ chords: sampleChords, chordIdx: 0, voicingIdx: 0 });
});

test('nextVoicing cycles within chord', () => {
  useApp.getState().nextVoicing();
  assert.equal(useApp.getState().voicingIdx, 0); // only one voicing in chord 0
  useApp.setState({ chordIdx: 1, voicingIdx: 0 });
  useApp.getState().nextVoicing();
  assert.equal(useApp.getState().voicingIdx, 1);
  useApp.getState().nextVoicing();
  assert.equal(useApp.getState().voicingIdx, 0);
});

test('nextChord resets voicingIdx', () => {
  useApp.getState().nextChord();
  assert.equal(useApp.getState().chordIdx, 1);
  assert.equal(useApp.getState().voicingIdx, 0);
});
