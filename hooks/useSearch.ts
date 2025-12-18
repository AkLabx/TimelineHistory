import { useState, useMemo, useEffect } from 'react';
import { SearchResult, EntityType } from '../types';
import { PART_DATA, DYNASTY_DATA, KINGS_DATA, GLOSSARY_DATA } from '../data';

/**
 * Extension of SearchResult to include a relevance score.
 * Used for sorting search results.
 */
interface ScoredResult extends SearchResult {
  score: number;
}

/**
 * Custom hook to handle searching across eras, dynasties, figures, and glossary terms.
 * Performs a weighted search on titles and content.
 *
 * @returns An object containing search state and results.
 */
export const useSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * Memoized search results based on the current query.
   * Calculates scores for matches to order results by relevance.
   */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const scoredResults: ScoredResult[] = [];

    /**
     * Calculates a score based on how well the text matches the query.
     * Exact match > Starts with > Contains word > Contains substring
     */
    const getMatchScore = (text: string): number => {
      if (!text) return 0;
      const lowerText = text.toLowerCase();
      if (lowerText === q) return 100;
      if (lowerText.startsWith(q)) return 80;
      if (lowerText.includes(` ${q}`)) return 70; // Matches beginning of a word inside
      if (lowerText.includes(q)) return 50;
      return 0;
    };

    // 1. Eras (Part Data)
    PART_DATA.timelineCards.forEach(card => {
      const titleScore = getMatchScore(card.title);
      const subtitleScore = getMatchScore(card.subtitle);
      // Give Eras a high base score as they are major sections
      const maxScore = Math.max(titleScore, subtitleScore);
      
      if (maxScore > 0) {
        scoredResults.push({
          id: card.target,
          title: card.title,
          type: EntityType.ERA,
          description: card.subtitle,
          matchType: 'title',
          score: maxScore + 15 
        });
      }
    });

    // 2. Dynasties (Dynasty Data)
    Object.keys(DYNASTY_DATA).forEach(periodId => {
      const period = DYNASTY_DATA[periodId];
      period.items.forEach(item => {
        const titleScore = getMatchScore(item.summary.title);
        
        if (titleScore > 0) {
           scoredResults.push({
                id: item.id || periodId, // Fallback to periodId if item has no id (though most do)
                title: item.summary.title,
                type: EntityType.DYNASTY,
                description: item.summary.period || 'Historical Dynasty/Event',
                matchType: 'title',
                parentId: periodId,
                score: titleScore + 10
            });
        }
      });
    });

    // 3. Figures / Kings (Kings Data)
    Object.keys(KINGS_DATA).forEach(kingId => {
      const king = KINGS_DATA[kingId];
      const titleScore = getMatchScore(king.summary.title);
      
      if (titleScore > 0) {
        scoredResults.push({
            id: kingId,
            title: king.summary.title,
            type: EntityType.FIGURE,
            description: king.summary.reign || 'Historical Figure',
            matchType: 'title',
            score: titleScore + 5
        });
      } else if (q.length >= 3 && king.content && king.content.toLowerCase().includes(q)) {
         // Content match - lower priority
         scoredResults.push({
            id: kingId,
            title: king.summary.title,
            type: EntityType.FIGURE,
            description: `...matches "${q}" in profile content...`,
            matchType: 'content',
            score: 20
        });
      }
    });

    // 4. Glossary
    Object.keys(GLOSSARY_DATA).forEach(termKey => {
        const term = GLOSSARY_DATA[termKey];
        const hiScore = getMatchScore(term.title_hi);
        const enScore = getMatchScore(term.title_en);
        const maxScore = Math.max(hiScore, enScore);

        if (maxScore > 0) {
            scoredResults.push({
                id: termKey,
                title: `${term.title_en} (${term.title_hi})`,
                type: EntityType.TERM,
                description: term.definition_en,
                matchType: 'title',
                score: maxScore
            });
        }
    });

    // Sort by score descending
    return scoredResults.sort((a, b) => b.score - a.score);

  }, [query]);

  return {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    results
  };
};
