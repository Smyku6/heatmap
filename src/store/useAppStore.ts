/**
 * Main Application Store
 *
 * Combines all slices (Session, UI, Visualization) into a unified Zustand store
 * with devtools and persistence middleware.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { isArrayOf, isSession } from '../utils/typeGuards';
import { createSessionSlice } from './slices/sessionSlice';
import { createUISlice } from './slices/uiSlice';
import { createVisualizationSlice } from './slices/visualizationSlice';

import type { AppState } from './types';

/**
 * Main application store
 *
 * Uses Zustand with devtools and persist middleware.
 * State is split into three slices for better organization:
 * - Session: Training session management
 * - UI: User interface state and settings
 * - Visualization: Data processing and visualization
 *
 * Only sessions are persisted to localStorage.
 */
const useAppStore = create<AppState>()(
  devtools(
    persist(
      (...a) => ({
        ...createSessionSlice(...a),
        ...createUISlice(...a),
        ...createVisualizationSlice(...a)
      }),
      {
        name: 'heatmap-storage', // localStorage key
        partialize: (state) => ({
          // Only persist sessions, don't persist UI state
          sessions: state.sessions
        }),
        // Validate data on rehydration from localStorage
        merge: (persistedState, currentState) => {
          const isSessionArray = isArrayOf(isSession);

          // Type guard for persisted state structure
          if (
            persistedState &&
            typeof persistedState === 'object' &&
            'sessions' in persistedState &&
            isSessionArray(persistedState.sessions)
          ) {
            return {
              ...currentState,
              sessions: persistedState.sessions
            };
          }

          // If validation fails, log error and use current state (empty sessions)
          console.warn('Invalid session data in localStorage, using fresh state');
          return currentState;
        }
      }
    ),
    {
      name: 'HeatmapStore' // DevTools name
    }
  )
);

export default useAppStore;
