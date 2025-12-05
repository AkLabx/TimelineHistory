import React, { useState, useEffect, useRef } from 'react';
import { PeriodData, DynastyItem } from '../types';
import { PART_DATA, DYNASTY_DATA, KINGS_DATA } from '../data';
import { Icons } from './Icons';
import TextToSpeech from './TextToSpeech';
import GlossaryHighlighter from './GlossaryHighlighter';
import { getImagePath } from '../utils/imageUtils';

interface EraDetailProps {
  period: PeriodData;
  periodId: string;
  onSelectFigure: (id: string) => void;
  onSelectPeriod: (id: string) => void;
}

const EraDetail: React.FC<EraDetailProps> = ({ period, periodId, onSelectFigure, onSelectPeriod }) => {
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [imgError, setImgError] = useState(false);
  
  // Find the image for this period from PART_DATA
  const timelineCard = PART_DATA.timelineCards.find(c => c.target === periodId);
  const heroImageRaw = timelineCard?.imageUrl;
  const heroImage = getImagePath(heroImageRaw);

  // Setup Intersection Observer for Table of Contents
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' } // Trigger when element is near top
    );

    period.items.forEach((item, idx) => {
      const id = item.id || `section-${idx}`;
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [period.items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderItem = (item: DynastyItem, idx: number, dynastyOrder: number) => {
    // Styling based on item type
    const isDynasty = item.type === 'dynasty-details';
    const isLink = item.type === 'timeline-link-card';
    const isEvent = item.type === 'event-details';
    
    // Generate a stable ID if item.id is missing
    const sectionId = item.id || `section-${idx}`;
    
    return (
        <div 
            key={idx} 
            id={sectionId}
            className="mb-20 relative animate-in slide-in-from-bottom-8 duration-700 fill-mode-backwards scroll-mt-48" 
            style={{ animationDelay: `${idx * 100}ms` }}
        >
            {/* Connector Line - Only if not last item */}
            {idx !== period.items.length - 1 && (
                <div className="absolute top-20 left-8 bottom-[-80px] w-0.5 border-l-2 border-dashed border-orange-200/60 -z-10 hidden md:block"></div>
            )}

            <div className={`relative rounded-2xl border transition-all duration-300 overflow-visible
                ${isDynasty ? 'border-orange-100 bg-white shadow-xl hover:shadow-2xl hover:border-orange-200' : ''} 
                ${isLink ? 'border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white shadow-lg hover:shadow-xl' : ''}
                ${isEvent ? 'border-stone-200 bg-stone-50/40 backdrop-blur-sm shadow-sm' : ''}
                p-6 md:p-10 group`
            }>
                {/* Decorative corner tag for dynasties */}
                {isDynasty && (
                    <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-orange-100 to-transparent -mr-8 -mt-8 rotate-45 transform"></div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row items-start gap-8">
                    {/* Number/Icon Bubble */}
                    <div className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-xl md:text-2xl shadow-lg ring-4 ring-white z-10
                        ${isDynasty ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white' : ''}
                        ${isLink ? 'bg-indigo-100 text-indigo-600' : ''}
                        ${isEvent ? 'bg-stone-200 text-stone-600 border border-stone-300' : ''}
                    `}>
                        {isDynasty ? dynastyOrder : (isLink ? '➜' : '📜')}
                    </div>
                    
                    <div className="flex-grow pt-1 w-full">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-6 border-b border-stone-100 pb-4">
                            <div>
                                <h3 className={`text-2xl md:text-3xl font-bold heading-text ${isDynasty ? 'text-stone-900' : 'text-stone-700'}`}>
                                    {item.summary.title}
                                </h3>
                                {item.summary.period && (
                                    <div className="inline-flex items-center mt-2 px-3 py-1 rounded-md text-xs font-bold tracking-widest bg-stone-100 text-stone-500 uppercase">
                                        <span className="mr-1.5 opacity-60">TIME</span> {item.summary.period}
                                    </div>
                                )}
                            </div>
                            {item.target && isLink && (
                                <button 
                                    onClick={() => onSelectPeriod(item.target!)} 
                                    className="inline-flex items-center px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-full transition-colors shadow-md hover:shadow-lg mt-4 md:mt-0"
                                >
                                    Explore <span className="ml-2 bg-white/20 rounded-full p-0.5"><Icons.ChevronRight /></span>
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm text-stone-600">
                             {item.summary.founder && (
                                 <div className="flex items-center group/info">
                                     <span className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-400 mr-3 group-hover/info:bg-orange-100 transition-colors">👤</span>
                                     <div className="flex flex-col">
                                        <span className="font-bold text-stone-400 uppercase text-[10px] tracking-widest">Founder</span>
                                        <span className="font-serif font-medium text-stone-800 text-base">{item.summary.founder}</span>
                                     </div>
                                 </div>
                             )}
                             {item.summary.capital && (
                                 <div className="flex items-center group/info">
                                     <span className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-400 mr-3 group-hover/info:bg-orange-100 transition-colors">🏰</span>
                                     <div className="flex flex-col">
                                        <span className="font-bold text-stone-400 uppercase text-[10px] tracking-widest">Capital</span>
                                        <span className="font-serif font-medium text-stone-800 text-base">{item.summary.capital}</span>
                                     </div>
                                 </div>
                             )}
                        </div>
                        
                        {/* Content Area */}
                        {item.content && (
                            <div className="mt-6 prose prose-stone max-w-none text-stone-700 font-serif leading-relaxed drop-cap">
                                {/* Enabled HTML rendering here to fix raw text issue */}
                                <GlossaryHighlighter text={item.content} isHtml={true} />
                            </div>
                        )}

                        {/* SubItems (Kings) Grid */}
                        {item.subItems && item.subItems.length > 0 && (
                            <div className="mt-10 pt-6 border-t border-dashed border-stone-200">
                                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center">
                                    <span className="w-6 h-px bg-stone-300 mr-3"></span>
                                    Key Figures & Events
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {item.subItems.map(subId => {
                                        const subItemData = KINGS_DATA[subId];
                                        return (
                                            <button 
                                                key={subId}
                                                onClick={() => onSelectFigure(subId)}
                                                className="group/btn flex items-center justify-between px-4 py-3 bg-stone-50 text-stone-700 rounded-lg text-sm font-bold border border-stone-200 hover:border-orange-300 hover:bg-white hover:text-orange-900 transition-all shadow-sm hover:shadow-md text-left"
                                            >
                                                <div className="flex items-center overflow-hidden">
                                                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg mr-3 shadow-sm border border-stone-100 group-hover/btn:border-orange-200 transition-colors">👑</span>
                                                    {/* Replaced generic text with actual title */}
                                                    <span className="truncate">{subItemData?.summary?.title || "View Details"}</span>
                                                </div>
                                                <span className="opacity-0 group-hover/btn:opacity-100 transform -translate-x-2 group-hover/btn:translate-x-0 transition-all text-orange-500">
                                                    <Icons.ChevronRight />
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
      <div className="max-w-7xl mx-auto px-4 pb-32 pt-6">
        {/* Grand Hero Header */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 h-[400px] group ring-1 ring-black/5">
            <div className="absolute inset-0 bg-stone-900">
                {!imgError && heroImage ? (
                    <img 
                        src={heroImage} 
                        alt={period.title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-50 group-hover:scale-105 transition-all duration-1000"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-orange-900 to-stone-900 opacity-90 flex flex-col items-center justify-center">
                        {heroImageRaw && (
                            <div className="mb-4 text-center">
                                <span className="block text-2xl mb-1">⚠️</span>
                                <span className="text-white/50 text-xs font-mono bg-black/30 px-2 py-1 rounded">Missing: {heroImageRaw}</span>
                            </div>
                        )}
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent"></div>
            </div>

            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full z-10">
                <div className="flex items-center gap-3 mb-4 text-orange-300 font-bold tracking-widest text-sm uppercase animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <span className="bg-orange-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-orange-500/30">Historical Era</span>
                    <div className="h-px bg-orange-300/30 flex-grow max-w-[100px]"></div>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 heading-text leading-tight drop-shadow-lg max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                    {period.title}
                </h1>
                <div className="flex items-center space-x-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                     <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/10 hover:bg-white/20 transition-colors">
                        <TextToSpeech text={period.title} />
                     </div>
                </div>
            </div>
        </div>

        {/* Layout with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Navigation Sidebar (Desktop) - Enhanced aesthetics */}
            <div className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-40 bg-white/40 backdrop-blur-md rounded-2xl border border-stone-200/50 p-6 shadow-sm">
                    <div className="mb-6 flex items-center">
                        <span className="w-1 h-5 bg-orange-500 mr-3 rounded-full"></span>
                        <h5 className="text-xs font-bold text-stone-500 uppercase tracking-widest font-sans">
                            Table of Contents
                        </h5>
                    </div>
                    
                    <ul className="space-y-1 relative">
                        {/* Decorative line */}
                        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-stone-200 -z-10"></div>
                        
                        {period.items.map((item, idx) => {
                             const sectionId = item.id || `section-${idx}`;
                             const isActive = activeSectionId === sectionId;
                             
                             return (
                                 <li key={idx} className="relative pl-6">
                                     {isActive ? (
                                        <div className="absolute left-[7px] top-[9px] w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-100 transition-all duration-300"></div>
                                     ) : (
                                        <div className="absolute left-[9px] top-[11px] w-1.5 h-1.5 rounded-full bg-stone-300 transition-all duration-300"></div>
                                     )}
                                     
                                     <button 
                                         onClick={() => scrollToSection(sectionId)}
                                         className={`text-left text-sm py-1.5 transition-all duration-300 leading-snug w-full
                                             ${isActive 
                                                 ? 'text-orange-800 font-bold translate-x-1' 
                                                 : 'text-stone-500 hover:text-stone-800 hover:translate-x-1'
                                             }`}
                                     >
                                         {item.summary.title}
                                     </button>
                                 </li>
                             );
                        })}
                    </ul>
                </div>
            </div>

            {/* Main Content Column */}
            <div className="flex-grow max-w-4xl">
                {period.items.map((item, idx) => {
                    // Calculate the number of Dynasties that have appeared so far (including this one if it is one)
                    // This ensures the first Dynasty gets labeled "1", the second "2", etc., regardless of how many Events precede them.
                    const dynastyOrder = period.items.slice(0, idx + 1).filter(i => i.type === 'dynasty-details').length;
                    return renderItem(item, idx, dynastyOrder);
                })}
                
                {/* Navigation Helpers */}
                <div className="mt-24 pt-10 border-t border-stone-200 flex flex-col md:flex-row justify-between gap-6">
                    {(() => {
                        const currentIndex = PART_DATA.timelineCards.findIndex(c => c.target === periodId);
                        const prev = PART_DATA.timelineCards[currentIndex - 1];
                        const next = PART_DATA.timelineCards[currentIndex + 1];
                        
                        return (
                            <>
                                {prev ? (
                                    <button onClick={() => onSelectPeriod(prev.target)} className="group flex-1 flex items-center p-6 rounded-2xl border border-stone-200 bg-white hover:border-orange-300 hover:bg-orange-50 transition-all text-left shadow-sm hover:shadow-md">
                                        <div className="mr-5 bg-stone-100 p-3 rounded-full group-hover:bg-white text-stone-400 group-hover:text-orange-500 transition-colors rotate-180 shadow-inner"><Icons.ChevronRight /></div>
                                        <div>
                                            <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Previous Era</span>
                                            <span className="text-lg font-bold text-stone-700 group-hover:text-orange-800 font-serif leading-tight">{prev.title}</span>
                                        </div>
                                    </button>
                                ) : <div className="hidden md:block flex-1"></div>}
                                
                                {next ? (
                                    <button onClick={() => onSelectPeriod(next.target)} className="group flex-1 flex items-center justify-end p-6 rounded-2xl border border-stone-200 bg-white hover:border-orange-300 hover:bg-orange-50 transition-all text-right shadow-sm hover:shadow-md">
                                        <div>
                                            <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Next Era</span>
                                            <span className="text-lg font-bold text-stone-700 group-hover:text-orange-800 font-serif leading-tight">{next.title}</span>
                                        </div>
                                        <div className="ml-5 bg-stone-100 p-3 rounded-full group-hover:bg-white text-stone-400 group-hover:text-orange-500 transition-colors shadow-inner"><Icons.ChevronRight /></div>
                                    </button>
                                ) : <div className="hidden md:block flex-1"></div>}
                            </>
                        );
                    })()}
                </div>
            </div>

        </div>
      </div>
  );
};

export default EraDetail;