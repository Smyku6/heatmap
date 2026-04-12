import React, { useState, useRef } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  onFileLoad: (content: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoad }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File | undefined) => {
    if (!file) {return;}

    if (!file.name.endsWith('.tcx')) {
      alert('Proszę wybrać plik TCX');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          onFileLoad(result);
        }
        setIsUploading(false);
      }, 500); // Small delay for animation
    };
    reader.onerror = () => {
      alert('Błąd wczytywania pliku');
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {


    processFile(e.target.files?.[0]);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const zoneClasses = [
    'upload-zone',
    isDragging && 'drag-over',
    isUploading && 'uploading'
  ].filter(Boolean).join(' ');

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

        <div className="upload-zone-content">
          <div className="upload-icon-circle">
            <span className="material-symbols-outlined">
              {isUploading ? 'sync' : 'speed'}
            </span>
          </div>

          <h3 className="upload-title">
            {isUploading ? 'Wczytuję...' : 'Wgraj plik TCX'}
          </h3>

          <p className="upload-description">
            {isUploading
              ? 'Przetwarzanie danych treningowych...'
              : 'Przeciągnij i upuść plik treningowy z Twojego urządzenia Garmin lub wybierz go z dysku.'
            }
          </p>

          {!isUploading && (
            <button className="upload-button" type="button">
              Wybierz plik
            </button>
          )}
        </div>

        {/* Technical Grid Decoration */}
        <div className="upload-decoration">
          <svg className="technical-grid" width="100" height="100" viewBox="0 0 100 100">
            <path d="M0 0 H100 V100 H0 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M10 0 V100 M20 0 V100 M30 0 V100 M40 0 V100 M50 0 V100 M60 0 V100 M70 0 V100 M80 0 V100 M90 0 V100"
                  stroke="currentColor" strokeWidth="0.1" />
            <path d="M0 10 H100 M0 20 H100 M0 30 H100 M0 40 H100 M0 50 H100 M0 60 H100 M0 70 H100 M0 80 H100 M0 90 H100"
                  stroke="currentColor" strokeWidth="0.1" />
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
