import React, { useState } from 'react';
import { KingProfile, EntityType } from '../types';
import { DYNASTY_DATA, KINGS_DATA, CONNECTIONS_DATA } from '../data';
import { Icons } from './Icons';
import GlossaryHighlighter from './GlossaryHighlighter';
import { useLanguage } from '../src/contexts/LanguageContext';
import { getLocalized } from '../src/utils/language';

/**
 * Props for the FigureDetail component.
 */
interface FigureDetailProps {
  /** The detailed profile data for the historical figure. */
  figure: KingProfile;
  /** The unique identifier for the figure. */
  figureId: string;
  /** Callback to select a period (e.g., when navigating back or via connections). */
  onSelectPeriod: (id: string) => void;
  /** Callback to select another figure (e.g., related chronicles). */
  onSelectFigure: (id: string) => void;
  /** Optional callback to open the Samvad chat interface. */
  onOpenSamvad?: () => void;
}

/**
 * Detailed view component for a specific historical figure or king.
 * Displays the figure's profile, content, related items, and connections.
 *
 * @param props - The component props.
 * @returns The rendered figure detail view.
 */
const FigureDetail: React.FC<FigureDetailProps> = ({ figure, figureId, onSelectPeriod, onSelectFigure, onOpenSamvad }) => {
  const [imgError, setImgError] = useState(false);
  const { language } = useLanguage();

  // Find parent period for "Back" button
  const parentPeriodId = Object.keys(DYNASTY_DATA).find(periodKey => {
      return DYNASTY_DATA[periodKey].items.some(item => 
          item.subItems?.includes(figureId)
      );
  });

  const parentPeriod = parentPeriodId ? DYNASTY_DATA[parentPeriodId] : null;
  
  // Find specific Dynasty/Section within the period for precise context
  const parentDynasty = parentPeriod?.items.find(item => item.subItems?.includes(figureId));

  const connections = CONNECTIONS_DATA[figureId];

  // Helper to handle navigation for connections
  const handleConnectionClick = (targetId: string) => {
    // Check if target is a King or Period
    if (KINGS_DATA[targetId]) {
      onSelectFigure(targetId);
    } else if (DYNASTY_DATA[targetId]) {
      onSelectPeriod(targetId);
    } else {
      // Fallback: Check if it matches a top-level Period ID from PART_DATA?
      // For now assume if not King, might be period.
       onSelectPeriod(targetId);
    }
  };

  // Construct correct image path
  const imagePath = figure.imageUrl ? `${(import.meta as any).env.BASE_URL}${figure.imageUrl}` : '';
  const title = getLocalized(figure.summary, 'title', language);
  const content = getLocalized(figure, 'content', language);
  const parentTitle = parentPeriod ? getLocalized(parentPeriod, 'title', language) : '';
  const parentDynastyTitle = parentDynasty ? getLocalized(parentDynasty.summary, 'title', language) : '';

  return (
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Breadcrumb / Back Navigation - kept for accessibility/easy exit */}
            <div className="mb-6 md:mb-8 flex justify-between items-center">
                {parentPeriod && (
                    <button onClick={() => onSelectPeriod(parentPeriodId!)} className="group inline-flex items-center text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors px-4 py-2 rounded-full bg-slate-100 hover:bg-orange-50 active:bg-orange-100">
                        <span className="transform rotate-180 inline-block mr-2 group-hover:-translate-x-1 transition-transform"><Icons.ChevronRight /></span>
                        {language === 'en' ? 'Back to' : 'वापस जाएं'} {parentTitle.split(':')[1]?.trim() || parentTitle}
                    </button>
                )}
            </div>

            {/* Hero Header */}
            <div className="relative bg-slate-900 rounded-3xl p-6 md:p-12 mb-8 md:mb-12 overflow-hidden shadow-2xl border border-slate-800 min-h-[auto] md:min-h-[300px] flex flex-col justify-end group">
                {/* Background Image or Gradient Fallback */}
                {!imgError && figure.imageUrl ? (
                     <>
                        <div className="absolute inset-0">
                            <img 
                                src={imagePath} 
                                alt={title}
                                className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000" 
                                onError={() => setImgError(true)}
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                     </>
                ) : (
                    <>
                         {/* Graceful Fallback Pattern */}
                         <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>
                         
                         {figure.imageUrl && (
                             <div className="absolute top-4 right-4 text-xs font-mono text-white/30 bg-black/20 p-2 rounded pointer-events-none">
                                Missing: {figure.imageUrl}
                             </div>
                         )}

                         <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                         <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
                         {/* Pattern overlay */}
                         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                    </>
                )}

                
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-start md:items-end">
                    <div className="flex-grow order-2 md:order-1 w-full">
                        
                        {/* Prominent Clickable Dynasty Card */}
                        {parentPeriod && parentDynasty ? (
                            <div 
                                onClick={(e) => { e.stopPropagation(); onSelectPeriod(parentPeriodId!); }}
                                className="inline-flex items-center gap-3 sm:gap-4 bg-black/30 hover:bg-black/50 border border-white/10 hover:border-orange-500/40 rounded-2xl p-3 pr-6 sm:p-4 sm:pr-8 mb-6 backdrop-blur-md cursor-pointer transition-all duration-300 group/dynasty w-auto max-w-full shadow-lg"
                                role="button"
                                title={`Return to ${parentDynasty.summary.title}`}
                            >
                                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-600 to-amber-700 flex items-center justify-center text-lg sm:text-2xl shadow-lg ring-1 ring-white/10 group-hover/dynasty:scale-110 transition-transform duration-300">
                                    🏛️
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-bold tracking-widest text-orange-200/70 uppercase mb-0.5 truncate">
                                        {language === 'en' ? 'Part of' : 'भाग'} {parentTitle.split(':')[0]}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-serif font-bold text-lg sm:text-xl leading-none tracking-wide truncate group-hover/dynasty:text-orange-100 transition-colors">
                                            {parentDynastyTitle.split('(')[0].trim()}
                                        </span>
                                        <span className="text-orange-400 opacity-0 -translate-x-2 group-hover/dynasty:opacity-100 group-hover/dynasty:translate-x-0 transition-all duration-300">
                                            <Icons.ChevronRight />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="inline-block px-3 py-1 rounded border border-orange-500/50 text-orange-400 text-xs font-bold tracking-widest uppercase mb-4 bg-slate-800/50 backdrop-blur-sm">
                                {language === 'en' ? 'Historical Profile' : 'ऐतिहासिक विवरण'}
                            </div>
                        )}

                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 heading-text leading-tight text-shadow-lg break-words">
                            {title}
                        </h1>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-y-2 gap-x-6 items-start sm:items-center">
                            {figure.summary.reign && (
                                <div className="flex items-center text-slate-300 font-serif text-base md:text-lg">
                                    <span className="mr-3 text-xl md:text-2xl">🗓</span>
                                    <span className="border-b border-slate-600 pb-1 tracking-wide">{figure.summary.reign}</span>
                                </div>
                            )}
                            
                            {/* Samvad Chat Button */}
                            {onOpenSamvad && (
                                <button 
                                    onClick={onOpenSamvad}
                                    className="mt-4 sm:mt-0 flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-bold shadow-lg hover:shadow-orange-500/30 hover:scale-105 transition-all active:scale-95 border border-white/20 animate-in fade-in zoom-in duration-300"
                                >
                                    <span className="text-lg">💬</span>
                                    <span>Samvad</span>
                                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/90 uppercase tracking-wide">AI Chat</span>
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Icon Badge */}
                    <div className="order-1 md:order-2 flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 bg-gradient-to-br from-amber-200 to-orange-400 rounded-full flex items-center justify-center text-4xl sm:text-5xl md:text-7xl shadow-2xl border-4 border-white/10 backdrop-blur-sm transform group-hover:rotate-6 transition-transform duration-500 self-start md:self-auto">
                        👑
                    </div>
                </div>
            </div>

            {/* Main Content with Glossary Highlighting */}
            {content ? (
                <div className="prose prose-sm sm:prose-base md:prose-lg prose-slate max-w-none font-serif leading-relaxed prose-headings:font-bold prose-headings:heading-text prose-a:text-orange-600 prose-blockquote:border-l-orange-500 prose-blockquote:bg-orange-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:rounded-r-lg">
                    <GlossaryHighlighter text={content} isHtml={true} />
                </div>
            ) : null}

            {/* SubItems (Kings) Grid */}
            {figure.subItems && figure.subItems.length > 0 && (
                <div className="mt-8 md:mt-12 pt-8 md:pt-10 border-t-2 border-slate-100">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 md:mb-8 flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-lg mr-3 shadow-sm">📜</span>
                        {language === 'en' ? 'Related Chronicles' : 'संबंधित इतिहास'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {figure.subItems.map(subId => {
                            const subItem = KINGS_DATA[subId];
                            const subTitle = getLocalized(subItem?.summary, 'title', language);
                            return (
                                <button 
                                    key={subId}
                                    onClick={() => onSelectFigure(subId)}
                                    className="group/btn flex items-center justify-between px-4 py-3 bg-white text-slate-700 rounded-xl text-sm font-bold border border-slate-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 transition-all shadow-sm hover:shadow-md text-left"
                                >
                                    <div className="flex items-center overflow-hidden">
                                        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg mr-3 group-hover/btn:bg-orange-100 transition-colors flex-shrink-0">👑</span>
                                        {/* Replaced generic text with actual title */}
                                        <span className="truncate">{subTitle || "View Entry"}</span>
                                    </div>
                                    <span className="opacity-0 group-hover/btn:opacity-100 transform -translate-x-2 group-hover/btn:translate-x-0 transition-all text-orange-500 hidden sm:inline-block">
                                        <Icons.ChevronRight />
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Connections Section */}
            {connections && connections.length > 0 && (
                <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t-2 border-slate-100">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 md:mb-8 flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg mr-3 shadow-sm">🔗</span>
                        {language === 'en' ? 'Historical Connections' : 'ऐतिहासिक संबंध'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {connections.map((conn, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => handleConnectionClick(conn.targetId)}
                                className="group cursor-pointer p-4 md:p-5 bg-white border border-slate-200 rounded-xl hover:border-orange-300 hover:bg-orange-50/50 hover:shadow-lg hover:shadow-orange-100/50 transition-all duration-300 flex items-center justify-between"
                            >
                                <div className="flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-orange-500 mr-3 transition-colors flex-shrink-0"></span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] md:text-xs font-bold uppercase text-slate-400 mb-0.5 tracking-wider">{conn.label.split('(')[1]?.replace(')', '') || 'Related'}</span>
                                        <span className="font-bold text-slate-700 group-hover:text-slate-900 text-base md:text-lg leading-tight">{conn.label.split('(')[0].trim()}</span>
                                    </div>
                                </div>
                                <span className="text-slate-300 group-hover:text-orange-500 transform group-hover:translate-x-1 transition-all"><Icons.ChevronRight /></span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!content && (!figure.subItems || figure.subItems.length === 0) && (
                 <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 mt-8">
                    <span className="text-4xl block mb-2">📜</span>
                    <p className="text-slate-500 font-serif italic">Historical records for this section are currently being transcribed.</p>
                </div>
            )}
        </div>
  );
};

export default FigureDetail;
