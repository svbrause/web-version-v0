import type { CaseItem } from '../types';
import '../App.css';

interface CaseDetailModalProps {
  caseItem: CaseItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CaseDetailModal({ caseItem, isOpen, onClose }: CaseDetailModalProps) {
  if (!isOpen || !caseItem) return null;

  const escapeHtml = (text: string | undefined): string => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const imageUrl = caseItem.beforeAfter || caseItem.thumbnail;
  const caseTitle = caseItem.headline || caseItem.name || 'Case';
  const casePatient = caseItem.patient;
  const caseStory = caseItem.story;
  const solvedIssues = caseItem.solved || [];
  const matchingCriteria = (caseItem.matchingCriteria || []) as string[];
  const directMatchingIssues = ((caseItem as any).directMatchingIssues || []) as string[];
  const caseTreatment = (caseItem as any).treatment;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="case-detail-overlay" onClick={handleOverlayClick}>
      <div className="case-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="case-detail-close" onClick={onClose}>×</button>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={caseTitle} 
            className="case-detail-image"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="case-detail-image" style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '200px' 
          }}>
            <div className="case-placeholder">Before/After</div>
          </div>
        )}
        <div className="case-detail-content">
          <h2 className="case-detail-title">{escapeHtml(caseTitle)}</h2>
          {casePatient && (
            <div className="case-detail-patient">
              <strong>Patient:</strong> {escapeHtml(casePatient)}
            </div>
          )}
          {solvedIssues.length > 0 && (
            <div className="case-detail-solved">
              <strong>This solved:</strong>
              <div className="case-detail-tags">
                {solvedIssues.map((issue, idx) => (
                  <span key={idx} className="case-detail-tag">{escapeHtml(String(issue))}</span>
                ))}
              </div>
            </div>
          )}
          {caseStory && (
            <div className="case-detail-story">
              <strong>Story:</strong>
              <p>{escapeHtml(caseStory)}</p>
            </div>
          )}
          {caseTreatment && (
            <div className="case-detail-treatment">
              <strong>Treatment Details:</strong>
              <p>{escapeHtml(caseTreatment)}</p>
            </div>
          )}
          {(matchingCriteria.length > 0 || directMatchingIssues.length > 0) && (
            <div className="case-detail-matching">
              <strong>Matching Criteria:</strong>
              <div className="case-detail-tags">
                {directMatchingIssues.length > 0
                  ? directMatchingIssues.map((issue: string, idx: number) => (
                      <span key={idx} className="case-detail-tag">{escapeHtml(issue)}</span>
                    ))
                  : matchingCriteria.map((criteria: string, idx: number) => (
                      <span key={idx} className="case-detail-tag">{escapeHtml(criteria)}</span>
                    ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
