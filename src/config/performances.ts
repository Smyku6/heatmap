/**
 * Example performance/training session for quick loading
 */
export interface PerformanceConfig {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD format
  description: string;
  pitchId: string;
  tcxFile: string; // Path to TCX file
}

/**
 * Example performances available for demo/testing
 */
export const EXAMPLE_PERFORMANCES: PerformanceConfig[] = [
  {
    id: 'match-2026-04-09',
    name: 'Mecz 09.04.2026',
    date: '2026-04-09',
    description: 'Mecz piłkarski - Lawendowe Wzgórze',
    pitchId: 'lawendowe-wzgorze-orlik',
    tcxFile: '/heatmap/examples/activity_22470142520.tcx'
  }
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

/**
 * Gets performance configuration by ID
 *
 * @param performanceId - ID of the performance to retrieve
 * @returns Performance configuration if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const performance = getPerformance('match-2026-04-09');
 * if (performance) {
 *   console.log(`Loading: ${performance.name}`);
 * }
 * ```
 */
export const getPerformance = (performanceId: string): PerformanceConfig | undefined => {
  return EXAMPLE_PERFORMANCES.find((p) => p.id === performanceId);
};

/**
 * Gets all available example performances
 *
 * @returns Array of all performance configurations
 *
 * @example
 * ```typescript
 * const performances = getPerformancesList();
 * performances.forEach(perf => {
 *   console.log(`${perf.name} - ${perf.date}`);
 * });
 * ```
 */
export const getPerformancesList = (): PerformanceConfig[] => {
  return EXAMPLE_PERFORMANCES;
};
