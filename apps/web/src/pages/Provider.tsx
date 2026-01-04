import React, { useEffect, useState } from "react";
import { getApiBaseUrl } from "../lib/api";
import { usePageTitle } from "../lib/usePageTitle";

export default function Provider({ slug }: { slug: string }) {
  const [provider, setProvider] = useState<any | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = getApiBaseUrl();
    setLoading(true);
    setError(null);
    
    Promise.all([
      fetch(`${apiUrl}/api/providers/${slug}`).then(r => r.json()),
      fetch(`${apiUrl}/api/plans?provider=${encodeURIComponent(slug)}`).then(r => r.json())
    ])
      .then(([providerData, plansData]) => {
        setProvider(providerData);
        setPlans(plansData.rows || plansData || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load provider data');
        setLoading(false);
      });
  }, [slug]);

  usePageTitle(
    provider ? `${provider.name} NBN Plans - NBN Compare` : 'Provider - NBN Compare',
    provider ? `Compare NBN plans from ${provider.name}. View pricing, speeds, and plan details.` : undefined
  );

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading provider...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!provider) return <div style={{ padding: '40px', textAlign: 'center' }}>Provider not found</div>;

  return (
    <div>
      <h2>{provider.name}</h2>
      <p>Source: <a href={provider.canonical_url} target="_blank" rel="noreferrer">{provider.canonical_url}</a></p>
      <p>Last checked: {provider.last_fetch_at ?? 'Not stated'}</p>
      <section className="grid">
        {plans.map(p => (
          <article className="card" key={p.id}>{/* reuse plan card */}
            <h3>{p.plan_name}</h3>
            <p>Price: {p.ongoing_price_cents ? `$${(p.ongoing_price_cents/100).toFixed(2)}` : 'Not stated'}</p>
            <p>Speed: {p.speed_tier ?? 'Not stated'}</p>
            <a href={p.source_url} target="_blank" rel="noopener noreferrer">View source</a>
          </article>
        ))}
      </section>
    </div>
  );
}
