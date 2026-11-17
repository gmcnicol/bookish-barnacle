# Fretboard explorer

A static, browser-only guitar tool for finding chord shapes, exploring inversions and connecting progressions. Built with React, TypeScript, Zustand and Vite.

## Run locally

Use Node.js 20 or newer.

~~~sh
npm ci
npm run dev
~~~

Validation:

~~~sh
npm test
npm run check
npm run build
~~~

## Chord notation

Enter Roman numerals, named chords, or a mixture. Separate chords with spaces, bars, commas or dashes.

| Input in C | Resolved chord |
| --- | --- |
| ii V I | Dm G C |
| iv | Fm |
| ♭VII or bVII | B♭ |
| V7 | G7 |
| vii°7 | Bdim7 |
| viiø7 | Bm7♭5 |
| I6 / I64 | C/E / C/G |
| V65 / V43 / V42 | G7/B / G7/D / G7/F |
| Dm7 G7 Cmaj7 | Named chords |
| C/E | C major with E in the bass |

Roman roots always use **major-scale degrees relative to the tonic**. Case explicitly determines major or minor quality. For A minor, use e.g. **i iv V7 ♭VI ♭VII i**. Selecting natural minor, Dorian or another scale overlay highlights those scale notes; it never silently changes the entered chords.

Supported qualities and extensions: major, minor (m/min), diminished (dim/°), augmented (aug/+), sus2, sus4, 7, maj7/M7, m7/min7, diminished seventh (dim7/°7), half-diminished seventh (m7b5/ø7), added ninth (add9), and named sixth chords such as C6. Roman 6/64 and 65/43/42 denote figured-bass inversions.

Unsupported syntax, including secondary functions such as V/V, ninth extensions such as V9, and slash basses outside the chord, produces an inline error. The last valid progression remains visible while you edit. There is a 24-chord limit.

## Exploring the fretboard

- Choose a fret region (0–22), string group, shape size, inversion and maximum fret spread.
- Open strings can ring outside the selected fretted region. Untick that option for closed shapes.
- Use **Up/down the neck** to move to a nearby shape, preferring the same inversion.
- Use **Next inversion** to find the next available inversion near the current position.
- Moving to an unvisited chord suggests a nearby shape. Returning to a chord restores your chosen shape for this session.
- **Smoothest progression** plans across the complete sequence, balancing movement, common sounding pitches and shape ease. It does not optimise the last-to-first transition.
- Change dot labels between notes, intervals and estimated finger numbers. Open-string roots are highlighted too.
- **Play chord** synthesises the exact sounding pitches locally. No audio, credentials or data are sent to a service.
- Arrow keys: left/right browse shapes, up/down change chord. Shortcuts pause inside editable fields.

Standard, Drop D and DADGAD tunings use absolute pitches, so inversion labels remain correct when a higher-fretted lower string crosses another string in pitch. String-group names identify standard-tuning string positions.

## How suggestions are chosen

The search explores all six strings in overlapping fret windows before sorting results. It requires every chord tone, a conservative four-finger estimate, the chosen fret spread and (optionally) at most one internal muted string.

Ranking favours familiar standard-tuning shapes, lower positions, root-position basses, manageable spreads and fewer fingering demands. Familiar open C and Dm and full F/Bm barres are regression-tested. Fingerings are **estimates**, not guarantees for every hand or technique. Thumb-over shapes and rootless/omitted-tone jazz voicings are outside this version.

Up to 256 ranked candidates per chord are available to the interface and sequence planner. Results are cached for responsive input changes. Every shape includes all requested chord tones: a four-note seventh chord therefore cannot fit a three-string group.

## Checks

Tests cover altered roots and chord quality, enharmonic spelling, seven scale overlays, full barre shapes, note correctness across 12 keys and three tunings, true bass inversions, filter boundaries, sequence optimisation, state recovery, keyboard editing and SVG dot placement.

Pull requests run tests, type checking and a Pages-path production build. Deployment runs only from main or a manual workflow on main.

## GitHub Pages

In repository **Settings → Pages**, select **GitHub Actions** as the source. The workflow builds with the repository subdirectory as its base path, then publishes the static site.

MIT licence.

