import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveChord, parseProgression } from './roman';
import { MODE_INTERVALS, noteIndex, scaleNotes } from './theory';

test('preserves chord case, altered roots and sevenths instead of silently rewriting them', () => {
  for (const [token, tonic, name, notes] of [
    ['V7', 'A', 'E7', ['E', 'G♯', 'B', 'D']],
    ['♭VII', 'C', 'B♭', ['B♭', 'D', 'F']],
    ['bVII', 'C', 'B♭', ['B♭', 'D', 'F']],
    ['iv', 'C', 'Fm', ['F', 'A♭', 'C']],
    ['#IV', 'C', 'F♯', ['F♯', 'A♯', 'C♯']],
    ['V7', 'C', 'G7', ['G', 'B', 'D', 'F']],
    ['vii°7', 'C', 'Bdim7', ['B', 'D', 'F', 'A♭']],
    ['viiø7', 'C', 'Bm7♭5', ['B', 'D', 'F', 'A']],
    ['C#maj7', 'C', 'C♯maj7', ['C♯', 'E♯', 'G♯', 'B♯']],
    ['Fsus4', 'C', 'Fsus4', ['F', 'B♭', 'C']],
    ['Cadd9', 'C', 'Cadd9', ['C', 'E', 'G', 'D']],
  ] as const) {
    const chord = resolveChord(token, tonic);
    assert.equal(chord.name, name);
    assert.deepEqual(chord.noteNames, notes);
    assert.deepEqual(chord.tones, notes.map(noteIndex));
  }
});
test('named slash chords and Roman figured-bass inversions preserve their bass', () => {
  assert.equal(resolveChord('C/E', 'C').bass, 4);
  assert.equal(resolveChord('I6', 'C').bass, 4);
  assert.equal(resolveChord('I64', 'C').bass, 7);
  assert.equal(resolveChord('V65', 'C').bass, 11);
  assert.equal(resolveChord('V43', 'C').bass, 2);
  assert.equal(resolveChord('V42', 'C').bass, 5);
  assert.equal(resolveChord('C6', 'C').tones.length, 4);
  assert.equal(resolveChord('I6', 'C').tones.length, 3);
});
test('functional intervals retain diminished sevenths and added ninths', () => {
  assert.deepEqual(resolveChord('Bdim7', 'C').intervalNames, ['R', '♭3', '♭5', '♭♭7']);
  assert.deepEqual(resolveChord('Cadd9', 'C').intervalNames, ['R', '3', '5', '9']);
  assert.deepEqual(resolveChord('Bm7♭5', 'C').tones, resolveChord('Bm7b5', 'C').tones);
});
test('rejects partial and unsupported notation with no guessed chord', () => {
  for (const token of ['#', 'V/V', 'garbage', 'Cbanana', 'V9', 'Ii', 'C/D']) {
    assert.throws(() => resolveChord(token, 'C'), /Unsupported|consistent case|not a chord tone/);
  }
  assert.deepEqual(parseProgression('ii-V-I'), ['ii', 'V', 'I']);
  assert.deepEqual(parseProgression('ii–V—I'), ['ii', 'V', 'I']);
  assert.deepEqual(parseProgression('ii | V, I; vi'), ['ii', 'V', 'I', 'vi']);
  assert.deepEqual(parseProgression(' '), []);
});
test('all seven scale overlays have the correct semitone offsets and transpose', () => {
  const expected = {
    major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11], mixolydian: [0, 2, 4, 5, 7, 9, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10],
  };
  for (const mode of Object.keys(MODE_INTERVALS) as (keyof typeof MODE_INTERVALS)[]) {
    assert.deepEqual(scaleNotes(0, mode), expected[mode]);
    assert.deepEqual(scaleNotes(9, mode), expected[mode].map(n => (n + 9) % 12));
  }
});
