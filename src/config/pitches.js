// Konfiguracja dostępnych boisk z współrzędnymi GPS narożników
export const PITCHES = {
  'lawendowe-wzgorze-orlik': {
    id: 'lawendowe-wzgorze-orlik',
    name: 'Lawendowe Wzgórze - Orlik',
    location: 'Gdańsk',
    corners: {
      topLeft: { lat: 54.325814, lon: 18.567196 },
      topRight: { lat: 54.325968, lon: 18.567493 },
      bottomLeft: { lat: 54.325438, lon: 18.567764 },
      bottomRight: { lat: 54.325592, lon: 18.568062 }
    },
    satellite: {
      image: '/images/lawendowe.jpg',
      imageCorners: {
        topLeft: { x: 623, y: 394 },
        topRight: { x: 864, y: 177 },
        bottomRight: { x: 1333, y: 703 },
        bottomLeft: { x: 1089, y: 920 }
      }
    }
  },
  // Dodaj kolejne boiska tutaj:
  // 'nazwa-boiska': {
  //   id: 'nazwa-boiska',
  //   name: 'Wyświetlana Nazwa',
  //   location: 'Miasto',
  //   corners: {
  //     topLeft: { lat: XX.XXXXXX, lon: XX.XXXXXX },
  //     topRight: { lat: XX.XXXXXX, lon: XX.XXXXXX },
  //     bottomLeft: { lat: XX.XXXXXX, lon: XX.XXXXXX },
  //     bottomRight: { lat: XX.XXXXXX, lon: XX.XXXXXX }
  //   }
  // },
};

// Domyślne boisko
export const DEFAULT_PITCH_ID = 'lawendowe-wzgorze-orlik';

// Funkcja pomocnicza do pobrania boiska
export const getPitch = (pitchId) => {
  return PITCHES[pitchId] || PITCHES[DEFAULT_PITCH_ID];
};

// Lista boisk do selectora
export const getPitchesList = () => {
  return Object.values(PITCHES);
};
