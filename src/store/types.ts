/**
 * Store type definitions
 *
 * Combines all slice interfaces into the complete AppState type.
 */

import type { MatchSlice } from './slices/matchSlice';
import type { SessionSlice } from './slices/sessionSlice';
import type { UISlice } from './slices/uiSlice';
import type { VisualizationSlice } from './slices/visualizationSlice';

/**
 * Complete application state type
 *
 * Combines all slices (Session, UI, Visualization, Match) into a single
 * unified store interface.
 */
export type AppState = SessionSlice & UISlice & VisualizationSlice & MatchSlice;
