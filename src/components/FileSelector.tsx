import React, { useRef, useState } from 'react';

import { getPerformancesList } from '../config/performances';

import type { PitchId } from '../types';
import './FileSelector.css';

interface FileSelectorProps {
  onFileLoad: (fileContent: string) => void;
  onLoadPerformance: (tcxContent: string, pitchId: PitchId) => void;
}

const FileSelector: React.FC<FileSelectorProps> = ({ onFileLoad, onLoadPerformance }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.endsWith('.tcx')) {
      console.error('Proszę wybrać plik TCX');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          onFileLoad(result);
        }
        setIsLoading(false);
      }, 300);
    };
    reader.onerror = () => {
      console.error('Błąd wczytywania pliku');
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const handleExampleFile = async () => {
    const performances = getPerformancesList();
    if (performances.length === 0) {
      return;
    }

    const performance = performances[0]; // Bierzemy pierwszy przykładowy plik
    setIsLoading(true);

    try {
      const response = await fetch(performance.tcxFile);
      if (!response.ok) {
        throw new Error('Nie można załadować pliku TCX');
      }
      const tcxContent = await response.text();

      setTimeout(() => {
        onLoadPerformance(tcxContent, performance.pitchId);
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.error('Błąd ładowania występu:', error);
      console.error('Nie można załadować przykładowego pliku');
      setIsLoading(false);
    }
  };

  return (
    <div className="file-selector">
      <div className="file-selector-card">
        <div className="file-selector-header">
          <span className="material-symbols-outlined file-selector-icon">
            {isLoading ? 'sync' : 'analytics'}
          </span>
          <div className="file-selector-title-group">
            <h3 className="file-selector-title">
              {isLoading ? 'Wczytuję dane...' : 'Rozpocznij analizę'}
            </h3>
            <p className="file-selector-subtitle">
              {isLoading
                ? 'Przetwarzanie danych treningowych'
                : 'Wybierz plik TCX z Garmin lub użyj przykładu'}
            </p>
          </div>
        </div>

        {!isLoading && (
          <div className="file-selector-actions">
            <button
              className="file-selector-btn primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="material-symbols-outlined">upload_file</span>
              <span>Wybierz plik</span>
            </button>

            <div className="file-selector-divider">
              <span>lub</span>
            </div>

            <button className="file-selector-btn secondary" onClick={handleExampleFile}>
              <span className="material-symbols-outlined">bolt</span>
              <span>Przykładowy plik</span>
            </button>
          </div>
        )}

        {isLoading && (
          <div className="file-selector-loading">
            <div className="loading-spinner" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".tcx"
        onChange={handleFileChange}
        className="file-input-hidden"
      />
    </div>
  );
};

export default FileSelector;
