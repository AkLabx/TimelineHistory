import React, { useState } from 'react';
import { TIMELINE_VISUAL_DATA } from '../data';

interface TimelineProps {
  activePeriodId: string | null;
}

const Timeline: React.FC<TimelineProps> = ({ activePeriodId }) => {
  const [hoveredDynasty, setHoveredDynasty] = useState<{
    name: string;
    start: number;
    end: number;
    left: string;
    width: string;
    color: string;
  } | null>(null);

  // If no active period or no data for it, return null or a placeholder
  if (!activePeriodId || !TIMELINE_VISUAL_DATA[activePeriodId]) return null;

  const data = TIMELINE_VISUAL_DATA[activePeriodId];
  const totalDuration = data.end - data.start;

  // Simple scale function
  const getWidth = (start: number, end: number) => {
    // Ensure a minimum width (e.g., 3%) so short dynasties are visible and clickable
    return `${Math.max(((end - start) / totalDuration) * 100, 3)}%`;
  };

  const getLeft = (start: number) => {
    return `${((start - data.start) / totalDuration) * 100}%`;
  };

  // Helper to format date
  const formatDate = (year: number) => {
    return `${Math.abs(year)} ${year < 0 ? 'BCE' : 'CE'}`;
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full bg-[#1c1917] border-b-[6px] border-[#78350f] shadow-2xl sticky top-16 z-30 transition-all duration-300">
        <div className="max-w-7xl mx-auto py-3 px-4 relative group">
            <div className="flex justify-between text-[11px] uppercase font-bold tracking-widest text-[#a8a29e] mb-1.5 font-mono">
                <span>{formatDate(data.start)}</span>
                <span>{formatDate(data.end)}</span>
            </div>
            
            <div className="relative h-12 bg-[#292524] rounded-lg overflow-visible flex items-center shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] ring-1 ring-white/10 border border-white/5">
                {/* Background grid lines for context */}
                <div className="absolute inset-0 flex justify-between px-2 opacity-20 pointer-events-none">
                    <div className="w-px h-full bg-[#fdba74]"></div>
                    <div className="w-px h-full bg-[#fdba74]"></div>
                    <div className="w-px h-full bg-[#fdba74]"></div>
                    <div className="w-px h-full bg-[#fdba74]"></div>
                    <div className="w-px h-full bg-[#fdba74]"></div>
                </div>

                {data.dynasties.map((dyn, idx) => {
                    const width = getWidth(dyn.start, dyn.end);
                    const left = getLeft(dyn.start);
                    
                    // Determine if it's the currently hovered one for styling
                    const isHovered = hoveredDynasty?.name === dyn.name;

                    return (
                        <div 
                            key={idx}
                            onClick={() => scrollToSection(dyn.detailsId)}
                            className={`absolute h-8 rounded-md flex items-center justify-center text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer border-x border-white/10 shadow-lg
                                ${isHovered ? 'z-30 h-10 -mt-1 shadow-[0_0_20px_rgba(251,146,60,0.4)] brightness-110 ring-2 ring-[#fb923c] scale-105' : 'z-10 hover:brightness-110 opacity-90'}
                            `}
                            style={{
                                left: left,
                                width: width,
                                backgroundColor: dyn.color,
                            }}
                            onMouseEnter={() => setHoveredDynasty({
                                name: dyn.name,
                                start: dyn.start,
                                end: dyn.end,
                                left,
                                width,
                                color: dyn.color
                            })}
                            onMouseLeave={() => setHoveredDynasty(null)}
                            aria-label={`${dyn.name}: ${formatDate(dyn.start)} to ${formatDate(dyn.end)}`}
                        >
                            {/* Only show text if width is sufficient, or if hovered */}
                            <span className={`drop-shadow-md truncate pointer-events-none text-white mix-blend-plus-lighter px-1 font-serif ${parseInt(width) < 8 && !isHovered ? 'hidden' : 'block'}`}>
                                {dyn.name}
                            </span>
                        </div>
                    );
                })}
            </div>
            
            {/* Interactive Tooltip Overlay */}
            {hoveredDynasty && (
                <div 
                    className="absolute top-20 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 pointer-events-none"
                    style={{ left: `calc(${hoveredDynasty.left} + (${hoveredDynasty.width} / 2))` }}
                >
                    <div className="bg-[#292524] text-[#f5f5f4] p-4 rounded-xl shadow-2xl border border-[#78350f] min-w-[180px] text-center relative after:content-[''] after:absolute after:top-[-6px] after:left-1/2 after:-translate-x-1/2 after:border-l-[6px] after:border-l-transparent after:border-r-[6px] after:border-r-transparent after:border-b-[6px] after:border-b-[#78350f]">
                         <div className="relative z-10">
                            <h4 className="font-bold text-lg leading-none mb-2 font-serif text-[#fb923c]">{hoveredDynasty.name}</h4>
                            <div className="text-xs font-mono font-medium text-[#d6d3d1] uppercase tracking-widest border-t border-[#44403c] pt-2 mt-1">
                                {formatDate(hoveredDynasty.start)} — {formatDate(hoveredDynasty.end)}
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