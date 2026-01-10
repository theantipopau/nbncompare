import React, { useState } from 'react';
import { ProviderTooltip } from './ProviderTooltip';
import { FreshnessIndicator } from './FreshnessIndicator';

interface PlanCardProps {
  plan: any;
  darkMode: boolean;
  isFavorite: boolean;
  onToggleFavorite: (planId: number) => void;
  onCompare: (planId: number) => void;
  onPriceHistory: (planId: number) => void;
  getProviderColor: (name: string) => string;
  getProviderInitials: (name: string) => string;
  stripHtml: (str: string | null | undefined) => string;
  isBestValue?: boolean;
  isPopular?: boolean;
  isCheapest?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  darkMode,
  isFavorite,
  onToggleFavorite,
  onCompare,
  onPriceHistory,
  getProviderColor,
  getProviderInitials,
  stripHtml,
  isBestValue,
  isPopular,
  isCheapest
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const cardStyle = {
    background: darkMode ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.95), rgba(26, 32, 44, 0.98))' : 'white',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    marginBottom: '16px',
    border: isFavorite ? `2px solid ${darkMode ? '#667eea' : '#667eea'}` : 'none',
    transition: 'all 0.3s ease',
  };

  const badgeStyle = {
    fontSize: '0.65em',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginRight: '4px',
    marginBottom: '4px'
  };

  return (
    <div style={cardStyle}>
      {/* Badges */}
      <div style={{ marginBottom: '12px', minHeight: '20px' }}>
        {isBestValue && (
          <span style={{ ...badgeStyle, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }} title="Best overall value for this speed tier">
            ⭐ Best Value
          </span>
        )}
        {isCheapest && (
          <span style={{ ...badgeStyle, background: 'linear-gradient(135deg, #10b981, #059669)' }} title="Cheapest plan for this speed">
            💰 Cheapest
          </span>
        )}
        {isPopular && (
          <span style={{ ...badgeStyle, background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} title="Most popular choice">
            🔥 Popular
          </span>
        )}
      </div>

      {/* Header with Logo and Provider */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0 }}>
          {plan.favicon_url ? (
            <img
              src={plan.favicon_url}
              alt={plan.provider_name}
              loading="lazy"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                objectFit: 'contain',
                background: 'white',
                padding: '4px'
              }}
            />
          ) : (
            <div 
              style={{
                background: getProviderColor(plan.provider_name),
                color: 'white',
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.9em'
              }}
            >
              {getProviderInitials(plan.provider_name)}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1em', fontWeight: '600' }}>
              {plan.provider_name}
            </h3>
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
                support_hours: plan.provider_support_hours
              }}
              darkMode={darkMode}
            />
          </div>
          <p style={{ margin: '4px 0', fontSize: '0.9em', fontWeight: '600', color: darkMode ? '#cbd5e0' : '#333' }}>
            {stripHtml(plan.plan_name)}
          </p>
          <p style={{ margin: '4px 0', fontSize: '0.8em', color: darkMode ? '#a0aec0' : '#666' }}>
            {plan.speed_tier}Mbps
            {plan.upload_speed_mbps && ` ↑${plan.upload_speed_mbps}Mbps`}
          </p>
        </div>
      </div>

      {/* Data Freshness */}
      <div style={{ marginBottom: '12px' }}>
        <FreshnessIndicator lastCheckedAt={plan.last_checked_at} />
      </div>

      {/* Price Section */}
      <div style={{
        padding: '12px',
        borderRadius: '12px',
        background: darkMode ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)',
        marginBottom: '16px',
        border: `1px solid ${darkMode ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`
      }}>
        {plan.intro_price_cents ? (
          <div>
            <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#10b981' }}>
              ${(plan.intro_price_cents/100).toFixed(2)}/mo
              {plan.price_trend && <span style={{ fontSize: '0.6em', marginLeft: '4px' }}>{plan.price_trend === 'down' ? '↓' : '↑'}</span>}
            </div>
            <div style={{ fontSize: '0.9em', color: darkMode ? '#a0aec0' : '#666', marginTop: '4px' }}>
              then ${(plan.ongoing_price_cents!/100).toFixed(2)}/mo
            </div>
            {plan.intro_duration_days && (
              <div style={{ fontSize: '0.85em', color: '#E91E63', marginTop: '4px', fontWeight: '600' }}>
                for {Math.round(plan.intro_duration_days/30)} months
              </div>
            )}
          </div>
        ) : plan.ongoing_price_cents ? (
          <div style={{ fontSize: '1.4em', fontWeight: 'bold' }}>
            ${(plan.ongoing_price_cents/100).toFixed(2)}/mo
            {plan.price_trend && <span style={{ fontSize: '0.6em', marginLeft: '4px' }}>{plan.price_trend === 'down' ? '↓' : '↑'}</span>}
          </div>
        ) : (
          <div style={{ fontSize: '0.95em', color: darkMode ? '#a0aec0' : '#666' }}>
            Price on request
          </div>
        )}
      </div>

      {/* Collapsible Details */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '8px 12px',
          marginBottom: '12px',
          background: 'transparent',
          border: `1px solid ${darkMode ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.2)'}`,
          borderRadius: '8px',
          color: darkMode ? '#a0aec0' : '#666',
          cursor: 'pointer',
          fontSize: '0.9em',
          transition: 'all 0.2s',
          fontWeight: '600'
        }}
      >
        {isExpanded ? '▼' : '▶'} {isExpanded ? 'Hide' : 'Show'} Details
      </button>

      {isExpanded && (
        <div style={{
          padding: '12px',
          borderTop: `1px solid ${darkMode ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
          marginBottom: '12px',
          fontSize: '0.85em'
        }}>
          {plan.contract_type && (
            <div style={{ marginBottom: '8px' }}>
              <strong>Contract:</strong> {plan.contract_type}
            </div>
          )}
          {plan.data_allowance && (
            <div style={{ marginBottom: '8px' }}>
              <strong>Data:</strong> {plan.data_allowance}
            </div>
          )}
          {plan.modem_included && (
            <div style={{ marginBottom: '8px' }}>
              <strong>Modem:</strong> {plan.modem_included ? 'Included' : 'Not included'}
            </div>
          )}
          {plan.provider_description && (
            <div style={{ marginBottom: '8px' }}>
              <strong>Provider:</strong> {plan.provider_description}
            </div>
          )}
          
          {/* Provider Features */}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${darkMode ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)'}` }}>
            <div style={{ marginBottom: '8px', fontWeight: '600' }}>Provider Features:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {plan.provider_ipv6_support && plan.provider_ipv6_support >= 1 && (
                <div>✓ IPv6 Support</div>
              )}
              {plan.provider_australian_support && plan.provider_australian_support >= 2 && (
                <div>✓ 100% Australian Support</div>
              )}
              {plan.provider_cgnat === 0 && (
                <div>✓ No CGNAT</div>
              )}
              {plan.provider_static_ip_available && plan.provider_static_ip_available >= 1 && (
                <div>✓ Static IP {plan.provider_static_ip_available === 1 ? '(Free)' : '(Available)'}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onToggleFavorite(plan.id)}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: isFavorite ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : (darkMode ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)'),
            color: isFavorite ? 'white' : (darkMode ? '#a0aec0' : '#667eea'),
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85em',
            transition: 'all 0.2s'
          }}
        >
          {isFavorite ? '❤️ Favorited' : '🤍 Favorite'}
        </button>
        <button
          onClick={() => onCompare(plan.id)}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: darkMode ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)',
            color: darkMode ? '#a0aec0' : '#667eea',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85em',
            transition: 'all 0.2s'
          }}
        >
          📊 Compare
        </button>
        <button
          onClick={() => onPriceHistory(plan.id)}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: darkMode ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)',
            color: darkMode ? '#a0aec0' : '#667eea',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85em',
            transition: 'all 0.2s'
          }}
        >
          📈 History
        </button>
        {plan.source_url && (
          <button
            onClick={() => window.open(plan.source_url, '_blank')}
            style={{
              flex: 1,
              padding: '10px 12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85em',
              transition: 'all 0.2s'
            }}
          >
            Visit
          </button>
        )}
      </div>
    </div>
  );
};
