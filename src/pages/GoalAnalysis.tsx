import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Pitch from '../components/Pitch';
import useAppStore from '../store/useAppStore';

import type { MatchGoal, TransformedPoint } from '../types';
import '../App.css';

const GoalAnalysis = () => {
  const navigate = useNavigate();

  // Animation state: which goal index is playing, and current point index
  const [playingGoalIndex, setPlayingGoalIndex] = useState<number | null>(null);
  const [animFrameIndex, setAnimFrameIndex] = useState(0);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const maxFramesRef = useRef(0);

  // Store state
  const visualizationData = useAppStore((s) => s.visualizationData);
  const rawPoints = useAppStore((s) => s.rawPoints);
  const matchData = useAppStore((s) => s.matchData);
  const selectedPlayerId = useAppStore((s) => s.selectedPlayerId);
  const goalWindowSeconds = useAppStore((s) => s.goalWindowSeconds);
  const matchLoading = useAppStore((s) => s.matchLoading);
  const matchError = useAppStore((s) => s.matchError);

  // Store actions
  const fetchMatchByDate = useAppStore((s) => s.fetchMatchByDate);
  const setSelectedPlayerId = useAppStore((s) => s.setSelectedPlayerId);
  const setGoalWindowSeconds = useAppStore((s) => s.setGoalWindowSeconds);
  const clearMatchData = useAppStore((s) => s.clearMatchData);

  // Stop animation helper
  const stopAnimation = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    setPlayingGoalIndex(null);
    setAnimFrameIndex(0);
  }, []);

  // Animation loop
  useEffect(() => {
    if (playingGoalIndex === null) return;

    const intervalMs = 120; // ms between frames

    const step = (timestamp: number) => {
      if (timestamp - lastTimeRef.current >= intervalMs) {
        lastTimeRef.current = timestamp;
        setAnimFrameIndex((prev) => {
          if (prev >= maxFramesRef.current - 1) {
            // Animation finished - stop on next tick
            cancelAnimationFrame(animRef.current!);
            animRef.current = null;
            return prev;
          }
          return prev + 1;
        });
      }
      if (animRef.current !== null) {
        animRef.current = requestAnimationFrame(step);
      }
    };

    lastTimeRef.current = 0;
    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [playingGoalIndex]);

  // Auto-select "me" when match data loads (player with GPS activity)
  useEffect(() => {
    if (matchData && !selectedPlayerId && matchData.playerActivities?.length > 0) {
      const myPlayerId = matchData.playerActivities[0].playerId;
      setSelectedPlayerId(myPlayerId);
    }
  }, [matchData, selectedPlayerId, setSelectedPlayerId]);

  // No session loaded
  if (!visualizationData || !rawPoints) {
    return (
      <div className="empty-state">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '1rem' }}
        >
          sports_soccer
        </span>
        <p>Najpierw załaduj sesję treningową w Dashboard</p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: 'var(--color-primary)',
            color: '#0a0a0a',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Wróć do Dashboard
        </button>
      </div>
    );
  }

  const handleAutoFetch = () => {
    if (visualizationData?.activityDate) {
      fetchMatchByDate(visualizationData.activityDate);
    }
  };

  // Identify "me" - the player with GPS data
  const myPlayerId = matchData?.playerActivities?.[0]?.playerId ?? null;

  // Find which team "I" belong to
  const getMyTeam = (): 'A' | 'B' | null => {
    if (!matchData || !myPlayerId) return null;
    if (matchData.lineup) {
      if (matchData.lineup.teamA?.find((p) => p.id === myPlayerId)) return 'A';
      if (matchData.lineup.teamB?.find((p) => p.id === myPlayerId)) return 'B';
    }
    // Fallback: check goals
    const myGoal = matchData.goals.find((g) => g.scorerId === myPlayerId);
    if (myGoal) return myGoal.team;
    return null;
  };

  const myTeam = getMyTeam();

  // Get context label for a goal
  const getGoalContext = (goal: MatchGoal): { label: string; icon: string; color: string } => {
    if (goal.scorerId === myPlayerId) {
      return { label: 'Twój gol', icon: 'sports_soccer', color: '#cafd00' };
    }
    if (myTeam && goal.team === myTeam) {
      return { label: 'Twoja pozycja przy golu', icon: 'support_agent', color: '#4ecdc4' };
    }
    return { label: 'Twoja obrona', icon: 'shield', color: '#ff6b6b' };
  };

  // Get all players who scored goals
  const getPlayersWithGoals = () => {
    if (!matchData) return [];

    // Build unique scorers from goals (works even without lineup)
    const seen = new Set<string>();
    return matchData.goals
      .filter((g) => {
        if (seen.has(g.scorerId)) return false;
        seen.add(g.scorerId);
        return true;
      })
      .map((g) => ({ id: g.scorerId, name: g.scorer }));
  };

  // Get goals for selected player
  const getPlayerGoals = (): MatchGoal[] => {
    if (!matchData || !selectedPlayerId) return [];
    return matchData.goals.filter((g) => g.scorerId === selectedPlayerId);
  };

  // Get tracking points for a time window before a goal
  const getGoalTrackingPoints = (goal: MatchGoal): TransformedPoint[] => {
    if (!visualizationData || !rawPoints || !matchData) return [];

    // Use matchStartEpoch if available, otherwise fall back to first GPS point
    const matchStartEpoch =
      matchData.matchStartEpoch ?? Math.floor(new Date(rawPoints[0].time).getTime() / 1000);

    const goalEpoch = matchStartEpoch + goal.sec;
    const windowStart = (goalEpoch - goalWindowSeconds) * 1000;
    const windowEnd = goalEpoch * 1000;

    // Get full segment tracking points (use first segment = full match)
    const allPoints = visualizationData.segments[0]?.trackingPoints ?? [];

    // Filter points by time window, drop last 2 points
    // (goal timestamp is registered 2-3s after the actual goal)
    const filtered = allPoints.filter((p) => {
      const t = new Date(p.time).getTime();
      return t >= windowStart && t <= windowEnd;
    });
    return filtered.length > 2 ? filtered.slice(0, -2) : filtered;
  };

  // Find which team the player belongs to
  const getPlayerTeam = (): string | null => {
    if (!matchData || !selectedPlayerId) return null;

    // Try lineup first
    if (matchData.lineup) {
      if (matchData.lineup.teamA?.find((p) => p.id === selectedPlayerId)) return matchData.teamA;
      if (matchData.lineup.teamB?.find((p) => p.id === selectedPlayerId)) return matchData.teamB;
    }

    // Fallback: get team from goal data
    const playerGoal = matchData.goals.find((g) => g.scorerId === selectedPlayerId);
    if (playerGoal) {
      return playerGoal.team === 'A' ? matchData.teamA : matchData.teamB;
    }
    return null;
  };

  const formatGoalTime = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}'${s.toString().padStart(2, '0')}`;
  };

  const playersWithGoals = getPlayersWithGoals();
  const playerGoals = getPlayerGoals();
  const playerTeam = getPlayerTeam();

  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/analysis')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(202, 253, 0, 0.3)',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-primary)'
            }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="app-header-title">ANALIZA GOLI</h1>
            <p className="app-header-subtitle">Wizualizacja biegu przed strzeleniem gola</p>
          </div>
        </div>
      </header>

      {/* Auto-fetch match data */}
      {!matchData && (
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={handleAutoFetch}
            disabled={matchLoading}
            style={{
              padding: '0.75rem 1.5rem',
              background: matchLoading ? 'rgba(202, 253, 0, 0.3)' : 'var(--color-primary)',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: matchLoading ? 'wait' : 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
              {matchLoading ? 'hourglass_top' : 'search'}
            </span>
            {matchLoading ? 'Szukam meczu...' : 'Znajdź mecz z tego dnia'}
          </button>
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
            Sesja z:{' '}
            {new Date(visualizationData.activityDate).toLocaleDateString('pl-PL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      )}

      {matchData && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button
            onClick={() => {
              stopAnimation();
              clearMatchData();
            }}
            style={{
              padding: '0.4rem 0.75rem',
              background: 'transparent',
              border: '1px solid rgba(255, 100, 100, 0.2)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              color: '#ff6b6b',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>
              close
            </span>
            Wyczyść mecz
          </button>
        </div>
      )}

      {/* Error */}
      {matchError && (
        <div
          style={{
            padding: '1rem',
            background: 'rgba(255, 100, 100, 0.1)',
            border: '1px solid rgba(255, 100, 100, 0.3)',
            borderRadius: '0.5rem',
            color: '#ff6b6b',
            marginBottom: '1.5rem'
          }}
        >
          {matchError}
        </div>
      )}

      {/* Match info */}
      {matchData && (
        <>
          <div
            style={{
              padding: '1.5rem',
              background: 'rgba(202, 253, 0, 0.05)',
              border: '1px solid rgba(202, 253, 0, 0.15)',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                fontSize: '1.5rem',
                fontWeight: 700
              }}
            >
              <span style={{ color: '#fff' }}>{matchData.teamA}</span>
              <span style={{ color: '#cafd00', fontSize: '2rem' }}>
                {matchData.scoreA} : {matchData.scoreB}
              </span>
              <span style={{ color: '#fff' }}>{matchData.teamB}</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Czas meczu: {Math.floor(matchData.duration / 60)} min &bull; Gole:{' '}
              {matchData.goals.length}
            </p>
          </div>

          {/* Player selector - split by team */}
          {(() => {
            const myTeamName =
              myTeam === 'A' ? matchData.teamA : myTeam === 'B' ? matchData.teamB : null;
            const opponentTeamName =
              myTeam === 'A' ? matchData.teamB : myTeam === 'B' ? matchData.teamA : null;

            const myTeamPlayers = playersWithGoals.filter((p) => {
              const team = matchData.goals.find((g) => g.scorerId === p.id)?.team;
              return team === myTeam;
            });
            const opponentPlayers = playersWithGoals.filter((p) => {
              const team = matchData.goals.find((g) => g.scorerId === p.id)?.team;
              return team !== myTeam;
            });

            const renderPlayerButton = (
              player: { id: string; name: string },
              teamColor: string
            ) => {
              const goalCount = matchData.goals.filter((g) => g.scorerId === player.id).length;
              const isSelected = selectedPlayerId === player.id;
              const isMe = player.id === myPlayerId;

              return (
                <button
                  key={player.id}
                  onClick={() => {
                    stopAnimation();
                    setSelectedPlayerId(isSelected ? null : player.id);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: isSelected ? `${teamColor}20` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isSelected ? `${teamColor}80` : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '0.5rem',
                    color: isSelected ? teamColor : '#ccc',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'all 0.2s'
                  }}
                >
                  {isMe && '⚡ '}
                  {player.name}
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      background: isSelected ? `${teamColor}40` : 'rgba(255,255,255,0.1)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem'
                    }}
                  >
                    {goalCount}
                  </span>
                </button>
              );
            };

            return (
              <div
                style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}
              >
                {/* My team */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#4ecdc4',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                      shield
                    </span>
                    Moja drużyna {myTeamName && `(${myTeamName})`}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {myTeamPlayers.map((p) =>
                      renderPlayerButton(p, p.id === myPlayerId ? '#cafd00' : '#4ecdc4')
                    )}
                  </div>
                </div>

                {/* Opponents */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#ff6b6b',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                      swords
                    </span>
                    Rywale {opponentTeamName && `(${opponentTeamName})`}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {opponentPlayers.map((p) => renderPlayerButton(p, '#ff6b6b'))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Time window slider */}
          {selectedPlayerId && (
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <label style={{ color: '#64748b', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                Okno czasowe przed golem:
              </label>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={goalWindowSeconds}
                onChange={(e) => setGoalWindowSeconds(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#cafd00' }}
              />
              <span
                style={{
                  color: '#cafd00',
                  fontWeight: 700,
                  fontSize: '1rem',
                  minWidth: '3rem',
                  textAlign: 'center'
                }}
              >
                {goalWindowSeconds}s
              </span>
            </div>
          )}

          {/* Goal maps */}
          {selectedPlayerId && playerGoals.length > 0 && (
            <>
              <h2
                style={{
                  color: '#fff',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem'
                }}
              >
                Gole: {playersWithGoals.find((p) => p.id === selectedPlayerId)?.name}
                {playerTeam && (
                  <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.9rem' }}>
                    {' '}
                    ({playerTeam})
                  </span>
                )}
              </h2>

              <div className="pitch-grid">
                {playerGoals.map((goal, index) => {
                  const points = getGoalTrackingPoints(goal);
                  const hasPoints = points.length > 0;
                  const isThisPlaying = playingGoalIndex === index;
                  const ctx = getGoalContext(goal);

                  return (
                    <div key={index} className="pitch-wrapper">
                      <h3 className="segment-title">
                        Gol #{index + 1}
                        <span className="segment-time">{formatGoalTime(goal.sec)}</span>
                        {goal.ownGoal && (
                          <span style={{ color: '#ff6b6b', fontSize: '0.75rem' }}>(samobój)</span>
                        )}
                      </h3>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          marginBottom: '0.5rem',
                          fontSize: '0.8rem',
                          color: ctx.color
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                          {ctx.icon}
                        </span>
                        {ctx.label}
                      </div>

                      {!hasPoints && (
                        <div
                          style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: '#64748b',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(255,255,255,0.06)'
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '2rem', opacity: 0.3 }}
                          >
                            gps_off
                          </span>
                          <p style={{ marginTop: '0.5rem' }}>
                            Brak punktów GPS w oknie {goalWindowSeconds}s przed golem
                          </p>
                        </div>
                      )}

                      {hasPoints && (
                        <>
                          {/* Play / Stop button */}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              marginBottom: '0.5rem'
                            }}
                          >
                            <button
                              onClick={() => {
                                if (isThisPlaying) {
                                  stopAnimation();
                                } else {
                                  stopAnimation();
                                  setAnimFrameIndex(0);
                                  maxFramesRef.current = points.length;
                                  setPlayingGoalIndex(index);
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1.25rem',
                                background: isThisPlaying
                                  ? 'rgba(255, 100, 100, 0.15)'
                                  : 'rgba(202, 253, 0, 0.12)',
                                border: `1px solid ${isThisPlaying ? 'rgba(255, 100, 100, 0.4)' : 'rgba(202, 253, 0, 0.3)'}`,
                                borderRadius: '2rem',
                                cursor: 'pointer',
                                color: isThisPlaying ? '#ff6b6b' : '#cafd00',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                              }}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '1.2rem' }}
                              >
                                {isThisPlaying ? 'stop' : 'play_arrow'}
                              </span>
                              {isThisPlaying ? 'Stop' : 'Play'}
                            </button>
                          </div>

                          <div className="pitch-with-controls">
                            <div className="pitch-canvas-area">
                              <Pitch
                                pitchCorners={visualizationData.pitchCorners}
                                trackingPoints={points}
                                width={visualizationData.canvasWidth}
                                height={visualizationData.canvasHeight}
                                rotationAngle={90}
                                showActivityPoints={false}
                                showHeatmap={false}
                                showSpeedTrail={true}
                                animateTrailIndex={isThisPlaying ? animFrameIndex : null}
                                satellite={null}
                                centerCircleRadius={visualizationData.centerCircleRadius}
                                pitchDimensions={visualizationData.pitchInfo.dimensions}
                                goal={visualizationData.goal}
                                penaltyBox={visualizationData.penaltyBox}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {hasPoints && (
                        <div
                          style={{
                            display: 'flex',
                            gap: '1.5rem',
                            justifyContent: 'center',
                            marginTop: '0.75rem',
                            fontSize: '0.8rem',
                            color: '#64748b'
                          }}
                        >
                          <span>Punkty GPS: {points.length}</span>
                          <span>Okno: {goalWindowSeconds}s</span>
                          {goal.assist && <span>Asysta: {goal.assist}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {selectedPlayerId && playerGoals.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#64748b'
              }}
            >
              Ten piłkarz nie strzelił żadnego gola w tym meczu
            </div>
          )}

          {!selectedPlayerId && (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#64748b'
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '3rem', opacity: 0.3, display: 'block', marginBottom: '1rem' }}
              >
                person_search
              </span>
              Wybierz piłkarza, aby zobaczyć jego gole
            </div>
          )}
        </>
      )}
    </>
  );
};

export default GoalAnalysis;
