import React from 'react';

interface FreshnessIndicatorProps {
  lastCheckedAt?: string | null;
  lastScrapedAt?: string | null;
  isStale?: boolean;
}

/**
 * Shows when plan data was last verified
 * Builds consumer confidence by showing recency
 */
export function FreshnessIndicator({ lastCheckedAt, lastScrapedAt }: FreshnessIndicatorProps) {
  const timestamp = lastCheckedAt || lastScrapedAt;
  if (!timestamp) return null;

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  let display = '';
  let color = '#10b981'; // green
  let icon = '✓';

  if (diffDays > 7) {
    display = `${diffDays} days ago`;
    color = '#f59e0b'; // amber
    icon = '⚠';
  } else if (diffDays > 0) {
    display = `${diffDays}d ${diffHours % 24}h ago`;
    color = '#10b981'; // green
    icon = '✓';
  } else if (diffHours > 0) {
    display = `${diffHours}h ago`;
    color = '#10b981'; // green
    icon = '✓';
  } else {
    display = 'Just now';
    color = '#06b6d4'; // cyan
    icon = '●';
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.75em',
        color: color,
        fontWeight: '500',
        padding: '4px 8px',
        backgroundColor: `${color}20`,
        borderRadius: '6px',
        marginTop: '8px'
      }}
      title={`Last verified: ${date.toLocaleString()}`}
    >
      <span>{icon}</span>
      <span>Updated {display}</span>
    </div>
  );
}

interface DataQualityBadgeProps {
  issues?: string[]; // Array of issue descriptions
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Shows data quality warnings or issues
 */
export function DataQualityBadge({ issues, severity = 'warning' }: DataQualityBadgeProps) {
  if (!issues || issues.length === 0) return null;

  const colors = {
    info: { bg: '#e0f2fe', text: '#0369a1', icon: 'ℹ' },
    warning: { bg: '#fef3c7', text: '#d97706', icon: '⚠' },
    error: { bg: '#fee2e2', text: '#dc2626', icon: '✕' },
    critical: { bg: '#fecaca', text: '#991b1b', icon: '✕' }
  };

  const style = colors[severity] || colors.warning;

  return (
    <div
      style={{
        display: 'inline-block',
        padding: '6px 10px',
        backgroundColor: style.bg,
        color: style.text,
        borderRadius: '4px',
        fontSize: '0.85em',
        marginTop: '6px'
      }}
      title={issues.join('\n')}
    >
      <span style={{ marginRight: '4px' }}>{style.icon}</span>
      {issues[0]}
      {issues.length > 1 && ` (+${issues.length - 1} more)`}
    </div>
  );
}
