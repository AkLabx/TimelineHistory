import React, { useState, useEffect, useRef } from 'react';
import { GLOSSARY_DATA } from '../data';
import { GlossaryTerm } from '../types';

/**
 * Props for the GlossaryHighlighter component.
 */
interface GlossaryHighlighterProps {
  /** The text content to process and highlight. */
  text: string;
  /** Whether the text contains HTML markup. */
  isHtml?: boolean;
}

interface PreparedTerm {
    term: GlossaryTerm;
    regex: RegExp;
    matchCandidates: string[];
    length: number;
}

/**
 * Pre-compute regex patterns for performance.
 * This runs once when the module is loaded, avoiding O(N*M) regex creations on every render.
 *
 * Optimization:
 * 1. Fixed bug where array indices ("0", "1") were used as match keys.
 * 2. Pre-compiled Regex objects for all glossary terms.
 * 3. Sorted by length once at load time.
 */
const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const PREPARED_TERMS: PreparedTerm[] = GLOSSARY_DATA.map(term => {
    const candidates = new Set<string>();

    // 1. The Hindi title
    if (term.title_hi) candidates.add(term.title_hi.trim());

    // 2. The part of English title before parens (often matches Hindi text)
    // Matches legacy behavior: term.title_en.split('(')[0].trim()
    if (term.title_en) candidates.add(term.title_en.split('(')[0].trim());

    // Filter out empty strings or very short strings to avoid noise
    const validCandidates = Array.from(candidates).filter(s => s && s.length > 0);

    if (validCandidates.length === 0) return null;

    const pattern = `(${validCandidates.map(escapeRegExp).join('|')})`;

    // Calculate max length for sorting (longest match first)
    const maxLength = Math.max(...validCandidates.map(s => s.length));

    return {
        term,
        regex: new RegExp(pattern, 'gi'),
        matchCandidates: validCandidates.map(s => s.toLowerCase()),
        length: maxLength
    };
}).filter((item): item is PreparedTerm => item !== null)
  .sort((a, b) => b.length - a.length);


/**
 * A utility component that scans text for glossary terms and highlights them.
 * Clicking a highlighted term opens a popover with its definition.
 *
 * @param props - The component props.
 * @returns The text with interactive highlights.
 */
const GlossaryHighlighter: React.FC<GlossaryHighlighterProps> = ({ text, isHtml = false }) => {
  const [activeTerm, setActiveTerm] = useState<GlossaryTerm | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  /**
   * Handles click on a highlighted term.
   * Calculates the position for the popover.
   */
  const handleTermClick = (e: React.MouseEvent<HTMLSpanElement>, term: GlossaryTerm) => {
    e.stopPropagation();
    e.preventDefault(); 
    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Calculate safe position (prevent overflow)
    const left = Math.min(rect.left + window.scrollX, window.innerWidth - 300); 

    setPopoverPosition({
      x: Math.max(10, left),
      y: rect.bottom + window.scrollY + 8
    });
    // Set active term (keeps it open)
    setActiveTerm(term);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close if clicking outside the popover
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActiveTerm(null);
      }
    };

    if (activeTerm) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeTerm]);

  /**
   * Processes a string to identify and wrap glossary terms.
   * Uses pre-computed regex patterns.
   */
  const processString = (content: string): React.ReactNode[] => {
    if (!content) return [];
    const parts: React.ReactNode[] = [content];
    
    // Iterate over pre-computed terms
    PREPARED_TERMS.forEach(({ term, regex, matchCandidates }) => {
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (typeof part === 'string') {
          // Use the pre-compiled regex
          const split = part.split(regex);

          if (split.length > 1) {
            const newParts: React.ReactNode[] = [];
            split.forEach((str, idx) => {
              // Check for exact match (case-insensitive) to avoid partial replacements inside other words
              const lowerStr = str.toLowerCase();

              // Check if the split part matches any of our candidates
              if (matchCandidates.includes(lowerStr)) {
                newParts.push(
                  <span 
                    key={`${term.title_en}-${i}-${idx}`}
                    onClick={(e) => handleTermClick(e, term)}
                    className="cursor-help border-b-2 border-dotted border-orange-400 text-orange-900 font-medium hover:bg-orange-100 transition-colors inline-block select-none"
                  >
                    {str}
                  </span>
                );
              } else {
                newParts.push(str);
              }
            });
            parts.splice(i, 1, ...newParts);
            i += newParts.length - 1; 
          }
        }
      }
    });
    return parts;
  };

  /**
   * Parses HTML string into React nodes and processes text content for highlighting.
   */
  const renderHtmlContent = (html: string) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const traverse = (node: Node, index: number): React.ReactNode => {
          if (node.nodeType === Node.TEXT_NODE) {
              return <React.Fragment key={index}>{processString(node.textContent || '')}</React.Fragment>;
          }
          if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as Element;
              const tagName = el.tagName.toLowerCase();
              const props: any = { key: index };
              
              Array.from(el.attributes).forEach(attr => {
                  props[attr.name === 'class' ? 'className' : attr.name] = attr.value;
              });

              const children = Array.from(node.childNodes).map((child, i) => traverse(child, i));
              return React.createElement(tagName, props, ...children);
          }
          return null;
      };

      return Array.from(doc.body.childNodes).map((node, i) => traverse(node, i));
  };

  return (
    <>
      <span className="leading-relaxed">
        {isHtml ? renderHtmlContent(text) : processString(text)}
      </span>
      
      {activeTerm && (
        <div 
          ref={popoverRef}
          className="absolute z-50 w-80 p-0 bg-white rounded-xl shadow-2xl border border-orange-100 animate-in fade-in zoom-in duration-200 overflow-hidden"
          style={{ left: popoverPosition.x, top: popoverPosition.y }}
          onClick={(e) => e.stopPropagation()}
        >
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-4 border-b border-orange-100 flex justify-between items-start">
                <div className="mr-2">
                    <h4 className="font-bold text-orange-900 font-serif text-lg leading-tight">{activeTerm.title_en}</h4>
                    <p className="text-sm text-orange-700 font-sans mt-1 opacity-80">{activeTerm.title_hi}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm text-orange-400 hidden sm:block">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    {/* Explicit Close Button */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveTerm(null);
                        }}
                        className="bg-white p-1.5 rounded-lg shadow-sm text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Close"
                        title="Close"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>
            <div className="p-5 space-y-4 bg-white">
                <div>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Definition</span>
                     <p className="text-sm text-slate-700 leading-relaxed font-medium">{activeTerm.definition_en}</p>
                </div>
                <div className="h-px bg-slate-100 w-full"></div>
                <div>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Hindi Translation</span>
                     <p className="text-sm text-slate-600 leading-relaxed font-serif">{activeTerm.definition_hi}</p>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default GlossaryHighlighter;
