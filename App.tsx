import React, { useMemo } from 'react';
import { ViewState } from './types';
import { useNavigation } from './hooks/useNavigation';
import { useSearch } from './hooks/useSearch';
import { DYNASTY_DATA } from './data';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Timeline from './components/Timeline';
import EraDetail from './components/EraDetail';
import FigureDetail from './components/FigureDetail';
import SearchModal from './components/SearchModal';
import Footer from './components/Footer';

export default function App() {
  const navigation = useNavigation();
  const search = useSearch();

  // Helper to resolve the active Era/Period context
  // If a King is selected, we find which Period they belong to.
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
            id: parentId || null 
        };
    }
    return { period: null, id: null };
  }, [navigation.selectedPeriod, navigation.selectedFigure, navigation.selectedEntityId]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar 
        onHome={navigation.goHome} 
        onSearchOpen={() => search.setIsOpen(true)} 
      />

      {/* Breadcrumbs */}
      {navigation.view !== ViewState.DASHBOARD && (
          <div className="bg-white border-b border-orange-100 py-3 px-4 sm:px-8 text-sm text-slate-500 flex items-center shadow-sm whitespace-nowrap overflow-x-auto">
             <span onClick={navigation.goHome} className="cursor-pointer hover:text-orange-600 font-medium">Home</span>
             
             {/* Show Period Breadcrumb (either selected or parent of figure) */}
             {activeContext.period && activeContext.id && (
                <>
                    <span className="mx-2 text-slate-300">/</span>
                    <span 
                        onClick={() => navigation.selectPeriod(activeContext.id!)} 
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

      <main className="flex-grow">
        {navigation.view === ViewState.DASHBOARD && (
          <Dashboard onSelectPeriod={navigation.selectPeriod} />
        )}
        
        {/* Render Timeline & Details if we are in a detail view and have ANY valid selection */}
        {(navigation.view === ViewState.DETAIL || navigation.view === ViewState.TIMELINE) && (navigation.selectedPeriod || navigation.selectedFigure) && (
          <>
            {/* Timeline persists showing the Context Period */}
            <Timeline 
              activePeriodId={activeContext.id} 
            />
            
            {navigation.selectedFigure ? (
              <FigureDetail 
                figure={navigation.selectedFigure} 
                figureId={navigation.selectedEntityId!}
                onSelectPeriod={navigation.selectPeriod}
                onSelectFigure={navigation.selectFigure}
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

      <SearchModal 
        isOpen={search.isOpen}
        onClose={() => search.setIsOpen(false)}
        query={search.query}
        setQuery={search.setQuery}
        results={search.results}
        onSelectPeriod={navigation.selectPeriod}
        onSelectFigure={navigation.selectFigure}
      />
    </div>
  );
}