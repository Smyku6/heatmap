import React, { useState, useRef } from 'react';

import type { DragDropUploadState } from '../types';
import './FileUpload.css';

interface FileUploadProps {
  onFileLoad: (content: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoad }) => {
  const [uploadState, setUploadState] = useState<DragDropUploadState>({ type: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!file.name.endsWith('.tcx')) {
      setUploadState({ type: 'error', message: 'Proszę wybrać plik TCX' });
      setTimeout(() => setUploadState({ type: 'idle' }), 3000);
      return;
    }

    setUploadState({ type: 'uploading', progress: 0 });

    const reader = new FileReader();

    reader.onprogress = (progressEvent) => {
      if (progressEvent.lengthComputable) {
        const progress = (progressEvent.loaded / progressEvent.total) * 100;
        setUploadState({ type: 'uploading', progress });
      }
    };

    reader.onload = (event) => {
      setTimeout(() => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          onFileLoad(result);
        }
        setUploadState({ type: 'idle' });
      }, 500); // Small delay for animation
    };

    reader.onerror = () => {
      setUploadState({ type: 'error', message: 'Błąd wczytywania pliku' });
      setTimeout(() => setUploadState({ type: 'idle' }), 3000);
    };

    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0]);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadState.type === 'idle') {
      setUploadState({ type: 'dragging' });
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadState.type === 'dragging') {
      setUploadState({ type: 'idle' });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (uploadState.type === 'dragging') {
      setUploadState({ type: 'idle' });
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleClick = () => {
    if (uploadState.type === 'idle' || uploadState.type === 'error') {
      fileInputRef.current?.click();
    }
  };

  // Type-safe exhaustive rendering based on upload state
  const renderContent = () => {
    switch (uploadState.type) {
      case 'idle':
        return (
          <>
            <div className="upload-icon-circle">
              <span className="material-symbols-outlined">speed</span>
            </div>
            <h3 className="upload-title">Wgraj plik TCX</h3>
            <p className="upload-description">
              Przeciągnij i upuść plik treningowy z Twojego urządzenia Garmin lub wybierz go z
              dysku.
            </p>
            <button className="upload-button" type="button">
              Wybierz plik
            </button>
          </>
        );

      case 'dragging':
        return (
          <>
            <div className="upload-icon-circle">
              <span className="material-symbols-outlined">download</span>
            </div>
            <h3 className="upload-title">Upuść plik tutaj</h3>
            <p className="upload-description">Zwolnij przycisk myszy, aby rozpocząć wczytywanie</p>
          </>
        );

      case 'uploading':
        return (
          <>
            <div className="upload-icon-circle">
              <span className="material-symbols-outlined">sync</span>
            </div>
            <h3 className="upload-title">Wczytuję...</h3>
            <p className="upload-description">
              Przetwarzanie danych treningowych...
              {uploadState.progress !== undefined && uploadState.progress > 0 && (
                <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  {Math.round(uploadState.progress)}%
                </span>
              )}
            </p>
          </>
        );

      case 'error':
        return (
          <>
            <div className="upload-icon-circle" style={{ borderColor: '#ef4444' }}>
              <span className="material-symbols-outlined" style={{ color: '#ef4444' }}>
                error
              </span>
            </div>
            <h3 className="upload-title" style={{ color: '#ef4444' }}>
              Błąd
            </h3>
            <p className="upload-description">{uploadState.message}</p>
            <button className="upload-button" type="button">
              Spróbuj ponownie
            </button>
          </>
        );
    }
  };

  const zoneClasses = [
    'upload-zone',
    uploadState.type === 'dragging' && 'drag-over',
    uploadState.type === 'uploading' && 'uploading'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="file-upload">
      <div
        className={zoneClasses}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-zone-background" />

        <div className="upload-zone-content">{renderContent()}</div>

        {/* Technical Grid Decoration */}
        <div className="upload-decoration">
          <svg className="technical-grid" width="100" height="100" viewBox="0 0 100 100">
            <path d="M0 0 H100 V100 H0 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path
              d="M10 0 V100 M20 0 V100 M30 0 V100 M40 0 V100 M50 0 V100 M60 0 V100 M70 0 V100 M80 0 V100 M90 0 V100"
              stroke="currentColor"
              strokeWidth="0.1"
            />
            <path
              d="M0 10 H100 M0 20 H100 M0 30 H100 M0 40 H100 M0 50 H100 M0 60 H100 M0 70 H100 M0 80 H100 M0 90 H100"
              stroke="currentColor"
              strokeWidth="0.1"
            />
          </svg>
        </div>
      </div>

      <input
        ref={fileInputRef}
        id="tcx-file"
        type="file"
        accept=".tcx"
        onChange={handleFileChange}
        className="file-input"
      />
    </div>
  );
};

export default FileUpload;
