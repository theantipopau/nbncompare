// Shared pure helpers for displaying plan/provider information.
// Extracted from Compare.tsx so presentational components (table rows,
// modals, cards) can reuse the same logic without prop-drilling functions.

export function stripHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&lt;/g, '<')   // Decode &lt;
    .replace(/&gt;/g, '>')   // Decode &gt;
    .replace(/&amp;/g, '&')  // Decode &amp;
    .replace(/&quot;/g, '"') // Decode &quot;
    .replace(/&#39;/g, "'")  // Decode &#39;
    .replace(/<[^>]*>/g, '') // Remove any remaining tags after decode
    .trim();
}

export function getSpeedTierColor(tier: number | null | undefined): string {
  if (!tier) return '#6b7280';
  if (tier <= 12) return '#94a3b8'; // Gray for basic
  if (tier <= 25) return '#22c55e'; // Green for standard
  if (tier <= 50) return '#3b82f6'; // Blue for standard plus
  if (tier <= 100) return '#8b5cf6'; // Purple for fast
  if (tier <= 250) return '#f59e0b'; // Amber for superfast
  if (tier <= 500) return '#ef4444'; // Red for ultrafast
  if (tier <= 1000) return '#ec4899'; // Pink for home ultrafast
  return '#06b6d4'; // Cyan for 2 gigabit
}

export function getSpeedTierLabel(tier: number | null | undefined): string {
  if (!tier) return '—';
  if (tier <= 12) return 'Basic';
  if (tier <= 25) return 'Standard';
  if (tier <= 50) return 'Standard Plus';
  if (tier <= 100) return 'Fast';
  if (tier <= 250) return 'Superfast';
  if (tier <= 500) return 'Ultrafast';
  if (tier <= 1000) return 'Home Ultrafast';
  return '2 Gigabit';
}

export interface TrustBadge {
  icon: string;
  label: string;
  color: string;
}

export interface PlanTrustFields {
  provider_ipv6_support?: number;
  provider_cgnat?: number;
  provider_cgnat_opt_out?: number;
  provider_australian_support?: number;
  provider_static_ip_available?: number;
}

export function getProviderTrustBadges(plan: PlanTrustFields): TrustBadge[] {
  const badges: TrustBadge[] = [];

  if (plan.provider_ipv6_support === 1) {
    badges.push({ icon: '🌐', label: 'IPv6 Support', color: '#10b981' });
  }

  if (plan.provider_cgnat === 0 || plan.provider_cgnat_opt_out === 1) {
    badges.push({ icon: '🔓', label: 'No CGNAT', color: '#3b82f6' });
  }

  if (plan.provider_australian_support === 1) {
    badges.push({ icon: '🇦🇺', label: 'AU Support', color: '#f59e0b' });
  }

  if (plan.provider_static_ip_available === 1) {
    badges.push({ icon: '📍', label: 'Static IP', color: '#8b5cf6' });
  }

  return badges;
}
