import * as React from "react";
import { getApiBaseUrl } from "../lib/api";
import { usePageTitle } from "../lib/usePageTitle";
const { useEffect, useState } = React as any;

interface ProviderIssue {
  id: number;
  name: string;
  slug: string;
  canonical_url: string;
  last_error?: string | null;
  needs_review?: number;
}

export default function Admin() {
  usePageTitle('Admin - NBN Compare');
  const [issues, setIssues] = useState([] as ProviderIssue[]);
  const [token, setToken] = useState("" as string);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null as any);

  useEffect(() => {
    if (!token) {
      setIssues([]);
      return;
    }

    const apiUrl = getApiBaseUrl();
    fetch(`${apiUrl}/api/admin/issues`, { headers: { 'x-admin-token': token } })
      .then(r => r.json())
      .then((data) => setIssues(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [token]);

  async function approve(slug: string) {
    const apiUrl = getApiBaseUrl();
    const res = await fetch(`${apiUrl}/api/admin/review/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ provider_slug: slug }),
    });
    if (res.ok) {
      setIssues(issues.filter((i: any) => i.slug !== slug));
    } else {
      const body = await res.json();
      alert('Error: ' + JSON.stringify(body));
    }
  }

  async function triggerManualScrape() {
    if (!token) {
      alert('Please enter admin token first');
      return;
    }
    setScraping(true);
    setScrapeResult(null);
    const apiUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${apiUrl}/internal/cron/run`, {
        method: 'GET',
        headers: { 'x-admin-token': token }
      });
      const data = await res.json();
      setScrapeResult(data);
      alert('Scrape completed! Check the result below.');
      // Refresh issues list
      const issuesRes = await fetch(`${apiUrl}/api/admin/issues`, { headers: { 'x-admin-token': token } });
      const issuesData = await issuesRes.json();
      setIssues(Array.isArray(issuesData) ? issuesData : []);
    } catch (err) {
      alert('Scrape failed: ' + (err as Error).message);
      setScrapeResult({ error: (err as Error).message });
    } finally {
      setScraping(false);
    }
  }


  return (
    <div>
      <h2>Admin Panel</h2>
      <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '12px' }}>
        <label style={{ display: 'block', marginBottom: '12px' }}>
          <strong>Admin Token:</strong>{' '}
          <input 
            type="password"
            value={token} 
            onChange={(e: any) => setToken(e.target.value)} 
            style={{ marginLeft: '8px', padding: '8px 12px', borderRadius: '6px', border: '2px solid #ddd', minWidth: '300px' }}
          />
        </label>
        <button 
          onClick={triggerManualScrape} 
          disabled={scraping || !token}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '8px',
            border: 'none',
            background: scraping ? '#999' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            cursor: scraping ? 'not-allowed' : 'pointer',
            marginTop: '8px'
          }}
        >
          {scraping ? '🔄 Scraping... (this may take 1-2 minutes)' : '🚀 Trigger Manual Scrape'}
        </button>
        {scraping && (
          <p style={{ marginTop: '12px', fontSize: '0.9em', color: '#666', fontStyle: 'italic' }}>
            ⏳ Fetching and parsing plans from 30+ provider websites. Please wait...
          </p>
        )}
      </div>

      {scrapeResult && (
        <div style={{ 
          marginBottom: '24px', 
          padding: '16px', 
          background: scrapeResult.ok ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          borderRadius: '12px',
          border: `2px solid ${scrapeResult.ok ? '#10b981' : '#ef4444'}`
        }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Scrape Result:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{JSON.stringify(scrapeResult, null, 2)}</pre>
        </div>
      )}

      <h3>Provider Issues</h3>
      <ul>
        {!token && <li>Enter admin token to load issues</li>}
        {token && issues.length === 0 && <li>No issues</li>}
        {issues.map((i: any) => (
          <li key={i.id}>
            <strong>{i.name}</strong> ({i.slug}) - {i.last_error ?? (i.needs_review ? 'Needs review' : '')}
            <button onClick={() => approve(i.slug)}>Approve & clear</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
