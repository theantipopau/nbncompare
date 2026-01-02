import React from "react";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: "how-to-choose-nbn-plan",
    title: "How to Choose the Right NBN Plan for Your Needs",
    excerpt: "Confused by all the NBN options? Learn how to select the perfect plan based on your household size, usage patterns, and budget.",
    date: "2026-01-02",
    readTime: "5 min read",
    category: "Guides"
  },
  {
    slug: "nbn-speed-tiers-explained",
    title: "NBN Speed Tiers Explained: 25, 50, 100, 250, or 1000 Mbps?",
    excerpt: "Understand the difference between NBN speed tiers and find out which one is right for your household.",
    date: "2026-01-02",
    readTime: "7 min read",
    category: "Education"
  },
  {
    slug: "fixed-wireless-vs-fttp",
    title: "Fixed Wireless vs FTTP: What's the Difference?",
    excerpt: "Learn about the different NBN connection types and how they affect your internet experience.",
    date: "2026-01-02",
    readTime: "6 min read",
    category: "Technology"
  },
  {
    slug: "save-money-nbn-plan",
    title: "5 Ways to Save Money on Your NBN Plan",
    excerpt: "Discover practical tips to reduce your internet bills without sacrificing speed or reliability.",
    date: "2026-01-02",
    readTime: "4 min read",
    category: "Money Saving"
  }
];

export default function Blog() {
  return (
    <div className="blog-page" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5em', marginBottom: '10px' }}>NBN Guides & Resources</h1>
        <p style={{ fontSize: '1.1em', opacity: 0.8 }}>
          Expert guides to help you make informed decisions about your NBN plan
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '30px' 
      }}>
        {blogPosts.map((post) => (
          <article 
            key={post.slug}
            style={{
              background: 'var(--card-bg)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <a 
              href={`/blog/${post.slug}`} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ 
                display: 'inline-block',
                padding: '4px 12px',
                background: 'var(--primary-color)',
                color: 'white',
                borderRadius: '6px',
                fontSize: '0.85em',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                {post.category}
              </div>
              
              <h2 style={{ 
                fontSize: '1.4em', 
                marginBottom: '12px',
                lineHeight: '1.3'
              }}>
                {post.title}
              </h2>
              
              <p style={{ 
                opacity: 0.8,
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                {post.excerpt}
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.9em',
                opacity: 0.7
              }}>
                <span>{new Date(post.date).toLocaleDateString('en-AU', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
                <span>{post.readTime}</span>
              </div>
            </a>
          </article>
        ))}
      </div>

      <div style={{ 
        marginTop: '60px',
        padding: '40px',
        background: 'var(--card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.8em', marginBottom: '16px' }}>
          Can't find what you're looking for?
        </h2>
        <p style={{ opacity: 0.8, marginBottom: '24px' }}>
          Head back to our plan comparison tool to find the perfect NBN plan
        </p>
        <a 
          href="/" 
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            background: 'var(--primary-color)',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Compare NBN Plans
        </a>
      </div>
    </div>
  );
}
