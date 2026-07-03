/**
 * Match Slice - Manages match data from external API for goal analysis
 */

import type { MatchData } from '../../types';
import type { AppState } from '../types';
import type { StateCreator } from 'zustand';

const API_BASE = 'https://us-central1-garmin-roster-api.cloudfunctions.net/api/api';
const USER_ID = 'test_user';

export interface MatchSlice {
  // State
  matchData: MatchData | null;
  matchList: MatchData[] | null;
  selectedPlayerId: string | null;
  goalWindowSeconds: number;
  matchLoading: boolean;
  matchError: string | null;

  // Actions
  fetchMatchByDate: (activityDate: Date | string) => Promise<void>;
  setSelectedPlayerId: (id: string | null) => void;
  setGoalWindowSeconds: (seconds: number) => void;
  clearMatchData: () => void;
}

/**
 * Check if two dates are on the same day
 */
const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const createMatchSlice: StateCreator<
  AppState,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  MatchSlice
> = (set) => ({
  matchData: null,
  matchList: null,
  selectedPlayerId: null,
  goalWindowSeconds: 45,
  matchLoading: false,
  matchError: null,

  fetchMatchByDate: async (activityDate: Date | string) => {
    set({ matchLoading: true, matchError: null }, false, 'match/fetchStart');

    try {
      const response = await fetch(`${API_BASE}/matches/${USER_ID}`);

      if (!response.ok) {
        throw new Error(`Błąd API: ${response.status}`);
      }

      const matches: MatchData[] = await response.json();
      const targetDate = new Date(activityDate);

      // Find match on the same day as the activity
      const found = matches.find((m) => {
        // Try matchStartEpoch first
        if (m.matchStartEpoch) {
          return isSameDay(new Date(m.matchStartEpoch * 1000), targetDate);
        }
        // Fallback to receivedAt
        if (m.receivedAt) {
          return isSameDay(new Date(m.receivedAt), targetDate);
        }
        return false;
      });

      if (!found) {
        set(
          {
            matchList: matches,
            matchLoading: false,
            matchError: `Nie znaleziono meczu z dnia ${targetDate.toLocaleDateString('pl-PL')}`
          },
          false,
          'match/notFound'
        );
        return;
      }

      set(
        {
          matchData: found,
          matchList: matches,
          matchLoading: false,
          matchError: null,
          selectedPlayerId: null
        },
        false,
        'match/fetchSuccess'
      );
    } catch (error) {
      set(
        {
          matchLoading: false,
          matchError: error instanceof Error ? error.message : 'Nie udało się pobrać danych meczów'
        },
        false,
        'match/fetchError'
      );
    }
  },

  setSelectedPlayerId: (id) => set({ selectedPlayerId: id }, false, 'match/selectPlayer'),

  setGoalWindowSeconds: (seconds) =>
    set({ goalWindowSeconds: seconds }, false, 'match/setGoalWindow'),

  clearMatchData: () =>
    set(
      {
        matchData: null,
        matchList: null,
        selectedPlayerId: null,
        matchError: null
      },
      false,
      'match/clear'
    )
});
