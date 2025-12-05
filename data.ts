// Re-export data from modular files
// NOW LOADED VIA contentLoader.ts
// data.ts is in the root, but utils is in src/utils.
// Wait, the original structure had `data.ts` in the root.
// But `src/utils` is inside `src`.
// If `data.ts` is in `src/`, then `./utils/contentLoader` is correct.
// If `data.ts` is in root `.`, then it should be `./src/utils/contentLoader`.

// Let's check where data.ts is.
// ls showed `data.ts` in root.
// So import should be `./src/utils/contentLoader`.

export { PART_DATA, DYNASTY_DATA, KINGS_DATA, GLOSSARY_DATA, CONNECTIONS_DATA, TIMELINE_VISUAL_DATA } from './src/utils/contentLoader';

// NOTE FOR USER:
// Content is now managed in src/content/ via JSON files.
// See src/content/README.md for instructions.
