import React, { useState, useMemo } from 'react';
import { Icons } from './Icons';
import { KINGS_DATA } from '../data';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartComparison: (id1: string, id2: string) => void;
}

const CompareModal: React.FC<CompareModalProps> = ({ isOpen, onClose, onStartComparison }) => {
  const [slot1, setSlot1] = useState<string | null>(null);
  const [slot2, setSlot2] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlot, setActiveSlot] = useState<1 | 2>(1);

  // Filter kings based on search
  const filteredKings = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return Object.entries(KINGS_DATA)
      .filter(([id, data]) => {
        // Exclude generic content containers or periods if any crept into kingsData
        if (!data.summary?.title) return false;
        // Search logic
        return data.summary.title.toLowerCase().includes(q) || 
               (data.summary.reign && data.summary.reign.toLowerCase().includes(q));
      })
      .map(([id, data]) => ({ id, ...data }));
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSelect = (id: string) => {
    if (activeSlot === 1) {
      setSlot1(id);
      setActiveSlot(2); // Auto switch to next slot
      setSearchQuery(''); // Reset search
    } else {
      setSlot2(id);
      setSearchQuery('');
    }
  };

  const handleStart = () => {
    if (slot1 && slot2) {
      onStartComparison(slot1, slot2);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-3xl shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div>
            <h2 className="text-2xl font-bold text-stone-800 heading-text">Compare History</h2>
            <p className="text-stone-500 text-sm">Select two historical figures to analyze side-by-side.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-600 transition-colors">
            <Icons.X />
          </button>
        </div>

        {/* Selection Area */}
        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
          
          {/* Slots Visualizer */}
          <div className="md:w-1/3 p-6 bg-stone-100 border-r border-stone-200 flex flex-col gap-4">
            
            {/* Slot 1 */}
            <div 
              onClick={() => setActiveSlot(1)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden group
                ${activeSlot === 1 ? 'border-orange-500 bg-white shadow-md' : 'border-stone-200 bg-stone-50 hover:bg-white'}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Contender A</span>
                {slot1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSlot1(null); }}
                    className="text-stone-300 hover:text-red-500"
                  >
                    <Icons.X />
                  </button>
                )}
              </div>
              {slot1 ? (
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl shadow-sm">
                      👑
                   </div>
                   <div>
                     <div className="font-bold text-stone-800 leading-tight line-clamp-1">{KINGS_DATA[slot1].summary.title}</div>
                     <div className="text-xs text-stone-500">{KINGS_DATA[slot1].summary.reign}</div>
                   </div>
                </div>
              ) : (
                <div className="h-10 flex items-center text-stone-400 italic text-sm">
                  Select a figure...
                </div>
              )}
            </div>

            {/* VS Badge */}
            <div className="flex justify-center -my-2 relative z-10">
              <div className="bg-stone-800 text-white text-xs font-black p-2 rounded-full border-4 border-stone-100 shadow-sm">
                VS
              </div>
            </div>

            {/* Slot 2 */}
            <div 
              onClick={() => setActiveSlot(2)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden group
                ${activeSlot === 2 ? 'border-indigo-500 bg-white shadow-md' : 'border-stone-200 bg-stone-50 hover:bg-white'}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Contender B</span>
                {slot2 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSlot2(null); }}
                    className="text-stone-300 hover:text-red-500"
                  >
                    <Icons.X />
                  </button>
                )}
              </div>
              {slot2 ? (
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl shadow-sm">
                      👑
                   </div>
                   <div>
                     <div className="font-bold text-stone-800 leading-tight line-clamp-1">{KINGS_DATA[slot2].summary.title}</div>
                     <div className="text-xs text-stone-500">{KINGS_DATA[slot2].summary.reign}</div>
                   </div>
                </div>
              ) : (
                <div className="h-10 flex items-center text-stone-400 italic text-sm">
                  Select a figure...
                </div>
              )}
            </div>

            <div className="mt-auto">
              <button 
                disabled={!slot1 || !slot2}
                onClick={handleStart}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2
                  ${(!slot1 || !slot2) 
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:scale-[1.02] hover:shadow-orange-200'}
                `}
              >
                <span>Start Comparison</span>
                {slot1 && slot2 && <Icons.ChevronRight />}
              </button>
            </div>
          </div>

          {/* Search & List */}
          <div className="md:w-2/3 flex flex-col bg-white">
            <div className="p-4 border-b border-stone-100">
              <div className="relative">
                <div className="absolute left-3 top-3 text-stone-400"><Icons.Search /></div>
                <input 
                  type="text" 
                  placeholder={`Search to add to ${activeSlot === 1 ? 'Contender A' : 'Contender B'}...`}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-200 transition-all font-serif"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto p-2">
              <div className="grid grid-cols-1 gap-2">
                {filteredKings.map(king => {
                  const isSelected = slot1 === king.id || slot2 === king.id;
                  const imagePath = king.imageUrl ? `${(import.meta as any).env.BASE_URL}${king.imageUrl}` : '';
                  return (
                    <button 
                      key={king.id}
                      disabled={isSelected}
                      onClick={() => handleSelect(king.id)}
                      className={`flex items-center text-left p-3 rounded-lg border transition-all
                        ${isSelected 
                          ? 'bg-stone-50 border-stone-100 opacity-50 cursor-default' 
                          : 'bg-white border-transparent hover:bg-orange-50 hover:border-orange-100 cursor-pointer'}
                      `}
                    >
                      <div className={`w-12 h-12 rounded-lg mr-4 bg-stone-200 overflow-hidden flex-shrink-0 relative`}>
                         {king.imageUrl ? (
                           <img src={imagePath} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-lg">📜</div>
                         )}
                         {isSelected && (
                           <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center text-white">
                             <Icons.Check />
                           </div>
                         )}
                      </div>
                      <div>
                        <div className="font-bold text-stone-800 heading-text">{king.summary.title}</div>
                        <div className="text-xs text-stone-500 font-serif">
                          {king.summary.reign ? king.summary.reign : 'Reign Unknown'}
                          {king.summary.founder && <span className="ml-2 px-1.5 py-0.5 bg-stone-100 rounded text-[10px] uppercase">Founder</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CompareModal;