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

interface Feedback {
  id: number;
  plan_id: number;
  issue_type: string;
  description: string;
  user_email?: string;
  resolved: number;
  admin_notes?: string;
  created_at: string;
}

interface ScraperRun {
  id: number;
  started_at: string;
  finished_at?: string;
  status: string;
  providers_checked: number;
  providers_changed: number;
  plans_updated: number;
  plans_added: number;
  plans_removed: number;
  errors_encountered: number;
  error_log?: string;
  notes?: string;
}

export default function Admin() {
  usePageTitle('Admin - NBN Compare');
  const [issues, setIssues] = useState([] as ProviderIssue[]);
  const [feedback, setFeedback] = useState([] as Feedback[]);
  const [scraperRuns, setScraperRuns] = useState([] as ScraperRun[]);
  const [token, setToken] = useState("" as string);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null as any);
  const [selectedTab, setSelectedTab] = useState('issues' as string);

  useEffect(() => {
    if (!token) {
      setIssues([]);
      setFeedback([]);
      setScraperRuns([]);
      return;
    }

    const apiUrl = getApiBaseUrl();
    
    // Fetch provider issues
    fetch(`${apiUrl}/api/admin/issues`, { headers: { 'x-admin-token': token } })
      .then(r => r.json())
      .then((data) => setIssues(Array.isArray(data) ? data : []))
      .catch(console.error);

    // Fetch user feedback
    fetch(`${apiUrl}/api/feedback`, { headers: { 'x-admin-token': token } })
      .then(r => r.json())
      .then((data) => setFeedback(Array.isArray(data) ? data : data.feedback || []))
      .catch(console.error);

    // Fetch scraper runs (if endpoint exists)
    fetch(`${apiUrl}/api/admin/scraper-runs`, { headers: { 'x-admin-token': token } })
      .then(r => r.json())
      .then((data) => setScraperRuns(Array.isArray(data) ? data : data.runs || []))
      .catch(() => setScraperRuns([])); // Silently fail if endpoint not available
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

  async function markFeedbackResolved(id: number, resolved: boolean) {
    const apiUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${apiUrl}/api/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'x-admin-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resolved: resolved ? 1 : 0 })
      });
      
      if (res.ok) {
        setFeedback(feedback.map((f: Feedback) => 
          f.id === id ? { ...f, resolved: resolved ? 1 : 0 } : f
        ));
      }
    } catch (err) {
      alert('Failed to update feedback: ' + (err as Error).message);
    }
  }


  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2>🔐 Admin Dashboard</h2>
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
            marginTop: '8px',
            marginRight: '8px'
          }}
        >
          {scraping ? '🔄 Scraping...' : '🚀 Trigger Manual Scrape'}
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #ddd', paddingBottom: '12px' }}>
        <button
          onClick={() => setSelectedTab('issues')}
          style={{
            padding: '10px 16px',
            background: selectedTab === 'issues' ? '#667eea' : 'transparent',
            color: selectedTab === 'issues' ? 'white' : '#666',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          📋 Provider Issues ({issues.length})
        </button>
        <button
          onClick={() => setSelectedTab('feedback')}
          style={{
            padding: '10px 16px',
            background: selectedTab === 'feedback' ? '#667eea' : 'transparent',
            color: selectedTab === 'feedback' ? 'white' : '#666',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          💬 User Feedback ({feedback.length})
        </button>
        <button
          onClick={() => setSelectedTab('scrapers')}
          style={{
            padding: '10px 16px',
            background: selectedTab === 'scrapers' ? '#667eea' : 'transparent',
            color: selectedTab === 'scrapers' ? 'white' : '#666',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🤖 Scraper Runs ({scraperRuns.length})
        </button>
      </div>

      {/* Issues Tab */}
      {selectedTab === 'issues' && (
        <div>
          <h3>Provider Issues</h3>
          <ul>
            {!token && <li>Enter admin token to load issues</li>}
            {token && issues.length === 0 && <li>✅ No provider issues</li>}
            {issues.map((i: any) => (
              <li key={i.id} style={{ marginBottom: '8px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
                <strong>{i.name}</strong> ({i.slug}) - {i.last_error ?? (i.needs_review ? 'Needs review' : '✓ OK')}
                <button 
                  onClick={() => approve(i.slug)}
                  style={{
                    marginLeft: '12px',
                    padding: '6px 12px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ✓ Approve & clear
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Feedback Tab */}
      {selectedTab === 'feedback' && (
        <div>
          <h3>💬 User Feedback Reports</h3>
          {!token ? (
            <p>Enter admin token to load feedback</p>
          ) : feedback.length === 0 ? (
            <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '6px', textAlign: 'center', color: '#666' }}>
              ✅ No feedback submitted yet
            </div>
          ) : (
            <div>
              {feedback.map((item: Feedback) => (
                <div key={item.id} style={{ 
                  marginBottom: '12px', 
                  padding: '16px', 
                  background: item.resolved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  border: `2px solid ${item.resolved ? '#10b981' : '#f59e0b'}`,
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div>
                      <span style={{
                        display: 'inline-block',
                        background: item.issue_type === 'wrong_price' ? '#ff6b6b' : '#667eea',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        marginRight: '8px'
                      }}>
                        {item.issue_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        Plan ID: {item.plan_id}
                      </span>
                    </div>
                    <button
                      onClick={() => markFeedbackResolved(item.id, !item.resolved)}
                      style={{
                        padding: '6px 12px',
                        background: item.resolved ? '#10b981' : '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      {item.resolved ? '✓ Resolved' : 'Mark Resolved'}
                    </button>
                  </div>
                  <p><strong>Description:</strong> {item.description}</p>
                  {item.user_email && (
                    <p><strong>Email:</strong> {item.user_email}</p>
                  )}
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Submitted: {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scrapers Tab */}
      {selectedTab === 'scrapers' && (
        <div>
          <h3>🤖 Scraper Run Logs</h3>
          {!token ? (
            <p>Enter admin token to load scraper runs</p>
          ) : scraperRuns.length === 0 ? (
            <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '6px', textAlign: 'center', color: '#666' }}>
              ⏳ No scraper runs logged yet (runs happen daily at 3 AM UTC)
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0f0f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #ddd' }}>Started</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #ddd' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #ddd' }}>Providers</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #ddd' }}>Plans Updated</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #ddd' }}>Errors</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #ddd' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {scraperRuns.map((run: ScraperRun) => {
                  const duration = run.finished_at
                    ? ((new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()) / 1000).toFixed(1) + 's'
                    : 'Running...';
                  
                  return (
                    <tr key={run.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{new Date(run.started_at).toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          display: 'inline-block',
                          background: run.status === 'success' ? '#10b981' : run.status === 'partial' ? '#f59e0b' : '#ef4444',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {run.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{run.providers_checked}</td>
                      <td style={{ padding: '12px' }}>{run.plans_updated} (+{run.plans_added}, -{run.plans_removed})</td>
                      <td style={{ padding: '12px', color: run.errors_encountered > 0 ? '#ef4444' : '#666' }}>
                        {run.errors_encountered}
                      </td>
                      <td style={{ padding: '12px' }}>{duration}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
