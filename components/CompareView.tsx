import React from 'react';
import { KINGS_DATA } from '../data';
import { Icons } from './Icons';
import GlossaryHighlighter from './GlossaryHighlighter';

interface CompareViewProps {
  id1: string;
  id2: string;
  onClose: () => void;
}

const CompareView: React.FC<CompareViewProps> = ({ id1, id2, onClose }) => {
  const k1 = KINGS_DATA[id1];
  const k2 = KINGS_DATA[id2];

  if (!k1 || !k2) return null;

  const imagePath1 = k1.imageUrl ? `${(import.meta as any).env.BASE_URL}${k1.imageUrl}` : '';
  const imagePath2 = k2.imageUrl ? `${(import.meta as any).env.BASE_URL}${k2.imageUrl}` : '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Navigation */}
      <div className="mb-8 flex justify-between items-center">
        <button 
          onClick={onClose}
          className="flex items-center text-stone-500 hover:text-orange-600 font-medium transition-colors"
        >
          <div className="bg-white p-2 rounded-full border border-stone-200 mr-2 shadow-sm transform rotate-180">
            <Icons.ChevronRight />
          </div>
          Exit Comparison
        </button>
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
          Side-by-Side View
        </span>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200">
        
        {/* Header Section */}
        <div className="grid grid-cols-2 relative">
          
          {/* Entity 1 Header */}
          <div className="relative h-64 md:h-80 group">
            <div className="absolute inset-0 bg-stone-900">
              {k1.imageUrl && (
                <img src={imagePath1} className="w-full h-full object-cover opacity-60 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700" alt="" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
              <h2 className="text-2xl md:text-4xl font-black text-white heading-text leading-tight text-shadow-lg mb-2">{k1.summary.title}</h2>
              <div className="inline-flex items-center bg-orange-500/20 backdrop-blur-md border border-orange-500/30 rounded-lg px-3 py-1 text-orange-200 text-xs font-bold uppercase tracking-wider">
                Contender A
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center font-black text-2xl md:text-3xl text-stone-900 shadow-2xl border-4 border-stone-100 ring-4 ring-orange-100/50 italic">
              VS
            </div>
          </div>

          {/* Entity 2 Header */}
          <div className="relative h-64 md:h-80 group border-l border-white/10">
            <div className="absolute inset-0 bg-stone-900">
              {k2.imageUrl && (
                <img src={imagePath2} className="w-full h-full object-cover opacity-60 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700" alt="" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full text-right">
              <h2 className="text-2xl md:text-4xl font-black text-white heading-text leading-tight text-shadow-lg mb-2">{k2.summary.title}</h2>
              <div className="inline-flex items-center bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 rounded-lg px-3 py-1 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                Contender B
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 divide-x divide-stone-100 border-b border-stone-100 bg-stone-50/50">
          
          {/* Row: Reign */}
          <div className="p-6 text-center border-b border-stone-100 md:border-b-0">
            <span className="block text-xs font-bold uppercase text-stone-400 tracking-widest mb-1">Reign Period</span>
            <span className="text-lg font-bold text-stone-700 font-serif">{k1.summary.reign || 'N/A'}</span>
          </div>
          <div className="p-6 text-center border-b border-stone-100 md:border-b-0">
            <span className="block text-xs font-bold uppercase text-stone-400 tracking-widest mb-1">Reign Period</span>
            <span className="text-lg font-bold text-stone-700 font-serif">{k2.summary.reign || 'N/A'}</span>
          </div>

          {/* Row: Capital */}
          <div className="p-6 text-center">
            <span className="block text-xs font-bold uppercase text-stone-400 tracking-widest mb-1">Capital City</span>
            <span className="text-lg font-bold text-stone-700 font-serif">{k1.summary.capital || 'N/A'}</span>
          </div>
          <div className="p-6 text-center">
            <span className="block text-xs font-bold uppercase text-stone-400 tracking-widest mb-1">Capital City</span>
            <span className="text-lg font-bold text-stone-700 font-serif">{k2.summary.capital || 'N/A'}</span>
          </div>
        </div>

        {/* Content Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200">
          
          {/* Content 1 */}
          <div className="p-6 md:p-10 bg-white">
             <div className="prose prose-sm prose-stone max-w-none font-serif leading-relaxed">
               {k1.content ? (
                 <GlossaryHighlighter text={k1.content} isHtml={true} />
               ) : (
                 <p className="italic text-stone-400">No detailed records available.</p>
               )}
             </div>
          </div>

          {/* Content 2 */}
          <div className="p-6 md:p-10 bg-white">
             <div className="prose prose-sm prose-stone max-w-none font-serif leading-relaxed">
               {k2.content ? (
                 <GlossaryHighlighter text={k2.content} isHtml={true} />
               ) : (
                 <p className="italic text-stone-400">No detailed records available.</p>
               )}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CompareView;