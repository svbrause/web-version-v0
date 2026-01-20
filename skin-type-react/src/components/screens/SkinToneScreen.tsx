// import React from 'react';
import { useApp } from '../../context/AppContext';
import { SKIN_TONES } from '../../constants/data';
import "../../App.css";

const skinToneColors: Record<string, string> = {
  light: '#f4d4b4',
  fair: '#e6c19a',
  medium: '#d4a574',
  tan: '#b8864f',
  brown: '#8b6f3d',
  deep: '#5c3d1f'
};

export default function SkinToneScreen() {
  const { state, updateState } = useApp();

  const handleSkinToneChange = (tone: string) => {
    updateState({ skinTone: tone });
  };

  return (
    <div className="question-view">
      <h1 className="main-question">What is your skin tone?</h1>
      <p className="subtitle">This helps us show you results from people with similar skin tones.</p>
      <div className="skin-tone-scale">
        {SKIN_TONES.map(tone => (
          <label
            key={tone}
            className={`skin-tone-option ${state.skinTone === tone ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="skin-tone"
              value={tone}
              checked={state.skinTone === tone}
              onChange={() => handleSkinToneChange(tone)}
            />
            <div
              className="skin-tone-swatch"
              style={{ background: skinToneColors[tone] }}
            ></div>
            <span>{tone.charAt(0).toUpperCase() + tone.slice(1)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
