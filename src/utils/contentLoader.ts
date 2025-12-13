
import { PartData, PeriodData, KingProfile, GlossaryTerm, Connection, TimelineVisualData } from '../../types';

// These use Vite's glob import feature to load all JSON files at build time.
// { eager: true } ensures they are bundled into the main JS chunk,
// so data is available synchronously (no async/await needed in components).

// 1. Load Part Data (Dashboard)
const partFiles = import.meta.glob('../content/parts/*.json', { eager: true });

// 2. Load Dynasty Data
const dynastyFiles = import.meta.glob('../content/dynasties/*.json', { eager: true });

// 3. Load Kings Data
const kingFiles = import.meta.glob('../content/kings/*.json', { eager: true });

// 4. Load Other Data (Glossary, Connections, Timeline)
// These files contain Dictionary-like objects in the JSON, not arrays (usually).
// We must parse them accordingly.
const glossaryFiles = import.meta.glob('../content/glossary/*.json', { eager: true });
const connectionFiles = import.meta.glob('../content/connections/*.json', { eager: true });
const timelineFiles = import.meta.glob('../content/timeline/*.json', { eager: true });


/**
 * Helper to extract the default export or the JSON content.
 */
function extractData<T>(globResult: Record<string, unknown>): T[] {
  return Object.values(globResult).map((module: any) => module.default || module);
}

// --- Construct PART_DATA ---
let loadedPartData: PartData = {
    subtitle: "Historical Timeline",
    breadcrumbHome: "Home",
    searchPlaceholder: "Search...",
    timelineCards: []
};

for (const path in partFiles) {
    if (path.includes('dashboard.json')) {
        const data = (partFiles[path] as any).default || partFiles[path];
        loadedPartData = { ...loadedPartData, ...data };
    }
}
export const PART_DATA = loadedPartData;


// --- Construct DYNASTY_DATA ---
// Map filename (without extension) or internal 'id' to the object.
export const DYNASTY_DATA: Record<string, PeriodData> = {};

for (const path in dynastyFiles) {
    const data = (dynastyFiles[path] as any).default || dynastyFiles[path];
    const filename = path.split('/').pop()?.replace('.json', '') || '';
    const key = (data as any).id || filename;

    DYNASTY_DATA[key] = data as PeriodData;
}

// --- Construct KINGS_DATA ---
export const KINGS_DATA: Record<string, KingProfile> = {};

for (const path in kingFiles) {
    const data = (kingFiles[path] as any).default || kingFiles[path];
    const filename = path.split('/').pop()?.replace('.json', '') || '';
    const key = (data as any).id || filename;

    KINGS_DATA[key] = data as KingProfile;
}

// --- Construct GLOSSARY_DATA ---
// The JSON file is an Object (Dictionary) where keys are terms.
// We want to export an Array of GlossaryTerm.
export const GLOSSARY_DATA: GlossaryTerm[] = [];

for (const path in glossaryFiles) {
    const data = (glossaryFiles[path] as any).default || glossaryFiles[path];

    if (Array.isArray(data)) {
        // If it was stored as an array
        GLOSSARY_DATA.push(...data);
    } else if (typeof data === 'object' && data !== null) {
        // If it was stored as a Dictionary { termKey: { ...termData } }
        const terms = Object.values(data) as GlossaryTerm[];
        GLOSSARY_DATA.push(...terms);
    }
}

// --- Construct CONNECTIONS_DATA ---
// The JSON is a Dictionary { entityId: [Connections] }
// We want to export an Array of Connection?
// Wait, check types.ts -> `export { CONNECTIONS_DATA } from ...`
// In the original `connectionsData.ts`, `CONNECTIONS_DATA` was a Record<string, Connection[]> ?
// Let's check `types.ts` again. `export interface Connection { label: string, targetId: string }`.
// The file `data.ts` exported `CONNECTIONS_DATA`.
// Let's assume the App expects a Record<string, Connection[]> based on how it's likely used (looking up by ID).
// But `contentLoader.ts` previously tried to export `Connection[]`.
// Let's check `links.json` content -> it is a Dictionary.
// So `CONNECTIONS_DATA` should be `Record<string, Connection[]>`.
// Checking `src/utils/contentLoader.ts` from previous step... `export const CONNECTIONS_DATA = loadedConnections;` where `loadedConnections` was `Connection[]`. This looks WRONG if the original was a map.
// I will verify usage in App or infer from JSON structure.
// The JSON structure `links.json` is `Record<string, Connection[]>`.
// So I should export it as such.

export const CONNECTIONS_DATA: Record<string, Connection[]> = {};

for (const path in connectionFiles) {
    const data = (connectionFiles[path] as any).default || connectionFiles[path];
    // Merge the dictionary
    Object.assign(CONNECTIONS_DATA, data);
}


// --- Construct TIMELINE_VISUAL_DATA ---
// JSON `visuals.json` is a Dictionary of Objects (keys like "magadha", "sultanate").
// Wait, `types.ts` defines `TimelineVisualData` as:
// interface TimelineVisualData { start: number; end: number; dynasties: ... }
// BUT `visuals.json` contains keys like "magadha": { start: ..., dynasties: ... }.
// So `TIMELINE_VISUAL_DATA` exported from `data.ts` must be `Record<string, TimelineVisualData>`.
// Let's verify `types.ts` usage.
// `data.ts` exported `TIMELINE_VISUAL_DATA`.
// `Timeline.tsx` uses it.
// If `visuals.json` has keys "magadha", "sultanate", then it is indeed a Record.

export const TIMELINE_VISUAL_DATA: Record<string, TimelineVisualData> = {};

for (const path in timelineFiles) {
    const data = (timelineFiles[path] as any).default || timelineFiles[path];
    // Merge the dictionary
    Object.assign(TIMELINE_VISUAL_DATA, data);
}
