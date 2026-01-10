import React, { useEffect, useState } from 'react';

interface Plan {
  id: number;
  plan_name: string;
  provider_name: string;
  intro_price_cents?: number | null;
  intro_duration_days?: number | null;
  ongoing_price_cents: number | null;
  speed_tier: number | null;
  last_checked_at?: string | null;
  source_url?: string | null;
  contract_type?: string;
  data_allowance_gb?: number;
  modem_included?: number;
  favicon_url?: string | null;
  technology_type?: string;
  promo_code?: string | null;
  promo_description?: string | null;
}

function getApiBaseUrl() {
  if (import.meta.env.DEV) {
    return 'http://localhost:8787';
  }
  return 'https://nbncompare-worker.matt-hurley91.workers.dev';
}

interface ProviderMetadata {
  name: string;
  description: string;
  logo_url?: string;
  canonical_url: string;
  ipv6_support: string;
  cgnat: string;
  cgnat_opt_out: string;
  static_ip_available: string;
  australian_support: string;
  parent_company?: string;
  routing_info?: string;
  support_hours?: string;
  last_fetch_at?: string;
}

export default function ProviderDetails() {
  // Get slug from URL path
  const pathParts = window.location.pathname.split('/');
  const slug = pathParts[pathParts.length - 1];
  
  const [provider, setProvider] = useState(null as ProviderMetadata | null);
  const [plans, setPlans] = useState([] as Plan[]);
  const [loading, setLoading] = useState(true);
  const [selectedSpeed, setSelectedSpeed] = useState('');

  useEffect(() => {
    async function fetchProviderData() {
      if (!slug) return;
      setLoading(true);
      
      try {
        const apiUrl = getApiBaseUrl();
        
        // Fetch provider metadata
        const providerRes = await fetch(`${apiUrl}/api/providers`);
        const providerData = await providerRes.json();
        const matchingProvider = providerData.providers?.find((p: Record<string, unknown>) => {
          const name = (p.name as string | undefined)?.toLowerCase().replace(/\s+/g, '-');
          return name === slug.toLowerCase();
        });
        
        if (matchingProvider) {
          setProvider(matchingProvider);
        }

        // Fetch all plans for this provider
        const plansRes = await fetch(`${apiUrl}/api/plans?provider=${encodeURIComponent(slug.replace(/-/g, ' '))}`);
        const plansData = await plansRes.json();
        
        if (plansData.plans) {
          setPlans(plansData.plans);
        }
      } catch (err) {
        console.error('Failed to fetch provider data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProviderData();
  }, [slug]);

  useEffect(() => {
    if (provider) {
      document.title = `${provider.name} NBN Plans - Compare Prices | NBN Compare`;
    }
  }, [provider]);

  const speedTiers = [...new Set(plans.map((p: Plan) => p.speed_tier).filter(Boolean))].sort((a, b) => (a as number) - (b as number));
  const filteredPlans = selectedSpeed 
    ? plans.filter((p: Plan) => String(p.speed_tier) === selectedSpeed)
    : plans;

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div className="loading">Loading provider details...</div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>Provider Not Found</h2>
        <p>Sorry, we couldn't find information for this provider.</p>
        <a href="/compare" style={{ color: '#667eea', textDecoration: 'underline' }}>
          ← Back to Compare
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
        <a href="/compare" style={{ color: '#667eea', textDecoration: 'none' }}>Compare</a>
        {' > '}
        <span>{provider.name}</span>
      </div>

      {/* Provider Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '40px',
        borderRadius: '16px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {provider.logo_url && (
            <img 
              src={provider.logo_url} 
              alt={`${provider.name} logo`}
              style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'white', padding: '10px' }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5em' }}>{provider.name}</h1>
            <p style={{ margin: 0, fontSize: '1.1em', opacity: 0.9 }}>
              {provider.description || 'Australian NBN Internet Provider'}
            </p>
          </div>
          <a
            href={provider.canonical_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'white',
              color: '#667eea',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            Visit Website →
          </a>
        </div>
      </div>

      {/* Provider Metadata Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <MetadataCard title="IPv6 Support" value={provider.ipv6_support} icon="🌐" />
        <MetadataCard title="CGNAT" value={provider.cgnat === 'no' ? 'No CGNAT' : provider.cgnat_opt_out === 'yes' ? 'Optional (can opt-out)' : 'Yes (CGNAT)'} icon="🔒" />
        <MetadataCard title="Static IP" value={provider.static_ip_available === 'yes' ? 'Available' : 'Not Available'} icon="📍" />
        <MetadataCard title="Australian Support" value={provider.australian_support === 'yes' ? 'Yes' : 'No'} icon="🇦🇺" />
        {provider.parent_company && (
          <MetadataCard title="Parent Company" value={provider.parent_company} icon="🏢" />
        )}
        {provider.support_hours && (
          <MetadataCard title="Support Hours" value={provider.support_hours} icon="⏰" />
        )}
        {provider.routing_info && (
          <MetadataCard title="Routing" value={provider.routing_info} icon="🛣️" />
        )}
      </div>

      {/* Plans Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ margin: 0 }}>📊 {provider.name} NBN Plans ({filteredPlans.length})</h2>
          
          {speedTiers.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Filter by speed:</span>
              <button
                onClick={() => setSelectedSpeed('')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: selectedSpeed === '' ? '2px solid #667eea' : '1px solid #ddd',
                  background: selectedSpeed === '' ? '#667eea' : 'white',
                  color: selectedSpeed === '' ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: selectedSpeed === '' ? 'bold' : 'normal'
                }}
              >
                All
              </button>
              {speedTiers.map((tier: unknown) => (
                <button
                  key={tier as number}
                  onClick={() => setSelectedSpeed(String(tier))}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: selectedSpeed === String(tier) ? '2px solid #667eea' : '1px solid #ddd',
                    background: selectedSpeed === String(tier) ? '#667eea' : 'white',
                    color: selectedSpeed === String(tier) ? 'white' : '#333',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: selectedSpeed === String(tier) ? 'bold' : 'normal'
                  }}
                >
                  NBN {tier as number}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredPlans.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>
            No plans found for this speed tier.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {filteredPlans
              .sort((a: Plan, b: Plan) => {
                const priceA = a.intro_price_cents ?? a.ongoing_price_cents ?? Infinity;
                const priceB = b.intro_price_cents ?? b.ongoing_price_cents ?? Infinity;
                return priceA - priceB;
              })
              .map((plan: Plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetadataCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div style={{
      background: 'white',
      border: '2px solid #e0e0e0',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <div style={{ fontSize: '2em', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '5px', fontWeight: 600 }}>
        {title}
      </div>
      <div style={{ fontSize: '1em', fontWeight: 'bold', color: '#333' }}>
        {value || 'Not specified'}
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const price = plan.intro_price_cents ?? plan.ongoing_price_cents;
  const priceDisplay = price ? `$${(price / 100).toFixed(2)}/mo` : 'Contact provider';
  
  return (
    <div style={{
      background: 'white',
      border: '2px solid #e0e0e0',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      transition: 'all 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)';
      (e.currentTarget as HTMLDivElement).style.borderColor = '#667eea';
    }}
    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
      (e.currentTarget as HTMLDivElement).style.borderColor = '#e0e0e0';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1 1 300px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3em' }}>{plan.plan_name}</h3>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {plan.speed_tier && (
              <span style={{ 
                background: '#667eea', 
                color: 'white', 
                padding: '4px 12px', 
                borderRadius: '6px', 
                fontSize: '0.85em',
                fontWeight: 'bold'
              }}>
                ⚡ NBN {plan.speed_tier}
              </span>
            )}
            {plan.modem_included === 1 && (
              <span style={{ 
                background: '#4CAF50', 
                color: 'white', 
                padding: '4px 12px', 
                borderRadius: '6px', 
                fontSize: '0.85em' 
              }}>
                📡 Modem Included
              </span>
            )}
            {plan.contract_type && plan.contract_type !== 'month-to-month' && (
              <span style={{ 
                background: '#FF9800', 
                color: 'white', 
                padding: '4px 12px', 
                borderRadius: '6px', 
                fontSize: '0.85em' 
              }}>
                🏷️ {plan.contract_type}
              </span>
            )}
            {plan.technology_type === 'fixed-wireless' && (
              <span style={{ 
                background: '#2196F3', 
                color: 'white', 
                padding: '4px 12px', 
                borderRadius: '6px', 
                fontSize: '0.85em' 
              }}>
                📡 Fixed Wireless
              </span>
            )}
          </div>

          {plan.promo_code && (
            <div style={{ 
              background: '#f0fdf4', 
              border: '1px solid #10b981', 
              borderRadius: '8px', 
              padding: '8px 12px',
              marginBottom: '12px'
            }}>
              <strong style={{ color: '#10b981' }}>🎟️ Promo Code:</strong> {plan.promo_code}
              {plan.promo_description && (
                <div style={{ fontSize: '0.9em', color: '#666', marginTop: '4px' }}>
                  {plan.promo_description}
                </div>
              )}
            </div>
          )}

          <div style={{ fontSize: '0.9em', color: '#666' }}>
            {plan.data_allowance_gb && plan.data_allowance_gb > 0 ? (
              <div>📦 Data: {plan.data_allowance_gb >= 1000 ? 'Unlimited' : `${plan.data_allowance_gb}GB`}</div>
            ) : (
              <div>📦 Data: Unlimited</div>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: '150px' }}>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' }}>
            {priceDisplay}
          </div>
          {plan.intro_price_cents && plan.ongoing_price_cents && plan.intro_price_cents !== plan.ongoing_price_cents && (
            <div style={{ fontSize: '0.9em', color: '#999', textDecoration: 'line-through', marginBottom: '8px' }}>
              ${(plan.ongoing_price_cents / 100).toFixed(2)}/mo after {plan.intro_duration_days ? `${Math.round(plan.intro_duration_days / 30)} months` : 'intro period'}
            </div>
          )}
          <a
            href={plan.source_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              marginTop: '8px'
            }}
          >
            View Plan →
          </a>
        </div>
      </div>
    </div>
  );
}
