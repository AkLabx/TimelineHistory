import React from 'react';
import { FigureData, KingData, DynastyData } from '../types';
import { KINGS_DATA, CONNECTIONS_DATA } from '../data';
import { Icons } from './Icons';
import GlossaryHighlighter from './GlossaryHighlighter';
import { getImagePath } from '../utils/imageUtils';

interface FigureDetailProps {
  figure: FigureData | KingData | DynastyData;
  figureId: string;
  onBack: () => void;
  onSelectFigure: (id: string) => void;
  onOpenSamvad?: () => void;
}

const FigureDetail: React.FC<FigureDetailProps> = ({ figure, figureId, onBack, onSelectFigure, onOpenSamvad }) => {
  // Determine connections if any (using CONNECTIONS_DATA)
  // Check if this figureId is a source or target in any connection
  const connections = CONNECTIONS_DATA.connections.filter(c => c.source === figureId || c.target === figureId).map(c => {
      const isSource = c.source === figureId;
      const targetId = isSource ? c.target : c.source;
      const label = isSource ? c.label : (c.label.includes('Father of') ? `Child: ${KINGS_DATA[targetId]?.summary?.title}` : `Connected to ${KINGS_DATA[targetId]?.summary?.title}`);
      return { targetId, label };
  });

  const handleConnectionClick = (targetId: string) => {
      onSelectFigure(targetId);
  };

  // Find parent context if possible (for breadcrumb-like effect)
  // This is a bit expensive search, but dataset is small
  let parentDynasty: DynastyData | undefined;
  let parentPeriod: any | undefined;

  // If current figure is a King, find its Dynasty
  if ((figure as any).reign) { // Simple check if it's likely a king/dynasty entry
      // Find which dynasty has this subItem
      // This logic would require iterating through all data.
      // For now, we will trust the "Back" button or add simple context if available.
  }

  return (
        <div className="max-w-5xl mx-auto px-4 pb-32 pt-6 animate-in slide-in-from-right-8 duration-500">
            {/* Header / Hero Section */}
            <div className="relative mb-10 group perspective-1000">
                {/* Background Banner with Parallax-like effect */}
                <div className="absolute inset-0 bg-slate-900 rounded-3xl overflow-hidden -z-10 shadow-2xl transform transition-transform duration-700 hover:scale-[1.01]">
                    <div className="absolute inset-0 bg-slate-900/60 z-10 backdrop-blur-[2px]"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent z-20"></div>
                     {figure.imageUrl && (
                        <img
                            src={getImagePath(figure.imageUrl)}
                            alt={figure.summary.title}
                            className="w-full h-full object-cover opacity-50 grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                        />
                    )}
                </div>

                {/* Header Content */}
                <div className="relative z-30 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center md:items-end">
                    <div className="flex-grow">
                        <button
                            onClick={onBack}
                            className="mb-6 flex items-center text-orange-300 hover:text-white transition-colors group/back"
                        >
                            <div className="bg-white/10 p-2 rounded-full mr-2 group-hover/back:bg-orange-500 transition-colors">
                                <span className="transform rotate-180 block"><Icons.ChevronRight /></span>
                            </div>
                            <span className="text-sm font-bold tracking-widest uppercase">Back to Overview</span>
                        </button>

                        {/* Breadcrumb / Context Label */}
                        {(figure as any).reign ? (
                            <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md hover:bg-white/10 transition-colors cursor-help"
                                 role="button"
                                 title={`Return to ${parentDynasty?.summary?.title || 'Dynasty'}`}
                            >
                                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-600 to-amber-700 flex items-center justify-center text-lg sm:text-2xl shadow-lg ring-1 ring-white/10 group-hover/dynasty:scale-110 transition-transform duration-300">
                                    🏛️
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-bold tracking-widest text-orange-200/70 uppercase mb-0.5 truncate">
                                        Historical Figure
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-serif font-bold text-lg sm:text-xl leading-none tracking-wide truncate group-hover/dynasty:text-orange-100 transition-colors">
                                            {figure.summary.title.split('(')[0].trim()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="inline-block px-3 py-1 rounded border border-orange-500/50 text-orange-400 text-xs font-bold tracking-widest uppercase mb-4 bg-slate-800/50 backdrop-blur-sm">
                                Historical Profile
                            </div>
                        )}

                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 heading-text leading-tight text-shadow-lg break-words">
                            {figure.summary.title}
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
            {figure.content ? (
                <div className="prose prose-sm sm:prose-base md:prose-lg prose-slate max-w-none font-serif leading-relaxed prose-headings:font-bold prose-headings:heading-text prose-a:text-orange-600 prose-blockquote:border-l-orange-500 prose-blockquote:bg-orange-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:rounded-r-lg">
                    <GlossaryHighlighter text={figure.content} isHtml={true} />
                </div>
            ) : null}

            {/* SubItems (Kings) Grid */}
            {figure.subItems && figure.subItems.length > 0 && (
                <div className="mt-8 md:mt-12 pt-8 md:pt-10 border-t-2 border-slate-100">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 md:mb-8 flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-lg mr-3 shadow-sm">📜</span>
                        Related Chronicles
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {figure.subItems.map(subId => {
                            const subItem = KINGS_DATA[subId];
                            return (
                                <button 
                                    key={subId}
                                    onClick={() => onSelectFigure(subId)}
                                    className="group/btn flex items-center justify-between px-4 py-3 bg-white text-slate-700 rounded-xl text-sm font-bold border border-slate-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 transition-all shadow-sm hover:shadow-md text-left"
                                >
                                    <div className="flex items-center overflow-hidden">
                                        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg mr-3 group-hover/btn:bg-orange-100 transition-colors flex-shrink-0">👑</span>
                                        {/* Replaced generic text with actual title */}
                                        <span className="truncate">{subItem?.summary?.title || "View Entry"}</span>
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
                        Historical Connections
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

            {!figure.content && (!figure.subItems || figure.subItems.length === 0) && (
                 <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 mt-8">
                    <span className="text-4xl block mb-2">📜</span>
                    <p className="text-slate-500 font-serif italic">Historical records for this section are currently being transcribed.</p>
                </div>
            )}
        </div>
  );
};

export default FigureDetail;