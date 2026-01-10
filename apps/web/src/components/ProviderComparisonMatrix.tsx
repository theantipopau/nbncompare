import React, { useEffect, useState } from 'react';

interface ProviderFeature {
  label: string;
  value: string | boolean | number | null;
  display: string;
}

interface Provider {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  features: Record<string, ProviderFeature>;
  description?: string;
}

/**
 * Side-by-side provider feature matrix
 * Compare IPv6, CGNAT, static IP, support location, parent company
 */
export function ProviderComparisonMatrix() {
  const [providers, setProviders] = useState(null);
  const [selectedProviders, setSelectedProviders] = useState([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/providers/comparison');
      const data = await response.json();
      setProviders(data.providers || []);
    } catch (err) {
      console.error('Failed to fetch provider comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  const featureKeys = ['ipv6', 'cgnat', 'static_ip', 'australian_support', 'parent_company'];

  const displayedProviders = selectedProviders.length > 0
    ? providers.filter((p: Provider) => selectedProviders.includes(p.slug))
    : providers.slice(0, 5);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading providers...</div>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', marginTop: '20px' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>Compare Providers</h3>

      {selectedProviders.length === 0 && (
        <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '16px' }}>
          Showing top 5 providers. Click on providers below to customize comparison.
        </p>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', maxHeight: '100px', overflowY: 'auto' }}>
        {providers?.map((provider: Provider) => (
          <button
            key={provider.slug}
            onClick={() => {
              setSelectedProviders((prev: string[]) =>
                prev.includes(provider.slug)
                  ? prev.filter((s: string) => s !== provider.slug)
                  : [...prev, provider.slug]
              );
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: selectedProviders.includes(provider.slug) ? '#667eea' : '#e5e7eb',
              color: selectedProviders.includes(provider.slug) ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9em',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {provider.name}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Feature</th>
              {displayedProviders.map((provider: Provider) => (
                <th key={provider.slug} style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    {provider.logo_url && (
                      <img src={provider.logo_url} alt={provider.name} style={{ height: '32px', maxWidth: '80px' }} />
                    )}
                    <div style={{ fontSize: '0.85em' }}>{provider.name}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureKeys.map((featureKey, idx) => (
              <tr key={featureKey} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? 'white' : '#fafbfc' }}>
                <td style={{ padding: '12px', fontWeight: '500' }}>
                  {displayedProviders[0]?.features[featureKey]?.label}
                </td>
                {displayedProviders.map((provider: Provider) => (
                  <td key={provider.slug} style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: '#f0f9ff', borderRadius: '4px', fontSize: '0.9em' }}>
                      {provider.features[featureKey]?.display}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
