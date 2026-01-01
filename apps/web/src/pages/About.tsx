import React from "react";

export default function About() {
  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <section className="hero" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.8em', marginBottom: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          About NBN Compare
        </h1>
        <p style={{ fontSize: '1.2em', color: '#666', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6' }}>
          Your trusted source for comparing NBN plans across 40+ Australian internet providers
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <section className="card" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)' }}>
          <h2 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5em' }}>
            <span style={{ fontSize: '1.6em' }}>🎯</span>
            <span>Our Mission</span>
          </h2>
          <p style={{ fontSize: '1.05em', lineHeight: '1.7', color: '#444' }}>
            Help Australians find the best NBN plan by comparing 40+ providers with real-time pricing, 
            speed comparisons, and official NBN availability checks.
          </p>
        </section>
        
        <section className="card" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.08) 0%, rgba(102, 126, 234, 0.08) 100%)' }}>
          <h2 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5em' }}>
            <span style={{ fontSize: '1.6em' }}>💰</span>
            <span>Always Free</span>
          </h2>
          <p style={{ fontSize: '1.05em', lineHeight: '1.7', color: '#444' }}>
            100% free to use. No sign-ups, no hidden fees, no affiliate links. 
            Just honest comparisons to help you save money.
          </p>
        </section>
      </div>

      <section className="card" style={{ marginBottom: '32px', padding: '32px' }}>
        <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.8em' }}>
          <span style={{ fontSize: '1.3em' }}>✨</span>
          <span>Key Features</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '16px', borderLeft: '3px solid #667eea', background: 'rgba(102, 126, 234, 0.05)' }}>
            <h3 style={{ marginBottom: '6px', color: '#667eea', fontSize: '1.1em' }}>🔍 NBN Address Check</h3>
            <p style={{ color: '#666', fontSize: '0.95em' }}>Official NBN Co API verifies availability & tech type</p>
          </div>
          <div style={{ padding: '16px', borderLeft: '3px solid #764ba2', background: 'rgba(118, 75, 162, 0.05)' }}>
            <h3 style={{ marginBottom: '6px', color: '#764ba2', fontSize: '1.1em' }}>📊 40+ Providers</h3>
            <p style={{ color: '#666', fontSize: '0.95em' }}>Compare all major Australian ISPs in one place</p>
          </div>
          <div style={{ padding: '16px', borderLeft: '3px solid #667eea', background: 'rgba(102, 126, 234, 0.05)' }}>
            <h3 style={{ marginBottom: '6px', color: '#667eea', fontSize: '1.1em' }}>⚡ Speed Tiers</h3>
            <p style={{ color: '#666', fontSize: '0.95em' }}>12 Mbps to 2 Gbps - find your perfect speed</p>
          </div>
          <div style={{ padding: '16px', borderLeft: '3px solid #764ba2', background: 'rgba(118, 75, 162, 0.05)' }}>
            <h3 style={{ marginBottom: '6px', color: '#764ba2', fontSize: '1.1em' }}>💰 Price Sorting</h3>
            <p style={{ color: '#666', fontSize: '0.95em' }}>Sort by price, provider, or speed instantly</p>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginBottom: '28px', padding: '28px', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.06) 0%, rgba(118, 75, 162, 0.06) 100%)', borderLeft: '4px solid #667eea' }}>
        <h2 style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.7em' }}>
          <span style={{ fontSize: '1.3em' }}>👨‍💻</span>
          <span>About the Developer</span>
        </h2>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={{ marginBottom: '10px', color: '#667eea', fontSize: '1.3em' }}>Matt Hurley 🇦🇺</h3>
            <p style={{ fontSize: '1.05em', lineHeight: '1.7', color: '#444', marginBottom: '14px' }}>
              Software developer based in Brisbane, Australia. Creator of OmenCore and multiple open-source tools 
              focused on performance, privacy, and user experience.
            </p>
            <p style={{ fontSize: '0.95em', color: '#666', marginBottom: '12px' }}>
              <strong style={{ color: '#667eea' }}>Specialties:</strong> System optimization, web apps, .NET development, cloud infrastructure
            </p>
            <a href="https://omencore.info" target="_blank" rel="noopener noreferrer" 
               style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#667eea', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.95em', marginTop: '8px' }}>
              <span>💎</span> Visit OmenCore.info
            </a>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginBottom: '28px', padding: '28px' }}>
        <h2 style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.7em' }}>
          <span style={{ fontSize: '1.3em' }}>🚀</span>
          <span>Other Projects</span>
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', borderLeft: '3px solid #667eea' }}>
            <h3 style={{ marginBottom: '8px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15em' }}>
              <span>💎</span> OmenCore
            </h3>
            <p style={{ color: '#555', fontSize: '0.95em', lineHeight: '1.6' }}>
              Advanced control center for HP OMEN & Victus laptops. Hardware control, RGB, fan tuning, monitoring—no bloat.
            </p>
          </div>

          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', borderLeft: '3px solid #764ba2' }}>
            <h3 style={{ marginBottom: '8px', color: '#764ba2', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15em' }}>
              <span>📚</span> BrightBound Adventures
            </h3>
            <p style={{ color: '#555', fontSize: '0.95em', lineHeight: '1.6' }}>
              Educational app for ages 4-12. ACARA/NAPLAN-aligned, offline, ad-free. Safe learning for Aussie kids.
            </p>
          </div>

          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', borderLeft: '3px solid #667eea' }}>
            <h3 style={{ marginBottom: '8px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15em' }}>
              <span>⚡</span> Win11 Gaming Optimizer
            </h3>
            <p style={{ color: '#555', fontSize: '0.95em', lineHeight: '1.6' }}>
              Batch utility for max gaming performance. Removes bloat, reduces telemetry, optimizes for FPS.
            </p>
          </div>

          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', borderLeft: '3px solid #764ba2' }}>
            <h3 style={{ marginBottom: '8px', color: '#764ba2', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15em' }}>
              <span>🎓</span> Sophia STARS
            </h3>
            <p style={{ color: '#555', fontSize: '0.95em', lineHeight: '1.6' }}>
              Student tracking system for schools. Data management, analytics, reporting for educators.
            </p>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginBottom: '32px', padding: '28px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)' }}>
        <h2 style={{ marginBottom: '14px', fontSize: '1.6em' }}>🤝 Connect & Feedback</h2>
        <p style={{ fontSize: '1.05em', color: '#555', marginBottom: '20px', maxWidth: '600px', margin: '0 auto 20px' }}>
          Questions, feedback, or issues? Join the community channels.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://reddit.com/r/omencore" target="_blank" rel="noopener noreferrer"
             style={{ padding: '11px 22px', background: '#FF4500', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.95em' }}>
            💬 Reddit
          </a>
          <a href="https://discord.gg/ahcUC2Un" target="_blank" rel="noopener noreferrer"
             style={{ padding: '11px 22px', background: '#5865F2', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.95em' }}>
            💬 Discord
          </a>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '24px', color: '#888', fontSize: '0.9em' }}>
        <p>© 2026 Matt Hurley. Built for Aussies, by an Aussie. 🇦🇺</p>
        <p style={{ marginTop: '8px', fontSize: '0.85em' }}>
          Independent comparison service. Not affiliated with NBN Co or any ISP.
        </p>
      </footer>
    </div>
  );
}
