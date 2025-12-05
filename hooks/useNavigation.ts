import { useState, useMemo } from 'react';
import { ViewState } from '../types';
import { PART_DATA, DYNASTY_DATA, KINGS_DATA } from '../data';

/**
 * Custom hook to manage navigation within the application.
 * Handles state for current view, selected entities (periods/kings), and comparison mode.
 *
 * @returns An object containing navigation state and functions to modify it.
 */
export const useNavigation = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // selectedEntityId can be a Period ID (magadha) or a King ID (bimbisara)
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // State for comparison
  const [compareIds, setCompareIds] = useState<[string | null, string | null]>([null, null]);

  // We need to know if the selected ID is a Period or a King to determine the view mode
  // However, the structure is: Dashboard -> EraDetail (Period) -> FigureDetail (King)
  
  /**
   * Memoized selected period data based on `selectedEntityId`.
   * Returns null if the ID does not correspond to a known period.
   */
  const selectedPeriod = useMemo(() => {
    if (!selectedEntityId) return null;
    return DYNASTY_DATA[selectedEntityId] || null;
  }, [selectedEntityId]);

  /**
   * Memoized selected figure data based on `selectedEntityId`.
   * Returns null if the ID does not correspond to a known figure.
   */
  const selectedFigure = useMemo(() => {
    if (!selectedEntityId) return null;
    return KINGS_DATA[selectedEntityId] || null;
  }, [selectedEntityId]);

  // If selectedEntityId matches a key in DYNASTY_DATA, it's a period
  // If matches KINGS_DATA, it's a figure
  
  /**
   * Derived current view state based on internal state and selected entity type.
   */
  const activeView = useMemo(() => {
    if (view === ViewState.COMPARE) return ViewState.COMPARE;
    if (view === ViewState.DASHBOARD) return ViewState.DASHBOARD;
    if (selectedFigure) return ViewState.DETAIL; // Showing King/Event specific detail
    if (selectedPeriod) return ViewState.TIMELINE; // Showing the Era/Dynasty List
    return ViewState.DASHBOARD;
  }, [view, selectedFigure, selectedPeriod]);


  /**
   * Resets navigation to the dashboard home view.
   */
  const goHome = () => {
    setView(ViewState.DASHBOARD);
    setSelectedEntityId(null);
    setCompareIds([null, null]);
  };

  /**
   * Selects a historical period to view its timeline/details.
   * @param id - The ID of the period to select.
   */
  const selectPeriod = (id: string) => {
    setSelectedEntityId(id);
    setView(ViewState.TIMELINE); // This maps to EraDetail component
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Selects a specific historical figure to view their details.
   * @param id - The ID of the figure to select.
   */
  const selectFigure = (id: string) => {
    setSelectedEntityId(id);
    setView(ViewState.DETAIL); // This maps to FigureDetail component
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Initiates a comparison view between two entities.
   * @param id1 - The ID of the first entity.
   * @param id2 - The ID of the second entity.
   */
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
