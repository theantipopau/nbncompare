import * as React from 'react';
import ReactDOM from 'react-dom';

interface ProviderInfo {
  name: string;
  description?: string;
  ipv6_support?: number;
  cgnat?: number;
  cgnat_opt_out?: number;
  static_ip_available?: number;
  australian_support?: number;
  parent_company?: string;
  routing_info?: string;
  support_hours?: string;
}

interface Props {
  provider: ProviderInfo;
  darkMode?: boolean;
}

export function ProviderTooltip({ provider, darkMode }: Props) {
  const [visible, setVisible] = React.useState(false);

  // Lock body scroll when visible
  React.useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [visible]);

  // Close on escape key
  React.useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  const getIPv6Badge = () => {
    if (provider.ipv6_support === 1) return { text: 'IPv6 Supported', color: '#10b981', icon: '✓' };
    return { text: 'IPv4 Only', color: '#ef4444', icon: '✗' };
  };

  const getCGNATInfo = () => {
    if (provider.cgnat === 0) return { text: 'No CGNAT', color: '#10b981', icon: '✓' };
    if (provider.cgnat_opt_out === 1) return { text: 'CGNAT (free opt-out)', color: '#f59e0b', icon: '!' };
    if (provider.cgnat_opt_out === 2) return { text: 'CGNAT (paid opt-out)', color: '#f59e0b', icon: '!' };
    return { text: 'Uses CGNAT', color: '#ef4444', icon: '✗' };
  };

  const getStaticIPInfo = () => {
    if (provider.static_ip_available === 1) return { text: 'Free Static IP', color: '#10b981', icon: '✓' };
    if (provider.static_ip_available === 2) return { text: 'Paid Static IP', color: '#f59e0b', icon: '$' };
    return { text: 'Not Available', color: '#6b7280', icon: '—' };
  };

  const getSupportInfo = () => {
    if (provider.australian_support === 2) return { text: '100% Australian', color: '#10b981', icon: '🇦🇺' };
    if (provider.australian_support === 1) return { text: 'Mixed AU/Offshore', color: '#f59e0b', icon: '🌏' };
    return { text: 'Offshore Support', color: '#6b7280', icon: '🌏' };
  };

  const InfoRow = ({ label, info }: { label: string; info: { text: string; color: string; icon: string } }) => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`
    }}>
      <span style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.9em' }}>{label}</span>
      <span style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        fontWeight: '600',
        color: info.color,
        fontSize: '0.9em'
      }}>
        <span>{info.icon}</span>
        {info.text}
      </span>
    </div>
  );

  const modalContent = visible ? (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px',
        backdropFilter: 'blur(4px)'
      }}
      onClick={() => setVisible(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: darkMode ? '#1f2937' : 'white',
          borderRadius: '16px',
          padding: '0',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px 24px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25em', fontWeight: '700' }}>{provider.name}</h3>
            {provider.parent_company && (
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85em', opacity: 0.9 }}>
                Part of {provider.parent_company}
              </p>
            )}
          </div>
          <button
            onClick={() => setVisible(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              color: 'white',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px' }}>
          {provider.description && (
            <p style={{ 
              margin: '0 0 16px 0', 
              fontSize: '0.95em', 
              color: darkMode ? '#d1d5db' : '#4b5563',
              lineHeight: 1.6
            }}>
              {provider.description}
            </p>
          )}

          <div style={{ marginBottom: '8px' }}>
            <InfoRow label="IPv6 Support" info={getIPv6Badge()} />
            <InfoRow label="CGNAT Status" info={getCGNATInfo()} />
            <InfoRow label="Static IP" info={getStaticIPInfo()} />
            <InfoRow label="Support Team" info={getSupportInfo()} />
            
            {provider.support_hours && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`
              }}>
                <span style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.9em' }}>Support Hours</span>
                <span style={{ fontWeight: '600', color: darkMode ? '#e5e7eb' : '#374151', fontSize: '0.9em' }}>
                  {provider.support_hours}
                </span>
              </div>
            )}
            
            {provider.routing_info && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '10px 0'
              }}>
                <span style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.9em' }}>Routing</span>
                <span style={{ fontWeight: '600', color: darkMode ? '#e5e7eb' : '#374151', fontSize: '0.9em' }}>
                  {provider.routing_info}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          background: darkMode ? '#111827' : '#f9fafb',
          borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
        }}>
          <button
            onClick={() => setVisible(false)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.95em'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button 
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setVisible(true); }}
        style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '3px',
          width: '12px',
          height: '12px',
          fontSize: '8px',
          color: '#667eea',
          fontWeight: 'bold',
          background: 'transparent',
          border: '1px solid #667eea',
          borderRadius: '50%',
          cursor: 'pointer',
          transition: 'all 0.2s',
          padding: 0,
          lineHeight: 1
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.background = '#667eea';
          (e.target as HTMLElement).style.color = 'white';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.background = 'transparent';
          (e.target as HTMLElement).style.color = '#667eea';
        }}
        aria-label={`View details about ${provider.name}`}
      >
        i
      </button>
      {modalContent && ReactDOM.createPortal(modalContent, document.body)}
    </>
  );
}
