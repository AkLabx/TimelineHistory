import React from 'react';
import { Icons } from './Icons';
import { SearchResult, EntityType } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  onSelectPeriod: (id: string) => void;
  onSelectFigure: (id: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ 
  isOpen, 
  onClose, 
  query, 
  setQuery, 
  results, 
  onSelectPeriod, 
  onSelectFigure 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50">
                <div className="text-slate-400"><Icons.Search /></div>
                <input 
                    type="text" 
                    placeholder="Search history (e.g. Ashoka, Magadha, Jizya)..." 
                    className="w-full ml-3 text-lg outline-none text-slate-900 placeholder-slate-400 h-10 bg-transparent font-serif"
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 hover:bg-slate-200 transition">
                    <Icons.X />
                </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
                {results.length === 0 && query && (
                    <div className="text-center py-12 text-slate-500">
                        <p>No results found for "<span className="font-semibold text-slate-700">{query}</span>"</p>
                    </div>
                )}
                {results.map(result => (
                    <div 
                        key={`${result.type}-${result.id}`}
                        onClick={() => {
                            if (result.type === EntityType.ERA) onSelectPeriod(result.id);
                            if (result.type === EntityType.DYNASTY) onSelectPeriod(result.parentId || result.id); // Dynasties are inside Periods
                            if (result.type === EntityType.FIGURE) onSelectFigure(result.id);
                            // Terms usually don't navigate, but maybe we can show definition expanded? 
                            // For now close.
                            if (result.type !== EntityType.TERM) onClose();
                        }}
                        className={`p-4 hover:bg-orange-50 rounded-xl cursor-pointer group flex items-start border-b border-transparent hover:border-orange-100 transition-all ${result.type === EntityType.TERM ? 'cursor-default' : ''}`}
                    >
                        <div className={`mt-1 mr-4 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold uppercase tracking-wider 
                            ${result.type === EntityType.ERA ? 'bg-indigo-100 text-indigo-700' : ''}
                            ${result.type === EntityType.DYNASTY ? 'bg-purple-100 text-purple-700' : ''}
                            ${result.type === EntityType.FIGURE ? 'bg-orange-100 text-orange-700' : ''}
                            ${result.type === EntityType.TERM ? 'bg-emerald-100 text-emerald-700' : ''}
                        `}>
                            {result.type === EntityType.ERA ? 'ERA' : ''}
                            {result.type === EntityType.DYNASTY ? 'DYN' : ''}
                            {result.type === EntityType.FIGURE ? 'KNG' : ''}
                            {result.type === EntityType.TERM ? 'DEF' : ''}
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-slate-800 text-lg group-hover:text-orange-700 heading-text">{result.title}</h4>
                            <p className="text-sm text-slate-500 line-clamp-2 mt-1 font-serif leading-relaxed">{result.description}</p>
                        </div>
                    </div>
                ))}
                {!query && (
                     <div className="text-center py-16 opacity-50">
                        <div className="text-4xl mb-4 grayscale">🏛️</div>
                        <p className="text-sm text-slate-400">Type to explore centuries of Indian History</p>
                     </div>
                )}
            </div>
            <div className="bg-slate-50 px-4 py-2 text-xs text-slate-400 border-t border-slate-100 flex justify-between">
                <span>Use arrows to navigate</span>
                <span>ESC to close</span>
            </div>
        </div>
    </div>
  );
};

export default SearchModal;