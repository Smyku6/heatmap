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
      transforms: {
        original: { scale: 0.94, rotation: 90, translateX: -73, translateY: 0 },
        horizontal: { scale: 0.94, rotation: 90, translateX: -73, translateY: 0 }
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
