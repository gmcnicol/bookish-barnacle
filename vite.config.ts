import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Workflow sets BASE_PATH to "/<repo>/" on CI. Locally, default to "/".
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  plugins: [react()],
  base,
})
