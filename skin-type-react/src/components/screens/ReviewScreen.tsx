// import React from 'react';
import { useApp } from '../../context/AppContext';
import { HIGH_LEVEL_CONCERNS, AREAS_OF_CONCERN } from '../../constants/data';
import "../../App.css";

export default function ReviewScreen() {
  const { state } = useApp();

  const getConcernName = (id: string) => {
    return HIGH_LEVEL_CONCERNS.find(c => c.id === id)?.name || id;
  };

  const getAreaName = (id: string) => {
    return AREAS_OF_CONCERN.find(a => a.id === id)?.name || id;
  };

  return (
    <div className="question-view">
      <h1 className="main-question">Review Your Selections</h1>
      <p className="subtitle">Please review your information before proceeding.</p>
      
      <div className="review-cards">
        <div className="review-card">
          <div className="review-card-checkmark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <div className="review-card-content">
            <div className="review-card-label">Your Concerns:</div>
            <div className="review-card-bubbles">
              {state.selectedConcerns.map(concernId => (
                <div key={concernId} className="review-card-bubble">
                  {getConcernName(concernId)}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="review-card">
          <div className="review-card-checkmark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <div className="review-card-content">
            <div className="review-card-label">Areas of Concern:</div>
            <div className="review-card-bubbles">
              {state.selectedAreas.map(areaId => (
                <div key={areaId} className="review-card-bubble">
                  {getAreaName(areaId)}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {state.ageRange && (
          <div className="review-card">
            <div className="review-card-checkmark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <div className="review-card-content">
              <div className="review-card-label">Age:</div>
              <div className="review-card-bubble">{state.ageRange}</div>
            </div>
          </div>
        )}
        
        {state.skinType && (
          <div className="review-card">
            <div className="review-card-checkmark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <div className="review-card-content">
              <div className="review-card-label">Skin Type:</div>
              <div className="review-card-bubble">{state.skinType}</div>
            </div>
          </div>
        )}
        
        {state.skinTone && (
          <div className="review-card">
            <div className="review-card-checkmark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <div className="review-card-content">
              <div className="review-card-label">Skin Tone:</div>
              <div className="review-card-bubble">{state.skinTone}</div>
            </div>
          </div>
        )}
        
        {state.ethnicBackground && (
          <div className="review-card">
            <div className="review-card-checkmark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <div className="review-card-content">
              <div className="review-card-label">Ethnic Background:</div>
              <div className="review-card-bubble">{state.ethnicBackground}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
