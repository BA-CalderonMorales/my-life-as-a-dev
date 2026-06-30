import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['docs/assets/js/chat-widget/**/*.test.js'],
    environment: 'node',
  },
});
