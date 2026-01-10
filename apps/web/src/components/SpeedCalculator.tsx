import React, { useState } from 'react';

interface Props {
  onSpeedRecommended: (speed: number) => void;
  darkMode: boolean;
}

interface UsageProfile {
  people: number;
  hdStreams: number;
  fourKStreams: number;
  gamers: number;
  workFromHome: number;
  largeDownloads: boolean;
}

export default function SpeedCalculator({ onSpeedRecommended, darkMode }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState({
    people: 2,
    hdStreams: 1,
    fourKStreams: 0,
    gamers: 0,
    workFromHome: 0,
    largeDownloads: false,
  } as UsageProfile);
  const [recommendedSpeed, setRecommendedSpeed] = useState(null as number | null);

  const calculateSpeed = () => {
    let totalMbps = 0;
    
    // Base usage: 5 Mbps per person for browsing/social media
    totalMbps += profile.people * 5;
    
    // HD streaming: 5 Mbps each
    totalMbps += profile.hdStreams * 5;
    
    // 4K streaming: 25 Mbps each
    totalMbps += profile.fourKStreams * 25;
    
    // Gaming: 25 Mbps for low latency + downloads
    totalMbps += profile.gamers * 25;
    
    // Work from home: 20 Mbps each (video calls, uploads)
    totalMbps += profile.workFromHome * 20;
    
    // Large downloads bonus
    if (profile.largeDownloads) {
      totalMbps += 50;
    }
    
    // Add 20% headroom
    totalMbps = Math.ceil(totalMbps * 1.2);
    
    // Map to NBN speed tiers
    let recommended: number;
    if (totalMbps <= 25) {
      recommended = 25;
    } else if (totalMbps <= 50) {
      recommended = 50;
    } else if (totalMbps <= 100) {
      recommended = 100;
    } else if (totalMbps <= 250) {
      recommended = 250;
    } else if (totalMbps <= 500) {
      recommended = 500;
    } else {
      recommended = 1000;
    }
    
    setRecommendedSpeed(recommended);
    return recommended;
  };

  const handleApply = () => {
    const speed = calculateSpeed();
    onSpeedRecommended(speed);
    setIsOpen(false);
  };

  const getSpeedDescription = (speed: number) => {
    const descriptions: Record<number, string> = {
      25: 'NBN 25 - Basic: Good for 1-2 people, light browsing, email, social media',
      50: 'NBN 50 - Standard: Perfect for most households, 2-3 HD streams',
      100: 'NBN 100 - Fast: Great for busy households, 4K streaming, multiple devices',
      250: 'NBN 250 - Superfast: Ideal for large families, gamers, work from home',
      500: 'NBN 500 - Ultrafast: Heavy users, content creators, multiple 4K streams',
      1000: 'NBN 1000 - Gigabit: Maximum speed, future-proof for all needs',
    };
    return descriptions[speed] || `NBN ${speed}`;
  };

  // Lock body scroll when modal is open - must be before early return!
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '10px 18px',
          background: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          border: '2px solid #10b981',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '0.9em',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#10b981';
          (e.currentTarget as HTMLButtonElement).style.color = 'white';
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          (e.currentTarget as HTMLButtonElement).style.background = darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)';
          (e.currentTarget as HTMLButtonElement).style.color = '#10b981';
        }}
      >
        🧮 What Speed Do I Need?
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
        backdropFilter: 'blur(4px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: darkMode ? '#1a202c' : 'white',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '550px',
          width: '100%',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: darkMode ? '#f7fafc' : '#1a202c' }}>
            🧮 Speed Calculator
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: darkMode ? '#a0aec0' : '#666'
            }}
          >
            ×
          </button>
        </div>

        <p style={{ color: darkMode ? '#a0aec0' : '#666', marginBottom: '24px' }}>
          Answer a few questions about your household to get a personalized speed recommendation.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* People in household */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: darkMode ? '#e2e8f0' : '#333' }}>
              👥 How many people in your household?
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={profile.people}
              onChange={(e) => setProfile({ ...profile, people: parseInt(e.target.value) })}
              style={{ width: '100%' }}
            />
            <div style={{ textAlign: 'center', color: darkMode ? '#a0aec0' : '#666' }}>{profile.people} {profile.people === 1 ? 'person' : 'people'}</div>
          </div>

          {/* HD Streams */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: darkMode ? '#e2e8f0' : '#333' }}>
              📺 Simultaneous HD video streams (Netflix, YouTube, etc.)
            </label>
            <input
              type="range"
              min="0"
              max="6"
              value={profile.hdStreams}
              onChange={(e) => setProfile({ ...profile, hdStreams: parseInt(e.target.value) })}
              style={{ width: '100%' }}
            />
            <div style={{ textAlign: 'center', color: darkMode ? '#a0aec0' : '#666' }}>{profile.hdStreams} streams</div>
          </div>

          {/* 4K Streams */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: darkMode ? '#e2e8f0' : '#333' }}>
              🎬 4K/Ultra HD streams at the same time
            </label>
            <input
              type="range"
              min="0"
              max="4"
              value={profile.fourKStreams}
              onChange={(e) => setProfile({ ...profile, fourKStreams: parseInt(e.target.value) })}
              style={{ width: '100%' }}
            />
            <div style={{ textAlign: 'center', color: darkMode ? '#a0aec0' : '#666' }}>{profile.fourKStreams} 4K streams</div>
          </div>

          {/* Gamers */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: darkMode ? '#e2e8f0' : '#333' }}>
              🎮 Online gamers in the household
            </label>
            <input
              type="range"
              min="0"
              max="4"
              value={profile.gamers}
              onChange={(e) => setProfile({ ...profile, gamers: parseInt(e.target.value) })}
              style={{ width: '100%' }}
            />
            <div style={{ textAlign: 'center', color: darkMode ? '#a0aec0' : '#666' }}>{profile.gamers} gamers</div>
          </div>

          {/* Work from home */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: darkMode ? '#e2e8f0' : '#333' }}>
              💼 People working from home (video calls, uploads)
            </label>
            <input
              type="range"
              min="0"
              max="4"
              value={profile.workFromHome}
              onChange={(e) => setProfile({ ...profile, workFromHome: parseInt(e.target.value) })}
              style={{ width: '100%' }}
            />
            <div style={{ textAlign: 'center', color: darkMode ? '#a0aec0' : '#666' }}>{profile.workFromHome} WFH</div>
          </div>

          {/* Large downloads */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: darkMode ? '#e2e8f0' : '#333' }}>
              <input
                type="checkbox"
                checked={profile.largeDownloads}
                onChange={(e) => setProfile({ ...profile, largeDownloads: e.target.checked })}
                style={{ width: '20px', height: '20px' }}
              />
              <span style={{ fontWeight: 'bold' }}>📥 Regular large downloads (games, movies, software)</span>
            </label>
          </div>
        </div>

        {/* Calculate button */}
        <button
          onClick={calculateSpeed}
          style={{
            width: '100%',
            padding: '14px',
            marginTop: '24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1em'
          }}
        >
          Calculate My Recommended Speed
        </button>

        {/* Result */}
        {recommendedSpeed !== null && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: darkMode ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)',
            borderRadius: '12px',
            border: '2px solid #667eea'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '2em' }}>⚡</span>
              <div>
                <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#667eea' }}>
                  NBN {recommendedSpeed}
                </div>
                <div style={{ color: darkMode ? '#a0aec0' : '#666', fontSize: '0.9em' }}>
                  Recommended for your household
                </div>
              </div>
            </div>
            <p style={{ color: darkMode ? '#e2e8f0' : '#333', marginBottom: '16px' }}>
              {getSpeedDescription(recommendedSpeed)}
            </p>
            <button
              onClick={handleApply}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.95em'
              }}
            >
              ✓ Show NBN {recommendedSpeed} Plans
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
