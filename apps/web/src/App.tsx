import React from "react";
import Compare from "./pages/Compare";
import Admin from "./pages/Admin";
import Provider from "./pages/Provider";
import About from "./pages/About";
import Status from "./pages/Status";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

export default function App() {
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
          <a href="/" style={{ textDecoration: 'none', color: location.pathname === '/' ? '#667eea' : '#333', fontWeight: location.pathname === '/' ? '700' : '600', transition: 'all 0.2s' }}>🏠 Home</a>
          <a href="/blog" style={{ textDecoration: 'none', color: location.pathname.startsWith('/blog') ? '#667eea' : '#333', fontWeight: location.pathname.startsWith('/blog') ? '700' : '600', transition: 'all 0.2s' }}>📝 Blog</a>
          <a href="/about" style={{ textDecoration: 'none', color: location.pathname === '/about' ? '#667eea' : '#333', fontWeight: location.pathname === '/about' ? '700' : '600', transition: 'all 0.2s' }}>ℹ️ About</a>
          <a href="/status" style={{ textDecoration: 'none', color: location.pathname === '/status' ? '#667eea' : '#333', fontWeight: location.pathname === '/status' ? '700' : '600', transition: 'all 0.2s' }}>📊 Status</a>
          <a href="/admin" style={{ textDecoration: 'none', color: location.pathname === '/admin' ? '#667eea' : '#333', fontWeight: location.pathname === '/admin' ? '700' : '600', transition: 'all 0.2s' }}>⚙️ Admin</a>
        </nav>
      </header>
      <main>
        {location.pathname === '/admin' ? <Admin /> : 
         location.pathname.startsWith('/blog/') ? <BlogPost /> :
         location.pathname === '/blog' ? <Blog /> :
         location.pathname.startsWith('/providers/') ? <Provider slug={location.pathname.replace('/providers/', '')} /> : 
         location.pathname === '/status' ? <Status /> : 
         location.pathname === '/about' ? <About /> : 
         <Compare />}
      </main>
      <footer>
        <small>⚠️ Promotions change frequently — verify on provider sites before ordering.</small>
        <small style={{ display: 'block', marginTop: '8px', opacity: 0.8 }}>Made with 💜 by Matt Hurley | Brisbane, Australia 🇦🇺</small>
      </footer>
    </div>
  );
}
