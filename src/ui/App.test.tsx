import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import React from 'react';
import App from '../App';
import { useApp } from '../state/store';
import { DEFAULT_OPTIONS } from '../engine/voicingFinder';
import { E_STANDARD } from '../engine/tuning';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, Element: dom.window.Element, KeyboardEvent: dom.window.KeyboardEvent });
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
const { render, fireEvent, cleanup } = await import('@testing-library/react');
afterEach(cleanup);
function reset() {
  useApp.setState({ keyRoot: 'C', mode: 'major', tuning: E_STANDARD, progression: 'ii V I', options: { ...DEFAULT_OPTIONS }, chords: [], chordIdx: 0, voicingIdx: 0, selections: [], error: null, notice: '' });
  useApp.getState().recompute();
}
test('editing fields keeps arrow keys available and invalid notation has an inline error', () => {
  reset();
  const view = render(<App />);
  const input = view.getByLabelText('Progression');
  const index = useApp.getState().voicingIdx;
  fireEvent.keyDown(input, { key: 'ArrowRight' });
  assert.equal(useApp.getState().voicingIdx, index);
  fireEvent.keyDown(window, { key: 'ArrowRight' });
  assert.equal(useApp.getState().voicingIdx, index + 1);
  fireEvent.change(input, { target: { value: 'V9' } });
  assert.match(view.getByRole('alert').textContent ?? '', /Unsupported chord suffix/);
  assert.match(view.getByRole('alert').textContent ?? '', /last valid progression/);
  fireEvent.change(input, { target: { value: 'Cmaj7' } });
  assert.equal(view.queryByRole('alert'), null);
  assert.ok(view.getByRole('heading', { name: 'Cmaj7' }));
});
test('filters show an actionable empty state and resetting restores suggestions', () => {
  reset();
  const view = render(<App />);
  fireEvent.change(view.getByLabelText('Progression'), { target: { value: 'Cmaj7' } });
  fireEvent.change(view.getByLabelText('String group'), { target: { value: 'gbe' } });
  assert.ok(view.getByText(/No shapes match/));
  fireEvent.click(view.getByRole('button', { name: 'Reset fretboard filters' }));
  assert.ok(view.getByRole('img'));
});
test('open roots, numbered frets and centred finger dots are present in the diagram', () => {
  reset();
  const view = render(<App />);
  const diagram = view.getByRole('img');
  assert.match(diagram.getAttribute('aria-label') ?? '', /String 4: open D/);
  const openRoot = diagram.querySelector('[data-string="2"][data-fret="0"] circle');
  assert.equal(openRoot?.getAttribute('fill'), '#6ee7b7');
  const dot = diagram.querySelector('[data-string="3"][data-fret="2"] circle');
  assert.equal(Number(dot?.getAttribute('cx')), 78 + 1.5 * (902 / 12));
  const tuning = view.getByLabelText('Tuning');
  const before = useApp.getState().chordIdx;
  fireEvent.keyDown(tuning, { key: 'ArrowDown' });
  assert.equal(useApp.getState().chordIdx, before);
});
