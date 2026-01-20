// import React from 'react';
import { useApp } from '../../context/AppContext';
import { SKIN_TYPE_DATA, NOT_SURE_QUESTIONS } from '../../constants/data';
import SkinTypeDetailScreen from './SkinTypeDetailScreen';
import "../../App.css";

// Skin type icons as SVG components
const SkinTypeIcons = {
  dry: (
    <svg width="32" height="32" viewBox="0 0 78 77" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="20.9998" width="32" height="7" rx="3.5" fill="currentColor"/>
      <rect width="45" height="7" rx="3.5" transform="matrix(1 0 0 -1 7 55.9998)" fill="currentColor"/>
      <rect y="34.9995" width="68" height="7" rx="3.5" fill="currentColor"/>
      <path d="M17.5001 14C17.5001 11.2311 18.3212 8.5243 19.8595 6.22202C21.3979 3.91973 23.5844 2.12531 26.1426 1.06569C28.7007 0.0060592 31.5157 -0.271187 34.2314 0.269007C36.9471 0.8092 39.4417 2.14257 41.3996 4.10051C43.3576 6.05844 44.6909 8.553 45.2311 11.2687C45.7713 13.9845 45.4941 16.7994 44.4344 19.3576C43.3748 21.9157 41.5804 24.1022 39.2781 25.6406C36.9758 27.1789 34.2691 28 31.5001 28L31.5001 20.9917C32.8829 20.9917 34.2347 20.5816 35.3845 19.8133C36.5342 19.0451 37.4304 17.9531 37.9596 16.6756C38.4887 15.398 38.6272 13.9922 38.3574 12.636C38.0877 11.2798 37.4218 10.034 36.444 9.05616C35.4662 8.07836 34.2204 7.41247 32.8641 7.14269C31.5079 6.87292 30.1021 7.01138 28.8245 7.54056C27.547 8.06974 26.455 8.96588 25.6868 10.1156C24.9185 11.2654 24.5085 12.6172 24.5085 14L17.5001 14Z" fill="currentColor"/>
      <path d="M34.5001 62.9998C34.5001 65.7687 35.3212 68.4755 36.8595 70.7777C38.3979 73.08 40.5844 74.8744 43.1426 75.9341C45.7007 76.9937 48.5157 77.2709 51.2314 76.7307C53.9471 76.1906 56.4417 74.8572 58.3996 72.8992C60.3576 70.9413 61.6909 68.4468 62.2311 65.731C62.7713 63.0153 62.4941 60.2003 61.4344 57.6422C60.3748 55.084 58.5804 52.8975 56.2781 51.3592C53.9758 49.8208 51.2691 48.9998 48.5001 48.9998L48.5001 56.0081C49.8829 56.0081 51.2347 56.4182 52.3845 57.1864C53.5342 57.9547 54.4304 59.0466 54.9596 60.3242C55.4887 61.6017 55.6272 63.0075 55.3574 64.3638C55.0877 65.72 54.4218 66.9658 53.444 67.9436C52.4662 68.9214 51.2204 69.5873 49.8641 69.8571C48.5079 70.1268 47.1021 69.9884 45.8245 69.4592C44.547 68.93 43.455 68.0339 42.6868 66.8841C41.9185 65.7343 41.5085 64.3826 41.5085 62.9998L34.5001 62.9998Z" fill="currentColor"/>
      <path d="M49.5001 27.9998C49.5001 25.2308 50.3212 22.5241 51.8595 20.2218C53.3979 17.9195 55.5844 16.1251 58.1426 15.0654C60.7007 14.0058 63.5157 13.7286 66.2314 14.2688C68.9471 14.809 71.4417 16.1423 73.3996 18.1003C75.3576 20.0582 76.6909 22.5528 77.2311 25.2685C77.7713 27.9842 77.4941 30.7992 76.4344 33.3573C75.3748 35.9155 73.5804 38.102 71.2781 39.6403C68.9758 41.1787 66.2691 41.9998 63.5001 41.9998L63.5001 34.9914C64.8829 34.9914 66.2347 34.5814 67.3845 33.8131C68.5342 33.0448 69.4304 31.9529 69.9596 30.6753C70.4887 29.3978 70.6272 27.992 70.3574 26.6358C70.0877 25.2795 69.4218 24.0337 68.444 23.0559C67.4662 22.0781 66.2204 21.4122 64.8641 21.1424C63.5079 20.8727 62.1021 21.0111 60.8245 21.5403C59.547 22.0695 58.455 22.9656 57.6868 24.1154C56.9185 25.2652 56.5085 26.6169 56.5085 27.9998L49.5001 27.9998Z" fill="currentColor"/>
      <circle cx="21" cy="13.9998" r="3.5" fill="currentColor"/>
      <circle cx="3.5" cy="3.5" r="3.5" transform="matrix(1 0 0 -1 34.5 66.5)" fill="currentColor"/>
      <circle cx="53" cy="27.9995" r="3.5" fill="currentColor"/>
    </svg>
  ),
  balanced: (
    <svg width="32" height="32" viewBox="0 0 91 79" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" width="63" height="6" rx="3" fill="currentColor"/>
      <rect x="25" y="73" width="40" height="6" rx="3" fill="currentColor"/>
      <rect x="7.84607" y="39.7227" width="30.2511" height="5.4993" rx="2.74965" transform="rotate(-67.6141 7.84607 39.7227)" fill="currentColor"/>
      <rect x="29.8779" y="41.981" width="31.362" height="5.4993" rx="2.74965" transform="rotate(-113.119 29.8779 41.981)" fill="currentColor"/>
      <rect x="79.0318" y="42.0027" width="31.362" height="5.4993" rx="2.74965" transform="rotate(-113.119 79.0318 42.0027)" fill="currentColor"/>
      <rect x="7.84607" y="39.7227" width="31.0618" height="5.4993" rx="2.74965" transform="rotate(-67.6141 7.84607 39.7227)" fill="currentColor"/>
      <rect x="57" y="39.7444" width="31.0618" height="5.4993" rx="2.74965" transform="rotate(-67.6141 57 39.7444)" fill="currentColor"/>
      <rect x="48" y="11" width="64" height="6" transform="rotate(90 48 11)" fill="currentColor"/>
      <path d="M2.26699 45.8609C4.04305 48.9492 6.76715 51.5365 10.1295 53.3286C13.4919 55.1206 17.3576 56.0456 21.2871 55.9983C25.2166 55.9509 29.0522 54.9332 32.3577 53.0608C35.6632 51.1884 38.3059 48.5365 39.9855 45.4066L34.4818 43.1145C33.2891 45.3371 31.4125 47.2203 29.0652 48.5499C26.7179 49.8795 23.9942 50.6022 21.2039 50.6358C18.4135 50.6694 15.6684 50.0126 13.2808 48.74C10.8931 47.4674 8.9587 45.6302 7.6975 43.4372L2.26699 45.8609Z" fill="currentColor"/>
      <path d="M51.267 45.8609C53.0431 48.9492 55.7672 51.5365 59.1295 53.3286C62.4919 55.1206 66.3576 56.0456 70.2871 55.9983C74.2166 55.9509 78.0522 54.9332 81.3577 53.0608C84.6632 51.1884 87.3059 48.5365 88.9855 45.4066L83.4818 43.1145C82.2891 45.3371 80.4125 47.2203 78.0652 48.5499C75.7179 49.8795 72.9942 50.6022 70.2039 50.6358C67.4135 50.6694 64.6684 50.0126 62.2808 48.74C59.8931 47.4674 57.9587 45.6302 56.6975 43.4372L51.267 45.8609Z" fill="currentColor"/>
    </svg>
  ),
  oily: (
    <svg width="32" height="32" viewBox="0 0 56 69" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M56 41C56 56.464 43.464 69 28 69C12.536 69 0 56.464 0 41C0 25.536 17 6.5 28 0C38 5.5 56 25.536 56 41ZM7.12105 41C7.12105 52.5311 16.4689 61.879 28 61.879C39.5311 61.879 48.879 52.5311 48.879 41C48.879 29.4689 33 12.5 28 8C23 12.5 7.12105 29.4689 7.12105 41Z" fill="currentColor"/>
      <path d="M11 43C11 45.3667 11.56 47.6998 12.6343 49.8086C13.7085 51.9174 15.2665 53.7421 17.1809 55.1336C19.0954 56.5251 21.3119 57.4438 23.6493 57.8147C25.9867 58.1856 28.3788 57.9981 30.6299 57.2676L28.9706 52.1544C27.5263 52.6231 25.9915 52.7433 24.4917 52.5054C22.992 52.2674 21.5699 51.6779 20.3415 50.7851C19.1132 49.8924 18.1136 48.7216 17.4243 47.3685C16.735 46.0155 16.3757 44.5185 16.3757 43L11 43Z" fill="currentColor"/>
      <circle cx="29.69" cy="54.7501" r="2.69" fill="currentColor"/>
      <circle cx="13.69" cy="42.99" r="2.69" fill="currentColor"/>
    </svg>
  ),
  combination: (
    <svg width="32" height="32" viewBox="0 0 59 58" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="26.0161" y="4" width="6" height="46" fill="currentColor"/>
      <path d="M17.6032 45.9498C17.2127 45.5593 17.2127 44.9261 17.6032 44.5356L20.4317 41.7071C20.8222 41.3166 21.4553 41.3166 21.8459 41.7071L32.5505 52.4118C32.941 52.8023 32.941 53.4355 32.5505 53.826L29.7221 56.6544C29.3315 57.0449 28.6984 57.0449 28.3078 56.6544L17.6032 45.9498Z" fill="currentColor"/>
      <path d="M36.1878 41.7071C36.5783 41.3166 37.2115 41.3166 37.602 41.7071L40.4304 44.5355C40.821 44.9261 40.821 45.5592 40.4304 45.9497L29.7258 56.6544C29.3353 57.0449 28.7021 57.0449 28.3116 56.6544L25.4832 53.8259C25.0926 53.4354 25.0926 52.8023 25.4832 52.4117L36.1878 41.7071Z" fill="currentColor"/>
      <path d="M4.01611 10C12.1828 5.33335 33.6161 -1.19998 54.0161 10" stroke="currentColor" strokeWidth="6"/>
      <path d="M44.4375 15.246C44.0823 14.8231 44.1373 14.1923 44.5603 13.8372L53.8716 6.01853L57.2147 9.99985C57.5699 10.4228 57.5149 11.0536 57.0919 11.4087L48.5464 18.5843C48.1234 18.9395 47.4926 18.8845 47.1375 18.4615L44.4375 15.246Z" fill="currentColor"/>
      <path d="M57.0161 -4.37114e-08C57.5684 -1.95703e-08 58.0161 0.447715 58.0161 1L58.0161 9.7C58.0161 10.8046 57.1207 11.7 56.0161 11.7L52.0161 11.7L52.0161 0.999999C52.0161 0.447714 52.4638 -2.42698e-07 53.0161 -2.18557e-07L57.0161 -4.37114e-08Z" fill="currentColor"/>
      <path d="M1.01611 -4.37114e-08C0.463829 -1.95703e-08 0.0161133 0.447715 0.0161137 1L0.0161138 9.77C0.0161138 10.8746 0.911544 11.77 2.01611 11.77L6.01611 11.77L6.01611 1C6.01611 0.447716 5.5684 -2.42698e-07 5.01611 -2.18557e-07L1.01611 -4.37114e-08Z" fill="currentColor"/>
      <path d="M13.5169 15.2485C13.872 14.8255 13.817 14.1948 13.3941 13.8396L3.98613 5.93988L0.64307 9.9212C0.287923 10.3442 0.342889 10.9749 0.765841 11.3301L9.40797 18.5868C9.83093 18.9419 10.4617 18.8869 10.8168 18.464L13.5169 15.2485Z" fill="currentColor"/>
    </svg>
  ),
  'not-sure': (
    <svg width="32" height="32" viewBox="0 0 119 119" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M119 59.5C119 92.3609 92.3609 119 59.5 119C26.6391 119 0 92.3609 0 59.5C0 26.6391 26.6391 0 59.5 0C92.3609 0 119 26.6391 119 59.5ZM6.505 59.5C6.505 88.7683 30.2317 112.495 59.5 112.495C88.7683 112.495 112.495 88.7683 112.495 59.5C112.495 30.2317 88.7683 6.505 59.5 6.505C30.2317 6.505 6.505 30.2317 6.505 59.5Z" fill="currentColor"/>
      <path d="M56.576 76.348C56.5187 73.1947 56.7193 70.328 57.178 67.748C57.694 65.168 59.07 62.7027 61.306 60.352C62.5673 59.0333 63.886 57.7433 65.262 56.482C66.638 55.2207 67.8993 53.9593 69.046 52.698C70.1927 51.3793 71.1387 50.032 71.884 48.656C72.6867 47.28 73.088 45.7893 73.088 44.184C73.088 42.636 72.7727 41.2027 72.142 39.884C71.5687 38.508 70.7087 37.3327 69.562 36.358C68.4153 35.326 67.0107 34.5233 65.348 33.95C63.6853 33.3767 61.7933 33.09 59.672 33.09C57.5507 33.09 55.6587 33.4627 53.996 34.208C52.3333 34.9533 50.9287 35.9853 49.782 37.304C48.6927 38.6227 47.8613 40.1707 47.288 41.948C46.7147 43.668 46.4567 45.56 46.514 47.624H41.268C41.0387 44.7573 41.354 42.1487 42.214 39.798C43.074 37.4473 44.3353 35.4407 45.998 33.778C47.718 32.058 49.7533 30.7393 52.104 29.822C54.4547 28.9047 57.0347 28.446 59.844 28.446C62.768 28.446 65.3767 28.8473 67.67 29.65C70.0207 30.3953 71.9987 31.4847 73.604 32.918C75.2093 34.294 76.442 35.9853 77.302 37.992C78.162 39.9987 78.592 42.206 78.592 44.614C78.592 47.1367 78.0187 49.3153 76.872 51.15C75.7827 52.9273 74.4353 54.59 72.83 56.138C71.2247 57.686 69.562 59.2627 67.842 60.868C66.122 62.416 64.6313 64.1647 63.37 66.114C62.3953 67.6047 61.8507 69.2673 61.736 71.102C61.6213 72.8793 61.564 74.628 61.564 76.348H56.576ZM56.06 92V84.432H62.338V92H56.06Z" fill="currentColor"/>
    </svg>
  )
};

export default function SkinTypeScreen() {
  const { state, updateState } = useApp();

  const handleSkinTypeSelect = (skinType: string) => {
    if (skinType === 'not-sure') {
      updateState({
        inNotSureFlow: true,
        notSureQuestionIndex: 0,
        notSureAnswers: [],
        showingSkinTypeDetail: false,
        cameFromNotSureFlow: false
      });
    } else {
      // Direct selection - no detail screen, just set the skin type
      updateState({ 
        skinType, 
        inNotSureFlow: false,
        showingSkinTypeDetail: false,
        cameFromNotSureFlow: false
      });
    }
  };

  const handleNotSureAnswer = (answerIndex: number) => {
    // Store answer as index (matching parent folder implementation)
    const currentAnswers = [...state.notSureAnswers];
    currentAnswers[state.notSureQuestionIndex] = answerIndex;
    
    // Just store the answer, don't auto-advance - user will click next
    updateState({
      notSureAnswers: currentAnswers
    });
  };


  const skinTypes = ['dry', 'balanced', 'oily', 'combination', 'not-sure'] as const;

  // Show detail screen ONLY if it was determined from "not sure" flow
  if (state.showingSkinTypeDetail && state.skinType && state.skinType !== 'not-sure') {
    return <SkinTypeDetailScreen skinType={state.skinType} />;
  }

  // Show questions view if in not sure flow
  if (state.inNotSureFlow) {
    const currentQuestion = NOT_SURE_QUESTIONS[state.notSureQuestionIndex];
    
    return (
      <div className="question-view">
        <div className="questions-view">
          <h1 className="main-question">{currentQuestion.question}</h1>
          <p className="subtitle">{currentQuestion.subtitle}</p>
          
          <div className="question-options">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = state.notSureAnswers[state.notSureQuestionIndex] === idx;
              return (
                <button
                  key={idx}
                  className={`question-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleNotSureAnswer(idx)}
                  onMouseLeave={(e) => {
                    // Reset visual state when mouse leaves during drag
                    if (!isSelected) {
                      e.currentTarget.blur();
                    }
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="question-view">
      <h1 className="main-question">What is your skin type?</h1>
      <p className="subtitle">Your skin type is the blueprint for your personalized skincare journey.</p>
      
      <div className="skin-type-grid">
        {skinTypes.map(type => {
          const isSelected = state.skinType === type;
          const data = SKIN_TYPE_DATA[type] || { title: 'Not Sure' };
          
          return (
            <button
              key={type}
              className={`skin-type-option ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSkinTypeSelect(type)}
              onMouseLeave={(e) => {
                // Reset visual state when mouse leaves during drag
                if (!isSelected) {
                  e.currentTarget.blur();
                }
              }}
            >
              <div className="skin-type-icon">
                {SkinTypeIcons[type]}
              </div>
              <span>{data.title}</span>
            </button>
          );
        })}
      </div>

      {state.skinType && state.skinType !== 'not-sure' && SKIN_TYPE_DATA[state.skinType] && (
        <div className="characteristics-container">
          {SKIN_TYPE_DATA[state.skinType].characteristics.map((char, idx) => (
            <div key={idx} className="characteristic-tag">{char}</div>
          ))}
        </div>
      )}
    </div>
  );
}
