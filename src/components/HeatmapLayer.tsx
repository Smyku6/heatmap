import React from 'react';

interface DensityPoint {
  x: number;
  y: number;
  count: number;
}

/**
 * Komponent renderujący warstwę heatmapy w SVG
 * Używa radial gradients dla każdego punktu aby stworzyć efekt ciepłej mapy
 */
const HeatmapLayer = ({
  trackingPoints,
  intensity = 30,
  opacity = 0.6,
  densityRadius = 5,
  colorPalette = 'classic',
  minThreshold = 0
}) => {
  if (!trackingPoints || trackingPoints.length === 0) return null;

  // Grupuj punkty po pozycji (agreguj punkty w tym samym miejscu)
  const pointDensity: Record<string, DensityPoint> = {};

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

  // Filtruj punkty poniżej progu minimalnego
  const filteredPoints = densityPoints.filter(point => {
    const normalizedIntensity = point.count / maxCount;
    return normalizedIntensity * 100 >= minThreshold;
  });

  return (
    <g className="heatmap-layer">
      <defs>
        {/* Gradient dla każdego poziomu intensywności */}
        {[1, 2, 3, 4, 5].map(level => (
          <radialGradient key={level} id={`heatGradient-${level}`}>
            <stop offset="0%" stopColor={getHeatColor(level / 5, colorPalette)} stopOpacity={opacity} />
            <stop offset="50%" stopColor={getHeatColor(level / 5, colorPalette)} stopOpacity={opacity * 0.5} />
            <stop offset="100%" stopColor={getHeatColor(level / 5, colorPalette)} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {/* Renderuj heat blobs */}
      {filteredPoints.map((point, index) => {
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
const getHeatColor = (intensity, palette) => {
  switch (palette) {
    case 'classic':
      // Klasyczna paleta: niebieski -> cyan -> zielony -> żółty -> pomarańczowy -> czerwony
      if (intensity < 0.2) return 'rgba(0, 0, 255, 0.8)';
      if (intensity < 0.4) return 'rgba(0, 255, 255, 0.9)';
      if (intensity < 0.6) return 'rgba(0, 255, 0, 1)';
      if (intensity < 0.8) return 'rgba(255, 255, 0, 1)';
      if (intensity < 0.95) return 'rgba(255, 128, 0, 1)';
      return 'rgba(255, 0, 0, 1)';

    case 'thermal':
      // Termalna paleta: czarny -> ciemnoczerwony -> czerwony -> pomarańczowy -> żółty
      if (intensity < 0.2) return 'rgba(0, 0, 0, 0.8)';
      if (intensity < 0.4) return 'rgba(128, 0, 0, 0.9)';
      if (intensity < 0.6) return 'rgba(255, 0, 0, 1)';
      if (intensity < 0.8) return 'rgba(255, 128, 0, 1)';
      return 'rgba(255, 255, 0, 1)';

    case 'purple':
      // Fioletowa paleta: fiolet -> różowy -> pomarańczowy -> żółty -> biały
      if (intensity < 0.2) return 'rgba(128, 0, 128, 0.8)';
      if (intensity < 0.4) return 'rgba(255, 0, 255, 0.9)';
      if (intensity < 0.6) return 'rgba(255, 128, 128, 1)';
      if (intensity < 0.8) return 'rgba(255, 255, 0, 1)';
      return 'rgba(255, 255, 255, 1)';

    case 'mono':
      // Monochromatyczna paleta: ciemny cyan -> jasny cyan
      if (intensity < 0.2) return 'rgba(0, 128, 128, 0.6)';
      if (intensity < 0.4) return 'rgba(0, 180, 180, 0.7)';
      if (intensity < 0.6) return 'rgba(0, 220, 220, 0.8)';
      if (intensity < 0.8) return 'rgba(0, 255, 255, 0.9)';
      return 'rgba(100, 255, 255, 1)';

    default:
      return 'rgba(255, 0, 0, 1)';
  }
};

export default HeatmapLayer;
