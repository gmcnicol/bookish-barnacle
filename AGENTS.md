# agents.md

Purpose:
Give an automation agent (e.g., Codex) a precise, static plan to build and ship the guitar-chord web app.

Scope & constraints:
- Static site only; all theory/voicing logic runs in the browser.
- Tech: Vite + React + TypeScript + Tailwind; Zustand for state.
- Hosting: GitHub Pages as a project site (served under /<repo>/ subdirectory).
- UX: minimal, muted palette, fast, accessible.

Repo layout (expected):
/src
  /engine        (music theory & voicing)
  /ui            (components: Fretboard, Tablature, etc.)
  /state         (zustand store)
  /styles        (tailwind.css + theme)
index.html
vite.config.ts
package.json
.github/workflows/publish-gh-pages.yml

Agent tasks (ordered):
1) Scaffold
   - Initialize Vite (React+TS), Tailwind, Zustand.
   - Commands: npm create vite@latest, npm i, npm i -D tailwindcss postcss autoprefixer, npx tailwindcss init -p.
   - Acceptance: npm run dev serves a blank page without errors.

2) Engine
   - Implement ScaleGenerator, ChordResolver, VoicingFinder, PlayabilityFilter.
   - Acceptance: key=C, mode=major, progression="ii V I" returns ≥4 playable voicings per chord in EADGBE.

3) Components
   - Fretboard (SVG), Tablature (ASCII), VoicingCarousel, VoicingInfoModal, ProgressionInput.
   - Acceptance: Next/prev voicing updates fretboard + tab in <100ms on desktop.

4) Styling
   - Tailwind theme: background #121212, muted foregrounds, minimal chrome, 2xl radii.
   - Acceptance: Lighthouse Performance ≥90, Accessibility ≥90 on default page.

5) State and wiring
   - Zustand store fields: key, mode, tuning, progression, voicings, selectedVoicingIdx.
   - Acceptance: Changing any input recomputes and re-renders.

6) SPA hardening
   - After build, copy dist/index.html to dist/404.html to support deep links on GitHub Pages.
   - Acceptance: Visiting /<repo>/?p=ii-V-I loads the app (no 404).

7) CI/CD to GitHub Pages (project subdirectory)
   - Add the workflow below; enable Pages in repo Settings → Pages → “GitHub Actions”.
   - Ensure Vite uses a base path of "/<repo>/" (see vite config).
   - Acceptance: Push to main builds and publishes to https://<owner>.github.io/<repo>/.

NPM scripts (expected):
- npm run dev
- npm run build
- npm run preview
- npm run lint (optional)
- npm test (optional)

----- begin file: vite.config.ts -----
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Workflow sets BASE_PATH to "/<repo>/" on CI. Locally, default to "/".
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  plugins: [react()],
  base,
})
----- end file -----

Tailwind (minimal expectations):
- tailwind.config.js includes content paths: ["./index.html", "./src/**/*.{ts,tsx}"].
- Use a muted palette; apply via Tailwind theme extension or CSS vars.

----- begin file: .github/workflows/publish-gh-pages.yml -----
name: Build & Publish to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install deps
        run: npm ci

      - name: Build (with GH Pages base path)
        env:
          # Set base to "/<repo>/" so assets work at the subdirectory
          BASE_PATH: "/${{ github.event.repository.name }}/"
        run: |
          npm run build
          # SPA fallback for deep links
          cp dist/index.html dist/404.html

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
----- end file -----

Pipeline setup (manual steps):
1) In GitHub → Repository → Settings → Pages:
   - Under “Build and deployment”, set Source = “GitHub Actions”.
2) Commit files above (vite.config.ts and .github/workflows/publish-gh-pages.yml) to the repo.
3) Push to the main branch. The workflow will:
   - build with BASE_PATH="/<repo>/"
   - copy dist/index.html to dist/404.html for SPA routing
   - publish the artifact to GitHub Pages
4) Check Actions → the latest “Build & Publish to GitHub Pages” run for success and the Pages URL.
5) Visit https://<owner>.github.io/<repo>/ to verify assets resolve under the subdirectory.

Minimum engine acceptance tests:
- Scale generation: all 7 modes from C produce correct semitone offsets.
- Roman numeral parsing: ii V I vi maps to correct degrees; accidental handling for ♭ / ♯ numerals.
- Chord object: correct root + quality intervals.
- VoicingFinder: returns only playable shapes (≤4-fret span, ≤1 skipped string, ≥3 unique chord tones).
- Inversion tagger: root/1st/2nd by bass note.

Definition of done:
- CI green on main; Pages shows latest build at /bookish-barnacle/.
- Lighthouse ≥90 for Performance and Accessibility on default route.
- At least 4 selectable voicings per chord for ii–V–I in C major (EADGBE).
- Mobile layout usable; keyboard navigation for voicing carousel.
