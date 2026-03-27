import React, { useMemo, useState, Suspense } from 'react';
import { ViewState } from './types';
import { useNavigation } from './hooks/useNavigation';
import { useSearch } from './hooks/useSearch';
import { DYNASTY_DATA, KINGS_DATA } from './data';
import { useLanguage } from './src/contexts/LanguageContext';
import { getLocalized } from './src/utils/language';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Timeline from './components/Timeline';
import Footer from './components/Footer';
import Onboarding from './components/Onboarding';


// Lazy load large components that are not immediately visible
const EraDetail = React.lazy(() => import('./components/EraDetail'));
const FigureDetail = React.lazy(() => import('./components/FigureDetail'));
const SearchModal = React.lazy(() => import('./components/SearchModal'));
const CompareModal = React.lazy(() => import('./components/CompareModal'));
const CompareView = React.lazy(() => import('./components/CompareView'));
const SamvadChat = React.lazy(() => import('./components/SamvadChat'));
const GlobalChat = React.lazy(() => import('./components/GlobalChat'));

// Simple loading fallback
const LoadingFallback = () => <div className="flex justify-center items-center p-8 text-orange-500">Loading...</div>;

/**
 * The main application component.
 * Manages the routing logic (via custom hooks), global state, and layout structure.
 *
 * @returns The complete App React Element.
 */
export default function App() {

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('hasCompletedOnboarding') === 'true';
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setHasCompletedOnboarding(true);
  };

  const navigation = useNavigation();
  const search = useSearch();
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [samvadFigureId, setSamvadFigureId] = useState<string | null>(null);
  const { language } = useLanguage();

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


  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

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
             <span onClick={navigation.goHome} className="cursor-pointer hover:text-orange-600 font-medium">{language === 'en' ? 'Home' : 'मुख्य पृष्ठ'}</span>
             
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
                        {getLocalized(activeContext.period, 'title', language).split(':')[0]}
                    </span>
                </>
             )}

             {/* Show Figure Breadcrumb */}
             {navigation.selectedFigure && (
                <>
                    <span className="mx-2 text-slate-300">/</span>
                    <span className="font-bold text-orange-800">{getLocalized(navigation.selectedFigure.summary, 'title', language)}</span>
                </>
             )}
          </div>
      )}

      <main className="flex-grow relative">
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      </main>

      <Footer />

      {/* Modals and Overlays wrapped in Suspense */}
      <Suspense fallback={null}>
        {/* Global AI Assistant (Itihaskar) */}
        <GlobalChat activeContext={activeContext} />

        {search.isOpen && (
          <SearchModal
            isOpen={search.isOpen}
            onClose={() => search.setIsOpen(false)}
            query={search.query}
            setQuery={search.setQuery}
            results={search.results}
            onSelectPeriod={navigation.selectPeriod}
            onSelectFigure={navigation.selectFigure}
          />
        )}

        {isCompareModalOpen && (
          <CompareModal
            isOpen={isCompareModalOpen}
            onClose={() => setIsCompareModalOpen(false)}
            onStartComparison={navigation.startComparison}
          />
        )}

        {/* Samvad Chat Drawer */}
        {!!samvadFigureId && (
          <SamvadChat
            isOpen={!!samvadFigureId}
            onClose={() => setSamvadFigureId(null)}
            figureId={samvadFigureId!}
          />
        )}
      </Suspense>
    </div>
  );
};
