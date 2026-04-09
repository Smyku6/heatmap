import { getPitchesList } from '../config/pitches';

// Sprawdza czy punkt jest wewnątrz czworokąta (algorytm ray casting)
const isPointInPolygon = (point, polygon) => {
  const { lat, lon } = point;
  const vertices = [
    polygon.topLeft,
    polygon.topRight,
    polygon.bottomRight,
    polygon.bottomLeft
  ];

  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].lon, yi = vertices[i].lat;
    const xj = vertices[j].lon, yj = vertices[j].lat;

    const intersect = ((yi > lat) !== (yj > lat))
      && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
};

// Automatycznie wykrywa boisko na podstawie punktów GPS
export const autoDetectPitch = (trackingPoints) => {
  if (!trackingPoints || trackingPoints.length === 0) {
    return null;
  }

  const pitches = getPitchesList();
  let bestMatch = null;
  let maxPointsInside = 0;

  // Dla każdego boiska policz ile punktów jest w środku
  pitches.forEach(pitch => {
    let pointsInside = 0;

    trackingPoints.forEach(point => {
      if (isPointInPolygon(point, pitch.corners)) {
        pointsInside++;
      }
    });

    // Sprawdź czy to lepsze dopasowanie
    if (pointsInside > maxPointsInside) {
      maxPointsInside = pointsInside;
      bestMatch = pitch;
    }
  });

  // Jeśli przynajmniej 10% punktów jest w boisku, uznaj za dopasowanie
  const threshold = trackingPoints.length * 0.1;
  if (maxPointsInside >= threshold && bestMatch) {
    console.log(`Auto-detected pitch: ${bestMatch.name} (${maxPointsInside}/${trackingPoints.length} points inside)`);
    return bestMatch.id;
  }

  console.log('No pitch detected, using default');
  return null;
};
