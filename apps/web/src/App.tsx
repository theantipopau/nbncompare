import React, { useState, useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Compare from "./pages/Compare";
import Admin from "./pages/Admin";
import Provider from "./pages/Provider";
import ProviderDetails from "./pages/ProviderDetails";
import About from "./pages/About";
import Status from "./pages/Status";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

export default function App() {
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    // Handle browser back/forward buttons
    const handlePopState = () => {
      setCurrentPath(location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <img 
            src="/nbncomparelogo.PNG" 
            alt="NBN Compare" 
            loading="eager"
            decoding="async"
            style={{ height: '60px' }} 
          />
          <div>
            <h1>NBN Compare</h1>
            <p>Compare NBN plans across providers — updated daily.</p>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
          <a href="/" onClick={(e) => navigate('/', e)} style={{ textDecoration: 'none', color: currentPath === '/' ? '#667eea' : '#333', fontWeight: currentPath === '/' ? '700' : '600', transition: 'all 0.2s', cursor: 'pointer' }}>🏠 Home</a>
          <a href="/blog" onClick={(e) => navigate('/blog', e)} style={{ textDecoration: 'none', color: currentPath.startsWith('/blog') ? '#667eea' : '#333', fontWeight: currentPath.startsWith('/blog') ? '700' : '600', transition: 'all 0.2s', cursor: 'pointer' }}>📝 Blog</a>
          <a href="/about" onClick={(e) => navigate('/about', e)} style={{ textDecoration: 'none', color: currentPath === '/about' ? '#667eea' : '#333', fontWeight: currentPath === '/about' ? '700' : '600', transition: 'all 0.2s', cursor: 'pointer' }}>ℹ️ About</a>
          <a href="/status" onClick={(e) => navigate('/status', e)} style={{ textDecoration: 'none', color: currentPath === '/status' ? '#667eea' : '#333', fontWeight: currentPath === '/status' ? '700' : '600', transition: 'all 0.2s', cursor: 'pointer' }}>📊 Status</a>
          <a href="/admin" onClick={(e) => navigate('/admin', e)} style={{ textDecoration: 'none', color: currentPath === '/admin' ? '#667eea' : '#333', fontWeight: currentPath === '/admin' ? '700' : '600', transition: 'all 0.2s', cursor: 'pointer' }}>⚙️ Admin</a>
        </nav>
      </header>
      {/* @ts-expect-error - ErrorBoundary component type issues in local build */}
      <ErrorBoundary>
        <main>
          {currentPath === '/admin' ? <Admin /> : 
         currentPath.startsWith('/blog/') ? <BlogPost /> :
         currentPath === '/blog' ? <Blog /> :
         currentPath.startsWith('/provider/') ? <ProviderDetails /> :
         currentPath.startsWith('/providers/') ? (<Provider slug={(currentPath.replace('/providers/', '') || '').trim()} />) : 
         currentPath === '/status' ? <Status /> : 
         currentPath === '/about' ? <About /> : 
         <Compare />}
        </main>
      </ErrorBoundary>
      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h4>NBN Compare</h4>
            <p>Compare NBN plans from Australia's leading internet providers. Updated daily with the latest pricing and promotions.</p>
            <div className="footer-badges">
              <span className="footer-badge">🇦🇺 Australian Made</span>
              <span className="footer-badge">🔄 Daily Updates</span>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/" onClick={(e) => navigate('/', e)}>Compare Plans</a></li>
              <li><a href="/blog" onClick={(e) => navigate('/blog', e)}>Blog & Guides</a></li>
              <li><a href="/about" onClick={(e) => navigate('/about', e)}>About</a></li>
              <li><a href="/status" onClick={(e) => navigate('/status', e)}>System Status</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Resources</h4>
            <ul className="footer-links">
              <li><a href="https://www.nbnco.com.au/" target="_blank" rel="noopener noreferrer">NBN Co Official</a></li>
              <li><a href="https://www.accc.gov.au/consumers/telecommunications-and-internet" target="_blank" rel="noopener noreferrer">ACCC Consumer Rights</a></li>
              <li><a href="https://www.tio.com.au/" target="_blank" rel="noopener noreferrer">TIO Complaints</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Connect</h4>
            <p style={{ marginBottom: '12px' }}>Made with 💜 by <a href="https://matthurley.dev" target="_blank" rel="noopener noreferrer">Matt Hurley</a></p>
            <div className="footer-social">
              <a href="https://github.com/theantipopau/nbncompare" target="_blank" rel="noopener noreferrer" title="GitHub">💻 GitHub</a>
              <a href="mailto:matt@matthurley.dev" title="Email">📧 Email</a>
              <a href="https://www.paypal.com/donate/?business=XH8CKYF8T7EBU&no_recurring=0&item_name=Thank+you+for+your+generous+donation%2C+this+will+allow+me+to+continue+developing+my+programs.&currency_code=AUD" target="_blank" rel="noopener noreferrer" title="Support via PayPal">💙 Donate</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <small>⚠️ Promotions change frequently — always verify pricing and terms on provider websites before ordering.</small>
          <small>Independent comparison service · Not affiliated with NBN Co or any provider · Brisbane, Australia 🇦🇺</small>
        </div>
      </footer>
    </div>
  );
}
