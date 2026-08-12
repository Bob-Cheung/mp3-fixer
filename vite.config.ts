import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // base: '/mp3-fixer/',
  base: '/',
  plugins: [react()],
})
