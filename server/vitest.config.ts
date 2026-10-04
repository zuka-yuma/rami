/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    setupFiles: ['src/test/setup.ts'],
    env: {
      JWT_SECRET: "test0secret",
      PORT: "3001",
      DATABASE_URL: "postgres://postgres:postgres@localhost:5432/test_rami",
    },
    fileParallelism: false,
  },
})
