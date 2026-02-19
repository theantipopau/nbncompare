import React, { useEffect, useRef } from 'react';
import { useComparison, Plan } from '../context/ComparisonContext';

interface ComparisonModalProps {
  onClose: () => void;
  darkMode: boolean;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ onClose, darkMode }) => {
  const { comparedPlans, removeFromComparison, clearComparison } = useComparison();
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const prevActive = document.activeElement as HTMLElement | null;

    const focusable = Array.from(el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    ));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab' && focusable.length > 0) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    first?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      prevActive?.focus();
    };
  }, [onClose]);

  if (comparedPlans.length === 0) {
    return null;
  }

  const formatPrice = (cents: number | undefined) => {
    if (!cents) return 'N/A';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    overflowY: 'auto',
  };

  const contentStyle: React.CSSProperties = {
    background: darkMode ? '#1e293b' : 'white',
    borderRadius: '12px',
    maxWidth: '1400px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  };

  const headerStyle: React.CSSProperties = {
    padding: '20px 30px',
    borderBottom: `2px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    background: darkMode ? '#1e293b' : 'white',
    zIndex: 1,
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyle: React.CSSProperties = {
    padding: '15px',
    textAlign: 'left',
    borderBottom: `2px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
    fontWeight: 600,
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: darkMode ? '#94a3b8' : '#64748b',
    position: 'sticky',
    top: '80px',
    background: darkMode ? '#1e293b' : 'white',
    zIndex: 1,
  };

  const tdStyle: React.CSSProperties = {
    padding: '15px',
    borderBottom: `1px solid ${darkMode ? '#334155' : '#f1f5f9'}`,
    verticalAlign: 'top',
  };

  const planHeaderStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const removeButtonStyle: React.CSSProperties = {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
    transition: 'background 0.2s',
  };

  const checkIcon = '✓';
  const crossIcon = '✗';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-modal-title"
      tabIndex={-1}
      ref={modalRef}
      style={modalStyle}
      onClick={onClose}
    >
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div>
            <h2 id="comparison-modal-title" style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>
              Compare Plans ({comparedPlans.length}/4)
            </h2>
            <p style={{ margin: '5px 0 0', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '14px' }}>
              Side-by-side comparison of selected NBN plans
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={clearComparison}
              style={{
                ...removeButtonStyle,
                background: darkMode ? '#475569' : '#94a3b8',
              }}
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: `2px solid ${darkMode ? '#475569' : '#cbd5e1'}`,
                color: darkMode ? '#e2e8f0' : '#334155',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Close
            </button>
          </div>
        </div>

        <div style={{ padding: '20px', overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '150px' }}>Feature</th>
                {comparedPlans.map((plan: Plan) => (
                  <th key={plan.id} style={{ ...thStyle, minWidth: '250px' }}>
                    <div style={planHeaderStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {plan.favicon_url && (
                          <img
                            src={plan.favicon_url}
                            alt={plan.provider_name}
                            style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        )}
                        <strong style={{ fontSize: '16px' }}>{plan.provider_name}</strong>
                      </div>
                      <div style={{ fontSize: '14px', color: darkMode ? '#cbd5e1' : '#475569' }}>
                        {plan.plan_name}
                      </div>
                      <button
                        onClick={() => removeFromComparison(plan.id)}
                        style={removeButtonStyle}
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Pricing */}
              <tr>
                <td style={{ ...tdStyle, fontWeight: 600 }}>Monthly Price</td>
                {comparedPlans.map((plan: Plan) => (
                  <td key={plan.id} style={tdStyle}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                      {formatPrice(plan.ongoing_price_cents)}/mo
                    </div>
                    {plan.intro_price_cents && plan.intro_price_cents < plan.ongoing_price_cents && (
                      <div style={{ marginTop: '5px', fontSize: '14px', color: '#f59e0b' }}>
                        <strong>{formatPrice(plan.intro_price_cents)}/mo</strong> for{' '}
                        {Math.floor((plan.intro_duration_days || 0) / 30)} months
                        {plan.promo_code && (
                          <div style={{ fontSize: '12px', marginTop: '3px' }}>
                            Code: <code>{plan.promo_code}</code>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Speed */}
              <tr>
                <td style={{ ...tdStyle, fontWeight: 600 }}>Download Speed</td>
                {comparedPlans.map((plan: Plan) => (
                  <td key={plan.id} style={tdStyle}>
                    <strong style={{ fontSize: '18px' }}>{plan.speed_tier} Mbps</strong>
                    {plan.typical_evening_speed_mbps && (
                      <div style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#64748b', marginTop: '3px' }}>
                        Typical evening: {plan.typical_evening_speed_mbps} Mbps
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td style={{ ...tdStyle, fontWeight: 600 }}>Upload Speed</td>
                {comparedPlans.map((plan: Plan) => (
                  <td key={plan.id} style={tdStyle}>
                    {plan.upload_speed_mbps || 'N/A'} Mbps
                  </td>
                ))}
              </tr>

              {/* Data */}
              <tr>
                <td style={{ ...tdStyle, fontWeight: 600 }}>Data Allowance</td>
                {comparedPlans.map((plan: Plan) => (
                  <td key={plan.id} style={tdStyle}>
                    {plan.data_allowance || 'Unlimited'}
                  </td>
                ))}
              </tr>

              {/* Contract */}
              <tr>
                <td style={{ ...tdStyle, fontWeight: 600 }}>Contract</td>
                {comparedPlans.map((plan: Plan) => (
                  <td key={plan.id} style={tdStyle}>
                    {plan.contract_type === 'month-to-month' ? 'No lock-in' : plan.contract_type || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Modem */}
              <tr>
                <td style={{ ...tdStyle, fontWeight: 600 }}>Modem Included</td>
                {comparedPlans.map((plan: Plan) => (
                  <td key={plan.id} style={tdStyle}>
                    <span style={{ fontSize: '18px', color: plan.modem_included ? '#10b981' : '#ef4444' }}>
                      {plan.modem_included ? checkIcon : crossIcon}
                    </span>
                    <span style={{ marginLeft: '8px' }}>
                      {plan.modem_included ? 'Yes' : 'No'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Setup Fee */}
              <tr>
                <td style={{ ...tdStyle, fontWeight: 600 }}>Setup Fee</td>
                {comparedPlans.map((plan: Plan) => (
                  <td key={plan.id} style={tdStyle}>
                    {plan.setup_fee_cents === 0 ? (
                      <span style={{ color: '#10b981', fontWeight: 600 }}>Free</span>
                    ) : (
                      formatPrice(plan.setup_fee_cents)
                    )}
                  </td>
                ))}
              </tr>

              {/* Technology */}
              <tr>
                <td style={{ ...tdStyle, fontWeight: 600 }}>Technology</td>
                {comparedPlans.map((plan: Plan) => (
                  <td key={plan.id} style={tdStyle}>
                    {plan.technology_type || plan.service_type || 'NBN'}
                  </td>
                ))}
              </tr>

              {/* Provider Features */}
              <tr>
                <td style={{ ...tdStyle, fontWeight: 600 }}>IPv6 Support</td>
                {comparedPlans.map((plan: Plan) => (
                  <td key={plan.id} style={tdStyle}>
                    <span style={{ fontSize: '18px', color: plan.provider_ipv6_support ? '#10b981' : '#94a3b8' }}>
                      {plan.provider_ipv6_support ? checkIcon : crossIcon}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td style={{ ...tdStyle, fontWeight: 600 }}>CGNAT</td>
                {comparedPlans.map((plan: Plan) => (
                  <td key={plan.id} style={tdStyle}>
                    <span style={{ fontSize: '18px', color: plan.provider_cgnat ? '#ef4444' : '#10b981' }}>
                      {plan.provider_cgnat ? 'Yes' : 'No'}
                    </span>
                    {plan.provider_cgnat === 0 && (
                      <div style={{ fontSize: '12px', color: '#10b981', marginTop: '3px' }}>
                        Direct IP
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td style={{ ...tdStyle, fontWeight: 600 }}>Support Quality</td>
                {comparedPlans.map((plan: Plan) => (
                  <td key={plan.id} style={tdStyle}>
                    {plan.provider_australian_support === 3 && '⭐⭐⭐ Excellent'}
                    {plan.provider_australian_support === 2 && '⭐⭐ Good'}
                    {plan.provider_australian_support === 1 && '⭐ Basic'}
                    {!plan.provider_australian_support && 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Value Analysis */}
              <tr>
                <td style={{ ...tdStyle, fontWeight: 600 }}>Price per Mbps</td>
                {comparedPlans.map((plan: Plan) => (
                  <td key={plan.id} style={tdStyle}>
                    {plan.ongoing_price_cents && plan.speed_tier
                      ? `$${((plan.ongoing_price_cents / 100) / plan.speed_tier).toFixed(2)}`
                      : 'N/A'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{
          padding: '20px 30px',
          borderTop: `2px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
          background: darkMode ? '#0f172a' : '#f8fafc',
          fontSize: '13px',
          color: darkMode ? '#94a3b8' : '#64748b',
        }}>
          <strong>💡 Tip:</strong> Click on a plan name to visit the provider's website. All prices are in AUD and include GST.
        </div>
      </div>
    </div>
  );
};
