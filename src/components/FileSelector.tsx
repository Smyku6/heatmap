import React, { useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { getPerformancesList } from '../config/performances';

import type { PitchId, FileUploadState } from '../types';

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
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              className="flex-1 w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-headline font-semibold text-[0.9375rem] bg-gradient-to-br from-[rgb(202,253,0)] to-[rgba(202,253,0,0.8)] text-[#0a0a0a] shadow-[0_4px_12px_rgba(202,253,0,0.2)] hover:shadow-[0_6px_16px_rgba(202,253,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 relative overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="material-symbols-outlined text-2xl transition-transform duration-300 group-hover:scale-110">
                upload_file
              </span>
              <span className="relative">Wybierz plik</span>
            </button>

            <div className="w-full sm:w-10 sm:h-10 h-auto py-2 sm:py-0 flex items-center justify-center flex-shrink-0 rounded-full bg-surface-container border border-[rgba(202,253,0,0.1)] text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>lub</span>
            </div>

            <button
              className="flex-1 w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-headline font-semibold text-[0.9375rem] bg-surface-container-highest text-on-surface border border-[rgba(202,253,0,0.2)] hover:bg-[rgba(202,253,0,0.05)] hover:border-[rgba(202,253,0,0.4)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:translate-y-0 transition-all duration-300 relative overflow-hidden group"
              onClick={handleExampleFile}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="material-symbols-outlined text-2xl transition-transform duration-300 group-hover:scale-110">
                bolt
              </span>
              <span className="relative">Przykładowy plik</span>
            </button>
          </div>
        );

      case 'selecting':
        return (
          <div className="flex items-center justify-center py-8">
            <p className="text-on-surface">Wybieranie pliku...</p>
          </div>
        );

      case 'parsing':
        return (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-10 h-10 border-[3px] border-[rgba(202,253,0,0.1)] border-t-[rgb(202,253,0)] rounded-full animate-spin" />
            {uploadState.progress > 0 && (
              <p className="text-sm opacity-70">Wczytywanie: {Math.round(uploadState.progress)}%</p>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="flex items-center justify-center py-8">
            <p className="text-primary">✓ Plik wczytany pomyślnie!</p>
          </div>
        );

      case 'error':
        return (
          <div className="flex items-center justify-center py-8">
            <p className="text-red-500">✗ {uploadState.message}</p>
          </div>
        );
    }
  };

  const isProcessing = uploadState.type === 'parsing' || uploadState.type === 'selecting';

  return (
    <div className="w-full max-w-2xl">
      <div className="relative overflow-hidden bg-surface-container-high border border-[rgba(202,253,0,0.1)] rounded-2xl p-8 sm:p-8 transition-all duration-300">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(202,253,0,0.03)] to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-start gap-6 mb-8">
          <span
            className={cn(
              'material-symbols-outlined text-5xl text-primary flex-shrink-0',
              isProcessing ? 'animate-spin' : 'animate-pulse'
            )}
          >
            {isProcessing ? 'sync' : 'analytics'}
          </span>
          <div className="flex-1">
            <h3 className="font-headline text-2xl font-bold text-on-surface mb-2 tracking-tight">
              {isProcessing ? 'Wczytuję dane...' : 'Rozpocznij analizę'}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {isProcessing
                ? 'Przetwarzanie danych treningowych'
                : 'Wybierz plik TCX z Garmin lub użyj przykładu'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="relative">{renderContent()}</div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".tcx"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileSelector;
