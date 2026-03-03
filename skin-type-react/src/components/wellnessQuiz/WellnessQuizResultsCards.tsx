/**
 * Wellness quiz results: suggested peptides with match reasons.
 * Test version – no "Add to treatment plan" (dashboard-only).
 */

import {
  getWellnessQuizMatchReasons,
  type WellnessTreatment,
} from "../../data/wellnessQuiz";
import "../WellnessQuizModal.css";

export interface WellnessQuizResultsCardsProps {
  suggestedTreatments: WellnessTreatment[];
  answers: Record<string, number | number[]>;
}

export default function WellnessQuizResultsCards({
  suggestedTreatments,
  answers,
}: WellnessQuizResultsCardsProps) {
  if (suggestedTreatments.length === 0) return null;

  return (
    <ul className="wellness-quiz-treatment-list wellness-quiz-results-cards-inline">
      {suggestedTreatments.map((t) => {
        const matchReasons = getWellnessQuizMatchReasons(answers, t.id);
        return (
          <li key={t.id} className="wellness-quiz-treatment-card">
            <div className="wellness-quiz-treatment-card-header">
              <div className="wellness-quiz-treatment-name">{t.name}</div>
              <div className="wellness-quiz-treatment-category">{t.category}</div>
            </div>
            <div className="wellness-quiz-treatment-used-for">
              <span className="wellness-quiz-treatment-used-for-label">
                What it&apos;s used for
              </span>
              <p className="wellness-quiz-treatment-summary">
                {t.summary ?? t.whatItAddresses}
              </p>
              {t.summary && (
                <p className="wellness-quiz-treatment-addresses">
                  {t.whatItAddresses}
                </p>
              )}
            </div>
            {matchReasons.length > 0 && (
              <div className="wellness-quiz-treatment-matches">
                <span className="wellness-quiz-treatment-used-for-label">
                  How this matches your answers
                </span>
                <ul className="wellness-quiz-treatment-matches-list">
                  {matchReasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="wellness-quiz-treatment-meta">
              <span>Ideal: {t.idealDemographics}</span>
              <span>Delivery: {t.deliveryMethod}</span>
              <span>Pricing: {t.pricing}</span>
              <span>Duration: {t.duration}</span>
            </div>
            {t.notes && (
              <p className="wellness-quiz-treatment-notes">{t.notes}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
