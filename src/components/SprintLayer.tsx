import React from 'react';
import type { Sprint } from '../types';

interface SprintLayerProps {
  sprints?: Sprint[];
  simplified?: boolean;
  showNumbers?: boolean;
}

/**
 * Komponent renderujący warstwę sprintów jako strzałki w SVG
 */
const SprintLayer: React.FC<SprintLayerProps> = ({ sprints, simplified = true, showNumbers = false }) => {
  if (!sprints || sprints.length === 0) return null;

  // Funkcja zwracająca kolor na podstawie prędkości
  const getSpeedColor = (speed: number): string => {
    if (speed >= 25) return '#ff0000';      // Czerwony >25 km/h
    if (speed >= 23) return '#ff8800';      // Pomarańczowy 23-25 km/h
    if (speed >= 20) return '#ffdd00';      // Żółty 20-23 km/h
    return '#00ff00';                        // Zielony 18-20 km/h
  };

  return (
    <g className="sprint-layer">
      <defs>
        {/* Definicje strzałek dla różnych kolorów */}
        {['#00ff00', '#ffdd00', '#ff8800', '#ff0000'].map(color => (
          <marker
            key={color}
            id={`arrowhead-${color.replace('#', '')}`}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L0,6 L9,3 z"
              fill={color}
            />
          </marker>
        ))}
      </defs>

      {sprints.map((sprint, index) => {
        const color = getSpeedColor(sprint.maxSpeed);
        const markerId = `arrowhead-${color.replace('#', '')}`;

        if (simplified) {
          // Prosta strzałka od punktu startowego do końcowego
          return (
            <g key={index}>
              <line
                x1={sprint.startPoint.x}
                y1={sprint.startPoint.y}
                x2={sprint.endPoint.x}
                y2={sprint.endPoint.y}
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                markerEnd={`url(#${markerId})`}
                opacity={0.8}
              />
              {showNumbers && (
                <text
                  x={(sprint.startPoint.x + sprint.endPoint.x) / 2}
                  y={(sprint.startPoint.y + sprint.endPoint.y) / 2}
                  fill="#fff"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  stroke="#000"
                  strokeWidth="0.5"
                >
                  {index + 1}
                </text>
              )}
            </g>
          );
        } else {
          // Szczegółowa polyline pokazująca dokładną ścieżkę
          const points = sprint.points.map(p => `${p.x},${p.y}`).join(' ');
          return (
            <g key={index}>
              <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd={`url(#${markerId})`}
                opacity={0.8}
              />
              {showNumbers && (
                <text
                  x={sprint.endPoint.x}
                  y={sprint.endPoint.y - 10}
                  fill="#fff"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  stroke="#000"
                  strokeWidth="0.5"
                >
                  {index + 1}
                </text>
              )}
            </g>
          );
        }
      })}
    </g>
  );
};

export default SprintLayer;
