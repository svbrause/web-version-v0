// import React from 'react';
import { useApp } from '../../context/AppContext';
import { AGE_RANGES } from '../../constants/data';
import "../../App.css";

export default function AgeScreen() {
  const { state, updateState } = useApp();

  const handleAgeChange = (ageRange: string) => {
    updateState({ ageRange });
  };

  return (
    <div className="question-view">
      <h1 className="main-question">What is your age?</h1>
      <p className="subtitle">This helps us show you relevant results.</p>
      <div className="age-ranges">
        {AGE_RANGES.map(age => (
          <label
            key={age}
            className={`age-range-option ${state.ageRange === age ? 'selected' : ''}`}
            onMouseLeave={(e) => {
              // Reset visual state when mouse leaves during drag
              if (state.ageRange !== age) {
                e.currentTarget.blur();
              }
            }}
          >
            <input
              type="radio"
              name="age-range"
              value={age}
              checked={state.ageRange === age}
              onChange={() => handleAgeChange(age)}
            />
            <span>{age}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
