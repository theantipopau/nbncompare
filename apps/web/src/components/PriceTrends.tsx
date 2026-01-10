import React, { useEffect, useState } from 'react';

interface PriceEntry {
  price_cents: number;
  recorded_at: string;
}

interface PriceTrendsProps {
  planId: number;
  _planName?: string;
}

/**
 * Show price trends over time
 * Helps consumers see if plans are getting cheaper or more expensive
 */
export function PriceTrends({ planId, _planName }: PriceTrendsProps) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPriceHistory();
  }, [planId]);

  const fetchPriceHistory = async () => {
    try {
      const response = await fetch(`/api/price-history/${planId}`);
      if (response.ok) {
        const history = await response.json();
        setData(history.history || []);
      } else {
        setError('No price history available');
      }
    } catch (err) {
      console.error('Failed to fetch price history:', err);
      setError('Failed to load price history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '10px', fontSize: '0.9em', color: '#666' }}>Loading history...</div>;
  if (error || data.length < 2) {
    return <div style={{ padding: '10px', fontSize: '0.9em', color: '#999' }}>Not enough history</div>;
  }

  const prices = data.map((d: PriceEntry) => d.price_cents / 100);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = prices[prices.length - 1];
  const startPrice = prices[0];
  const priceChange = currentPrice - startPrice;
  const priceChangePercent = (priceChange / startPrice) * 100;

  // Simple ASCII chart
  const chartHeight = 30;
  const range = maxPrice - minPrice || 1;
  const chartPoints = prices.map((p: number) => {
    const normalized = (p - minPrice) / range;
    return Math.round(normalized * (chartHeight - 1));
  });

  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      fontSize: '0.9em'
    }}>
      <div style={{ marginBottom: '8px', fontWeight: '500' }}>
        Price Trend: <span style={{
          color: priceChange < 0 ? '#10b981' : priceChange > 0 ? '#ef4444' : '#6b7280',
          fontWeight: '600'
        }}>
          {priceChange < 0 ? '↓' : priceChange > 0 ? '↑' : '→'} ${Math.abs(priceChange).toFixed(2)} ({priceChangePercent > 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%)
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(chartPoints.length, 12)}, 1fr)`,
        gap: '2px',
        marginBottom: '8px'
      }}>
        {chartPoints.slice(-12).map((height: number, idx: number) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              height: '40px'
            }}
          >
            <div
              style={{
                width: '6px',
                height: `${(height / chartHeight) * 100}%`,
                backgroundColor: priceChange < 0 ? '#10b981' : '#ef4444',
                borderRadius: '2px',
                opacity: 0.7
              }}
            />
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.8em',
        color: '#666'
      }}>
        <span>Min: ${minPrice.toFixed(2)}</span>
        <span>Avg: ${((prices.reduce((a: number, b: number) => a + b) / prices.length)).toFixed(2)}</span>
        <span>Max: ${maxPrice.toFixed(2)}</span>
      </div>

      <div style={{
        marginTop: '10px',
        paddingTop: '10px',
        borderTop: '1px solid #e5e7eb',
        fontSize: '0.85em',
        color: '#666'
      }}>
        Tracking since {new Date(data[0].recorded_at).toLocaleDateString()}
      </div>
    </div>
  );
}
