
import React, { useMemo, useState } from 'react';
import { ViewState } from './types';
import { useNavigation } from './hooks/useNavigation';
import { useSearch } from './hooks/useSearch';
import { DYNASTY_DATA, KINGS_DATA } from './data';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Timeline from './components/Timeline';
import EraDetail from './components/EraDetail';
import FigureDetail from './components/FigureDetail';
import SearchModal from './components/SearchModal';
import CompareModal from './components/CompareModal';
import CompareView from './components/CompareView';
import Footer from './components/Footer';
import SamvadChat from './components/SamvadChat';
import GlobalChat from './components/GlobalChat';

/**
 * The main application component.
 * Manages the routing logic (via custom hooks), global state, and layout structure.
 *
 * @returns The complete App React Element.
 */
export default function App() {
  const navigation = useNavigation();
  const search = useSearch();
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [samvadFigureId, setSamvadFigureId] = useState<string | null>(null);

  /**
   * Helper to resolve the active Era/Period context for breadcrumbs and AI context.
   * If a figure is selected, it finds the parent period.
   */
  const activeContext = useMemo(() => {
    if (navigation.selectedPeriod) {
        return { 
            period: navigation.selectedPeriod, 
            id: navigation.selectedEntityId 
        };
    }
    if (navigation.selectedFigure) {
        const parentPeriod = Object.values(DYNASTY_DATA).find(p => 
            p.items.some(item => item.subItems?.includes(navigation.selectedEntityId!))
        );
        const parentId = parentPeriod ? Object.keys(DYNASTY_DATA).find(key => DYNASTY_DATA[key] === parentPeriod) : null;
        
        return { 
            period: parentPeriod || null, 
            id: navigation.selectedEntityId // Pass the figure ID for more specific context
        };
    }
    return { period: null, id: null };
  }, [navigation.selectedPeriod, navigation.selectedFigure, navigation.selectedEntityId]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar 
        onHome={navigation.goHome} 
        onSearchOpen={() => search.setIsOpen(true)}
        onCompareOpen={() => setIsCompareModalOpen(true)}
      />

      {/* Breadcrumbs - Hide on Dashboard and Compare View */}
      {navigation.view !== ViewState.DASHBOARD && navigation.view !== ViewState.COMPARE && (
          <div className="bg-white border-b border-orange-100 py-3 px-4 sm:px-8 text-sm text-slate-500 flex items-center shadow-sm whitespace-nowrap overflow-x-auto">
             <span onClick={navigation.goHome} className="cursor-pointer hover:text-orange-600 font-medium">Home</span>
             
             {/* Show Period Breadcrumb (either selected or parent of figure) */}
             {activeContext.period && (
                <>
                    <span className="mx-2 text-slate-300">/</span>
                    <span 
                        onClick={() => {
                            // Find the ID of the period to navigate back
                            const periodId = Object.keys(DYNASTY_DATA).find(key => DYNASTY_DATA[key] === activeContext.period);
                            if(periodId) navigation.selectPeriod(periodId);
                        }} 
                        className={`cursor-pointer hover:text-orange-600 ${!navigation.selectedFigure ? 'font-bold text-orange-800' : ''}`}
                    >
                        {activeContext.period.title.split(':')[0]}
                    </span>
                </>
             )}

             {/* Show Figure Breadcrumb */}
             {navigation.selectedFigure && (
                <>
                    <span className="mx-2 text-slate-300">/</span>
                    <span className="font-bold text-orange-800">{navigation.selectedFigure.summary.title}</span>
                </>
             )}
          </div>
      )}

      <main className="flex-grow relative">
        {navigation.view === ViewState.DASHBOARD && (
          <Dashboard onSelectPeriod={navigation.selectPeriod} />
        )}

        {navigation.view === ViewState.COMPARE && navigation.compareIds[0] && navigation.compareIds[1] && (
          <CompareView 
            id1={navigation.compareIds[0]!} 
            id2={navigation.compareIds[1]!} 
            onClose={navigation.goHome} 
          />
        )}
        
        {/* Render Timeline & Details if we are in a detail view and have ANY valid selection */}
        {(navigation.view === ViewState.DETAIL || navigation.view === ViewState.TIMELINE) && (navigation.selectedPeriod || navigation.selectedFigure) && (
          <>
            {/* Timeline persists showing the Context Period */}
            <Timeline 
              activePeriodId={navigation.selectedPeriod ? navigation.selectedEntityId : (activeContext.id && KINGS_DATA[activeContext.id] ? Object.keys(DYNASTY_DATA).find(key => DYNASTY_DATA[key] === activeContext.period) || null : null)} 
            />
            
            {navigation.selectedFigure ? (
              <FigureDetail 
                figure={navigation.selectedFigure} 
                figureId={navigation.selectedEntityId!}
                onSelectPeriod={navigation.selectPeriod}
                onSelectFigure={navigation.selectFigure}
                onOpenSamvad={() => setSamvadFigureId(navigation.selectedEntityId!)}
              />
            ) : (
               /* Safe check for EraDetail */
               navigation.selectedPeriod && (
                  <EraDetail 
                    period={navigation.selectedPeriod}
                    periodId={navigation.selectedEntityId!}
                    onSelectFigure={navigation.selectFigure}
                    onSelectPeriod={navigation.selectPeriod}
                  />
               )
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Global AI Assistant (Itihaskar) */}
      <GlobalChat activeContext={activeContext} />

      <SearchModal 
        isOpen={search.isOpen}
        onClose={() => search.setIsOpen(false)}
        query={search.query}
        setQuery={search.setQuery}
        results={search.results}
        onSelectPeriod={navigation.selectPeriod}
        onSelectFigure={navigation.selectFigure}
      />

      <CompareModal 
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onStartComparison={navigation.startComparison}
      />

      {/* Samvad Chat Drawer */}
      <SamvadChat 
        isOpen={!!samvadFigureId}
        onClose={() => setSamvadFigureId(null)}
        figureId={samvadFigureId}
      />
    </div>
  );
};
