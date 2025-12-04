import { useState, useMemo } from 'react';
import { ViewState } from '../types';
import { PART_DATA, DYNASTY_DATA, KINGS_DATA } from '../data';

export const useNavigation = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // selectedEntityId can be a Period ID (magadha) or a King ID (bimbisara)
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // State for comparison
  const [compareIds, setCompareIds] = useState<[string | null, string | null]>([null, null]);

  // We need to know if the selected ID is a Period or a King to determine the view mode
  // However, the structure is: Dashboard -> EraDetail (Period) -> FigureDetail (King)
  
  const selectedPeriod = useMemo(() => {
    if (!selectedEntityId) return null;
    return DYNASTY_DATA[selectedEntityId] || null;
  }, [selectedEntityId]);

  const selectedFigure = useMemo(() => {
    if (!selectedEntityId) return null;
    return KINGS_DATA[selectedEntityId] || null;
  }, [selectedEntityId]);

  // If selectedEntityId matches a key in DYNASTY_DATA, it's a period
  // If matches KINGS_DATA, it's a figure
  
  const activeView = useMemo(() => {
    if (view === ViewState.COMPARE) return ViewState.COMPARE;
    if (view === ViewState.DASHBOARD) return ViewState.DASHBOARD;
    if (selectedFigure) return ViewState.DETAIL; // Showing King/Event specific detail
    if (selectedPeriod) return ViewState.TIMELINE; // Showing the Era/Dynasty List
    return ViewState.DASHBOARD;
  }, [view, selectedFigure, selectedPeriod]);


  const goHome = () => {
    setView(ViewState.DASHBOARD);
    setSelectedEntityId(null);
    setCompareIds([null, null]);
  };

  const selectPeriod = (id: string) => {
    setSelectedEntityId(id);
    setView(ViewState.TIMELINE); // This maps to EraDetail component
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectFigure = (id: string) => {
    setSelectedEntityId(id);
    setView(ViewState.DETAIL); // This maps to FigureDetail component
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startComparison = (id1: string, id2: string) => {
    setCompareIds([id1, id2]);
    setView(ViewState.COMPARE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    view: activeView, // Derived view
    selectedEntityId,
    selectedPeriod,
    selectedFigure,
    compareIds,
    goHome,
    selectPeriod,
    selectFigure,
    startComparison
  };
};