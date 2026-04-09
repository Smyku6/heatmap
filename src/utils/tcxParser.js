export const parseTCX = (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  const trackpoints = xmlDoc.getElementsByTagName('Trackpoint');
  const points = [];

  for (let i = 0; i < trackpoints.length; i++) {
    const trackpoint = trackpoints[i];
    const position = trackpoint.getElementsByTagName('Position')[0];

    if (position) {
      const lat = parseFloat(position.getElementsByTagName('LatitudeDegrees')[0]?.textContent);
      const lon = parseFloat(position.getElementsByTagName('LongitudeDegrees')[0]?.textContent);
      const time = trackpoint.getElementsByTagName('Time')[0]?.textContent;
      const heartRate = trackpoint.getElementsByTagName('HeartRateBpm')[0]
        ?.getElementsByTagName('Value')[0]?.textContent;

      if (!isNaN(lat) && !isNaN(lon)) {
        points.push({
          lat,
          lon,
          time,
          heartRate: heartRate ? parseInt(heartRate) : null
        });
      }
    }
  }

  return points;
};

// Współrzędne GPS boiska piłkarskiego (4 narożniki)
export const PITCH_CORNERS = {
  topLeft: { lat: 54.325814, lon: 18.567196 },
  topRight: { lat: 54.325968, lon: 18.567493 },
  bottomLeft: { lat: 54.325438, lon: 18.567764 },
  bottomRight: { lat: 54.325592, lon: 18.568062 }
};

// Konwertuje GPS lat/lon na współrzędne SVG
// Używamy prostego układu: znajdź min/max wszystkich punktów (boisko + tracking)
// i mapuj na canvas
export const convertGPSToSVG = (allPoints, canvasWidth = 1000, canvasHeight = 800) => {
  // Zbierz wszystkie punkty GPS (narożniki boiska + punkty trackingu)
  const allLats = allPoints.map(p => p.lat);
  const allLons = allPoints.map(p => p.lon);

  const minLat = Math.min(...allLats);
  const maxLat = Math.max(...allLats);
  const minLon = Math.min(...allLons);
  const maxLon = Math.max(...allLons);

  const latRange = maxLat - minLat;
  const lonRange = maxLon - minLon;

  // Dodaj padding (10% z każdej strony)
  const padding = 50;
  const drawWidth = canvasWidth - 2 * padding;
  const drawHeight = canvasHeight - 2 * padding;

  // Funkcja konwertująca GPS na SVG
  const toSVG = (lat, lon) => ({
    x: padding + ((lon - minLon) / lonRange) * drawWidth,
    y: padding + drawHeight - ((lat - minLat) / latRange) * drawHeight // odwrócone Y
  });

  return {
    toSVG,
    canvasWidth,
    canvasHeight,
    bounds: { minLat, maxLat, minLon, maxLon }
  };
};

// Oblicza odległość między dwoma punktami GPS (w metrach) - wzór Haversine
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // promień Ziemi w metrach
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Oblicza całkowitą przebiegniętą odległość
export const calculateTotalDistance = (trackingPoints) => {
  if (trackingPoints.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < trackingPoints.length; i++) {
    const prev = trackingPoints[i - 1];
    const curr = trackingPoints[i];
    totalDistance += calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon);
  }

  return totalDistance; // w metrach
};

// Oblicza czas trwania aktywności
export const calculateDuration = (trackingPoints) => {
  if (trackingPoints.length < 2) return null;

  const startTime = new Date(trackingPoints[0].time);
  const endTime = new Date(trackingPoints[trackingPoints.length - 1].time);

  const durationMs = endTime - startTime;
  const durationSeconds = Math.floor(durationMs / 1000);

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    totalSeconds: durationSeconds,
    formatted: hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`
  };
};

// Dzieli punkty na segmenty czasowe (według czasu, nie liczby punktów)
export const splitIntoSegments = (trackingPoints, segmentType) => {
  if (segmentType === 'full' || trackingPoints.length === 0) {
    return [trackingPoints];
  }

  const count = segmentType === 'halves' ? 2 : segmentType === 'thirds' ? 3 : 4;

  // Oblicz całkowity czas trwania
  const startTime = new Date(trackingPoints[0].time);
  const endTime = new Date(trackingPoints[trackingPoints.length - 1].time);
  const totalDuration = endTime - startTime;
  const segmentDuration = totalDuration / count;

  const segments = [];

  for (let i = 0; i < count; i++) {
    const segmentStartTime = new Date(startTime.getTime() + i * segmentDuration);
    const segmentEndTime = new Date(startTime.getTime() + (i + 1) * segmentDuration);

    // Filtruj punkty dla tego segmentu czasowego
    const segmentPoints = trackingPoints.filter(point => {
      const pointTime = new Date(point.time);
      return pointTime >= segmentStartTime &&
             (i === count - 1 ? pointTime <= segmentEndTime : pointTime < segmentEndTime);
    });

    segments.push(segmentPoints);
  }

  return segments;
};

// Konwertuje punkty trackingu i narożniki boiska na współrzędne SVG
export const prepareVisualizationData = (trackingPoints, segmentType = 'full') => {
  // Podziel na segmenty
  const segments = splitIntoSegments(trackingPoints, segmentType);

  // Wszystkie punkty GPS (boisko + tracking) do obliczenia boundingu
  const allGPSPoints = [
    PITCH_CORNERS.topLeft,
    PITCH_CORNERS.topRight,
    PITCH_CORNERS.bottomLeft,
    PITCH_CORNERS.bottomRight,
    ...trackingPoints
  ];

  const { toSVG, canvasWidth, canvasHeight } = convertGPSToSVG(allGPSPoints);

  // Konwertuj narożniki boiska
  const pitchCornersSVG = {
    topLeft: toSVG(PITCH_CORNERS.topLeft.lat, PITCH_CORNERS.topLeft.lon),
    topRight: toSVG(PITCH_CORNERS.topRight.lat, PITCH_CORNERS.topRight.lon),
    bottomLeft: toSVG(PITCH_CORNERS.bottomLeft.lat, PITCH_CORNERS.bottomLeft.lon),
    bottomRight: toSVG(PITCH_CORNERS.bottomRight.lat, PITCH_CORNERS.bottomRight.lon)
  };

  // Konwertuj segmenty punktów trackingu
  const segmentsSVG = segments.map(segmentPoints => {
    const pointsSVG = segmentPoints.map(point => ({
      ...point,
      ...toSVG(point.lat, point.lon)
    }));

    const duration = calculateDuration(segmentPoints);
    const distance = calculateTotalDistance(segmentPoints);

    // Oblicz średnie tętno
    const heartRates = segmentPoints.filter(p => p.heartRate).map(p => p.heartRate);
    const avgHeartRate = heartRates.length > 0
      ? Math.round(heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length)
      : null;

    return {
      trackingPoints: pointsSVG,
      duration,
      distance,
      avgHeartRate,
      pointCount: segmentPoints.length
    };
  });

  // Oblicz całkowite statystyki
  const totalDuration = calculateDuration(trackingPoints);
  const totalDistance = calculateTotalDistance(trackingPoints);
  const allHeartRates = trackingPoints.filter(p => p.heartRate).map(p => p.heartRate);
  const totalAvgHeartRate = allHeartRates.length > 0
    ? Math.round(allHeartRates.reduce((sum, hr) => sum + hr, 0) / allHeartRates.length)
    : null;

  return {
    pitchCorners: pitchCornersSVG,
    segments: segmentsSVG,
    canvasWidth,
    canvasHeight,
    totalDuration,
    totalDistance,
    totalAvgHeartRate,
    totalPointCount: trackingPoints.length,
    segmentType
  };
};