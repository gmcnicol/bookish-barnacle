import './test-setup'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import ProgressionInput from './ProgressionInput'
import VoicingCarousel from './VoicingCarousel'
import { useStore } from '../state/store'
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

beforeEach(() => {
  useStore.setState({
    key: 'C',
    mode: 'major',
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    progression: '',
    voicings: [],
    selectedVoicingIdx: 0,
  })
})

test('changing progression recomputes voicings and rerenders', () => {
  render(
    <>
      <ProgressionInput />
      <VoicingCarousel />
    </>,
  )
  const input = screen.getByLabelText('progression')
  fireEvent.change(input, { target: { value: 'I' } })
  let fretboard = screen.getByTestId('fretboard')
  let tablature = screen.getByTestId('tablature')
  assert.equal(fretboard.getAttribute('data-frets'), '-1,3,2,0,1,0')
  assert.equal(tablature.getAttribute('data-frets'), '-1,3,2,0,1,0')
  fireEvent.change(input, { target: { value: 'V' } })
  fretboard = screen.getByTestId('fretboard')
  tablature = screen.getByTestId('tablature')
  assert.equal(fretboard.getAttribute('data-frets'), '3,2,0,0,0,3')
  assert.equal(tablature.getAttribute('data-frets'), '3,2,0,0,0,3')
})
