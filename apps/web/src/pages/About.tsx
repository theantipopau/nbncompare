import React from "react";
import { usePageTitle } from "../lib/usePageTitle";

export default function About() {
  usePageTitle('About NBN Compare - Free NBN Plan Comparison Tool', 'Learn about NBN Compare, a free tool for comparing NBN plans from 30+ Australian providers with no ads or affiliate links.');
  
  return (
    <div style={{ 
      maxWidth: '720px', 
      margin: '0 auto', 
      padding: '48px 40px',
      lineHeight: '1.8',
      color: '#333',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <h1 style={{ 
        fontSize: '2.2em', 
        fontWeight: '700', 
        marginBottom: '24px',
        color: '#111'
      }}>
        📡 About NBN Compare
      </h1>

      <p style={{ fontSize: '1.1em', marginBottom: '32px', color: '#555' }}>
        A free tool to help Australians compare NBN internet plans. No ads, no affiliate links, 
        no tracking—just straightforward comparisons to help you find the right plan.
      </p>

      <h2 style={{ fontSize: '1.4em', fontWeight: '600', marginBottom: '16px', marginTop: '40px', color: '#111' }}>
        ✨ What's included
      </h2>
      
      <ul style={{ paddingLeft: '20px', marginBottom: '32px', color: '#444' }}>
        <li style={{ marginBottom: '12px' }}>
          <strong>142 plans</strong> from 30+ Australian providers
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>Address checker</strong> using official NBN Co data to verify availability and technology type
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>Price history tracking</strong> with charts showing how prices change over time
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>All speed tiers</strong> from 25 Mbps to 2 Gbps, including Fixed Wireless plans
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>Filtering</strong> by speed, price, provider, contract length, and promotional offers
        </li>
      </ul>

      <h2 style={{ fontSize: '1.4em', fontWeight: '600', marginBottom: '16px', marginTop: '40px', color: '#111' }}>
        💰 Why it's free
      </h2>
      
      <p style={{ marginBottom: '32px', color: '#444' }}>
        This is a personal project, not a business. There are no affiliate commissions, 
        sponsored placements, or hidden monetisation. The goal is simply to make it easier 
        to compare NBN plans without wading through marketing spin on provider websites.
      </p>

      <h2 style={{ fontSize: '1.4em', fontWeight: '600', marginBottom: '16px', marginTop: '40px', color: '#111' }}>
        👨‍💻 About the developer
      </h2>
      
      <p style={{ marginBottom: '16px', color: '#444' }}>
        I'm Matt Hurley, a software developer based in Brisbane. I built NBN Compare after 
        getting frustrated trying to compare plans across dozens of provider websites when 
        moving house.
      </p>
      
      <p style={{ marginBottom: '24px', color: '#444' }}>
        If you'd like to see my other projects or get in touch, visit my portfolio.
      </p>

      <a 
        href="https://matthurley.dev" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 20px', 
          background: '#667eea', 
          color: 'white', 
          borderRadius: '8px', 
          textDecoration: 'none', 
          fontWeight: '500',
          fontSize: '0.95em'
        }}
      >
        <img src="/logosmall.PNG" alt="" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
        matthurley.dev
      </a>
    </div>
  );
}
