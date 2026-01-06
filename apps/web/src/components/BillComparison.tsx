import React, { useState } from 'react';

interface Plan {
  id: number;
  plan_name: string;
  provider_name: string;
  ongoing_price_cents: number | null;
  speed_tier: number | null;
}

interface Props {
  darkMode: boolean;
  currentPlans: Plan[];
}

interface BillInput {
  monthlyBill: number;
  currentSpeed: number;
  currentProvider: string;
  includesPhone: boolean;
  includesTV: boolean;
}

export default function BillComparison({ darkMode, currentPlans }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [bill, setBill] = useState({
    monthlyBill: 80,
    currentSpeed: 50,
    currentProvider: '',
    includesPhone: false,
    includesTV: false,
  } as BillInput);
  const [savings, setSavings] = useState(null as number | null);
  const [betterPlans, setBetterPlans] = useState([] as Plan[]);

  const calculateSavings = () => {
    // Filter plans at same or higher speed tier
    const comparablePlans = currentPlans.filter(p => 
      p.ongoing_price_cents && 
      p.speed_tier && 
      p.speed_tier >= bill.currentSpeed
    );
    
    // Sort by price ascending
    const sortedPlans = comparablePlans.sort((a, b) => 
      (a.ongoing_price_cents || 0) - (b.ongoing_price_cents || 0)
    );
    
    // Calculate effective bill (remove bundled services estimate)
    let effectiveBill = bill.monthlyBill * 100; // Convert to cents
    if (bill.includesPhone) effectiveBill -= 1000; // Assume $10/mo for phone
    if (bill.includesTV) effectiveBill -= 2000; // Assume $20/mo for TV
    
    // Find cheaper plans
    const cheaper = sortedPlans.filter(p => 
      (p.ongoing_price_cents || 0) < effectiveBill
    ).slice(0, 5);
    
    setBetterPlans(cheaper);
    
    if (cheaper.length > 0) {
      const bestSavings = effectiveBill - (cheaper[0].ongoing_price_cents || 0);
      setSavings(Math.round(bestSavings * 12 / 100)); // Annual savings in dollars
    } else {
      setSavings(0);
    }
  };

  // Lock body scroll when modal is open - must be before early return!
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '10px 18px',
          background: darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
          color: '#f59e0b',
          border: '2px solid #f59e0b',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '0.9em',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e: any) => {
          e.currentTarget.style.background = '#f59e0b';
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e: any) => {
          e.currentTarget.style.background = darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)';
          e.currentTarget.style.color = '#f59e0b';
        }}
      >
        💰 Am I Paying Too Much?
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
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
        backdropFilter: 'blur(4px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: darkMode ? '#1a202c' : 'white',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '550px',
          width: '100%',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: darkMode ? '#f7fafc' : '#1a202c' }}>
            💰 Bill Comparison
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: darkMode ? '#a0aec0' : '#666'
            }}
          >
            ×
          </button>
        </div>

        <p style={{ color: darkMode ? '#a0aec0' : '#666', marginBottom: '24px' }}>
          Enter your current internet bill to see if you could save money.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Monthly bill */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: darkMode ? '#e2e8f0' : '#333' }}>
              💵 Current monthly bill
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2em', color: darkMode ? '#e2e8f0' : '#333' }}>$</span>
              <input
                type="number"
                min="0"
                max="500"
                value={bill.monthlyBill}
                onChange={(e) => setBill({ ...bill, monthlyBill: parseInt(e.target.value) || 0 })}
                style={{
                  padding: '12px 16px',
                  fontSize: '1.2em',
                  border: darkMode ? '2px solid #4a5568' : '2px solid #e0e0e0',
                  borderRadius: '8px',
                  background: darkMode ? '#2d3748' : 'white',
                  color: darkMode ? '#f7fafc' : '#333',
                  width: '120px'
                }}
              />
              <span style={{ color: darkMode ? '#a0aec0' : '#666' }}>per month</span>
            </div>
          </div>

          {/* Current speed */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: darkMode ? '#e2e8f0' : '#333' }}>
              ⚡ Current speed tier
            </label>
            <select
              value={bill.currentSpeed}
              onChange={(e) => setBill({ ...bill, currentSpeed: parseInt(e.target.value) })}
              style={{
                padding: '12px 16px',
                fontSize: '1em',
                border: darkMode ? '2px solid #4a5568' : '2px solid #e0e0e0',
                borderRadius: '8px',
                background: darkMode ? '#2d3748' : 'white',
                color: darkMode ? '#f7fafc' : '#333',
                width: '100%'
              }}
            >
              <option value="25">NBN 25 (Basic)</option>
              <option value="50">NBN 50 (Standard)</option>
              <option value="100">NBN 100 (Fast)</option>
              <option value="250">NBN 250 (Superfast)</option>
              <option value="500">NBN 500 (Ultrafast)</option>
              <option value="1000">NBN 1000 (Gigabit)</option>
            </select>
          </div>

          {/* Current provider */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: darkMode ? '#e2e8f0' : '#333' }}>
              🏢 Current provider (optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Telstra, Optus, TPG"
              value={bill.currentProvider}
              onChange={(e) => setBill({ ...bill, currentProvider: e.target.value })}
              style={{
                padding: '12px 16px',
                fontSize: '1em',
                border: darkMode ? '2px solid #4a5568' : '2px solid #e0e0e0',
                borderRadius: '8px',
                background: darkMode ? '#2d3748' : 'white',
                color: darkMode ? '#f7fafc' : '#333',
                width: '100%'
              }}
            />
          </div>

          {/* Bundled services */}
          <div>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', color: darkMode ? '#e2e8f0' : '#333' }}>
              📦 Does your bill include bundled services?
            </label>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: darkMode ? '#e2e8f0' : '#333' }}>
                <input
                  type="checkbox"
                  checked={bill.includesPhone}
                  onChange={(e) => setBill({ ...bill, includesPhone: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>📞 Home phone</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: darkMode ? '#e2e8f0' : '#333' }}>
                <input
                  type="checkbox"
                  checked={bill.includesTV}
                  onChange={(e) => setBill({ ...bill, includesTV: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>📺 TV/Streaming</span>
              </label>
            </div>
          </div>
        </div>

        {/* Calculate button */}
        <button
          onClick={calculateSavings}
          style={{
            width: '100%',
            padding: '14px',
            marginTop: '24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1em'
          }}
        >
          Compare My Bill
        </button>

        {/* Results */}
        {savings !== null && (
          <div style={{ marginTop: '24px' }}>
            {savings > 0 ? (
              <div style={{
                padding: '20px',
                background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                borderRadius: '12px',
                border: '2px solid #10b981'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '2em' }}>🎉</span>
                  <div>
                    <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#10b981' }}>
                      Save up to ${savings}/year!
                    </div>
                    <div style={{ color: darkMode ? '#a0aec0' : '#666', fontSize: '0.9em' }}>
                      Found {betterPlans.length} cheaper plans at the same or better speed
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: darkMode ? '#e2e8f0' : '#333' }}>
                    Top alternatives:
                  </h4>
                  {betterPlans.slice(0, 3).map((plan: Plan) => (
                    <div
                      key={plan.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
                        borderRadius: '8px',
                        marginBottom: '8px'
                      }}
                    >
                      <div>
                        <strong style={{ color: darkMode ? '#f7fafc' : '#333' }}>{plan.provider_name}</strong>
                        <div style={{ fontSize: '0.85em', color: darkMode ? '#a0aec0' : '#666' }}>
                          {plan.plan_name} • NBN {plan.speed_tier}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.1em' }}>
                          ${((plan.ongoing_price_cents || 0) / 100).toFixed(0)}/mo
                        </div>
                        <div style={{ fontSize: '0.8em', color: darkMode ? '#a0aec0' : '#666' }}>
                          Save ${((bill.monthlyBill * 100 - (plan.ongoing_price_cents || 0)) / 100).toFixed(0)}/mo
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                padding: '20px',
                background: darkMode ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)',
                borderRadius: '12px',
                border: '2px solid #667eea'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '2em' }}>👍</span>
                  <div>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#667eea' }}>
                      You're getting a good deal!
                    </div>
                    <div style={{ color: darkMode ? '#a0aec0' : '#666', fontSize: '0.9em' }}>
                      We couldn't find cheaper plans at your speed tier
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
