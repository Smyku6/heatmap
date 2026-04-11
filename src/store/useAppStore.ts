import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { parseTCX, prepareVisualizationData } from '../utils/tcxParser';
import { DEFAULT_PITCH_ID } from '../config/pitches';
import { autoDetectPitch } from '../utils/pitchDetection';
import type { AppState } from '../types';

const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // ============================================
        // STATE
        // ============================================

        // Sessions
        sessions: [],
        currentSessionId: null,

        // Visualization data
        rawPoints: null,
        visualizationData: null,

        // UI Settings
        selectedSegment: 'full',
        selectedOrientation: 'original',
        detectedPitch: null,

        // Display toggles
        showHeatmap: true,
        showActivityPoints: false,
        showSprints: false,

        // Heatmap settings
        heatmapSettings: {
          intensity: 14,
          opacity: 0.65,
          densityRadius: 10,
          colorPalette: 'classic',
          minThreshold: 0
        },

        // Sprint settings
        sprintSettings: {
          minSpeed: 16.5,
          minDuration: 2,
          minDistance: 10,
          simplified: true,
          showNumbers: false
        },

        // Satellite transform
        satelliteTransform: {
          scale: 1.0,
          rotation: 0,
          translateX: 0,
          translateY: 0
        },

        // ============================================
        // COMPUTED VALUES
        // ============================================

        selectedPitchId: () => {
          const state = get();
          return state.detectedPitch || DEFAULT_PITCH_ID;
        },

        // ============================================
        // ACTIONS
        // ============================================

        // Session management
        addSession: (session) => set((state) => ({
          sessions: [session, ...state.sessions]
        })),

        removeSession: (sessionId) => set((state) => ({
          sessions: state.sessions.filter(s => s.id !== sessionId)
        })),

        clearSessions: () => set({ sessions: [] }),

        // Load session for analysis
        loadSessionForAnalysis: (sessionId) => {
          const state = get();
          const session = state.sessions.find(s => s.id === sessionId);

          if (session) {
            set({
              currentSessionId: sessionId,
              rawPoints: session.rawPoints,
              detectedPitch: session.pitchId,
              visualizationData: session.visualizationData,
              selectedSegment: 'full',
              selectedOrientation: 'original'
            });
          }
        },

        // File loading
        handleFileLoad: (fileContent) => {
          try {
            const points = parseTCX(fileContent);

            if (points.length > 0) {
              // Auto-detect pitch
              const pitchId = autoDetectPitch(points) || DEFAULT_PITCH_ID;

              // Prepare visualization data
              const vizData = prepareVisualizationData(
                points,
                'full',
                pitchId,
                'original',
                null
              );

              // Create new session
              const newSession = {
                id: Date.now().toString(),
                rawPoints: points,
                pitchId: pitchId,
                activityDate: vizData.activityDate,
                totalDuration: vizData.totalDuration?.formatted || vizData.totalDuration,
                totalDistance: vizData.totalDistance?.formatted || vizData.totalDistance,
                totalAvgHeartRate: vizData.totalAvgHeartRate,
                totalPointCount: vizData.totalPointCount,
                pitchInfo: vizData.pitchInfo,
                visualizationData: vizData
              };

              // Add to sessions
              get().addSession(newSession);
            }
          } catch (error) {
            console.error('Błąd parsowania pliku TCX:', error);
            alert('Nie można wczytać pliku TCX. Sprawdź format pliku.');
          }
        },

        handleLoadPerformance: (tcxContent, pitchId) => {
          try {
            const points = parseTCX(tcxContent);

            if (points.length > 0) {
              // Prepare visualization data
              const vizData = prepareVisualizationData(
                points,
                'full',
                pitchId,
                'original',
                null
              );

              // Create new session
              const newSession = {
                id: Date.now().toString(),
                rawPoints: points,
                pitchId: pitchId,
                activityDate: vizData.activityDate,
                totalDuration: vizData.totalDuration?.formatted || vizData.totalDuration,
                totalDistance: vizData.totalDistance?.formatted || vizData.totalDistance,
                totalAvgHeartRate: vizData.totalAvgHeartRate,
                totalPointCount: vizData.totalPointCount,
                pitchInfo: vizData.pitchInfo,
                visualizationData: vizData
              };

              // Add to sessions
              get().addSession(newSession);
            }
          } catch (error) {
            console.error('Błąd parsowania pliku TCX:', error);
            alert('Nie można wczytać pliku TCX. Sprawdź format pliku.');
          }
        },

        // Settings updates
        setSelectedSegment: (segment) => set({ selectedSegment: segment }),

        setSelectedOrientation: (orientation) => set({ selectedOrientation: orientation }),

        setDetectedPitch: (pitchId) => set({ detectedPitch: pitchId }),

        setShowHeatmap: (show) => set({ showHeatmap: show }),

        setShowActivityPoints: (show) => set({ showActivityPoints: show }),

        setShowSprints: (show) => set({ showSprints: show }),

        setHeatmapSettings: (settings) => set({ heatmapSettings: settings }),

        setSprintSettings: (settings) => set({ sprintSettings: settings }),

        setSatelliteTransform: (transform) => set({ satelliteTransform: transform }),

        handlePitchChange: (pitchId) => set({ detectedPitch: pitchId }),

        // Update visualization data when dependencies change
        updateVisualizationData: () => {
          const state = get();
          if (state.rawPoints) {
            const vizData = prepareVisualizationData(
              state.rawPoints,
              state.selectedSegment,
              state.detectedPitch || DEFAULT_PITCH_ID,
              state.selectedOrientation,
              state.showSprints ? state.sprintSettings : null
            );

            set({ visualizationData: vizData });

            // Load default transform for this orientation if exists
            if (vizData.satellite?.transforms?.[state.selectedOrientation]) {
              set({ satelliteTransform: vizData.satellite.transforms[state.selectedOrientation] });
            } else {
              set({
                satelliteTransform: {
                  scale: 1.0,
                  rotation: 0,
                  translateX: 0,
                  translateY: 0
                }
              });
            }
          }
        }
      }),
      {
        name: 'heatmap-storage', // localStorage key
        partialize: (state) => ({
          // Only persist sessions, don't persist UI state
          sessions: state.sessions
        })
      }
    ),
    {
      name: 'HeatmapStore' // DevTools name
    }
  )
);

export default useAppStore;
