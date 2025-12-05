import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite Configuration.
 * Configures the build process, including React plugin support,
 * base path for deployment, and environment variable handling.
 *
 * @param config - The environment configuration (mode, command, etc.).
 * @returns The Vite configuration object.
 */
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    base: '/TimelineHistory/', // Sets the base path for GitHub Pages deployment
    define: {
      // Prevents "process is not defined" error in browser by replacing it with the stringified value during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY)
    }
  };
});
