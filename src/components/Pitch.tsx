import React, { useState } from 'react';

import HeatmapLayer from './HeatmapLayer';
import SprintLayer from './SprintLayer';

import type {
  TransformedPoint,
  HeatmapSettings,
  SatelliteTransform,
  SatelliteData,
  Sprint,
  SprintSettings,
  GoalDimensions,
  PenaltyBoxDimensions,
  PitchCorner,
  PitchCorners
} from '../types';
import './Pitch.css';

interface PitchProps {
  pitchCorners: PitchCorners;
  trackingPoints: TransformedPoint[];
  width?: number;
  height?: number;
  duration?: { formatted: string; seconds: number; timeRange?: string };
  distance?: { formatted: string; meters: number };
  avgHeartRate?: number | null;
  rotationAngle?: number;
  showActivityPoints?: boolean;
  showHeatmap?: boolean;
  heatmapSettings?: HeatmapSettings;
  satellite?: SatelliteData | null;
  satelliteTransform?: SatelliteTransform;
  centerCircleRadius?: number;
  pitchDimensions?: { length: number; width: number };
  goal?: GoalDimensions;
  penaltyBox?: PenaltyBoxDimensions;
  showAveragePosition?: boolean;
  showSprints?: boolean;
  sprints?: Sprint[];
  sprintSettings?: SprintSettings;
}

const Pitch: React.FC<PitchProps> = ({
  pitchCorners,
  trackingPoints,
  width = 1000,
  height = 800,
  duration,
  distance,
  avgHeartRate,
  rotationAngle = 0,
  showActivityPoints = true,
  showHeatmap = false,
  heatmapSettings = {
    intensity: 14,
    opacity: 0.65,
    densityRadius: 10,
    colorPalette: 'classic',
    minThreshold: 0
  },
  satellite = null,
  satelliteTransform = { scale: 1, rotation: 0, translateX: 0, translateY: 0 },
  centerCircleRadius = 5,
  pitchDimensions = { length: 56, width: 26 },
  goal = { width: 5, height: 1 },
  penaltyBox = { width: 10, length: 5, goalBoxWidth: 5, goalBoxLength: 2 },
  showAveragePosition = false,
  showSprints = false,
  sprints = [],
  sprintSettings = {
    minSpeed: 16.5,
    minDuration: 2,
    minDistance: 10,
    simplified: true,
    showNumbers: false
  }
}) => {
  const [showAvgTooltip, setShowAvgTooltip] = useState(false);

  if (!pitchCorners || !trackingPoints) {
    return null;
  }

  // Czworokąt boiska (polygon z 4 narożników GPS)
  const pitchPolygonPoints = `
    ${pitchCorners.topLeft.x},${pitchCorners.topLeft.y}
    ${pitchCorners.topRight.x},${pitchCorners.topRight.y}
    ${pitchCorners.bottomRight.x},${pitchCorners.bottomRight.y}
    ${pitchCorners.bottomLeft.x},${pitchCorners.bottomLeft.y}
  `;

  // Centrum SVG dla rotacji
  const centerX = width / 2;
  const centerY = height / 2;

  // Centrum boiska dla obrazu satelitarnego (punkt odniesienia dla transformacji)
  const pitchCenter = {
    x:
      (pitchCorners.topLeft.x +
        pitchCorners.topRight.x +
        pitchCorners.bottomLeft.x +
        pitchCorners.bottomRight.x) /
      4,
    y:
      (pitchCorners.topLeft.y +
        pitchCorners.topRight.y +
        pitchCorners.bottomLeft.y +
        pitchCorners.bottomRight.y) /
      4
  };

  // Punkt środkowy linii środkowej (środek boiska)
  const midlineCenter = {
    x:
      ((pitchCorners.topLeft.x + pitchCorners.bottomLeft.x) / 2 +
        (pitchCorners.topRight.x + pitchCorners.bottomRight.x) / 2) /
      2,
    y:
      ((pitchCorners.topLeft.y + pitchCorners.bottomLeft.y) / 2 +
        (pitchCorners.topRight.y + pitchCorners.bottomRight.y) / 2) /
      2
  };

  // Oblicz promień koła środkowego w pikselach SVG
  // Szerokość boiska w metrach i szerokość w pikselach SVG
  const pitchWidthMeters = pitchDimensions.width;
  const pitchWidthPixels = Math.sqrt(
    Math.pow(pitchCorners.topLeft.x - pitchCorners.topRight.x, 2) +
      Math.pow(pitchCorners.topLeft.y - pitchCorners.topRight.y, 2)
  );
  const metersToPixels = pitchWidthPixels / pitchWidthMeters;
  const centerCircleRadiusPixels = centerCircleRadius * metersToPixels;

  // Oblicz wymiary bramki w pikselach
  const goalWidthPixels = goal.width * metersToPixels;
  const goalDepthPixels = (goal.depth ?? 0) * metersToPixels;

  // Oblicz pozycje bramek
  // Górna bramka (między topLeft i topRight)
  const topGoalCenter = {
    x: (pitchCorners.topLeft.x + pitchCorners.topRight.x) / 2,
    y: (pitchCorners.topLeft.y + pitchCorners.topRight.y) / 2
  };

  // Wektor od topLeft do topRight (kierunek bramki)
  const topGoalVector = {
    x: pitchCorners.topRight.x - pitchCorners.topLeft.x,
    y: pitchCorners.topRight.y - pitchCorners.topLeft.y
  };
  const topGoalVectorLength = Math.sqrt(topGoalVector.x ** 2 + topGoalVector.y ** 2);
  const topGoalVectorNormalized = {
    x: topGoalVector.x / topGoalVectorLength,
    y: topGoalVector.y / topGoalVectorLength
  };

  // Wektor prostopadły (na zewnątrz boiska)
  const topGoalPerpendicular = {
    x: topGoalVectorNormalized.y,
    y: -topGoalVectorNormalized.x
  };

  // Dolna bramka (między bottomLeft i bottomRight)
  const bottomGoalCenter = {
    x: (pitchCorners.bottomLeft.x + pitchCorners.bottomRight.x) / 2,
    y: (pitchCorners.bottomLeft.y + pitchCorners.bottomRight.y) / 2
  };

  const bottomGoalVector = {
    x: pitchCorners.bottomRight.x - pitchCorners.bottomLeft.x,
    y: pitchCorners.bottomRight.y - pitchCorners.bottomLeft.y
  };
  const bottomGoalVectorLength = Math.sqrt(bottomGoalVector.x ** 2 + bottomGoalVector.y ** 2);
  const bottomGoalVectorNormalized = {
    x: bottomGoalVector.x / bottomGoalVectorLength,
    y: bottomGoalVector.y / bottomGoalVectorLength
  };

  const bottomGoalPerpendicular = {
    x: -bottomGoalVectorNormalized.y,
    y: bottomGoalVectorNormalized.x
  };

  // Oblicz wymiary pola karnego w pikselach
  const penaltyBoxWidthPixels = penaltyBox.width * metersToPixels;
  const penaltyBoxDepthPixels = (penaltyBox.depth ?? 0) * metersToPixels;

  return (
    <div className="pitch-container">
      <svg width={width} height={height} className="pitch-svg">
        {/* Tło */}
        <rect x={0} y={0} width={width} height={height} fill="#1a1a1a" />

        {/* Grupa z rotacją - wszystko co ma się obracać */}
        <g transform={`rotate(${rotationAngle}, ${centerX}, ${centerY})`}>
          {/* Obraz satelitarny w tle (jeśli istnieje) */}
          {satellite && (
            <g
              transform={`
            translate(${pitchCenter.x}, ${pitchCenter.y})
            rotate(${satelliteTransform.rotation})
            scale(${satelliteTransform.scale})
            translate(${satelliteTransform.translateX}, ${satelliteTransform.translateY})
          `}
            >
              <image
                href={`${import.meta.env.BASE_URL}${satellite.image.startsWith('/') ? satellite.image.slice(1) : satellite.image}`}
                x={-width}
                y={-height}
                width={width * 2}
                height={height * 2}
                opacity={0.6}
                preserveAspectRatio="xMidYMid meet"
              />
            </g>
          )}

          {/* Boisko - czworokąt z 4 narożników GPS */}
          <polygon
            points={pitchPolygonPoints}
            fill={satellite ? 'rgba(45, 80, 22, 0.3)' : '#2d5016'}
            stroke="#fff"
            strokeWidth="3"
          />

          {/* Linia środkowa boiska */}
          <line
            x1={(pitchCorners.topLeft.x + pitchCorners.bottomLeft.x) / 2}
            y1={(pitchCorners.topLeft.y + pitchCorners.bottomLeft.y) / 2}
            x2={(pitchCorners.topRight.x + pitchCorners.bottomRight.x) / 2}
            y2={(pitchCorners.topRight.y + pitchCorners.bottomRight.y) / 2}
            stroke="#fff"
            strokeWidth="2"
            opacity={0.5}
          />

          {/* Koło środkowe */}
          <circle
            cx={midlineCenter.x}
            cy={midlineCenter.y}
            r={centerCircleRadiusPixels}
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            opacity={0.5}
          />

          {/* Pola karne */}
          {/* Górne pole karne - wchodzi w boisko (odwrotny kierunek niż bramka) */}
          <polygon
            points={`
            ${topGoalCenter.x - (penaltyBoxWidthPixels / 2) * topGoalVectorNormalized.x},${topGoalCenter.y - (penaltyBoxWidthPixels / 2) * topGoalVectorNormalized.y}
            ${topGoalCenter.x + (penaltyBoxWidthPixels / 2) * topGoalVectorNormalized.x},${topGoalCenter.y + (penaltyBoxWidthPixels / 2) * topGoalVectorNormalized.y}
            ${topGoalCenter.x + (penaltyBoxWidthPixels / 2) * topGoalVectorNormalized.x - topGoalPerpendicular.x * penaltyBoxDepthPixels},${topGoalCenter.y + (penaltyBoxWidthPixels / 2) * topGoalVectorNormalized.y - topGoalPerpendicular.y * penaltyBoxDepthPixels}
            ${topGoalCenter.x - (penaltyBoxWidthPixels / 2) * topGoalVectorNormalized.x - topGoalPerpendicular.x * penaltyBoxDepthPixels},${topGoalCenter.y - (penaltyBoxWidthPixels / 2) * topGoalVectorNormalized.y - topGoalPerpendicular.y * penaltyBoxDepthPixels}
          `}
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            opacity={0.5}
          />

          {/* Dolne pole karne - wchodzi w boisko (odwrotny kierunek niż bramka) */}
          <polygon
            points={`
            ${bottomGoalCenter.x - (penaltyBoxWidthPixels / 2) * bottomGoalVectorNormalized.x},${bottomGoalCenter.y - (penaltyBoxWidthPixels / 2) * bottomGoalVectorNormalized.y}
            ${bottomGoalCenter.x + (penaltyBoxWidthPixels / 2) * bottomGoalVectorNormalized.x},${bottomGoalCenter.y + (penaltyBoxWidthPixels / 2) * bottomGoalVectorNormalized.y}
            ${bottomGoalCenter.x + (penaltyBoxWidthPixels / 2) * bottomGoalVectorNormalized.x - bottomGoalPerpendicular.x * penaltyBoxDepthPixels},${bottomGoalCenter.y + (penaltyBoxWidthPixels / 2) * bottomGoalVectorNormalized.y - bottomGoalPerpendicular.y * penaltyBoxDepthPixels}
            ${bottomGoalCenter.x - (penaltyBoxWidthPixels / 2) * bottomGoalVectorNormalized.x - bottomGoalPerpendicular.x * penaltyBoxDepthPixels},${bottomGoalCenter.y - (penaltyBoxWidthPixels / 2) * bottomGoalVectorNormalized.y - bottomGoalPerpendicular.y * penaltyBoxDepthPixels}
          `}
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            opacity={0.5}
          />

          {/* Bramki */}
          {/* Górna bramka - polygon z 4 punktami */}
          <polygon
            points={`
            ${topGoalCenter.x - (goalWidthPixels / 2) * topGoalVectorNormalized.x},${topGoalCenter.y - (goalWidthPixels / 2) * topGoalVectorNormalized.y}
            ${topGoalCenter.x + (goalWidthPixels / 2) * topGoalVectorNormalized.x},${topGoalCenter.y + (goalWidthPixels / 2) * topGoalVectorNormalized.y}
            ${topGoalCenter.x + (goalWidthPixels / 2) * topGoalVectorNormalized.x + topGoalPerpendicular.x * goalDepthPixels},${topGoalCenter.y + (goalWidthPixels / 2) * topGoalVectorNormalized.y + topGoalPerpendicular.y * goalDepthPixels}
            ${topGoalCenter.x - (goalWidthPixels / 2) * topGoalVectorNormalized.x + topGoalPerpendicular.x * goalDepthPixels},${topGoalCenter.y - (goalWidthPixels / 2) * topGoalVectorNormalized.y + topGoalPerpendicular.y * goalDepthPixels}
          `}
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            opacity={0.6}
          />

          {/* Dolna bramka - polygon z 4 punktami */}
          <polygon
            points={`
            ${bottomGoalCenter.x - (goalWidthPixels / 2) * bottomGoalVectorNormalized.x},${bottomGoalCenter.y - (goalWidthPixels / 2) * bottomGoalVectorNormalized.y}
            ${bottomGoalCenter.x + (goalWidthPixels / 2) * bottomGoalVectorNormalized.x},${bottomGoalCenter.y + (goalWidthPixels / 2) * bottomGoalVectorNormalized.y}
            ${bottomGoalCenter.x + (goalWidthPixels / 2) * bottomGoalVectorNormalized.x + bottomGoalPerpendicular.x * goalDepthPixels},${bottomGoalCenter.y + (goalWidthPixels / 2) * bottomGoalVectorNormalized.y + bottomGoalPerpendicular.y * goalDepthPixels}
            ${bottomGoalCenter.x - (goalWidthPixels / 2) * bottomGoalVectorNormalized.x + bottomGoalPerpendicular.x * goalDepthPixels},${bottomGoalCenter.y - (goalWidthPixels / 2) * bottomGoalVectorNormalized.y + bottomGoalPerpendicular.y * goalDepthPixels}
          `}
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            opacity={0.6}
          />

          {/* Warstwa heatmapy */}
          {showHeatmap && (
            <HeatmapLayer
              trackingPoints={trackingPoints}
              intensity={heatmapSettings.intensity}
              opacity={heatmapSettings.opacity}
              densityRadius={heatmapSettings.densityRadius}
              colorPalette={heatmapSettings.colorPalette}
              minThreshold={heatmapSettings.minThreshold}
            />
          )}

          {/* Warstwa sprintów */}
          {showSprints && (
            <SprintLayer
              sprints={sprints}
              simplified={sprintSettings.simplified}
              showNumbers={sprintSettings.showNumbers}
            />
          )}

          {/* Średnia pozycja */}
          {showAveragePosition &&
            trackingPoints.length > 0 &&
            (() => {
              const avgX = trackingPoints.reduce((sum, p) => sum + p.x, 0) / trackingPoints.length;
              const avgY = trackingPoints.reduce((sum, p) => sum + p.y, 0) / trackingPoints.length;

              // Oblicz dodatkowe statystyki
              const pointsWithHR = trackingPoints.filter((p) => p.heartRate);
              const avgHR =
                pointsWithHR.length > 0
                  ? Math.round(
                      pointsWithHR.reduce((sum, p) => sum + (p.heartRate ?? 0), 0) /
                        pointsWithHR.length
                    )
                  : null;

              const pointsWithSpeed = trackingPoints.filter((p) => p.speed);
              const avgSpeed =
                pointsWithSpeed.length > 0
                  ? (
                      pointsWithSpeed.reduce((sum, p) => sum + (p.speed ?? 0), 0) /
                      pointsWithSpeed.length
                    ).toFixed(1)
                  : null;

              // Tooltip po prawej lub lewej stronie, zależnie od pozycji punktu
              const tooltipOnRight = avgX < width / 2;
              const tooltipX = tooltipOnRight ? avgX + 20 : avgX - 20;
              const tooltipY = avgY;
              const boxWidth = 160;
              const boxHeight = avgHR && avgSpeed ? 72 : avgHR || avgSpeed ? 54 : 36;
              const boxX = tooltipOnRight ? tooltipX : tooltipX - boxWidth;
              const boxY = tooltipY - boxHeight / 2;

              return (
                <g
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setShowAvgTooltip(true)}
                  onMouseLeave={() => setShowAvgTooltip(false)}
                >
                  {/* Zewnętrzny pulsujący okrąg */}
                  <circle
                    cx={avgX}
                    cy={avgY}
                    r={18}
                    fill="none"
                    stroke="#cafd00"
                    strokeWidth="2"
                    opacity={0.5}
                  >
                    <animate
                      attributeName="r"
                      values="14;22;14"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0.2;0.6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  {/* Główny punkt */}
                  <circle
                    cx={avgX}
                    cy={avgY}
                    r={10}
                    fill="#cafd00"
                    stroke="#fff"
                    strokeWidth="2.5"
                    opacity={0.9}
                  />
                  {/* Wewnętrzny punkt */}
                  <circle cx={avgX} cy={avgY} r={4} fill="#0a0a0a" opacity={0.8} />

                  {/* Tooltip */}
                  {showAvgTooltip && (
                    <g>
                      {/* Linia łącząca punkt z tooltipem */}
                      <line
                        x1={avgX}
                        y1={avgY}
                        x2={tooltipOnRight ? boxX : boxX + boxWidth}
                        y2={tooltipY}
                        stroke="#cafd00"
                        strokeWidth="1"
                        opacity={0.5}
                      />
                      {/* Tło tooltipa */}
                      <rect
                        x={boxX}
                        y={boxY}
                        width={boxWidth}
                        height={boxHeight}
                        rx={6}
                        fill="rgba(10, 10, 10, 0.9)"
                        stroke="#cafd00"
                        strokeWidth="1"
                      />
                      {/* Tytuł */}
                      <text
                        x={boxX + 10}
                        y={boxY + 16}
                        fill="#cafd00"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        Średnia pozycja
                      </text>
                      {/* Punkty GPS */}
                      <text
                        x={boxX + 10}
                        y={boxY + 32}
                        fill="#ccc"
                        fontSize="10"
                        fontFamily="sans-serif"
                      >
                        Punkty GPS: {trackingPoints.length}
                      </text>
                      {/* Średnie tętno */}
                      {avgHR && (
                        <text
                          x={boxX + 10}
                          y={boxY + 48}
                          fill="#ccc"
                          fontSize="10"
                          fontFamily="sans-serif"
                        >
                          Śr. tętno: {avgHR} bpm
                        </text>
                      )}
                      {/* Średnia prędkość */}
                      {avgSpeed && (
                        <text
                          x={boxX + 10}
                          y={boxY + (avgHR ? 64 : 48)}
                          fill="#ccc"
                          fontSize="10"
                          fontFamily="sans-serif"
                        >
                          Śr. prędkość: {avgSpeed} km/h
                        </text>
                      )}
                    </g>
                  )}
                </g>
              );
            })()}

          {/* Markery narożników boiska */}
          {Object.entries(pitchCorners).map(([key, corner]) => {
            const c = corner as PitchCorner;
            return <circle key={key} cx={c.x} cy={c.y} r={4} fill="#ff00ff" opacity={0.6} />;
          })}

          {/* Punkty GPS trackingu */}
          {showActivityPoints &&
            trackingPoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={3}
                fill={getColorByHeartRate(point.heartRate)}
                opacity={0.7}
                className="gps-point"
              />
            ))}

          {/* Linia trasy */}
          {showActivityPoints && trackingPoints.length > 1 && (
            <polyline
              points={trackingPoints.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#ff6b6b"
              strokeWidth="2"
              opacity={0.5}
            />
          )}
        </g>
      </svg>

      <div className="stats">
        {duration && (
          <div className="stat-item">
            <span className="stat-label">Czas:</span>
            <span className="stat-value">{duration.formatted}</span>
          </div>
        )}
        {distance !== undefined && (
          <div className="stat-item">
            <span className="stat-label">Dystans:</span>
            <span className="stat-value">{(distance.meters / 1000).toFixed(2)} km</span>
          </div>
        )}
        {avgHeartRate && (
          <div className="stat-item">
            <span className="stat-label">Śr. tętno:</span>
            <span className="stat-value">{avgHeartRate} bpm</span>
          </div>
        )}
        <div className="stat-item">
          <span className="stat-label">Punkty GPS:</span>
          <span className="stat-value">{trackingPoints.length}</span>
        </div>
      </div>
    </div>
  );
};

const getColorByHeartRate = (hr: number | undefined): string => {
  if (!hr) {
    return '#4ecdc4';
  }
  if (hr < 100) {
    return '#4ecdc4';
  }
  if (hr < 130) {
    return '#95e1d3';
  }
  if (hr < 160) {
    return '#ffd93d';
  }
  return '#ff6b6b';
};

export default Pitch;
