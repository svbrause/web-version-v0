// import React from 'react';
import { useApp } from '../../context/AppContext';
import { ETHNIC_BACKGROUNDS } from '../../constants/data';
import "../../App.css";

export default function EthnicBackgroundScreen() {
  const { state, updateState } = useApp();

  const handleEthnicBackgroundChange = (background: string) => {
    updateState({ ethnicBackground: background });
  };

  const formatLabel = (value: string) => {
    return value
      .split(/[\/-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('/');
  };

  return (
    <div className="question-view">
      <h1 className="main-question">What is your ethnic background?</h1>
      <p className="subtitle">This helps us show you more relevant results.</p>
      <div className="ethnic-pills">
        {ETHNIC_BACKGROUNDS.map(background => (
          <label
            key={background}
            className={`ethnic-pill ${state.ethnicBackground === background ? 'selected' : ''}`}
            onMouseLeave={(e) => {
              // Reset visual state when mouse leaves during drag
              if (state.ethnicBackground !== background) {
                e.currentTarget.blur();
              }
            }}
          >
            <input
              type="radio"
              name="ethnic-background"
              value={background}
              checked={state.ethnicBackground === background}
              onChange={() => handleEthnicBackgroundChange(background)}
            />
            <span>{formatLabel(background)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
