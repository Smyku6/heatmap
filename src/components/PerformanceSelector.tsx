import React from 'react';
import { getPerformancesList } from '../config/performances';
import './PerformanceSelector.css';

const PerformanceSelector = ({ onLoadPerformance }) => {
  const performances = getPerformancesList();

  const handleChange = async (e) => {
    const performanceId = e.target.value;
    if (!performanceId) return;

    const performance = performances.find(p => p.id === performanceId);
    if (!performance) return;

    try {
      // Pobierz plik TCX
      const response = await fetch(performance.tcxFile);
      if (!response.ok) {
        throw new Error('Nie można załadować pliku TCX');
      }
      const tcxContent = await response.text();

      // Wywołaj callback z danymi
      onLoadPerformance(tcxContent, performance.pitchId);
    } catch (error) {
      console.error('Błąd ładowania występu:', error);
      alert('Nie można załadować przykładowego występu');
      // Resetuj select tylko jeśli błąd
      e.target.value = '';
    }
  };

  return (
    <div className="performance-selector">
      <label htmlFor="performance-select" className="performance-selector-label">
        Lub wybierz przykładowy występ:
      </label>
      <select
        id="performance-select"
        onChange={handleChange}
        className="performance-selector-dropdown"
        defaultValue=""
      >
        <option value="" disabled>-- Wybierz występ --</option>
        {performances.map(performance => (
          <option key={performance.id} value={performance.id}>
            {performance.name} - {performance.description}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PerformanceSelector;
