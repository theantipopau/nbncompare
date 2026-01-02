import React, { useEffect, useState } from "react";

interface Plan {
  id: number;
  plan_name: string;
  provider_name: string;
  intro_price_cents?: number | null;
  intro_duration_days?: number | null;
  ongoing_price_cents: number | null;
  speed_tier: number | null;
  last_checked_at?: string | null;
  source_url?: string | null;
  contract_type?: string;
  data_allowance?: string;
  modem_included?: number;
  favicon_url?: string | null;
  technology_type?: string;
  upload_speed_mbps?: number | null;
}

interface AddressResult {
  id: string;
  formattedAddress: string;
}

interface ServiceQualification {
  serviceType: string;
  techType: string;
  maxSpeed: number;
  available: boolean;
}

export default function Compare() {
  const [plans, setPlans] = useState([] as Plan[]);
  const [speed, setSpeed] = useState("100");
  const [address, setAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([] as AddressResult[]);
  const [selectedAddress, setSelectedAddress] = useState(null as AddressResult | null);
  const [qualification, setQualification] = useState(null as ServiceQualification | null);
  const [message, setMessage] = useState(null as string | null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites') || '[]') as number[];
    } catch {
      return [];
    }
  });
  const [contractFilter, setContractFilter] = useState('');
  const [dataFilter, setDataFilter] = useState('');
  const [technologyFilter, setTechnologyFilter] = useState('');
  const [modemFilter, setModemFilter] = useState('');
  const [compareList, setCompareList] = useState([] as number[]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  async function fetchPlans(s: string) {
    setLoading(true);
    setMessage('Loading plans...');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const params = new URLSearchParams({ speed: s });
      if (contractFilter) params.append('contract', contractFilter);
      if (dataFilter) params.append('data', dataFilter);
      if (modemFilter) params.append('modem', modemFilter);
      if (technologyFilter) params.append('technology', technologyFilter);
      
      const res = await fetch(`${apiUrl}/api/plans?${params}`);
      const json = await res.json();
      setPlans(json.rows || json || []);
      setMessage(null);
    } catch (err) {
      console.error(err);
      setMessage('Failed to load plans');
    } finally {
      setLoading(false);
    }
  }

  function toggleFavorite(planId: number) {
    const newFavorites = favorites.includes(planId)
      ? favorites.filter((id: number) => id !== planId)
      : [...favorites, planId];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  }

  function toggleDarkMode() {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.body.classList.toggle('dark-mode', newMode);
  }

  function getProviderColor(providerName: string): string {
    const colors: Record<string, string> = {
      'Telstra': '#0088CC',
      'Optus': '#006D5B',
      'TPG': '#ED1B24',
      'Aussie Broadband': '#FF6B35',
      'iiNet': '#00A0DF',
      'Exetel': '#E31E24',
      'Launtel': '#00B8D4',
      'MyRepublic': '#FF4655',
      'Tangerine': '#FF6F00',
    };
    return colors[providerName] || '#667eea';
  }

  function getProviderInitials(providerName: string): string {
    return providerName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }

  function toggleCompare(planId: number) {
    if (compareList.includes(planId)) {
      setCompareList(compareList.filter((id: number) => id !== planId));
    } else {
      if (compareList.length >= 3) {
        alert('You can only compare up to 3 plans at once');
        return;
      }
      setCompareList([...compareList, planId]);
    }
  }

  function getComparePlans(): Plan[] {
    return plans.filter((p: Plan) => compareList.includes(p.id));
  }

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetchPlans(speed);
  }, [speed, contractFilter, dataFilter, modemFilter, technologyFilter]);

  // Debounced address search
  useEffect(() => {
    if (address.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiUrl}/api/address/search?q=${encodeURIComponent(address)}`);
        const json = await res.json();
        if (json.ok && json.results) {
          setAddressSuggestions(json.results);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Address search error:', err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [address]);

  async function onSelectAddress(addr: AddressResult) {
    setSelectedAddress(addr);
    setAddress(addr.formattedAddress);
    setShowSuggestions(false);
    setMessage("🔍 Checking NBN availability...");
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/address/qualify?id=${encodeURIComponent(addr.id)}`);
      const json = await res.json();
      
      if (json.ok && json.qualification) {
        const qual = json.qualification;
        setQualification(qual);
        
        if (qual.available) {
          setMessage(`✅ ${qual.techType} available! Max speed: NBN ${qual.maxSpeed}Mbps. ${json.note || ''}`);
          
          // Auto-adjust speed filter to match available service
          const currentSpeed = parseInt(speed);
          if (currentSpeed > qual.maxSpeed) {
            setSpeed(String(qual.maxSpeed));
          }
        } else {
          setMessage(`⚠️ NBN not available at this address. Service type: ${qual.serviceType}`);
        }
      }
    } catch (err) {
      console.error('Address qualification error:', err);
      setMessage('❌ Failed to check address. Please try again.');
    }
  }

  async function onCheckAddress(e: any) {
    e.preventDefault();
    if (!address.trim()) {
      setMessage("Please enter an address or suburb");
      return;
    }
    
    // If suggestions available, select first one
    if (addressSuggestions.length > 0) {
      onSelectAddress(addressSuggestions[0]);
    } else {
      setMessage("Please select an address from the suggestions");
    }
  }

  return (
    <div>
      <section className="hero">
        <h2>🏠 Find NBN plans for your home</h2>
        <p>Enter your address to check NBN availability and compare plans from 30+ Australian providers.</p>
        <form onSubmit={onCheckAddress} className="search" style={{ position: 'relative' }}>
          <input 
            placeholder="Enter your address or suburb (e.g., '123 Main St, Brisbane QLD')" 
            value={address} 
            onChange={(e: any) => setAddress(e.target.value)}
            onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
            autoComplete="off"
          />
          <button type="submit">🔍 Check Address</button>
          
          {showSuggestions && addressSuggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              marginTop: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000
            }}>
              {addressSuggestions.map((addr: AddressResult) => (
                <div
                  key={addr.id}
                  onClick={() => onSelectAddress(addr)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  📍 {addr.formattedAddress}
                </div>
              ))}
            </div>
          )}
        </form>
        {message && <p className={message.includes('failed') || message.includes('Please') || message.includes('❌') ? 'error' : 'muted'}>{message}</p>}
        
        {qualification && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <strong>Your NBN Service:</strong> {qualification.techType} | 
            <strong> Max Speed:</strong> {qualification.maxSpeed}Mbps
          </div>
        )}
      </section>

      <section className="filters">
        <label>
          <strong>Speed tier:</strong>
          <select value={speed} onChange={(e: any) => setSpeed(e.target.value)}>
            <option value="12">NBN 12 (Basic)</option>
            <option value="25">NBN 25 (Standard)</option>
            <option value="50">NBN 50 (Standard Plus)</option>
            <option value="100">NBN 100 (Fast)</option>
            <option value="250">NBN 250 (Superfast)</option>
            <option value="500">NBN 500 (Ultrafast)</option>
            <option value="1000">NBN 1000 (Home Ultrafast)</option>
            <option value="2000">NBN 2000 (2 Gigabit)</option>
          </select>
        </label>
        <label>
          <strong>Contract:</strong>
          <select value={contractFilter} onChange={(e: any) => { setContractFilter(e.target.value); fetchPlans(speed); }}>
            <option value="">All</option>
            <option value="month-to-month">Month-to-Month</option>
            <option value="12-month">12 Month</option>
            <option value="24-month">24 Month</option>
          </select>
        </label>
        <label>
          <strong>Data:</strong>
          <select value={dataFilter} onChange={(e: any) => { setDataFilter(e.target.value); fetchPlans(speed); }}>
            <option value="">All</option>
            <option value="unlimited">Unlimited</option>
            <option value="limited">Limited</option>
          </select>
        </label>
        <label>
          <strong>Technology:</strong>
          <select value={technologyFilter} onChange={(e: any) => { setTechnologyFilter(e.target.value); fetchPlans(speed); }}>
            <option value="">All</option>
            <option value="standard">Standard NBN</option>
            <option value="fixed-wireless">Fixed Wireless</option>
          </select>
        </label>
        <label>
          <strong>Modem:</strong>
          <select value={modemFilter} onChange={(e: any) => { setModemFilter(e.target.value); fetchPlans(speed); }}>
            <option value="">All</option>
            <option value="1">Included</option>
          </select>
        </label>
        <label>
          <strong>Sort by:</strong>
          <select value={sortBy} onChange={(e: any) => setSortBy(e.target.value)}>
            <option value="price">💰 Price (Low to High)</option>
            <option value="price-desc">💰 Price (High to Low)</option>
            <option value="provider">🏢 Provider Name</option>
            <option value="speed">⚡ Speed Tier</option>
          </select>
        </label>
        <label style={{ flex: 1, minWidth: '200px' }}>
          <strong>Search:</strong>
          <input
            type="text"
            placeholder="Search provider or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 18px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '15px',
              marginTop: '4px'
            }}
          />
        </label>
        <button onClick={() => fetchPlans(speed)}>🔄 Refresh</button>
        <button onClick={toggleDarkMode} style={{ background: darkMode ? '#FDB813' : '#2C3E50' }}>
          {darkMode ? '☀️' : '🌙'} {darkMode ? 'Light' : 'Dark'}
        </button>
        {favorites.length > 0 && (
          <button onClick={() => {
            const favPlans = plans.filter((p: Plan) => favorites.includes(p.id));
            if (favPlans.length > 0) {
              alert(`Favorites (${favPlans.length}):\n\n` + favPlans.map((p: Plan) => 
                `${p.provider_name} - ${p.plan_name}\n$${(p.ongoing_price_cents! / 100).toFixed(2)}/mo`
              ).join('\n\n'));
            }
          }} style={{ background: '#E91E63' }}>
            ⭐ Favorites ({favorites.length})
          </button>
        )}
      </section>

      <section className="plan-list">
        <h3>📊 Available Plans ({plans.length})</h3>
        {loading ? (
          <div className="skeleton-container">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton-row">
                <div className="skeleton skeleton-logo"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-price"></div>
                <div className="skeleton skeleton-small"></div>
                <div className="skeleton skeleton-button"></div>
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="loading">No plans found for NBN {speed}. Try a different speed tier.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Provider</th>
                  <th>Plan Name</th>
                  <th>Monthly Price</th>
                  <th className="hide-mobile">Speed Tier</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...plans]
                  .filter(p => {
                    if (!searchTerm) return true;
                    const term = searchTerm.toLowerCase();
                    return (
                      p.provider_name.toLowerCase().includes(term) ||
                      p.plan_name.toLowerCase().includes(term)
                    );
                  })
                  .sort((a, b) => {
                    if (sortBy === 'price') {
                      const priceA = a.intro_price_cents ?? a.ongoing_price_cents ?? Infinity;
                      const priceB = b.intro_price_cents ?? b.ongoing_price_cents ?? Infinity;
                      return priceA - priceB;
                    } else if (sortBy === 'price-desc') {
                      const priceA = a.intro_price_cents ?? a.ongoing_price_cents ?? -Infinity;
                      const priceB = b.intro_price_cents ?? b.ongoing_price_cents ?? -Infinity;
                      return priceB - priceA;
                    } else if (sortBy === 'provider') {
                      return a.provider_name.localeCompare(b.provider_name);
                    } else if (sortBy === 'speed') {
                      return (b.speed_tier ?? 0) - (a.speed_tier ?? 0);
                    }
                    return 0;
                  })
                  .map((p: any) => (
                    <tr key={p.id} className={favorites.includes(p.id) ? 'favorite-row' : ''}>
                      <td>
                        {p.favicon_url ? (
                          <img
                            src={p.favicon_url}
                            alt={p.provider_name}
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              objectFit: 'contain',
                              background: 'white',
                              padding: '4px'
                            }}
                            onError={(e) => {
                              // Fallback to letter logo if favicon fails
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLElement).parentElement;
                              if (parent) {
                                parent.innerHTML = `<div style="background:${getProviderColor(p.provider_name)};color:white;width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.9em">${getProviderInitials(p.provider_name)}</div>`;
                              }
                            }}
                          />
                        ) : (
                          <div 
                            className="provider-logo"
                            style={{
                              background: getProviderColor(p.provider_name),
                              color: 'white',
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.9em'
                            }}
                          >
                            {getProviderInitials(p.provider_name)}
                          </div>
                        )}
                      </td>
                      <td className="provider-name">{p.provider_name}</td>
                      <td>
                        {p.plan_name}
                        {p.modem_included === 1 && <span style={{ marginLeft: '8px', fontSize: '0.8em', background: '#4CAF50', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>📡 Modem</span>}
                        {p.contract_type && p.contract_type !== 'month-to-month' && <span style={{ marginLeft: '8px', fontSize: '0.8em', background: '#FF9800', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>🏷️ {p.contract_type}</span>}
                        {p.technology_type === 'fixed-wireless' && <span style={{ marginLeft: '8px', fontSize: '0.8em', background: '#2196F3', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>📡 Fixed Wireless</span>}
                      </td>
                      <td className="price">
                        {p.intro_price_cents ? (
                          <div style={{ lineHeight: '1.4' }}>
                            <span style={{ fontWeight: 'bold', color: '#E91E63', fontSize: '0.95em' }}>
                              ${(p.intro_price_cents/100).toFixed(2)}
                            </span>
                            <span style={{ fontSize: '0.7em', color: '#666', marginLeft: '4px' }}>
                              {p.intro_duration_days ? `${Math.round(p.intro_duration_days/30)}mo` : ''}
                            </span>
                            <br />
                            <span style={{ fontSize: '0.7em', color: '#999', textDecoration: 'line-through' }}>
                              ${(p.ongoing_price_cents!/100).toFixed(2)}/mo
                            </span>
                          </div>
                        ) : p.ongoing_price_cents ? (
                          `$${(p.ongoing_price_cents/100).toFixed(2)}/mo`
                        ) : (
                          'Contact provider'
                        )}
                      </td>
                      <td className="hide-mobile">
                        NBN {p.speed_tier ?? '—'}
                        {p.upload_speed_mbps && <span style={{ fontSize: '0.8em', color: '#666' }}> / {p.upload_speed_mbps}↑</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => toggleFavorite(p.id)}
                            style={{
                              background: favorites.includes(p.id) ? '#E91E63' : '#ddd',
                              color: favorites.includes(p.id) ? 'white' : '#666',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85em',
                              fontWeight: '600'
                            }}
                          >
                            {favorites.includes(p.id) ? '⭐' : '☆'}
                          </button>
                          <button
                            onClick={() => toggleCompare(p.id)}
                            style={{
                              background: compareList.includes(p.id) ? '#667eea' : '#f0f0f0',
                              color: compareList.includes(p.id) ? 'white' : '#666',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85em',
                              fontWeight: '600'
                            }}
                          >
                            {compareList.includes(p.id) ? '✓ Compare' : 'Compare'}
                          </button>
                          {p.source_url ? (
                            <a href={p.source_url} target="_blank" rel="noopener noreferrer" style={{color: '#667eea', textDecoration: 'none', fontWeight: 600, fontSize: '0.9em'}}>
                              Details →
                            </a>
                          ) : (
                            <span style={{color: '#999'}}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Floating Compare Button */}
      {compareList.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000
        }}>
          <button
            onClick={() => setShowCompareModal(true)}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '16px 24px',
              borderRadius: '50px',
              cursor: 'pointer',
              fontSize: '1em',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Compare ({compareList.length})
          </button>
        </div>
      )}

      {/* Comparison Modal */}
      {showCompareModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={() => setShowCompareModal(false)}
        >
          <div style={{
            background: darkMode ? '#1a1a1a' : 'white',
            borderRadius: '12px',
            padding: window.innerWidth > 768 ? '24px' : '16px',
            maxWidth: '1200px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: darkMode ? 'white' : '#333' }}>Compare Plans</h2>
              <button
                onClick={() => setShowCompareModal(false)}
                style={{
                  background: '#ff4444',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth > 768 ? `repeat(${getComparePlans().length}, 1fr)` : '1fr',
              gap: '20px' 
            }}>
              {getComparePlans().map(plan => (
                <div key={plan.id} style={{
                  border: `2px solid ${darkMode ? '#333' : '#e0e0e0'}`,
                  borderRadius: '12px',
                  padding: '20px',
                  background: darkMode ? '#2a2a2a' : '#f9f9f9'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#667eea', fontSize: '1.1em' }}>{plan.provider_name}</h3>
                  <p style={{ margin: '0 0 20px 0', fontSize: '0.95em', color: darkMode ? '#ccc' : '#666' }}>{plan.plan_name}</p>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.85em', color: darkMode ? '#999' : '#666', marginBottom: '4px' }}>Price</div>
                    {plan.intro_price_cents ? (
                      <div>
                        <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#E91E63' }}>
                          ${(plan.intro_price_cents/100).toFixed(2)}/mo
                        </div>
                        <div style={{ fontSize: '0.8em', color: darkMode ? '#999' : '#666' }}>
                          for {Math.round(plan.intro_duration_days!/30)} months
                        </div>
                        <div style={{ fontSize: '0.85em', color: darkMode ? '#999' : '#666', textDecoration: 'line-through' }}>
                          then ${(plan.ongoing_price_cents!/100).toFixed(2)}/mo
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: darkMode ? 'white' : '#333' }}>
                        ${(plan.ongoing_price_cents!/100).toFixed(2)}/mo
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: `1px solid ${darkMode ? '#444' : '#e0e0e0'}`, paddingTop: '16px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.85em', color: darkMode ? '#999' : '#666' }}>Speed</div>
                      <div style={{ fontWeight: '600', color: darkMode ? 'white' : '#333' }}>
                        NBN {plan.speed_tier} Mbps
                        {plan.upload_speed_mbps && ` / ${plan.upload_speed_mbps}↑`}
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.85em', color: darkMode ? '#999' : '#666' }}>Contract</div>
                      <div style={{ fontWeight: '600', color: darkMode ? 'white' : '#333' }}>
                        {plan.contract_type || 'Month-to-month'}
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.85em', color: darkMode ? '#999' : '#666' }}>Data</div>
                      <div style={{ fontWeight: '600', color: darkMode ? 'white' : '#333' }}>
                        {plan.data_allowance || 'Unlimited'}
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.85em', color: darkMode ? '#999' : '#666' }}>Modem</div>
                      <div style={{ fontWeight: '600', color: darkMode ? 'white' : '#333' }}>
                        {plan.modem_included === 1 ? 'Included' : 'BYO'}
                      </div>
                    </div>

                    {plan.technology_type === 'fixed-wireless' && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{
                          background: '#2196F3',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8em',
                          display: 'inline-block'
                        }}>
                          📡 Fixed Wireless
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    {plan.source_url && (
                      <a
                        href={plan.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'block',
                          background: '#667eea',
                          color: 'white',
                          textAlign: 'center',
                          padding: '12px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          marginBottom: '8px'
                        }}
                      >
                        View Plan Details →
                      </a>
                    )}
                    <button
                      onClick={() => toggleCompare(plan.id)}
                      style={{
                        width: '100%',
                        background: darkMode ? '#333' : '#f0f0f0',
                        color: darkMode ? 'white' : '#666',
                        border: 'none',
                        padding: '10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Remove from comparison
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
