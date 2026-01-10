import React, { useEffect, useState } from "react";
import { getApiBaseUrl } from "../lib/api";
import { usePageTitle } from "../lib/usePageTitle";

interface _StatusData {
  lastRun?: {
    started_at: string;
    ended_at?: string;
    notes?: string;
  };
  providers: {
    total: number;
    upToDate: number;
    withErrors: number;
    stale: Array<{ name: string; slug: string; last_fetch_at: string | null }>;
  };
  plans: {
    total: number;
    byTier: Array<{ speed_tier: number; count: number }>;
  };
  recentErrors: Array<{
    name: string;
    slug: string;
    last_error: string;
    last_fetch_at: string;
  }>;
}

export default function Status() {
  usePageTitle('System Status - NBN Compare');
  const [status, setStatus] = (useState as any)(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const apiUrl = getApiBaseUrl();
    fetch(`${apiUrl}/api/status`)
      .then(r => r.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading status...</div>;
  if (!status) return <div style={{ padding: '40px', textAlign: 'center' }}>Failed to load status</div>;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleString('en-AU', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Australia/Sydney'
    });
  };

  const getTimeAgo = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const healthPercentage = Math.round((status.providers.upToDate / status.providers.total) * 100);
  const getHealthColor = (pct: number) => {
    if (pct >= 80) return '#10b981';
    if (pct >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const speedTierNames: Record<number, string> = {
    12: 'NBN 12',
    25: 'NBN 25',
    50: 'NBN 50',
    100: 'NBN 100',
    250: 'NBN 250',
    1000: 'NBN 1000 (Gigabit)',
    2000: 'NBN 2000 (2 Gigabit)'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        🔄 System Status
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '40px' }}>
        Real-time monitoring of NBN plan scraping and data updates
      </p>

      {/* Health Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>System Health</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: getHealthColor(healthPercentage) }}>{healthPercentage}%</div>
          <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '4px' }}>{status.providers.upToDate} of {status.providers.total} providers current</div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Plans</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#667eea' }}>{status.plans.total}</div>
          <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '4px' }}>Active NBN plans tracked</div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Last Scrape</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#333' }}>{getTimeAgo(status.lastRun?.ended_at || status.lastRun?.started_at)}</div>
          <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '4px' }}>{formatDate(status.lastRun?.ended_at || status.lastRun?.started_at)}</div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Errors</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: status.providers.withErrors > 0 ? '#ef4444' : '#10b981' }}>{status.providers.withErrors}</div>
          <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '4px' }}>{status.providers.withErrors > 0 ? 'Providers need attention' : 'All systems operational'}</div>
        </div>
      </div>

      {/* Plans by Speed Tier */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#333' }}>📊 Plans by Speed Tier</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {(status as unknown as {plans: {byTier: Array<{speed_tier: number, count: number}>}}).plans.byTier.map((tier: {speed_tier: number, count: number}) => (
            <div key={tier.speed_tier} style={{ padding: '16px', borderRadius: '8px', background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', border: '1px solid #667eea30' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#667eea', marginBottom: '4px' }}>
                {speedTierNames[tier.speed_tier] || `${tier.speed_tier} Mbps`}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#333' }}>{tier.count}</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>plans available</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Errors */}
      {status.recentErrors.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#333' }}>⚠️ Recent Errors</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(status as unknown as {recentErrors: Array<{slug: string, name: string, last_error: string, last_fetch_at: string}>}).recentErrors.map((err: {slug: string, name: string, last_error: string, last_fetch_at: string}) => (
              <div key={err.slug} style={{ padding: '16px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '600', color: '#991b1b' }}>{err.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>{getTimeAgo(err.last_fetch_at)}</div>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#7f1d1d', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {err.last_error}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stale Providers */}
      {status.providers.stale.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#333' }}>⏰ Next to Update</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {(status as unknown as {providers: {stale: Array<{slug: string, name: string, last_fetch_at: string}>}}).providers.stale.map((prov: {slug: string, name: string, last_fetch_at: string}) => (
              <div key={prov.slug} style={{ padding: '16px', borderRadius: '8px', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>{prov.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {prov.last_fetch_at ? getTimeAgo(prov.last_fetch_at) : 'Never scraped'}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', padding: '12px', background: '#eff6ff', borderRadius: '8px', fontSize: '0.9rem', color: '#1e40af' }}>
            💡 These providers will be prioritized in the next automatic scrape (daily at 3 AM AEDT)
          </div>
        </div>
      )}
    </div>
  );
}
