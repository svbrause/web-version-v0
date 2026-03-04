/**
 * In-flow wellness step for wellnest: one question per screen (activity, body composition,
 * skin interest, conditions). Age comes from the previous step.
 * Answers are stored in state.wellnessQuizAnswers for results-screen suggestions.
 */
import { useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { WELLNESS_QUIZ } from "../../data/wellnessQuiz";
import "../../App.css";

const AGE_RANGE_TO_INDEX: Record<string, number> = {
  "18-29": 0,
  "30-39": 1,
  "40-49": 2,
  "50-59": 3,
  "60+": 4,
};

const WELLNESS_STEP_QUESTION_IDS = ["activity", "bodyComposition", "skinInterest", "conditions"] as const;
const QUESTIONS = WELLNESS_QUIZ.questions.filter((q) => WELLNESS_STEP_QUESTION_IDS.includes(q.id as any));
const WELLNESS_STEP_COUNT = QUESTIONS.length;

export default function WellnessStepScreen() {
  const { state, updateState } = useApp();
  const answers = state.wellnessQuizAnswers ?? {};
  const stepIndex = Math.min(state.wellnessStepIndex ?? 0, WELLNESS_STEP_COUNT - 1);
  const q = QUESTIONS[stepIndex];
  const isMulti = q.id === "conditions";
  const selectedForMulti = (answers[q.id] as number[] | undefined) ?? [];

  // Seed age from previous step so wellness scoring has it (once per session)
  useEffect(() => {
    if (state.ageRange && state.wellnessQuizAnswers?.age === undefined) {
      const ageIndex = AGE_RANGE_TO_INDEX[state.ageRange] ?? 0;
      updateState({
        wellnessQuizAnswers: { ...state.wellnessQuizAnswers, age: ageIndex },
      });
    }
  }, [state.ageRange, state.wellnessQuizAnswers?.age]);

  const handleSingleAnswer = (questionId: string, answerIndex: number) => {
    updateState({
      wellnessQuizAnswers: { ...state.wellnessQuizAnswers, [questionId]: answerIndex },
    });
  };

  const handleMultiToggle = (questionId: string, answerIndex: number) => {
    const current = (state.wellnessQuizAnswers?.[questionId] as number[] | undefined) ?? [];
    const next = current.includes(answerIndex)
      ? current.filter((i) => i !== answerIndex)
      : [...current, answerIndex].sort((a, b) => a - b);
    updateState({
      wellnessQuizAnswers: { ...state.wellnessQuizAnswers, [questionId]: next },
    });
  };

  // Split label into headline + optional subtitle (e.g. "Headline – detail" or "Headline (detail)")
  const getHeadlineSubtitle = (label: string) => {
    const dash = label.indexOf(" – ");
    const paren = label.indexOf(" (");
    if (dash > 0) return { headline: label.slice(0, dash).trim(), subtitle: label.slice(dash + 3).trim() };
    if (paren > 0) {
      const closeParen = label.indexOf(")", paren);
      const inside = closeParen > paren ? label.slice(paren + 2, closeParen).trim() : "";
      const after = closeParen > paren ? label.slice(closeParen + 1).trim() : label.slice(paren + 2).trim();
      const subtitle = after ? `${inside} ${after}`.trim() : inside;
      return { headline: label.slice(0, paren).trim(), subtitle };
    }
    return { headline: label, subtitle: "" };
  };

  const renderChip = (
    label: string,
    isSelected: boolean,
    onSelect: () => void,
    isMulti: boolean,
    radioValue?: number
  ) => {
    const { headline, subtitle } = getHeadlineSubtitle(label);
    const content = (
      <span className="wellness-chip-line">
        <span className="wellness-chip-headline">{headline}</span>
        {subtitle && (
          <>
            <span className="wellness-chip-sep"> – </span>
            <span className="wellness-chip-subtitle">{subtitle}</span>
          </>
        )}
      </span>
    );
    if (isMulti) {
      return (
        <button
          type="button"
          className={`wellness-chip ${isSelected ? "selected" : ""}`}
          onClick={onSelect}
          onMouseLeave={(e) => { if (!isSelected) e.currentTarget.blur(); }}
        >
          {content}
        </button>
      );
    }
    return (
      <label className="wellness-chip">
        <input
          type="radio"
          name={`wellness-${q.id}`}
          value={radioValue}
          checked={isSelected}
          onChange={onSelect}
        />
        {content}
      </label>
    );
  };

  // Use question as heading when it ends with " (Select all that apply)"; conditions gets a subtitle
  const selectAllSuffix = " (Select all that apply)";
  const isSelectAllQuestion = q.question.endsWith(selectAllSuffix);
  const mainHeading = isSelectAllQuestion
    ? q.question.slice(0, -selectAllSuffix.length).trim()
    : q.title;
  const subheading = isSelectAllQuestion
    ? (q.id === "conditions" ? "Select all that apply" : "")
    : q.question;

  return (
    <div className="question-view">
      <h1 className="main-question">{mainHeading}</h1>
      {subheading && <p className="subtitle">{subheading}</p>}
      {isMulti ? (
        <>
          <div className="wellness-chips-list">
            {q.answers.map((a, idx) => {
              const isSelected = selectedForMulti.includes(idx);
              return (
                <div key={idx}>
                  {renderChip(a.label, isSelected, () => handleMultiToggle(q.id, idx), true)}
                </div>
              );
            })}
          </div>
          {selectedForMulti.length > 0 && (
            <div className="selection-count">
              {selectedForMulti.length} selected
            </div>
          )}
        </>
      ) : (
        <div className="wellness-chips-list">
          {q.answers.map((a, idx) => (
            <div key={idx}>
              {renderChip(
                a.label,
                answers[q.id] === idx,
                () => handleSingleAnswer(q.id, idx),
                false,
                idx
              )}
            </div>
          ))}
        </div>
      )}
      {stepIndex === WELLNESS_STEP_COUNT - 1 && (
        <p className="wellness-disclaimer">
          Results are for discussion with your provider only. Compounds may be investigational and not FDA-approved for general use.
        </p>
      )}
    </div>
  );
}
