import * as React from "react";
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
  const [issues, setIssues] = useState([] as ProviderIssue[]);
  const [token, setToken] = useState("" as string);

  useEffect(() => {
    fetch('/api/admin/issues').then(r => r.json()).then((data) => setIssues(data)).catch(console.error);
  }, []);

  async function approve(slug: string) {
    const res = await fetch('/api/admin/review/approve', {
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


  return (
    <div>
      <h2>Admin review</h2>
      <label>Admin token: <input value={token} onChange={(e: any) => setToken(e.target.value)} /></label>
      <ul>
        {issues.length === 0 && <li>No issues</li>}
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
