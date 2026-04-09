// Przykładowe występy/treningi do szybkiego wczytania
export const EXAMPLE_PERFORMANCES = [
  {
    id: 'match-2026-04-09',
    name: 'Mecz 09.04.2026',
    date: '2026-04-09',
    description: 'Mecz piłkarski - Lawendowe Wzgórze',
    pitchId: 'lawendowe-wzgorze-orlik',
    tcxFile: '/heatmap/examples/activity_22470142520.tcx'
  },
  // Dodaj więcej przykładowych występów tutaj:
  // {
  //   id: 'unique-id',
  //   name: 'Nazwa występu',
  //   date: 'YYYY-MM-DD',
  //   description: 'Opis',
  //   pitchId: 'id-boiska',
  //   tcxFile: '/heatmap/examples/nazwa-pliku.tcx'
  // },
];

export const getPerformance = (performanceId) => {
  return EXAMPLE_PERFORMANCES.find(p => p.id === performanceId);
};

export const getPerformancesList = () => {
  return EXAMPLE_PERFORMANCES;
};
