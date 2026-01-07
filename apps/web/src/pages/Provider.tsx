import React, { useEffect, useState } from "react";
import { getApiBaseUrl } from "../lib/api";
import { usePageTitle } from "../lib/usePageTitle";

interface ProviderReview {
  overall_rating: number | null;
  value_rating: number | null;
  speed_rating: number | null;
  support_rating: number | null;
  review_count: number;
  pros: string | null;
  cons: string | null;
  summary: string | null;
}

function StarRating({ rating, label }: { rating: number | null, label: string }) {
  if (!rating) return null;
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <span style={{ width: '80px', color: '#666', fontSize: '0.9em' }}>{label}:</span>
      <div style={{ display: 'flex', gap: '2px' }}>
        {[...Array(fullStars)].map((_, i) => <span key={`f${i}`}>⭐</span>)}
        {hasHalf && <span>⭐</span>}
        {[...Array(emptyStars)].map((_, i) => <span key={`e${i}`} style={{ opacity: 0.3 }}>⭐</span>)}
      </div>
      <span style={{ color: '#667eea', fontWeight: 'bold' }}>{rating.toFixed(1)}</span>
    </div>
  );
}

interface Provider {
  name: string;
  description: string | null;
  canonical_url: string;
  favicon_url: string | null;
  support_hours: string | null;
  routing_info: string | null;
  ipv6_support: number;
  cgnat: number;
}

interface Plan {
  id: number;
  plan_name: string;
  speed_tier: number | null;
  ongoing_price_cents: number | null;
  intro_price_cents: number | null;
  intro_duration_days: number | null;
  source_url: string | null;
}

export default function Provider({ slug }: { slug: string }) {
  const [provider, setProvider] = (useState as any)(null);
  const [plans, setPlans] = (useState as any)([]);
  const [review, setReview] = (useState as any)(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = (useState as any)(null);
  const [darkMode, _setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    const apiUrl = getApiBaseUrl();
    setLoading(true);
    setError(null);
    
    Promise.all([
      fetch(`${apiUrl}/api/providers/${slug}`).then(r => r.json()),
      fetch(`${apiUrl}/api/plans?provider=${encodeURIComponent(slug)}&limit=50`).then(r => r.json())
    ])
      .then(([providerData, plansData]) => {
        setProvider(providerData);
        setPlans(plansData.rows || plansData || []);
        // Set mock review data for now (would come from API)
        if (providerData) {
          setReview(getProviderReview(providerData.name));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load provider data');
        setLoading(false);
      });
  }, [slug]);

  usePageTitle(
    provider ? `${provider.name} NBN Plans & Reviews - NBN Compare` : 'Provider - NBN Compare',
    provider ? `Compare NBN plans from ${provider.name}. View pricing, speeds, reviews and plan details.` : undefined
  );

  // Mock review data - in production this would come from the API
  function getProviderReview(name: string): ProviderReview {
    const reviews: Record<string, ProviderReview> = {
      'Aussie Broadband': {
        overall_rating: 4.6,
        value_rating: 4.2,
        speed_rating: 4.7,
        support_rating: 4.8,
        review_count: 12453,
        pros: 'Excellent Australian support, No lock-in contracts, IPv6 support, Great CVC management',
        cons: 'Slightly higher prices than budget providers, Limited TV bundle options',
        summary: 'Aussie Broadband is consistently rated as one of the best NBN providers for customer service and network performance.'
      },
      'Telstra': {
        overall_rating: 3.8,
        value_rating: 3.2,
        speed_rating: 4.2,
        support_rating: 3.5,
        review_count: 28912,
        pros: 'Reliable network, Good speed consistency, Extensive retail presence, Telstra Plus rewards',
        cons: 'Premium pricing, Long wait times for support, Contracts can be expensive to exit',
        summary: 'Australia\'s largest provider offers reliable service but at a premium price point.'
      },
      'TPG': {
        overall_rating: 3.5,
        value_rating: 4.3,
        speed_rating: 3.4,
        support_rating: 3.0,
        review_count: 15678,
        pros: 'Very competitive pricing, No lock-in contracts, Bundled deals available',
        cons: 'Congestion during peak hours, Offshore support, Limited features',
        summary: 'TPG offers budget-friendly plans but may experience slower speeds during peak times.'
      },
      'Superloop': {
        overall_rating: 4.4,
        value_rating: 4.5,
        speed_rating: 4.5,
        support_rating: 4.2,
        review_count: 5632,
        pros: 'Great value for speed, No lock-in contracts, Good peak time performance, Transparent pricing',
        cons: 'Smaller provider, Limited brand recognition',
        summary: 'Superloop consistently delivers excellent speeds at competitive prices.'
      }
    };
    return reviews[name] || {
      overall_rating: 4.0,
      value_rating: 4.0,
      speed_rating: 4.0,
      support_rating: 3.8,
      review_count: 500,
      pros: 'Competitive pricing, Month-to-month options',
      cons: 'Limited information available',
      summary: 'A reliable NBN provider serving Australian households.'
    };
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading provider...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!provider) return <div style={{ padding: '40px', textAlign: 'center' }}>Provider not found</div>;

  const speedTiers = Array.from(new Set(plans.map((p: any) => p.speed_tier).filter((t: any): t is number => t !== null))).sort((a: any, b: any) => a - b);
  const cheapestPlan = plans.reduce((min: any, p: any) => 
    (!min || (p.ongoing_price_cents !== null && (min.ongoing_price_cents === null || p.ongoing_price_cents < min.ongoing_price_cents))) ? p : min, 
    null
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Provider Header */}
      <section style={{
        background: darkMode 
          ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.95), rgba(26, 32, 44, 0.98))'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        borderRadius: '16px',
        color: 'white',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {provider.favicon_url && (
            <img 
              src={provider.favicon_url} 
              alt={`${provider.name} logo`}
              style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'white', padding: '8px' }}
              onError={(e: any) => { e.target.style.display = 'none'; }}
            />
          )}
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '2.5em' }}>{provider.name}</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1em' }}>
              {provider.description || `NBN plans from ${provider.name}`}
            </p>
          </div>
        </div>
        
        {/* Quick stats */}
        <div style={{ 
          display: 'flex', 
          gap: '32px', 
          marginTop: '24px', 
          flexWrap: 'wrap',
          background: 'rgba(255,255,255,0.15)',
          padding: '20px',
          borderRadius: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.9em', opacity: 0.8 }}>Plans Available</div>
            <div style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{plans.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.9em', opacity: 0.8 }}>Starting From</div>
            <div style={{ fontSize: '1.8em', fontWeight: 'bold' }}>
              {cheapestPlan ? `$${(cheapestPlan.ongoing_price_cents / 100).toFixed(0)}/mo` : 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.9em', opacity: 0.8 }}>Speed Tiers</div>
            <div style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{speedTiers.join(', ')} Mbps</div>
          </div>
          {review && (
            <div>
              <div style={{ fontSize: '0.9em', opacity: 0.8 }}>Customer Rating</div>
              <div style={{ fontSize: '1.8em', fontWeight: 'bold' }}>
                ⭐ {review.overall_rating?.toFixed(1)} ({review.review_count.toLocaleString()} reviews)
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) 1fr', gap: '24px' }}>
        {/* Plans list */}
        <section>
          <h2 style={{ color: darkMode ? '#f7fafc' : '#1a202c', marginBottom: '16px' }}>
            All {provider.name} NBN Plans
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {plans.map((p: any) => (
              <article 
                key={p.id}
                style={{
                  background: darkMode ? '#2d3748' : 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div style={{ flex: '1 1 200px' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: darkMode ? '#f7fafc' : '#1a202c' }}>{p.plan_name}</h3>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.9em', color: darkMode ? '#a0aec0' : '#666' }}>
                    <span>⚡ NBN {p.speed_tier || '?'}</span>
                    {p.upload_speed_mbps && <span>⬆️ {p.upload_speed_mbps} Mbps up</span>}
                    {p.contract_type && <span>📄 {p.contract_type}</span>}
                    {p.data_allowance && <span>📊 {p.data_allowance}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#667eea' }}>
                    ${p.ongoing_price_cents ? (p.ongoing_price_cents / 100).toFixed(0) : '?'}/mo
                  </div>
                  {p.intro_price_cents && p.intro_price_cents < p.ongoing_price_cents && (
                    <div style={{ fontSize: '0.85em', color: '#10b981' }}>
                      First {p.intro_duration_days ? Math.round(p.intro_duration_days / 30) : '?'} months: ${(p.intro_price_cents / 100).toFixed(0)}/mo
                    </div>
                  )}
                  <a 
                    href={p.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.9em',
                      fontWeight: 'bold'
                    }}
                  >
                    View Plan →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Sidebar with reviews and info */}
        <aside>
          {/* Ratings */}
          {review && (
            <section style={{
              background: darkMode ? '#2d3748' : 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              marginBottom: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: darkMode ? '#f7fafc' : '#1a202c' }}>
                Customer Reviews
              </h3>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '16px',
                padding: '16px',
                background: darkMode ? '#1a202c' : '#f8f9fa',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '3em' }}>⭐</span>
                <div>
                  <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#667eea' }}>
                    {review.overall_rating?.toFixed(1)}
                  </div>
                  <div style={{ color: darkMode ? '#a0aec0' : '#666', fontSize: '0.9em' }}>
                    {review.review_count.toLocaleString()} reviews
                  </div>
                </div>
              </div>
              
              <StarRating rating={review.value_rating} label="Value" />
              <StarRating rating={review.speed_rating} label="Speed" />
              <StarRating rating={review.support_rating} label="Support" />
              
              {review.summary && (
                <p style={{ 
                  marginTop: '16px', 
                  color: darkMode ? '#e2e8f0' : '#333',
                  fontSize: '0.95em',
                  lineHeight: 1.6
                }}>
                  {review.summary}
                </p>
              )}
            </section>
          )}

          {/* Pros & Cons */}
          {review && (review.pros || review.cons) && (
            <section style={{
              background: darkMode ? '#2d3748' : 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              marginBottom: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: darkMode ? '#f7fafc' : '#1a202c' }}>
                Pros & Cons
              </h3>
              {review.pros && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ color: '#10b981', margin: '0 0 8px 0', fontSize: '0.95em' }}>✅ Pros</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: darkMode ? '#e2e8f0' : '#333' }}>
                    {(review as any).pros.split(', ').map((pro: any, i: any) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{pro}</li>
                    ))}
                  </ul>
                </div>
              )}
              {review.cons && (
                <div>
                  <h4 style={{ color: '#ef4444', margin: '0 0 8px 0', fontSize: '0.95em' }}>❌ Cons</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: darkMode ? '#e2e8f0' : '#333' }}>
                    {(review as any).cons.split(', ').map((con: any, i: any) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{con}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Provider info */}
          <section style={{
            background: darkMode ? '#2d3748' : 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: darkMode ? '#f7fafc' : '#1a202c' }}>
              Provider Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9em' }}>
              {provider.ipv6_support !== null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: darkMode ? '#e2e8f0' : '#333' }}>
                  <span>IPv6 Support</span>
                  <span style={{ color: provider.ipv6_support ? '#10b981' : '#ef4444' }}>
                    {provider.ipv6_support ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              )}
              {provider.cgnat !== null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: darkMode ? '#e2e8f0' : '#333' }}>
                  <span>CGNAT</span>
                  <span>
                    {provider.cgnat ? (provider.cgnat_opt_out ? '⚠️ Yes (opt-out available)' : '⚠️ Yes') : '✓ No CGNAT'}
                  </span>
                </div>
              )}
              {provider.australian_support !== null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: darkMode ? '#e2e8f0' : '#333' }}>
                  <span>Australian Support</span>
                  <span style={{ color: provider.australian_support >= 2 ? '#10b981' : (provider.australian_support === 1 ? '#f59e0b' : '#ef4444') }}>
                    {provider.australian_support >= 2 ? '✓ 100% AU' : (provider.australian_support === 1 ? '⚠️ Mixed' : '✗ Offshore')}
                  </span>
                </div>
              )}
              {provider.support_hours && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: darkMode ? '#e2e8f0' : '#333' }}>
                  <span>Support Hours</span>
                  <span>{provider.support_hours}</span>
                </div>
              )}
              {provider.parent_company && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: darkMode ? '#e2e8f0' : '#333' }}>
                  <span>Parent Company</span>
                  <span>{provider.parent_company}</span>
                </div>
              )}
            </div>
            
            <a 
              href={provider.canonical_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                marginTop: '20px',
                padding: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              Visit {provider.name} Website →
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}
