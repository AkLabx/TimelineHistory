import React, { useState } from 'react';
import { MindmapCanvas } from './MindmapCanvas';
import { PART_DATA, DYNASTY_DATA, KINGS_DATA } from '../../utils/contentLoader';

export const MindmapView: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    let selectedItem = null;
    if (selectedId) {
        const eraCard = PART_DATA.timelineCards.find(c => c.target === selectedId);
        if (eraCard) selectedItem = { title: eraCard.title, type: 'Era', period: eraCard.period, image: eraCard.imageUrl };
        if (!selectedItem && DYNASTY_DATA[selectedId]) {
            const d = DYNASTY_DATA[selectedId].items.find(i => i.id === selectedId)?.summary;
            if (d) selectedItem = { title: d.title, type: 'Dynasty', period: d.period };
        }
        if (!selectedItem && KINGS_DATA[selectedId]) {
            const k = KINGS_DATA[selectedId];
            selectedItem = { title: k.summary.title, type: 'King', period: k.summary.reign || k.summary.period, image: k.imageUrl, content: k.content };
        }
    }
    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex font-sans overflow-hidden">
            <div className="flex-1 relative">
                <MindmapCanvas onNodeSelect={setSelectedId} />
                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center pointer-events-none z-10">
                    <div className="pointer-events-auto flex items-center gap-4">
                        <button onClick={onClose} className="bg-slate-800/80 hover:bg-slate-700 text-white p-3 rounded-full backdrop-blur-md transition-all shadow-lg border border-slate-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-wide">3D Chronology Map</h1>
                            <p className="text-sm text-slate-300">Scroll to zoom, drag to pan</p>
                        </div>
                    </div>
                </div>
            </div>
            {selectedItem && (
                <div className="w-80 bg-slate-900/90 backdrop-blur-xl border-l border-white/10 p-6 flex flex-col overflow-y-auto z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
                    <div className="text-indigo-400 text-xs uppercase tracking-widest font-semibold mb-2">{selectedItem.type}</div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-hindi">{selectedItem.title}</h2>
                    <div className="text-amber-400 font-mono text-sm mb-6">{selectedItem.period}</div>
                    {selectedItem.image && <div className="w-full h-48 rounded-xl overflow-hidden mb-6 border border-white/10"><img src={import.meta.env.BASE_URL + selectedItem.image} alt={selectedItem.title} className="w-full h-full object-cover" /></div>}
                    {selectedItem.content && <div className="text-slate-300 text-sm leading-relaxed prose prose-invert font-hindi" dangerouslySetInnerHTML={{ __html: selectedItem.content }} />}
                </div>
            )}
        </div>
    );
};
