import React from 'react';
import './FileUpload.css';

const FileUpload = ({ onFileLoad }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onFileLoad(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="file-upload">
      <label htmlFor="tcx-file" className="upload-label">
        <div className="upload-icon">📁</div>
        <div className="upload-text">
          <div className="upload-title">Wczytaj plik TCX</div>
          <div className="upload-subtitle">Kliknij lub przeciągnij plik</div>
        </div>
      </label>
      <input
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
