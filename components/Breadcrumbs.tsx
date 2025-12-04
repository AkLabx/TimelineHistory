import React from 'react';
import { ViewState, PeriodData, KingProfile } from '../types';

interface BreadcrumbsProps {
  view: ViewState;
  selectedEra?: PeriodData;
  selectedEraId?: string;
  selectedFigure?: KingProfile;
  onHome: () => void;
  onSelectEra: (id: string) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ view, selectedEra, selectedEraId, selectedFigure, onHome, onSelectEra }) => {
  if (view === ViewState.DASHBOARD) return null;

  return (
    <div className="bg-white border-b border-slate-100 py-2 px-4 sm:px-8 text-sm text-slate-500 flex items-center overflow-x-auto whitespace-nowrap">
         <span onClick={onHome} className="cursor-pointer hover:text-indigo-600">Home</span>
         {selectedEra && selectedEraId && (
            <>
                <span className="mx-2 text-slate-300">/</span>
                <span onClick={() => onSelectEra(selectedEraId)} className={`cursor-pointer hover:text-indigo-600 ${!selectedFigure ? 'font-semibold text-slate-900' : ''}`}>{selectedEra.title}</span>
            </>
         )}
         {selectedFigure && (
            <>
                <span className="mx-2 text-slate-300">/</span>
                <span className="font-semibold text-slate-900">{selectedFigure.summary.title}</span>
            </>
         )}
    </div>
  );
};

export default Breadcrumbs;