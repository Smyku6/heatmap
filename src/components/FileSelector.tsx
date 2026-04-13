import React, { useRef, useState } from 'react';

import { getPerformancesList } from '../config/performances';

import type { PitchId, FileUploadState } from '../types';
import './FileSelector.css';

interface FileSelectorProps {
  onFileLoad: (fileContent: string) => void;
  onLoadPerformance: (tcxContent: string, pitchId: PitchId) => void;
}

const FileSelector: React.FC<FileSelectorProps> = ({ onFileLoad, onLoadPerformance }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<FileUploadState>({ type: 'idle' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.endsWith('.tcx')) {
      setUploadState({ type: 'error', message: 'Proszę wybrać plik TCX' });
      setTimeout(() => setUploadState({ type: 'idle' }), 3000);
      return;
    }

    setUploadState({ type: 'parsing', progress: 0 });
    const reader = new FileReader();

    reader.onprogress = (progressEvent) => {
      if (progressEvent.lengthComputable) {
        const progress = (progressEvent.loaded / progressEvent.total) * 100;
        setUploadState({ type: 'parsing', progress });
      }
    };

    reader.onload = (event) => {
      setTimeout(() => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          onFileLoad(result);
          // Success state would be set after session creation
          setUploadState({ type: 'idle' });
        }
      }, 300);
    };

    reader.onerror = () => {
      setUploadState({ type: 'error', message: 'Błąd wczytywania pliku' });
      setTimeout(() => setUploadState({ type: 'idle' }), 3000);
    };

    reader.readAsText(file);
  };

  const handleExampleFile = async () => {
    const performances = getPerformancesList();
    if (performances.length === 0) {
      return;
    }

    const performance = performances[0]; // Bierzemy pierwszy przykładowy plik
    setUploadState({ type: 'parsing', progress: 50 });

    try {
      const response = await fetch(performance.tcxFile);
      if (!response.ok) {
        throw new Error('Nie można załadować pliku TCX');
      }
      const tcxContent = await response.text();

      setTimeout(() => {
        onLoadPerformance(tcxContent, performance.pitchId);
        setUploadState({ type: 'idle' });
      }, 300);
    } catch (error) {
      console.error('Błąd ładowania występu:', error);
      setUploadState({ type: 'error', message: 'Nie można załadować przykładowego pliku' });
      setTimeout(() => setUploadState({ type: 'idle' }), 3000);
    }
  };

  // Type-safe exhaustive rendering based on upload state
  const renderContent = () => {
    switch (uploadState.type) {
      case 'idle':
        return (
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
        );

      case 'selecting':
        return (
          <div className="file-selector-loading">
            <p>Wybieranie pliku...</p>
          </div>
        );

      case 'parsing':
        return (
          <div className="file-selector-loading">
            <div className="loading-spinner" />
            {uploadState.progress > 0 && (
              <p style={{ marginTop: '1rem', fontSize: '0.875rem', opacity: 0.7 }}>
                Wczytywanie: {Math.round(uploadState.progress)}%
              </p>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="file-selector-loading">
            <p style={{ color: 'var(--color-primary)' }}>✓ Plik wczytany pomyślnie!</p>
          </div>
        );

      case 'error':
        return (
          <div className="file-selector-loading">
            <p style={{ color: '#ef4444' }}>✗ {uploadState.message}</p>
          </div>
        );
    }
  };

  const isProcessing = uploadState.type === 'parsing' || uploadState.type === 'selecting';

  return (
    <div className="file-selector">
      <div className="file-selector-card">
        <div className="file-selector-header">
          <span className="material-symbols-outlined file-selector-icon">
            {isProcessing ? 'sync' : 'analytics'}
          </span>
          <div className="file-selector-title-group">
            <h3 className="file-selector-title">
              {isProcessing ? 'Wczytuję dane...' : 'Rozpocznij analizę'}
            </h3>
            <p className="file-selector-subtitle">
              {isProcessing
                ? 'Przetwarzanie danych treningowych'
                : 'Wybierz plik TCX z Garmin lub użyj przykładu'}
            </p>
          </div>
        </div>

        {renderContent()}
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
