import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['docs/assets/js/canvas/scene/**/*.test.js'],
  },
});
