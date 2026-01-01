import React, { useEffect, useState } from "react";

export default function Provider({ slug }: { slug: string }) {
  const [provider, setProvider] = useState<any | null>(null);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/providers/${slug}`).then(r => r.json()).then(setProvider).catch(console.error);
    fetch(`/api/plans?provider=${encodeURIComponent(slug)}`).then(r => r.json()).then(setPlans).catch(console.error);
  }, [slug]);

  if (!provider) return <div>Loading...</div>;

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
