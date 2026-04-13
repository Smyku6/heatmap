/**
 * Session Slice - Manages training sessions
 *
 * Handles all session-related state and actions including:
 * - Adding/removing sessions
 * - Loading sessions for analysis
 * - Session persistence to localStorage
 */

import type { Session, SessionId } from '../../types';
import type { AppState } from '../types';
import type { StateCreator } from 'zustand';

/**
 * Session slice interface
 */
export interface SessionSlice {
  // State
  sessions: Session[];
  currentSessionId: SessionId | null;

  // Actions
  addSession: (session: Session) => void;
  removeSession: (sessionId: SessionId) => void;
  clearSessions: () => void;
  loadSessionForAnalysis: (sessionId: SessionId) => void;
}

/**
 * Creates the session management slice
 *
 * @param set - Zustand set function
 * @param get - Zustand get function
 * @returns Session slice implementation
 */
export const createSessionSlice: StateCreator<
  AppState,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  SessionSlice
> = (set, get) => ({
  // ============================================
  // STATE
  // ============================================
  sessions: [],
  currentSessionId: null,

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Adds a new training session to the store
   *
   * Prepends the session to the sessions array (newest first).
   */
  addSession: (session) =>
    set(
      (state) => ({
        sessions: [session, ...state.sessions]
      }),
      false,
      'session/add'
    ),

  /**
   * Removes a session by ID
   *
   * @param sessionId - ID of the session to remove
   */
  removeSession: (sessionId) =>
    set(
      (state) => ({
        sessions: state.sessions.filter((s) => s.id !== sessionId)
      }),
      false,
      'session/remove'
    ),

  /**
   * Clears all sessions from the store
   */
  clearSessions: () =>
    set(
      {
        sessions: []
      },
      false,
      'session/clearAll'
    ),

  /**
   * Loads a session for detailed analysis
   *
   * Sets the session as current and loads its visualization data,
   * resetting the view to default orientation and full segment.
   *
   * @param sessionId - ID of the session to load
   */
  loadSessionForAnalysis: (sessionId) => {
    const state = get();
    const session = state.sessions.find((s) => s.id === sessionId);

    if (session) {
      set(
        {
          currentSessionId: sessionId,
          rawPoints: session.rawPoints,
          detectedPitch: session.pitchId,
          visualizationData: session.visualizationData,
          selectedSegment: 'full',
          selectedOrientation: 'original'
        },
        false,
        'session/loadForAnalysis'
      );
    }
  }
});
