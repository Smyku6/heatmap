import React, { useState } from 'react';
import './SatelliteControls.css';

const SatelliteControls = ({ transform, onChange, pitchId }) => {
  const [scaleInput, setScaleInput] = useState(transform.scale.toString());
  const [rotationInput, setRotationInput] = useState(transform.rotation.toString());
  const [translateXInput, setTranslateXInput] = useState(transform.translateX.toString());
  const [translateYInput, setTranslateYInput] = useState(transform.translateY.toString());

  const handleScaleChange = (value) => {
    setScaleInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 5.0) {
      onChange({ ...transform, scale: numValue });
    }
  };

  const handleScaleDelta = (delta) => {
    const newScale = Math.max(0.1, Math.min(5.0, transform.scale + delta));
    setScaleInput(newScale.toString());
    onChange({ ...transform, scale: newScale });
  };

  const handleRotationChange = (value) => {
    setRotationInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onChange({ ...transform, rotation: numValue });
    }
  };

  const handleTranslateXChange = (value) => {
    setTranslateXInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onChange({ ...transform, translateX: numValue });
    }
  };

  const handleTranslateYChange = (value) => {
    setTranslateYInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onChange({ ...transform, translateY: numValue });
    }
  };

  const handleTranslateDelta = (axis, delta) => {
    if (axis === 'x') {
      const newValue = transform.translateX + delta;
      setTranslateXInput(newValue.toString());
      onChange({ ...transform, translateX: newValue });
    } else {
      const newValue = transform.translateY + delta;
      setTranslateYInput(newValue.toString());
      onChange({ ...transform, translateY: newValue });
    }
  };

  const handleReset = () => {
    onChange({ scale: 1.0, rotation: 0, translateX: 0, translateY: 0 });
    setScaleInput('1.0');
    setRotationInput('0');
    setTranslateXInput('0');
    setTranslateYInput('0');
  };

  const handleSaveConfig = () => {
    const config = {
      pitchId,
      transform,
      timestamp: new Date().toISOString()
    };

    // Skopiuj transform do schowka w formacie gotowym do wklejenia
    const transformStr = JSON.stringify(transform, null, 2);
    navigator.clipboard.writeText(transformStr).then(() => {
      alert(`Transform skopiowany do schowka!\n\nWklej do pitches.js jako:\ntransforms: {\n  original: ${transformStr}\n}`);
    }).catch(() => {
      // Fallback: zapisz jako plik
      const jsonStr = JSON.stringify(config, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `satellite-config-${pitchId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleLoadConfig = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result !== 'string') return;
          const config = JSON.parse(result);
          if (config.transform) {
            onChange(config.transform);
            setScaleInput(config.transform.scale.toString());
            setRotationInput(config.transform.rotation.toString());
            setTranslateXInput(config.transform.translateX.toString());
            setTranslateYInput(config.transform.translateY.toString());
          }
        } catch (error) {
          alert('Błąd wczytywania konfiguracji');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="satellite-controls">
      <h3>Ustawienia zdjęcia satelitarnego</h3>

      <div className="control-group">
        <label>Skala:</label>
        <div className="rotation-controls">
          <input
            type="number"
            value={scaleInput}
            onChange={(e) => handleScaleChange(e.target.value)}
            step="0.001"
            min="0.1"
            max="5.0"
          />
          <div className="button-group">
            <button onClick={() => handleScaleDelta(-0.01)}>-0.01</button>
            <button onClick={() => handleScaleDelta(-0.1)}>-0.1</button>
            <button onClick={() => handleScaleDelta(0.1)}>+0.1</button>
            <button onClick={() => handleScaleDelta(0.01)}>+0.01</button>
          </div>
        </div>
      </div>

      <div className="control-group">
        <label>Rotacja (stopnie):</label>
        <div className="rotation-controls">
          <input
            type="number"
            value={rotationInput}
            onChange={(e) => handleRotationChange(e.target.value)}
            step="0.1"
          />
          <div className="button-group">
            <button onClick={() => handleRotationChange((parseFloat(rotationInput) - 5).toString())}>-5°</button>
            <button onClick={() => handleRotationChange((parseFloat(rotationInput) - 1).toString())}>-1°</button>
            <button onClick={() => handleRotationChange((parseFloat(rotationInput) + 1).toString())}>+1°</button>
            <button onClick={() => handleRotationChange((parseFloat(rotationInput) + 5).toString())}>+5°</button>
          </div>
        </div>
      </div>

      <div className="control-group">
        <label>Pozycja X:</label>
        <div className="rotation-controls">
          <input
            type="number"
            value={translateXInput}
            onChange={(e) => handleTranslateXChange(e.target.value)}
            step="1"
          />
          <div className="button-group">
            <button onClick={() => handleTranslateDelta('x', -10)}>←10</button>
            <button onClick={() => handleTranslateDelta('x', -1)}>←1</button>
            <button onClick={() => handleTranslateDelta('x', 1)}>→1</button>
            <button onClick={() => handleTranslateDelta('x', 10)}>→10</button>
          </div>
        </div>
      </div>

      <div className="control-group">
        <label>Pozycja Y:</label>
        <div className="rotation-controls">
          <input
            type="number"
            value={translateYInput}
            onChange={(e) => handleTranslateYChange(e.target.value)}
            step="1"
          />
          <div className="button-group">
            <button onClick={() => handleTranslateDelta('y', -10)}>↑10</button>
            <button onClick={() => handleTranslateDelta('y', -1)}>↑1</button>
            <button onClick={() => handleTranslateDelta('y', 1)}>↓1</button>
            <button onClick={() => handleTranslateDelta('y', 10)}>↓10</button>
          </div>
        </div>
      </div>

      <div className="control-actions">
        <button className="reset-btn" onClick={handleReset}>Reset</button>
        <button className="save-btn" onClick={handleSaveConfig}>Zapisz config</button>
        <label className="load-btn">
          Wczytaj config
          <input
            type="file"
            accept=".json"
            onChange={handleLoadConfig}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );
};

export default SatelliteControls;
