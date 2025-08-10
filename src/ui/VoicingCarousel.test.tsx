import './test-setup'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import VoicingCarousel from './VoicingCarousel'
import { useStore } from '../state/store'
import { Voicing } from '../engine'
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

const samples: Voicing[] = [
  {
    frets: [3, 2, 0, 0, 0, 3],
    tones: [],
    span: 3,
  },
  {
    frets: [3, 5, 5, 4, 3, 3],
    tones: [],
    span: 2,
  },
]

beforeEach(() => {
  useStore.setState({ voicings: samples, selectedVoicingIdx: 0 })
})

test('cycles through voicings', () => {
  render(<VoicingCarousel />)
  const fretboard = screen.getByTestId('fretboard')
  const tablature = screen.getByTestId('tablature')
  assert.equal(fretboard.getAttribute('data-frets'), '3,2,0,0,0,3')
  fireEvent.click(screen.getByText('Next'))
  assert.equal(fretboard.getAttribute('data-frets'), '3,5,5,4,3,3')
  assert.equal(tablature.getAttribute('data-frets'), '3,5,5,4,3,3')
  fireEvent.click(screen.getByText('Prev'))
  assert.equal(fretboard.getAttribute('data-frets'), '3,2,0,0,0,3')
})

