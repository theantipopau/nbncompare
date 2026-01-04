import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Chart: any;
  }
}

interface PriceHistory {
  id: number;
  plan_id: number;
  price_cents: number;
  recorded_at: string;
}

interface Plan {
  id: number;
  plan_name: string;
  provider_name: string;
  ongoing_price_cents: number | null;
}

interface Props {
  plan: Plan;
  history: PriceHistory[];
  loading: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function PriceHistoryModal({ plan, history, loading, onClose, darkMode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    // Prevent background scroll while modal is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button for keyboard users.
    setTimeout(() => closeButtonRef.current?.focus(), 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      // Minimal focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (!active || active === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    if (!canvasRef.current || loading || history.length === 0 || !window.Chart) {
      return;
    }

    // Destroy previous chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Sort by date ascending
    const sortedHistory = [...history].sort((a, b) => 
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );

    // Add current price if not in history
    const latestHistoryPrice = sortedHistory[sortedHistory.length - 1]?.price_cents;
    if (plan.ongoing_price_cents && latestHistoryPrice !== plan.ongoing_price_cents) {
      sortedHistory.push({
        id: 0,
        plan_id: plan.id,
        price_cents: plan.ongoing_price_cents,
        recorded_at: new Date().toISOString()
      });
    }

    const labels = sortedHistory.map(h => {
      const date = new Date(h.recorded_at);
      return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
    });

    const data = sortedHistory.map(h => h.price_cents / 100);

    chartRef.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Price ($/month)',
          data,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          tension: 0.1,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return '$' + context.parsed.y.toFixed(2) + '/mo';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value: any) {
                return '$' + value;
              },
              color: darkMode ? '#ccc' : '#666'
            },
            grid: {
              color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }
          },
          x: {
            ticks: {
              color: darkMode ? '#ccc' : '#666'
            },
            grid: {
              color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [history, loading, plan, darkMode]);

  const getPriceChange = () => {
    if (history.length < 2) return null;
    const sorted = [...history].sort((a, b) => 
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );
    const oldest = sorted[0].price_cents;
    const newest = plan.ongoing_price_cents || sorted[sorted.length - 1].price_cents;
    const change = newest - oldest;
    const percentChange = ((change / oldest) * 100).toFixed(1);
    return { change: change / 100, percent: percentChange };
  };

  const priceChange = getPriceChange();

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
      onClick={onClose}
      role="presentation"
    >
      <div 
        ref={dialogRef}
        style={{
          background: darkMode ? '#1a1a1a' : 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Price history for ${plan.provider_name} ${plan.plan_name}`}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', color: darkMode ? 'white' : '#333' }}>
              Price History
            </h2>
            <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#667eea' }}>
              {plan.provider_name} - {plan.plan_name}
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            style={{
              background: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Close
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: darkMode ? '#ccc' : '#666' }}>
            Loading price history...
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: darkMode ? '#ccc' : '#666' }}>
            <p>No price history available yet.</p>
            <p style={{ fontSize: '0.9em', marginTop: '10px' }}>
              Price changes will be tracked automatically as our system checks plans daily.
            </p>
          </div>
        ) : (
          <>
            {priceChange && (
              <div style={{
                background: priceChange.change < 0 ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                border: `2px solid ${priceChange.change < 0 ? '#16a34a' : '#dc2626'}`,
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: darkMode ? '#ccc' : '#666' }}>
                  Price change over time:
                </span>
                <span style={{
                  fontSize: '1.3em',
                  fontWeight: 'bold',
                  color: priceChange.change < 0 ? '#16a34a' : '#dc2626'
                }}>
                  {priceChange.change < 0 ? '↓' : '↑'} ${Math.abs(priceChange.change).toFixed(2)} ({priceChange.percent}%)
                </span>
              </div>
            )}

            <div style={{ height: '300px', marginBottom: '20px' }}>
              <canvas ref={canvasRef}></canvas>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '1.1em', marginBottom: '12px', color: darkMode ? 'white' : '#333' }}>
                Price Changes
              </h3>
              <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                {[...history].sort((a, b) => 
                  new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
                ).map((h, idx, arr) => {
                  const prevPrice = idx < arr.length - 1 ? arr[idx + 1].price_cents : null;
                  const change = prevPrice ? h.price_cents - prevPrice : 0;
                  return (
                    <div 
                      key={h.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '10px',
                        borderBottom: idx < arr.length - 1 ? `1px solid ${darkMode ? '#333' : '#e0e0e0'}` : 'none',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ color: darkMode ? '#ccc' : '#666' }}>
                        {new Date(h.recorded_at).toLocaleDateString('en-AU', { 
                          year: 'numeric',
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.1em', color: darkMode ? 'white' : '#333' }}>
                          ${(h.price_cents / 100).toFixed(2)}
                        </span>
                        {change !== 0 && (
                          <span style={{
                            fontSize: '0.9em',
                            color: change < 0 ? '#16a34a' : '#dc2626',
                            fontWeight: '600'
                          }}>
                            {change < 0 ? '↓' : '↑'} ${Math.abs(change / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
