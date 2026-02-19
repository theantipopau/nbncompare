import React from 'react';
import { useComparison, Plan } from '../context/ComparisonContext';

interface ComparisonBarProps {
  onOpenModal: () => void;
  darkMode: boolean;
}

export const ComparisonBar: React.FC<ComparisonBarProps> = ({ onOpenModal, darkMode }) => {
  const { comparedPlans, removeFromComparison, clearComparison } = useComparison();

  if (comparedPlans.length === 0) {
    return null;
  }

  const barStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: darkMode ? '#1e293b' : 'white',
    borderTop: `3px solid ${darkMode ? '#3b82f6' : '#2563eb'}`,
    boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
    padding: '15px 20px',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15px',
    flexWrap: 'wrap',
  };

  const plansContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    flex: 1,
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  const planChipStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: darkMode ? '#334155' : '#f1f5f9',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
  };

  const removeButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 700,
    fontSize: '16px',
    lineHeight: '1',
    transition: 'background 0.2s',
  };

  const compareButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '15px',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  };

  const clearButtonStyle: React.CSSProperties = {
    background: 'transparent',
    color: darkMode ? '#94a3b8' : '#64748b',
    border: `2px solid ${darkMode ? '#475569' : '#cbd5e1'}`,
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={barStyle}>
      <div style={plansContainerStyle}>
        <strong style={{ fontSize: '15px', whiteSpace: 'nowrap' }}>
          🔍 Comparing {comparedPlans.length}/4:
        </strong>
        {comparedPlans.map((plan: Plan) => (
          <div key={plan.id} style={planChipStyle}>
            <span>
              {plan.provider_name} - NBN {plan.speed_tier}
            </span>
            <button
              onClick={() => removeFromComparison(plan.id)}
              style={removeButtonStyle}
              title="Remove from comparison"
              onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? '#475569' : '#e2e8f0')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={clearComparison}
          style={clearButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = darkMode ? '#334155' : '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Clear All
        </button>
        <button
          onClick={onOpenModal}
          style={compareButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
          }}
        >
          Compare Plans →
        </button>
      </div>
    </div>
  );
};
