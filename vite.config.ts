
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: set base to your repo name when deploying to GitHub Pages, e.g. '/RealEstate-Simulator/'
const base = process.env.GHP_BASE || '/'

export default defineConfig({
  plugins: [react()],
  base,
})
