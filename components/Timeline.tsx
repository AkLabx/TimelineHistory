import React, { useState } from 'react';
import { TIMELINE_VISUAL_DATA } from '../data';
import { useLanguage } from '../src/contexts/LanguageContext';
import { getLocalized } from '../src/utils/language';

/**
 * Props for the Timeline component.
 */
interface TimelineProps {
  /** The ID of the currently active historical period to visualize. */
  activePeriodId: string | null;
}

/**
 * A horizontal timeline component that visualizes dynasties within a specific era.
 * Allows users to hover for details and click to scroll to the relevant section.
 *
 * @param props - The component props.
 * @returns The rendered timeline or null if no active period data is found.
 */
const Timeline: React.FC<TimelineProps> = ({ activePeriodId }) => {
  const [hoveredDynasty, setHoveredDynasty] = useState<{
    name: string;
    start: number;
    end: number;
    left: string;
    width: string;
    color: string;
  } | null>(null);
  const { language } = useLanguage();

  // If no active period or no data for it, return null or a placeholder
  if (!activePeriodId || !TIMELINE_VISUAL_DATA[activePeriodId]) return null;

  const data = TIMELINE_VISUAL_DATA[activePeriodId];
  const totalDuration = data.end - data.start;

  /**
   * Calculates the width of a dynasty bar as a percentage.
   */
  const getWidth = (start: number, end: number) => {
    // Ensure a minimum width (e.g., 3%) so short dynasties are visible and clickable
    return `${Math.max(((end - start) / totalDuration) * 100, 3)}%`;
  };

  /**
   * Calculates the left position of a dynasty bar as a percentage.
   */
  const getLeft = (start: number) => {
    return `${((start - data.start) / totalDuration) * 100}%`;
  };

  /**
   * Formats a year number into a string with BCE/CE suffix.
   */
  const formatDate = (year: number) => {
    return `${Math.abs(year)} ${year < 0 ? 'BCE' : 'CE'}`;
  };

  /**
   * Scrolls the page to the section corresponding to the clicked dynasty.
   */
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        // The EraDetail components have 'scroll-mt-48' to handle the sticky header offset
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full bg-[#292524] border-b-[6px] border-[#78350f] shadow-2xl sticky top-16 z-30 transition-all duration-300">
        <div className="max-w-7xl mx-auto py-4 px-4 relative group">
            {/* Date Range Labels */}
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-[#a8a29e] mb-2 font-mono">
                <span>{formatDate(data.start)}</span>
                <span>{formatDate(data.end)}</span>
            </div>
            
            {/* Timeline Track */}
            <div className="relative h-14 bg-[#1c1917] rounded-lg overflow-visible flex items-center shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] ring-1 ring-white/5 border border-white/5">
                {/* Background grid lines for context */}
                <div className="absolute inset-0 flex justify-between px-2 opacity-10 pointer-events-none">
                    <div className="w-px h-full bg-orange-200"></div>
                    <div className="w-px h-full bg-orange-200"></div>
                    <div className="w-px h-full bg-orange-200"></div>
                    <div className="w-px h-full bg-orange-200"></div>
                    <div className="w-px h-full bg-orange-200"></div>
                </div>

                {data.dynasties.map((dyn, idx) => {
                    const width = getWidth(dyn.start, dyn.end);
                    const left = getLeft(dyn.start);
                    
                    // Translate the name if possible. dyn object usually has 'name'.
                    // We might need to check if 'name_en' exists on dyn?
                    // The VisualData structure is usually simple.
                    // Let's check 'src/content/timeline/visuals.json' later.
                    // Assuming dyn has name_en or we stick with Hindi/English as is.
                    // Actually, let's use getLocalized(dyn, 'name', language) just in case.
                    const dynName = getLocalized(dyn, 'name', language);

                    // Determine if it's the currently hovered one for styling
                    const isHovered = hoveredDynasty?.name === dynName;

                    return (
                        <div 
                            key={idx}
                            onClick={() => scrollToSection(dyn.detailsId)}
                            className={`absolute h-9 rounded-md flex items-center justify-center text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 cursor-pointer border-x border-white/10 shadow-lg
                                ${isHovered ? 'z-30 h-11 -mt-1 shadow-[0_0_15px_rgba(251,146,60,0.5)] brightness-110 ring-2 ring-orange-400 scale-[1.02]' : 'z-10 hover:brightness-110 opacity-90'}
                            `}
                            style={{
                                left: left,
                                width: width,
                                backgroundColor: dyn.color,
                            }}
                            onMouseEnter={() => setHoveredDynasty({
                                name: dynName,
                                start: dyn.start,
                                end: dyn.end,
                                left,
                                width,
                                color: dyn.color
                            })}
                            onMouseLeave={() => setHoveredDynasty(null)}
                            aria-label={`${dynName}: ${formatDate(dyn.start)} to ${formatDate(dyn.end)}`}
                        >
                            {/* Text label inside the bar (hidden if too small) */}
                            <span className={`drop-shadow-md truncate pointer-events-none text-white mix-blend-plus-lighter px-1 font-serif tracking-wide ${parseInt(width) < 8 && !isHovered ? 'hidden' : 'block'}`}>
                                {dynName}
                            </span>
                        </div>
                    );
                })}
            </div>
            
            {/* Interactive Tooltip Overlay - Parchment Style */}
            {hoveredDynasty && (
                <div 
                    className="absolute top-24 transform -translate-x-1/2 z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
                    style={{ left: `calc(${hoveredDynasty.left} + (${hoveredDynasty.width} / 2))` }}
                >
                    <div className="bg-[#fffbeb] text-stone-900 p-4 rounded-xl shadow-2xl border-2 border-orange-200 min-w-[200px] text-center relative after:content-[''] after:absolute after:top-[-8px] after:left-1/2 after:-translate-x-1/2 after:border-l-[8px] after:border-l-transparent after:border-r-[8px] after:border-r-transparent after:border-b-[8px] after:border-b-orange-200">
                         {/* Inner triangle for border effect */}
                         <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#fffbeb] z-10"></div>
                         
                         <div className="relative z-10">
                            <h4 className="font-bold text-lg leading-tight mb-1 font-serif text-orange-900">{hoveredDynasty.name}</h4>
                            <div className="w-12 h-0.5 bg-orange-300 mx-auto my-2 rounded-full"></div>
                            <div className="text-xs font-sans font-bold text-stone-500 uppercase tracking-widest">
                                {formatDate(hoveredDynasty.start)} — {formatDate(hoveredDynasty.end)}
                            </div>
                            <div className="mt-2 text-[10px] text-orange-600 font-medium italic">
                                Click to view details
                            </div>
                         </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default Timeline;
