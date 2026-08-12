import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5180',
    setupNodeEvents() {
      // implement node event listeners here
    },
    env: {
      apiUrl: 'http://localhost:8001/api',
    },
  },
});
