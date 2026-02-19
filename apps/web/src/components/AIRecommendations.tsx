import React, { useState } from 'react';

interface Props {
  darkMode: boolean;
  onRecommendation: (filters: Record<string, unknown>) => void;
}

export default function AIRecommendations({ darkMode, onRecommendation }: Props) {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null as string | null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    try {
      // Simulate AI processing (in a real implementation, this would call an AI API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock AI response based on common user queries
      const input = userInput.toLowerCase();
      let response = '';
      let filters: Record<string, unknown> = {};

      if (input.includes('gaming') || input.includes('game')) {
        response = "🎮 **Gaming Setup Recommendation**\n\nFor gaming, you need low latency and stable connections. I recommend:\n\n• **NBN 100+ Mbps** (avoid FTTN if possible)\n• **IPv6 support** for better online gaming\n• **No CGNAT** (or opt-out available) for port forwarding\n• **Providers**: Aussie Broadband, TPG, or Telstra\n\nThese providers have good routing and minimal CGNAT issues.";
        filters = {
          speed: '100',
          ipv6Filter: true,
          noCgnatFilter: true,
          selectedProviders: ['Aussie Broadband', 'TPG', 'Telstra']
        };
      } else if (input.includes('work from home') || input.includes('wfh') || input.includes('remote work')) {
        response = "🏠 **Work From Home Recommendation**\n\nFor remote work, reliability and upload speed matter most:\n\n• **NBN 50+ Mbps** with good upload speeds\n• **Unlimited data** (most plans qualify)\n• **Stable providers** with good uptime\n• **Consider**: Aussie Broadband or TPG for consistent performance";
        filters = {
          speed: '50',
          dataFilter: 'unlimited'
        };
      } else if (input.includes('streaming') || input.includes('netflix') || input.includes('youtube')) {
        response = "📺 **Streaming Recommendation**\n\nFor 4K streaming and multiple devices:\n\n• **NBN 50+ Mbps** minimum\n• **Unlimited data** essential\n• **Good routing** to streaming services\n• **Any major provider** works, but check for CDN peering";
        filters = {
          speed: '50',
          dataFilter: 'unlimited'
        };
      } else if (input.includes('budget') || input.includes('cheap') || input.includes('affordable')) {
        response = "💰 **Budget-Friendly Recommendation**\n\nLooking for the best value under budget:\n\n• **NBN 25-50 Mbps** for basic needs\n• **Introductory pricing** (watch for price increases)\n• **Value providers**: Amaysim, Kogan, or Boost\n• **Check contract terms** to avoid lock-in";
        filters = {
          speed: '25',
          contractFilter: 'month-to-month'
        };
      } else if (input.includes('family') || input.includes('multiple users')) {
        response = "👨‍👩‍👧‍👦 **Family/Home Recommendation**\n\nFor households with multiple users:\n\n• **NBN 100+ Mbps** for 4+ people\n• **Unlimited data** to avoid overage charges\n• **Good upload speeds** for video calls\n• **Consider**: Fixed Wireless if in regional areas";
        filters = {
          speed: '100',
          dataFilter: 'unlimited'
        };
      } else {
        response = "🤔 **General Recommendation**\n\nBased on your needs, here's what I recommend:\n\n• **Start with NBN 50 Mbps** - good balance of speed and cost\n• **Check provider features** like IPv6 and CGNAT status\n• **Compare 2-3 providers** before deciding\n• **Look for introductory offers** but watch contract terms\n\nTry asking about specific use cases like 'gaming', 'streaming', or 'work from home' for more tailored advice!";
        filters = {
          speed: '50'
        };
      }

      setRecommendation(response);
      onRecommendation(filters);
    } catch (error) {
      console.error('AI recommendation error:', error);
      setRecommendation("Sorry, I couldn't generate a recommendation right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(102, 126, 234, 0.05)',
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(102, 126, 234, 0.15)'}`,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        color: darkMode ? '#e2e8f0' : '#1a202c',
        fontSize: '1.2em',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🤖 AI Plan Assistant
      </h3>

      <form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Describe your needs (e.g., 'gaming setup', 'work from home', 'budget internet')"
            style={{
              flex: 1,
              padding: '12px 16px',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
              borderRadius: '8px',
              background: darkMode ? '#2a2a2a' : 'white',
              color: darkMode ? 'white' : 'black',
              fontSize: '14px'
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            style={{
              padding: '12px 20px',
              background: isLoading ? '#6b7280' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Thinking...
              </>
            ) : (
              <>Get Advice</>
            )}
          </button>
        </div>
      </form>

      {recommendation && (
        <div style={{
          background: darkMode ? '#2a2a2a' : 'white',
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: '8px',
          padding: '16px',
          whiteSpace: 'pre-line',
          lineHeight: '1.6'
        }}>
          {recommendation}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}