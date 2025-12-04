// Re-export data from modular files
export { PART_DATA } from './data/partData';
export { DYNASTY_DATA } from './data/dynastyData';
export { KINGS_DATA } from './data/kingsData';
export { GLOSSARY_DATA } from './data/glossaryData';
export { CONNECTIONS_DATA } from './data/connectionsData';
export { TIMELINE_VISUAL_DATA } from './data/timelineData';

// NOTE FOR USER:
// To use local images instead of URLs:
// 1. Place your images in a 'public/images' folder in your project.
// 2. Update the 'imageUrl' property to point to that path, e.g., imageUrl: "/images/bimbisara.jpg"
// 3. Alternatively, you can use Base64 strings if you want to keep everything in this file, but that makes the file very large.
