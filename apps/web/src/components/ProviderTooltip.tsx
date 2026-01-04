import * as React from 'react';
const { useState, useRef, useEffect } = React as any;

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
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState('bottom' as 'top' | 'bottom');
  const triggerRef = useRef(null as HTMLSpanElement | null);
  const tooltipRef = useRef(null as HTMLDivElement | null);

  useEffect(() => {
    if (visible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      if (spaceBelow < tooltipRect.height + 10 && spaceAbove > tooltipRect.height + 10) {
        setPosition('top');
      } else {
        setPosition('bottom');
      }
    }
  }, [visible]);

  const getIPv6Badge = () => {
    if (provider.ipv6_support === 1) return '✅ IPv6';
    return '❌ IPv4 only';
  };

  const getCGNATInfo = () => {
    if (provider.cgnat === 0) return '✅ No CGNAT';
    if (provider.cgnat_opt_out === 1) return '⚠️ CGNAT (free opt-out)';
    if (provider.cgnat_opt_out === 2) return '⚠️ CGNAT (paid opt-out)';
    return '⚠️ CGNAT';
  };

  const getStaticIPInfo = () => {
    if (provider.static_ip_available === 0) return '❌ Not available';
    if (provider.static_ip_available === 1) return '✅ Free';
    return '💰 Paid addon';
  };

  const getSupportInfo = () => {
    if (provider.australian_support === 2) return '🇦🇺 100% Australian';
    if (provider.australian_support === 1) return '🌏 Mixed AU/Offshore';
    return '🌏 Offshore';
  };

  return (
    <span 
      ref={triggerRef}
      style={{ 
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'help'
      }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      tabIndex={0}
      role="button"
      aria-label={`Information about ${provider.name}`}
    >
      <span style={{ 
        marginLeft: '6px',
        fontSize: '0.9em',
        color: '#667eea',
        fontWeight: 'bold'
      }}>
        ⓘ
      </span>

      {visible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            [position === 'top' ? 'bottom' : 'top']: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: position === 'bottom' ? '8px' : '0',
            marginBottom: position === 'top' ? '8px' : '0',
            zIndex: 10000,
            minWidth: '280px',
            maxWidth: '320px',
            background: darkMode ? '#1a202c' : 'white',
            border: `2px solid ${darkMode ? '#3a4556' : '#e2e8f0'}`,
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            fontSize: '0.85em',
            lineHeight: '1.6',
            color: darkMode ? '#e0e0e0' : '#333',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: '8px', color: '#667eea' }}>
            {provider.name}
          </div>
          
          {provider.description && (
            <p style={{ margin: '0 0 12px 0', fontSize: '0.95em', color: darkMode ? '#aaa' : '#666' }}>
              {provider.description}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: darkMode ? '#aaa' : '#666' }}>Protocol:</span>
              <span style={{ fontWeight: '600' }}>{getIPv6Badge()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: darkMode ? '#aaa' : '#666' }}>CGNAT:</span>
              <span style={{ fontWeight: '600' }}>{getCGNATInfo()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: darkMode ? '#aaa' : '#666' }}>Static IP:</span>
              <span style={{ fontWeight: '600' }}>{getStaticIPInfo()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: darkMode ? '#aaa' : '#666' }}>Support:</span>
              <span style={{ fontWeight: '600' }}>{getSupportInfo()}</span>
            </div>

            {provider.support_hours && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: darkMode ? '#aaa' : '#666' }}>Hours:</span>
                <span style={{ fontWeight: '600' }}>{provider.support_hours}</span>
              </div>
            )}

            {provider.routing_info && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: darkMode ? '#aaa' : '#666' }}>Routing:</span>
                <span style={{ fontWeight: '600' }}>{provider.routing_info}</span>
              </div>
            )}

            {provider.parent_company && (
              <div style={{ 
                marginTop: '8px', 
                paddingTop: '8px', 
                borderTop: `1px solid ${darkMode ? '#3a4556' : '#e2e8f0'}`,
                fontSize: '0.9em',
                color: darkMode ? '#888' : '#999'
              }}>
                Owned by: <strong style={{ color: darkMode ? '#aaa' : '#666' }}>{provider.parent_company}</strong>
              </div>
            )}
          </div>

          <div style={{
            position: 'absolute',
            [position === 'top' ? 'bottom' : 'top']: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            [position === 'top' ? 'borderTop' : 'borderBottom']: `6px solid ${darkMode ? '#1a202c' : 'white'}`
          }} />
        </div>
      )}
    </span>
  );
}
