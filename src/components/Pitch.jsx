import React from 'react';
import './Pitch.css';

const Pitch = ({ pitchCorners, trackingPoints, width = 1000, height = 800, duration, distance, avgHeartRate, rotationAngle = 0, showActivityPoints = true, satellite = null, satelliteTransform = { scale: 1, rotation: 0, translateX: 0, translateY: 0 } }) => {
  if (!pitchCorners || !trackingPoints) return null;

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
    x: (pitchCorners.topLeft.x + pitchCorners.topRight.x + pitchCorners.bottomLeft.x + pitchCorners.bottomRight.x) / 4,
    y: (pitchCorners.topLeft.y + pitchCorners.topRight.y + pitchCorners.bottomLeft.y + pitchCorners.bottomRight.y) / 4
  };


  return (
    <div className="pitch-container">
      <svg width={width} height={height} className="pitch-svg">
        {/* Tło */}
        <rect x={0} y={0} width={width} height={height} fill="#1a1a1a" />

        {/* Grupa z rotacją - wszystko co ma się obracać */}
        <g transform={`rotate(${rotationAngle}, ${centerX}, ${centerY})`}>

        {/* Obraz satelitarny w tle (jeśli istnieje) */}
        {satellite && (
          <g transform={`
            translate(${pitchCenter.x}, ${pitchCenter.y})
            rotate(${satelliteTransform.rotation})
            scale(${satelliteTransform.scale})
            translate(${satelliteTransform.translateX}, ${satelliteTransform.translateY})
          `}>
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
          fill={satellite ? "rgba(45, 80, 22, 0.3)" : "#2d5016"}
          stroke="#fff"
          strokeWidth="3"
        />

        {/* Markery narożników boiska */}
        {Object.entries(pitchCorners).map(([key, corner]) => (
          <g key={key}>
            <circle
              cx={corner.x}
              cy={corner.y}
              r={8}
              fill="#ff00ff"
              opacity={0.8}
            />
            <text
              x={corner.x}
              y={corner.y - 15}
              fill="#fff"
              fontSize="12"
              textAnchor="middle"
              fontWeight="bold"
            >
              {key}
            </text>
          </g>
        ))}

        {/* Punkty GPS trackingu */}
        {showActivityPoints && trackingPoints.map((point, index) => (
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
            points={trackingPoints.map(p => `${p.x},${p.y}`).join(' ')}
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
            <span className="stat-value">{(distance / 1000).toFixed(2)} km</span>
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

const getColorByHeartRate = (hr) => {
  if (!hr) return '#4ecdc4';
  if (hr < 100) return '#4ecdc4';
  if (hr < 130) return '#95e1d3';
  if (hr < 160) return '#ffd93d';
  return '#ff6b6b';
};

export default Pitch;
