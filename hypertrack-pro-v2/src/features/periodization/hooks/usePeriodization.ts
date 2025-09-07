import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { PeriodizationPhase, PeriodizationState } from '../types/periodization';
import { createHypertrophyPhase, calculatePhaseTransition } from '../utils/phaseTransitions';
import { useEffect } from 'react';

function addWeeks(date: Date, w: number): Date {
  return new Date(date.getTime() + w * 7 * 86400000);
}

function getDefaultHypertrophyPhase(): PeriodizationPhase {
  return createHypertrophyPhase();
}

interface PeriodizationStore {
  state: PeriodizationState;
  actions: {
    transitionPhase: (nextPhase: PeriodizationPhase) => void;
    updatePhaseProgress: () => void;
    toggleAutoTransitions: () => void;
    customizePhase: (customizations: Record<string, any>) => void;
  };
}

export const usePeriodizationStore = create<PeriodizationStore>()(
  immer((set, get) => ({
    state: {
      currentPhase: getDefaultHypertrophyPhase(),
      phaseHistory: [],
      nextTransition: addWeeks(new Date(), 6),
      autoTransitions: true,
      customizations: {}
    },
    actions: {
      transitionPhase: (nextPhase) => set((state) => {
        state.state.phaseHistory.push(state.state.currentPhase);
        state.state.currentPhase = nextPhase;
        state.state.nextTransition = nextPhase.endDate;
      }),
      updatePhaseProgress: () => set((state) => {
        state.state.currentPhase.weekNumber = Math.min(state.state.currentPhase.weekNumber + 1, state.state.currentPhase.totalWeeks);
      }),
      toggleAutoTransitions: () => set((state) => {
        state.state.autoTransitions = !state.state.autoTransitions;
      }),
      customizePhase: (customizations) => set((state) => {
        state.state.customizations = { ...state.state.customizations, ...customizations };
      })
    }
  }))
);

export function usePeriodization() {
  const store = usePeriodizationStore();

  useEffect(() => {
    if (!store.state.autoTransitions) return;
    const id = setInterval(() => {
      // Placeholder: external data could feed plateauRisk/progressData
      const rec = calculatePhaseTransition(store.state.currentPhase, { recentPerformance: [] }, 0.0);
      if (rec.shouldTransition && rec.nextPhase) {
        store.actions.transitionPhase(rec.nextPhase);
      }
    }, 7 * 24 * 60 * 60 * 1000); // weekly check
    return () => clearInterval(id);
  }, [store.state.autoTransitions, store.state.currentPhase]);

  return {
    currentPhase: store.state.currentPhase,
    phaseHistory: store.state.phaseHistory,
    nextTransition: store.state.nextTransition,
    autoTransitions: store.state.autoTransitions,
    actions: store.actions
  };
}


