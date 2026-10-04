/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    env: {
      JWT_SECRET: "test0secret",
      PORT: "3001",
      DATABASE_URL: "<test database url>",
    },
  },
})
