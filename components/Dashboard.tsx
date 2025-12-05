import React, { useState } from 'react';
import { PART_DATA } from '../data';
import { Icons } from './Icons';

/**
 * Props for the Dashboard component.
 */
interface DashboardProps {
  /** Callback to handle selecting a historical period. */
  onSelectPeriod: (id: string) => void;
}

/**
 * A card component representing a single historical era or period.
 * Displays the period title, subtitle, image, and dates.
 *
 * @param props.card - The data object for the timeline card.
 * @param props.index - The index of the card for animation delay.
 * @param props.onSelect - Callback when the card is clicked.
 */
const DashboardCard: React.FC<{ card: any, index: number, onSelect: (id: string) => void }> = ({ card, index, onSelect }) => {
    const [imgError, setImgError] = useState(false);

    // Construct the correct path using Vite's Base URL
    const imagePath = card.imageUrl ? `${(import.meta as any).env.BASE_URL}${card.imageUrl}` : '';

    return (
          <div 
               onClick={() => onSelect(card.target)}
               className="group relative h-[450px] w-full rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ring-1 ring-slate-900/5 bg-slate-900"
               style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background Image Container */}
            <div className="absolute inset-0 bg-slate-900 z-0">
               {!imgError && card.imageUrl ? (
                   <img 
                      src={imagePath} 
                      alt={card.title} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-110 transition-all duration-1000 ease-out" 
                      loading="lazy"
                      onError={() => setImgError(true)}
                   />
               ) : (
                   <div className="w-full h-full bg-slate-800 opacity-90 flex flex-col items-center justify-center p-6 text-center border-4 border-slate-700/50">
                       <span className="text-5xl mb-3 opacity-20">🖼️</span>
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Image Asset Missing</span>
                       <span className="text-[10px] font-mono text-orange-400/80 break-all px-4 bg-black/20 rounded py-1">
                         {card.imageUrl || "No URL provided"}
                       </span>
                   </div>
               )}
               {/* Gradient Overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500"></div>
            </div>
            
            {/* Content Container - z-10 ensures it sits above the image */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-widest text-orange-300 uppercase bg-black/40 rounded-full border border-orange-500/30 backdrop-blur-md">
                      {card.period}
                  </span>
                  
                  <h3 className="text-3xl font-bold text-white mb-2 heading-text leading-tight group-hover:text-orange-200 transition-colors drop-shadow-md">
                      {card.title}
                  </h3>
                  
                  <p className="text-slate-300 text-lg font-serif italic mb-6 border-l-2 border-orange-500 pl-4">
                      {card.subtitle}
                  </p>
                  
                  <div className="flex items-center text-white font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform translate-y-2 group-hover:translate-y-0">
                    <span className="mr-2 border-b border-transparent hover:border-white transition-all">Start Journey</span>
                    <Icons.ChevronRight />
                  </div>
              </div>
            </div>
            
            {/* Decorative Top Right Number */}
            <div className="absolute top-6 right-6 text-7xl font-black text-white/5 font-serif select-none pointer-events-none z-10">
                {String(index + 1).padStart(2, '0')}
            </div>
          </div>
    );
}

/**
 * The main dashboard view component.
 * Displays a grid of timeline cards allowing navigation to different historical eras.
 *
 * @param props - The component props.
 * @returns The rendered dashboard.
 */
const Dashboard: React.FC<DashboardProps> = ({ onSelectPeriod }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-20 space-y-6 animate-in slide-in-from-bottom-5 duration-700">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-orange-900 mb-6 heading-text drop-shadow-sm">
            Bharat <span className="text-orange-600">Itihas</span>
        </h1>
        <p className="text-xl md:text-3xl text-slate-600 max-w-4xl mx-auto leading-relaxed serif-text">
            {PART_DATA.subtitle}
        </p>
        <div className="w-32 h-1.5 bg-gradient-to-r from-orange-400 to-amber-600 mx-auto rounded-full mt-10"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {PART_DATA.timelineCards.map((card, idx) => (
            <DashboardCard key={card.target} card={card} index={idx} onSelect={onSelectPeriod} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
