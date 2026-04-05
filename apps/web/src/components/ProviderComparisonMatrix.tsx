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
  const [providers, setProviders] = useState([] as Provider[]);
  const [selectedProviders, setSelectedProviders] = useState([] as string[]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

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
      setProviders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const featureKeys = ['ipv6', 'cgnat', 'static_ip', 'australian_support', 'parent_company'];

  const displayedProviders = selectedProviders.length > 0
    ? providers.filter((p: Provider) => selectedProviders.includes(p.slug))
    : providers.slice(0, 5);

  const shownCount = displayedProviders.length;

  // Don't render anything if loading or no providers
  if (loading || providers.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: '12px 14px', backgroundColor: '#f9fafb', borderRadius: '12px', marginTop: '12px', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: expanded ? '10px' : 0 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Compare Providers</h3>
          <div style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '2px' }}>
            {selectedProviders.length > 0 ? `Comparing ${shownCount} selected` : 'Top 5 by default'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          style={{
            padding: '6px 10px',
            backgroundColor: '#111827',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.82rem',
            whiteSpace: 'nowrap'
          }}
        >
          {expanded ? 'Hide comparison' : 'Show comparison'}
        </button>
      </div>

      {expanded && (
      <>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', maxHeight: '72px', overflowY: 'auto' }}>
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
              padding: '6px 10px',
              backgroundColor: selectedProviders.includes(provider.slug) ? '#667eea' : '#e5e7eb',
              color: selectedProviders.includes(provider.slug) ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.82rem',
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
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600' }}>Feature</th>
              {displayedProviders.map((provider: Provider) => (
                <th key={provider.slug} style={{ padding: '10px', textAlign: 'center', fontWeight: '600' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    {provider.logo_url && (
                      <img src={provider.logo_url} alt={provider.name} loading="lazy" width={80} height={32} style={{ height: '32px', maxWidth: '80px' }} />
                    )}
                    <div style={{ fontSize: '0.78rem' }}>{provider.name}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureKeys.map((featureKey, idx) => (
              <tr key={featureKey} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? 'white' : '#fafbfc' }}>
                <td style={{ padding: '10px', fontWeight: '500', fontSize: '0.88rem' }}>
                  {displayedProviders[0]?.features[featureKey]?.label}
                </td>
                {displayedProviders.map((provider: Provider) => (
                  <td key={provider.slug} style={{ padding: '10px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '3px 7px', backgroundColor: '#f0f9ff', borderRadius: '4px', fontSize: '0.82rem' }}>
                      {provider.features[featureKey]?.display}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>
      )}
    </div>
  );
}
