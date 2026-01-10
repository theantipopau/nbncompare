import React, { useState } from 'react';

interface Plan {
  id: number;
  plan_name: string;
  provider_name: string;
  speed_tier?: number;
  ongoing_price_cents: number;
}

interface Alternative {
  id: number;
  name: string;
  provider: string;
  annual_cost: number;
  savings: number;
  savings_percent: number;
  speed_upgrade: boolean;
}

interface _SavingsResult {
  current_plan: {
    id: number;
    name: string;
    provider: string;
    annual_cost: number;
  };
  alternatives: Array<{
    id: number;
    name: string;
    provider: string;
    annual_cost: number;
    savings: number;
    savings_percent: number;
    speed_upgrade: boolean;
  }>;
  best_value_id: number;
}

interface SavingsCalculatorProps {
  currentPlan: Plan;
  allPlans: Plan[];
}

/**
 * Calculate estimated annual savings
 * Shows comparison with other plans
 */
export function SavingsCalculator({ currentPlan, allPlans }: SavingsCalculatorProps) {
  const [showCalculator, setShowCalculator] = useState(false);
  const [usageGbPerMonth, setUsageGbPerMonth] = useState(250);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/savings/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_plan_id: currentPlan.id,
          proposed_plans: allPlans.map(p => p.id).filter(id => id !== currentPlan.id),
          usage_gb_per_month: usageGbPerMonth,
          months: 12
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (err) {
      console.error('Failed to calculate savings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!showCalculator) {
    return (
      <button
        onClick={() => setShowCalculator(true)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.95em',
          fontWeight: '500',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#059669';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#10b981';
        }}
      >
        💰 Calculate Savings
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={() => setShowCalculator(false)}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3em' }}>💰 How Much Can You Save?</h3>

        {!result ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Your current plan:
              </label>
              <div style={{
                padding: '12px',
                backgroundColor: '#f0fdf4',
                borderRadius: '6px',
                border: '2px solid #10b981'
              }}>
                <strong>{currentPlan.plan_name}</strong> - ${(currentPlan.ongoing_price_cents / 100).toFixed(2)}/month
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Average monthly usage (GB):
              </label>
              <input
                type="range"
                min="50"
                max="500"
                step="50"
                value={usageGbPerMonth}
                onChange={(e) => setUsageGbPerMonth(Number(e.target.value))}
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', color: '#666' }}>
                <span>50 GB</span>
                <span style={{ fontWeight: '600', color: '#10b981' }}>{usageGbPerMonth} GB</span>
                <span>500 GB</span>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1em',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Calculating...' : 'Calculate Savings'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              padding: '16px',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.9em', color: '#92400e' }}>Potential Annual Savings</div>
              <div style={{ fontSize: '2em', fontWeight: '700', color: '#b45309' }}>
                ${result.total_potential_savings.toFixed(2)}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0' }}>Alternative Plans</h4>
              {result.alternatives.slice(0, 5).map((alt: Alternative) => (
                <div
                  key={alt.id}
                  style={{
                    padding: '12px',
                    marginBottom: '10px',
                    backgroundColor: result.best_value_id === alt.id ? '#dbeafe' : '#f9fafb',
                    borderRadius: '6px',
                    border: `2px solid ${result.best_value_id === alt.id ? '#3b82f6' : '#e5e7eb'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{alt.name}</strong>
                      <div style={{ fontSize: '0.85em', color: '#666' }}>{alt.provider}</div>
                      {alt.speed_upgrade && (
                        <span style={{ fontSize: '0.8em', color: '#10b981', fontWeight: '600' }}>
                          ⬆️ Faster than current plan
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9em', color: '#666' }}>
                        ${alt.annual_cost.toFixed(2)}/year
                      </div>
                      <div style={{
                        fontSize: '1.1em',
                        fontWeight: '700',
                        color: alt.savings > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {alt.savings > 0 ? '−' : '+'} ${Math.abs(alt.savings).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>
                        {alt.savings_percent > 0 ? `${alt.savings_percent}% less` : `${Math.abs(alt.savings_percent)}% more`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setResult(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Adjust Usage
              </button>
              <button
                onClick={() => setShowCalculator(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
