import React from 'react';

/**
 * Komponent renderujący warstwę heatmapy w SVG
 * Używa radial gradients dla każdego punktu aby stworzyć efekt ciepłej mapy
 */
const HeatmapLayer = ({ trackingPoints, intensity = 30, opacity = 0.6, densityRadius = 5 }) => {
  if (!trackingPoints || trackingPoints.length === 0) return null;

  // Grupuj punkty po pozycji (agreguj punkty w tym samym miejscu)
  const pointDensity = {};

  trackingPoints.forEach(point => {
    const key = `${Math.round(point.x / densityRadius)}_${Math.round(point.y / densityRadius)}`;
    if (!pointDensity[key]) {
      pointDensity[key] = {
        x: point.x,
        y: point.y,
        count: 0
      };
    }
    pointDensity[key].count++;
  });

  // Konwertuj na tablicę i sortuj po gęstości
  const densityPoints = Object.values(pointDensity);
  const maxCount = Math.max(...densityPoints.map(p => p.count));

  return (
    <g className="heatmap-layer">
      <defs>
        {/* Gradient dla każdego poziomu intensywności */}
        {[1, 2, 3, 4, 5].map(level => (
          <radialGradient key={level} id={`heatGradient-${level}`}>
            <stop offset="0%" stopColor={getHeatColor(level / 5)} stopOpacity={opacity} />
            <stop offset="50%" stopColor={getHeatColor(level / 5)} stopOpacity={opacity * 0.5} />
            <stop offset="100%" stopColor={getHeatColor(level / 5)} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {/* Renderuj heat blobs */}
      {densityPoints.map((point, index) => {
        const normalizedIntensity = point.count / maxCount;
        const radius = intensity * (0.5 + normalizedIntensity * 0.5); // 50-100% intensywności
        const level = Math.ceil(normalizedIntensity * 5); // 1-5

        return (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={radius}
            fill={`url(#heatGradient-${level})`}
          />
        );
      })}
    </g>
  );
};

// Funkcja zwracająca kolor dla danej intensywności (0-1)
// Klasyczna paleta heatmapy: przezroczysty -> niebieski -> zielony -> żółty -> czerwony
const getHeatColor = (intensity) => {
  if (intensity < 0.2) return 'rgba(0, 0, 255, 0.8)';     // niebieski
  if (intensity < 0.4) return 'rgba(0, 255, 255, 0.9)';   // cyan
  if (intensity < 0.6) return 'rgba(0, 255, 0, 1)';       // zielony
  if (intensity < 0.8) return 'rgba(255, 255, 0, 1)';     // żółty
  if (intensity < 0.95) return 'rgba(255, 128, 0, 1)';    // pomarańczowy
  return 'rgba(255, 0, 0, 1)';                             // czerwony
};

export default HeatmapLayer;
