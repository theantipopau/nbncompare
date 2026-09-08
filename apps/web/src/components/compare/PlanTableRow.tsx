import React from "react";
import { ProviderTooltip } from "../ProviderTooltip";
import { getProviderTrustBadges, getSpeedTierColor, getSpeedTierLabel, stripHtml } from "../../lib/planDisplay";
import { useComparison, Plan as ComparisonPlan } from "../../context/ComparisonContext";

interface Plan {
  id: number;
  plan_name: string;
  provider_name: string;
  intro_price_cents?: number | null;
  intro_duration_days?: number | null;
  ongoing_price_cents: number | null;
  speed_tier: number | null;
  source_url?: string | null;
  contract_type?: string;
  modem_included?: number;
  favicon_url?: string | null;
  technology_type?: string;
  upload_speed_mbps?: number | null;
  price_trend?: 'up' | 'down' | null;
  promo_code?: string | null;
  promo_description?: string | null;
  provider_ipv6_support?: number;
  provider_cgnat?: number;
  provider_cgnat_opt_out?: number;
  provider_static_ip_available?: number;
  provider_australian_support?: number;
  provider_parent_company?: string | null;
  provider_routing_info?: string | null;
  provider_description?: string | null;
  provider_support_hours?: string | null;
}

interface PlanTableRowProps {
  plan: Plan;
  darkMode: boolean;
  isFavorite: boolean;
  isBestValue: boolean;
  showOngoingInsteadOfIntro: boolean;
  renderLogo: (plan: Plan) => React.ReactNode;
  onToggleFavorite: (planId: number) => void;
  onViewPriceHistory: (plan: Plan) => void;
}

function PriceCell({ plan, darkMode, showOngoingInsteadOfIntro }: {
  plan: Plan;
  darkMode: boolean;
  showOngoingInsteadOfIntro: boolean;
}) {
  const trendIndicator = plan.price_trend && (
    <span
      className={`price-trend price-trend--${plan.price_trend}`}
      title={plan.price_trend === 'down' ? 'Price decreased' : 'Price increased'}
    >
      {plan.price_trend === 'down' ? '↓' : '↑'}
    </span>
  );

  if (showOngoingInsteadOfIntro && plan.intro_price_cents) {
    return (
      <div className="price-cell">
        <div className="price-cell__row">
          <span className={`price-cell__amount ${darkMode ? 'price-cell__amount--dark' : ''}`}>
            ${(plan.ongoing_price_cents! / 100).toFixed(0)}
          </span>
          <span className={`price-cell__unit ${darkMode ? 'price-cell__unit--dark' : ''}`}>/mo</span>
          {trendIndicator}
        </div>
        <div className="price-cell__intro-note">
          💰 First {Math.round(plan.intro_duration_days! / 30)}mo: ${(plan.intro_price_cents / 100).toFixed(0)}
        </div>
      </div>
    );
  }

  if (plan.intro_price_cents) {
    return (
      <div className="price-cell">
        <div className="price-cell__row">
          <span className="price-cell__amount price-cell__amount--intro">
            ${(plan.intro_price_cents / 100).toFixed(0)}
          </span>
          <span className={`price-cell__duration ${darkMode ? 'price-cell__duration--dark' : ''}`}>
            {plan.intro_duration_days ? `${Math.round(plan.intro_duration_days / 30)}mo` : 'intro'}
          </span>
          {trendIndicator}
        </div>
        <div className="price-cell__then">then ${(plan.ongoing_price_cents! / 100).toFixed(0)}/mo</div>
      </div>
    );
  }

  if (plan.ongoing_price_cents) {
    return (
      <div className="price-cell__row">
        <span className={`price-cell__amount ${darkMode ? 'price-cell__amount--dark' : ''}`}>
          ${(plan.ongoing_price_cents / 100).toFixed(0)}
        </span>
        <span className={`price-cell__unit ${darkMode ? 'price-cell__unit--dark' : ''}`}>/mo</span>
        {trendIndicator}
      </div>
    );
  }

  return <span className={`price-cell__unavailable ${darkMode ? 'price-cell__unavailable--dark' : ''}`}>Contact provider</span>;
}

const TECH_BADGES: Record<string, { icon: string; label: string; className: string }> = {
  'fixed-wireless': { icon: '📡', label: 'Fixed Wireless', className: 'tech-badge--wireless' },
  satellite: { icon: '🛰️', label: 'Satellite', className: 'tech-badge--satellite' },
  '5g-home': { icon: '📶', label: '5G Home', className: 'tech-badge--5g' },
  fttp: { icon: '🚀', label: 'FTTP', className: 'tech-badge--fttp' },
  fttc: { icon: '🏢', label: 'FTTC', className: 'tech-badge--fttc' },
  fttn: { icon: '🏠', label: 'FTTN', className: 'tech-badge--fttn' },
};

export function PlanTableRow({
  plan,
  darkMode,
  isFavorite,
  isBestValue,
  showOngoingInsteadOfIntro,
  renderLogo,
  onToggleFavorite,
  onViewPriceHistory,
}: PlanTableRowProps) {
  const { addToComparison, removeFromComparison, isComparing } = useComparison();
  const comparisonId = String(plan.id);
  const isInCompare = isComparing(comparisonId);
  const trustBadges = getProviderTrustBadges(plan);
  const techBadge = plan.technology_type ? TECH_BADGES[plan.technology_type] : undefined;

  const toggleComparison = () => {
    if (isInCompare) {
      removeFromComparison(comparisonId);
      return;
    }

    addToComparison({
      ...plan,
      id: comparisonId,
      speed_tier: plan.speed_tier ?? 0,
      ongoing_price_cents: plan.ongoing_price_cents ?? 0,
    } as ComparisonPlan);
  };

  return (
    <tr className={`plan-row ${isFavorite ? 'favorite-row' : ''}`}>
      <td className="plan-row__logo-cell">{renderLogo(plan)}</td>

      <td className="provider-name plan-row__provider-cell">
        <div className="plan-row__provider-info">
          <div className="plan-row__provider-name-line">
            <a
              href={`/provider/${(plan.provider_name || '').toLowerCase().replace(/\s+/g, '-')}`}
              className="plan-row__provider-link"
            >
              {plan.provider_name}
            </a>
            <ProviderTooltip
              provider={{
                name: plan.provider_name,
                description: plan.provider_description,
                ipv6_support: plan.provider_ipv6_support ?? 0,
                cgnat: plan.provider_cgnat ?? 0,
                cgnat_opt_out: plan.provider_cgnat_opt_out ?? 0,
                static_ip_available: plan.provider_static_ip_available ?? 0,
                australian_support: plan.provider_australian_support ?? 0,
                parent_company: plan.provider_parent_company,
                routing_info: plan.provider_routing_info,
                support_hours: plan.provider_support_hours,
              }}
              darkMode={darkMode}
            />
          </div>
          {trustBadges.length > 0 && (
            <div className="plan-row__trust-badges">
              {trustBadges.map((badge, idx) => (
                <span
                  key={idx}
                  title={badge.label}
                  className="trust-badge"
                  style={{ background: `${badge.color}15`, color: badge.color, borderColor: `${badge.color}40` }}
                >
                  {badge.icon}
                </span>
              ))}
            </div>
          )}
        </div>
      </td>

      <td className="plan-row__details-cell">
        <div className="plan-row__plan-name">{stripHtml(plan.plan_name)}</div>
        {isBestValue && (
          <span
            className="plan-row__best-value-badge"
            title={`Best Value = Price + Quality Score\n\nThis plan offers the optimal balance of:\n• Competitive pricing\n${plan.provider_australian_support && plan.provider_australian_support >= 1 ? '• Australian support team\n' : ''}${plan.provider_cgnat === 0 || (plan.provider_cgnat_opt_out && plan.provider_cgnat_opt_out >= 1) ? '• No CGNAT (or opt-out available)\n' : ''}${plan.provider_ipv6_support && plan.provider_ipv6_support >= 1 ? '• IPv6 support\n' : ''}${plan.provider_static_ip_available && plan.provider_static_ip_available >= 1 ? '• Static IP available\n' : ''}${plan.provider_routing_info && (plan.provider_routing_info || '').toLowerCase().includes('direct') ? '• Direct routing/good network POIs\n' : ''}${plan.modem_included === 1 ? '• Modem included\n' : ''}\nNot just the cheapest, but the best overall value for this speed tier.`}
          >
            ⭐ Best Value
          </span>
        )}
        <div className="plan-row__badge-row">
          {plan.promo_code && (
            <span className="plan-badge plan-badge--promo" title={`Use code: ${plan.promo_code}${plan.promo_description ? ` - ${plan.promo_description}` : ''}`}>
              🎟️ {plan.promo_code}
            </span>
          )}
          {plan.modem_included === 1 && <span className="plan-badge plan-badge--modem">📡 Modem</span>}
          {plan.contract_type && plan.contract_type !== 'month-to-month' && (
            <span className="plan-badge plan-badge--contract">🏷️ {plan.contract_type}</span>
          )}
          {techBadge && (
            <span className={`plan-badge ${techBadge.className}`}>
              {techBadge.icon} {techBadge.label}
            </span>
          )}
        </div>
      </td>

      <td className="plan-row__price-cell">
        <PriceCell plan={plan} darkMode={darkMode} showOngoingInsteadOfIntro={showOngoingInsteadOfIntro} />
      </td>

      <td className="hide-mobile plan-row__speed-cell">
        <div
          className="speed-tier-pill"
          style={{ background: `${getSpeedTierColor(plan.speed_tier)}15`, borderColor: `${getSpeedTierColor(plan.speed_tier)}40` }}
        >
          <span className="speed-tier-pill__value" style={{ color: getSpeedTierColor(plan.speed_tier) }}>
            {plan.speed_tier ?? '—'}
          </span>
          <span className={`speed-tier-pill__unit ${darkMode ? 'speed-tier-pill__unit--dark' : ''}`}>Mbps</span>
        </div>
        <div className="speed-tier-label" style={{ color: getSpeedTierColor(plan.speed_tier) }}>
          {getSpeedTierLabel(plan.speed_tier)}
        </div>
        {plan.upload_speed_mbps && (
          <div className={`speed-tier-upload ${darkMode ? 'speed-tier-upload--dark' : ''}`}>
            ↑ {plan.upload_speed_mbps} Mbps upload
          </div>
        )}
      </td>

      <td className="plan-row__actions-cell">
        <div className="plan-row__actions">
          <button
            onClick={() => onToggleFavorite(plan.id)}
            className={`plan-action-btn plan-action-btn--favorite ${isFavorite ? 'plan-action-btn--favorite-active' : ''} ${darkMode ? 'plan-action-btn--dark' : ''}`}
          >
            {isFavorite ? '⭐' : '☆'}
          </button>
          <button
            onClick={() => onViewPriceHistory(plan)}
            className="plan-action-btn plan-action-btn--history"
            title="View price history"
          >
            📊
          </button>
          <button
            onClick={toggleComparison}
            className={`plan-action-btn plan-action-btn--compare ${isInCompare ? 'plan-action-btn--compare-active' : ''} ${darkMode ? 'plan-action-btn--dark' : ''}`}
          >
            {isInCompare ? '✓ Compare' : 'Compare'}
          </button>
          {plan.source_url ? (
            <a href={plan.source_url} target="_blank" rel="noopener noreferrer" className="plan-action-link">
              Details →
            </a>
          ) : (
            <span className="plan-action-empty">—</span>
          )}
        </div>
      </td>
    </tr>
  );
}
