
/**
 * Enum representing the different view states of the application.
 */
export enum ViewState {
  /** The dashboard view, showing an overview of eras. */
  DASHBOARD = 'DASHBOARD',
  /** The timeline view, visualizing the chronological order of events. */
  TIMELINE = 'TIMELINE',
  /** The detailed view for a specific era, dynasty, or figure. */
  DETAIL = 'DETAIL',
  /** The search results view. */
  SEARCH = 'SEARCH',
  /** The comparison view for comparing multiple entities. */
  COMPARE = 'COMPARE'
}

/**
 * Enum representing the types of entities in the system.
 */
export enum EntityType {
  /** Represents a historical era (e.g., sections in the dashboard). */
  ERA = 'ERA',
  /** Represents a dynasty. */
  DYNASTY = 'DYNASTY',
  /** Represents a historical figure or king. */
  FIGURE = 'FIGURE',
  /** Represents a term in the glossary. */
  TERM = 'TERM'
}

/**
 * Represents a card displayed on the timeline or dashboard.
 * Corresponds to entries in `part.json`.
 */
export interface TimelineCard {
  /** The unique identifier for the target entity (e.g., dynasty ID). */
  target: string;
  /** The title of the card. */
  title: string;
  /** The subtitle of the card. */
  subtitle: string;
  /** The time period covered by the entity. */
  period: string;
  /** Optional URL for the card's background image. */
  imageUrl?: string;
}

/**
 * Represents the structure of the part data loaded from `part.json`.
 */
export interface PartData {
  /** The subtitle for the application header. */
  subtitle: string;
  /** Text for the home breadcrumb link. */
  breadcrumbHome: string;
  /** Placeholder text for the search input. */
  searchPlaceholder: string;
  /** Array of timeline cards to display. */
  timelineCards: TimelineCard[];
}

/**
 * Summary information for a dynasty.
 */
export interface DynastyItemSummary {
  /** The title of the dynasty. */
  title: string;
  /** The time period of the dynasty. */
  period?: string;
  /** The founder of the dynasty. */
  founder?: string;
  /** The capital city of the dynasty. */
  capital?: string;
  /** Subtitle for link cards. */
  subtitle?: string;
}

/**
 * Represents a dynasty item, loaded from `dynasty.json`.
 */
export interface DynastyItem {
  /** Unique identifier for the dynasty item. */
  id?: string;
  /** The type of item (e.g., 'event-details', 'dynasty-details', 'timeline-link-card'). */
  type: string;
  /** Summary details about the dynasty. */
  summary: DynastyItemSummary;
  /** List of IDs pointing to sub-items (e.g., kings) in `kings.json`. */
  subItems?: string[];
  /** HTML content for the item description. */
  content?: string;
  /** Target ID for link cards. */
  target?: string;
  /** ID of the parent entity, for navigation. */
  parent?: string;
}

/**
 * Represents a historical period containing multiple dynasty items.
 */
export interface PeriodData {
  /** The title of the period. */
  title: string;
  /** List of dynasty items within this period. */
  items: DynastyItem[];
  /** Pointer to the parent section if nested. */
  parent?: string;
}

/**
 * Summary information for a king or historical figure.
 */
export interface KingProfileSummary {
  /** The name/title of the figure. */
  title: string;
  /** The reign period of the king. */
  reign?: string;
  /** The general time period. */
  period?: string;
  /** The founder (if applicable contextually). */
  founder?: string;
  /** The capital city (if applicable). */
  capital?: string;
}

/**
 * Represents a profile of a king or historical figure, loaded from `kings.json`.
 */
export interface KingProfile {
  /** The type of profile entry. */
  type: string;
  /** Summary details about the figure. */
  summary: KingProfileSummary;
  /** HTML content describing the figure. */
  content?: string;
  /** List of IDs pointing to related entries. */
  subItems?: string[];
  /** URL for the figure's image. */
  imageUrl?: string;
  /** Reign duration in years (for statistical comparison). */
  reignDuration?: number;
  /** Approximate empire size in sq km (for statistical comparison). */
  empireSize?: number;
}

/**
 * Represents visual data for the timeline, loaded from `TimelineData.json`.
 */
export interface TimelineVisualData {
  /** The start year of the timeline view. */
  start: number;
  /** The end year of the timeline view. */
  end: number;
  /** Array of dynasties to visualize on the timeline. */
  dynasties: Array<{
    /** Name of the dynasty. */
    name: string;
    /** Start year of the dynasty. */
    start: number;
    /** End year of the dynasty. */
    end: number;
    /** ID linking to detailed information. */
    detailsId: string;
    /** Color code for visualization. */
    color: string;
  }>;
}

/**
 * Represents a term in the glossary, loaded from `Glossary.json`.
 */
export interface GlossaryTerm {
  /** The term in English. */
  title_en: string;
  /** The definition in English. */
  definition_en: string;
  /** The term in Hindi. */
  title_hi: string;
  /** The definition in Hindi. */
  definition_hi: string;
}

/**
 * Represents a connection between entities, loaded from `ConnectionsData.json`.
 */
export interface Connection {
  /** Label describing the connection. */
  label: string;
  /** ID of the target entity connected to. */
  targetId: string;
}

/**
 * Represents a search result item.
 */
export interface SearchResult {
  /** Unique identifier of the found entity. */
  id: string;
  /** Title of the found entity. */
  title: string;
  /** The type of the entity (Era, Dynasty, Figure, Term). */
  type: EntityType;
  /** Description or snippet of the entity. */
  description: string;
  /** Indicates if the match was found in the title or content. */
  matchType: 'title' | 'content';
  /** ID of the parent entity to facilitate navigation. */
  parentId?: string;
}

/**
 * Represents a message in the chat interface.
 */
export interface ChatMessage {
  /** Unique identifier for the message. */
  id: string;
  /** The role of the message sender ('user' or 'model'). */
  role: 'user' | 'model';
  /** The text content of the message. */
  text: string;
  /** Indicates if the message is currently being streamed. */
  isStreaming?: boolean;
}
