import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export function Loading({ message = 'Loading...', size = 'medium' }: LoadingProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="loading-container">
      <div className={`loading-spinner ${sizeClasses[size]}`} />
      <p className="loading-message">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      marginBottom: '16px',
      border: '2px solid rgba(102,126,234,0.1)'
    }} aria-hidden="true">
      {/* Badge row */}
      <div style={{ marginBottom: '12px', height: '20px', display: 'flex', gap: '8px' }}>
        <div className="skeleton skeleton-small" style={{ borderRadius: '4px', width: '80px', height: '20px' }} />
      </div>
      {/* Header: logo + name */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
        <div className="skeleton skeleton-logo" style={{ borderRadius: '8px', width: '48px', height: '48px', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="skeleton skeleton-text" style={{ height: '18px', width: '60%' }} />
          <div className="skeleton skeleton-small" style={{ height: '14px', width: '40%' }} />
          <div className="skeleton skeleton-small" style={{ height: '12px', width: '30%' }} />
        </div>
      </div>
      {/* Price block */}
      <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(102,126,234,0.04)', marginBottom: '16px' }}>
        <div className="skeleton skeleton-price" style={{ height: '28px', width: '120px', marginBottom: '8px' }} />
        <div className="skeleton skeleton-small" style={{ height: '14px', width: '80px' }} />
      </div>
      {/* Button row */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <div className="skeleton skeleton-button" style={{ flex: 1, height: '38px', borderRadius: '8px' }} />
        <div className="skeleton skeleton-button" style={{ flex: 1, height: '38px', borderRadius: '8px' }} />
        <div className="skeleton skeleton-button" style={{ flex: 1, height: '38px', borderRadius: '8px' }} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}