
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TIMELINE = 'TIMELINE',
  DETAIL = 'DETAIL',
  SEARCH = 'SEARCH',
  COMPARE = 'COMPARE'
}

export enum EntityType {
  ERA = 'ERA',      // Corresponds to entries in part.json (sections)
  DYNASTY = 'DYNASTY', // Corresponds to items in dynasty.json
  FIGURE = 'FIGURE',   // Corresponds to entries in kings.json
  TERM = 'TERM'     // Glossary terms
}

// From part.json
export interface TimelineCard {
  target: string; // ID used to lookup in dynasty.json
  title: string;
  subtitle: string;
  period: string;
  imageUrl?: string; // URL for the card background
}

export interface PartData {
  subtitle: string;
  breadcrumbHome: string;
  searchPlaceholder: string;
  timelineCards: TimelineCard[];
}

// From dynasty.json
export interface DynastyItemSummary {
  title: string;
  period?: string;
  founder?: string;
  capital?: string;
  subtitle?: string; // For link cards
}

export interface DynastyItem {
  id?: string;
  type: string; // 'event-details', 'dynasty-details', 'timeline-link-card'
  summary: DynastyItemSummary;
  subItems?: string[]; // IDs pointing to kings.json
  content?: string; // HTML content if no subItems
  target?: string; // For link cards
  parent?: string; // For navigation back
}

export interface PeriodData {
  title: string;
  items: DynastyItem[];
  parent?: string; // Pointer to parent section if nested
}

// From kings.json
export interface KingProfileSummary {
  title: string;
  reign?: string;
  period?: string;
  founder?: string;
  capital?: string;
}

export interface KingProfile {
  type: string;
  summary: KingProfileSummary;
  content?: string; // HTML, optional as some entries might only be containers
  subItems?: string[]; // IDs pointing to other entries
  imageUrl?: string; // Hero image for the king/figure
}

// From TimelineData.json
export interface TimelineVisualData {
  start: number;
  end: number;
  dynasties: Array<{
    name: string;
    start: number;
    end: number;
    detailsId: string;
    color: string;
  }>;
}

// From Glossary.json
export interface GlossaryTerm {
  title_en: string;
  definition_en: string;
  title_hi: string;
  definition_hi: string;
}

// From ConnectionsData.json
export interface Connection {
  label: string;
  targetId: string;
}

export interface SearchResult {
  id: string;
  title: string;
  type: EntityType;
  description: string;
  matchType: 'title' | 'content';
  parentId?: string; // To know where to navigate
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}