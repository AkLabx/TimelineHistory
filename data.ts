// Re-export data from modular files
/**
 * Exported constant containing part/era data.
 * Loaded from `data/partData.ts`.
 */
export { PART_DATA } from './data/partData';

/**
 * Exported constant containing dynasty data.
 * Loaded from `data/dynastyData.ts`.
 */
export { DYNASTY_DATA } from './data/dynastyData';

/**
 * Exported constant containing kings/figures data.
 * Loaded from `data/kingsData.ts`.
 */
export { KINGS_DATA } from './data/kingsData';

/**
 * Exported constant containing glossary terms.
 * Loaded from `data/glossaryData.ts`.
 */
export { GLOSSARY_DATA } from './data/glossaryData';

/**
 * Exported constant containing connection data between entities.
 * Loaded from `data/connectionsData.ts`.
 */
export { CONNECTIONS_DATA } from './data/connectionsData';

/**
 * Exported constant containing visual timeline data.
 * Loaded from `data/timelineData.ts`.
 */
export { TIMELINE_VISUAL_DATA } from './data/timelineData';

// NOTE FOR USER:
// To use local images instead of URLs:
// 1. Place your images in a 'public/images' folder in your project.
// 2. Update the 'imageUrl' property to point to that path, e.g., imageUrl: "/images/bimbisara.jpg"
// 3. Alternatively, you can use Base64 strings if you want to keep everything in this file, but that makes the file very large.
