import React, { useEffect, useState } from "react";
import PriceHistoryModal from "../components/PriceHistoryModal";
import { ProviderTooltip } from "../components/ProviderTooltip";
import { getApiBaseUrl } from "../lib/api";

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
  price_trend?: 'up' | 'down' | null;
  promo_code?: string | null;
  promo_description?: string | null;
  // Provider metadata
  provider_ipv6_support?: number;
  provider_cgnat?: number;
  provider_cgnat_opt_out?: number;
  provider_static_ip_available?: number;
  provider_australian_support?: number;
  provider_parent_company?: string | null;
  provider_routing_info?: string | null;
  provider_description?: string | null;
  provider_support_hours?: string | null;
}

interface PriceHistory {
  id: number;
  plan_id: number;
  price_cents: number;
  recorded_at: string;
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
  const [ipv6Filter, setIpv6Filter] = useState(false);
  const [noCgnatFilter, setNoCgnatFilter] = useState(false);
  const [auSupportFilter, setAuSupportFilter] = useState(false);
  const [staticIpFilter, setStaticIpFilter] = useState(false);
  const [providerFilter, setProviderFilter] = useState('');
  const [viewMode, setViewMode] = useState<'standard' | 'fixed-wireless'>('standard');
  const [compareList, setCompareList] = useState([] as number[]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [selectedPlanForHistory, setSelectedPlanForHistory] = useState(null as Plan | null);
  const [priceHistoryData, setPriceHistoryData] = useState([] as PriceHistory[]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  async function fetchPlans(s: string) {
    setLoading(true);
    setMessage('Loading plans...');
    try {
      const apiUrl = getApiBaseUrl();
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

  async function fetchPriceHistory(plan: Plan) {
    setSelectedPlanForHistory(plan);
    setShowPriceHistory(true);
    setLoadingHistory(true);
    setPriceHistoryData([]);
    
    try {
      const apiUrl = getApiBaseUrl();
      const res = await fetch(`${apiUrl}/api/price-history/${plan.id}`);
      const data = await res.json();
      if (data.ok && data.history) {
        setPriceHistoryData(data.history);
      }
    } catch (err) {
      console.error('Failed to fetch price history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetchPlans(speed);
  }, [speed, contractFilter, dataFilter, modemFilter, technologyFilter]);

  // Reset speed when switching between Standard and Fixed Wireless
  useEffect(() => {
    if (viewMode === 'fixed-wireless') {
      // If current speed isn't valid for Fixed Wireless (25, 50, 75), reset to 25
      if (!['25', '50', '75'].includes(speed)) {
        setSpeed('25');
      }
    } else {
      // If current speed is only valid for Fixed Wireless, reset to 100 for Standard
      if (speed === '75') {
        setSpeed('100');
      }
    }
  }, [viewMode]);

  // Calculate best value plans - considers price AND quality factors
  const bestValuePlanIds = React.useMemo(() => {
    const bestByTier: Record<number, number> = {};
    
    plans.forEach((p: any) => {
      if (!p.speed_tier) return;
      const price = p.intro_price_cents ?? p.ongoing_price_cents;
      if (!price) return;
      
      // Calculate value score (higher is better)
      // Price component: inverse of price (cheaper = higher score)
      const priceScore = 100000 / price; // Normalize so $50/mo ≈ 200 points
      
      // Quality bonuses
      let qualityScore = 0;
      if (p.provider_australian_support === 'yes') qualityScore += 15; // AU support team
      if (p.provider_cgnat === 'no' || p.provider_cgnat_opt_out === 'yes') qualityScore += 12; // No CGNAT
      if (p.provider_ipv6_support === 'yes') qualityScore += 8; // IPv6 support
      if (p.provider_static_ip_available === 'yes') qualityScore += 6; // Static IP option
      if (p.provider_routing_info && p.provider_routing_info.includes('direct')) qualityScore += 8; // Good routing
      if (p.modem_included === 1) qualityScore += 5; // Modem included
      
      const totalScore = priceScore + qualityScore;
      
      // Compare with existing best for this tier
      const currentBest = plans.find((x: any) => x.id === bestByTier[p.speed_tier]);
      if (!currentBest) {
        bestByTier[p.speed_tier] = p.id;
      } else {
        const currentPrice = currentBest.intro_price_cents ?? currentBest.ongoing_price_cents;
        const currentPriceScore = 100000 / currentPrice;
        let currentQualityScore = 0;
        if (currentBest.provider_australian_support === 'yes') currentQualityScore += 15;
        if (currentBest.provider_cgnat === 'no' || currentBest.provider_cgnat_opt_out === 'yes') currentQualityScore += 12;
        if (currentBest.provider_ipv6_support === 'yes') currentQualityScore += 8;
        if (currentBest.provider_static_ip_available === 'yes') currentQualityScore += 6;
        if (currentBest.provider_routing_info && currentBest.provider_routing_info.includes('direct')) currentQualityScore += 8;
        if (currentBest.modem_included === 1) currentQualityScore += 5;
        const currentTotalScore = currentPriceScore + currentQualityScore;
        
        if (totalScore > currentTotalScore) {
          bestByTier[p.speed_tier] = p.id;
        }
      }
    });
    return new Set(Object.values(bestByTier));
  }, [plans]);

  // Debounced address search
  useEffect(() => {
    if (address.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const apiUrl = getApiBaseUrl();
        const res = await fetch(`${apiUrl}/api/address/search?q=${encodeURIComponent(address)}`);
        const json = await res.json();
        if (json.ok && json.results) {
          setAddressSuggestions(json.results);
          setShowSuggestions(true);
          setHighlightedIndex(-1);
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
    setHighlightedIndex(-1);
    setMessage("🔍 Checking NBN availability...");
    
    try {
      const apiUrl = getApiBaseUrl();
      const res = await fetch(`${apiUrl}/api/address/qualify?id=${encodeURIComponent(addr.id)}`);
      const json = await res.json();
      
      if (json.ok && json.qualification) {
        const qual = json.qualification;
        setQualification(qual);
        
        if (qual.available) {
          let techMessage = '';
          
          // Auto-set technology filter based on service type
          if (qual.techType === 'FTTC' || qual.techType === 'FTTN' || qual.techType === 'FTTP' || qual.techType === 'HFC') {
            setTechnologyFilter('standard');
            techMessage = qual.techType === 'FTTP' 
              ? ' 🎉 FTTP premises can support up to 2 Gigabit speeds (may require free NBN NTD upgrade).' 
              : '';
          } else if (qual.techType === 'Wireless' || qual.techType === 'Fixed Wireless') {
            setTechnologyFilter('fixed-wireless');
            techMessage = ' 📡 Fixed Wireless plans only.';
          }
          
          setMessage(`✅ ${qual.techType} available! Max speed: NBN ${qual.maxSpeed}Mbps.${techMessage} ${json.note || ''}`);
          
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
            onKeyDown={(e: any) => {
              if (!showSuggestions || addressSuggestions.length === 0) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedIndex((prev) => 
                  prev < addressSuggestions.length - 1 ? prev + 1 : prev
                );
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
              } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                e.preventDefault();
                onSelectAddress(addressSuggestions[highlightedIndex]);
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowSuggestions(false);
                setHighlightedIndex(-1);
              }
            }}
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="address-suggestions"
            aria-expanded={showSuggestions}
            role="combobox"
          />
          <button type="submit">🔍 Check Address</button>
          
          {showSuggestions && addressSuggestions.length > 0 && (
            <div 
              id="address-suggestions"
              role="listbox"
              style={{
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
              {addressSuggestions.map((addr: AddressResult, index: number) => (
                <div
                  key={addr.id}
                  onClick={() => onSelectAddress(addr)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                    transition: 'background 0.2s',
                    backgroundColor: highlightedIndex === index ? '#f5f5f5' : 'white'
                  }}
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
            {qualification.techType === 'FTTP' && (
              <div style={{ marginTop: '8px', fontSize: '0.9em', color: '#4ade80' }}>
                💡 FTTP premises can get 2 Gigabit speeds (may need free NBN NTD upgrade)
              </div>
            )}
          </div>
        )}
      </section>

      {/* NBN Type Toggle */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95))',
        padding: '20px 30px',
        borderRadius: 'var(--radius-xl)',
        marginTop: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <strong style={{ color: '#2d3748' }}>Service Type:</strong>
        <div style={{ display: 'flex', gap: '8px', background: '#f5f5f5', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setViewMode('standard')}
            style={{
              padding: '10px 24px',
              background: viewMode === 'standard' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              color: viewMode === 'standard' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95em',
              transition: 'all 0.2s'
            }}
          >
            🏠 Standard NBN
          </button>
          <button
            onClick={() => setViewMode('fixed-wireless')}
            style={{
              padding: '10px 24px',
              background: viewMode === 'fixed-wireless' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              color: viewMode === 'fixed-wireless' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95em',
              transition: 'all 0.2s'
            }}
          >
            📡 Fixed Wireless
          </button>
        </div>
        <span style={{ fontSize: '0.85em', color: '#666', fontStyle: 'italic' }}>
          {viewMode === 'standard' ? 'FTTP, FTTC, FTTN, HFC' : 'For regional/rural areas'}
        </span>
      </section>

      {/* Quick provider filter */}
      {plans.length > 0 && (
        <section style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95))',
          padding: '20px 30px',
          borderRadius: 'var(--radius-xl)',
          marginTop: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <strong style={{ color: '#2d3748' }}>Quick Filter:</strong>
            {providerFilter && (
              <button 
                onClick={() => setProviderFilter('')}
                style={{
                  padding: '6px 14px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9em'
                }}
              >
                ✕ Clear Filter
              </button>
            )}
            {['Telstra', 'Optus', 'TPG', 'Aussie Broadband', 'iiNet', 'Exetel', 'Superloop', 'Tangerine']
              .filter(name => plans.some((p: Plan) => p.provider_name === name))
              .map(name => (
                <button
                  key={name}
                  onClick={() => setProviderFilter(providerFilter === name ? '' : name)}
                  style={{
                    padding: '6px 14px',
                    background: providerFilter === name ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                    color: providerFilter === name ? 'white' : '#333',
                    border: providerFilter === name ? 'none' : '2px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: providerFilter === name ? 'bold' : '600',
                    fontSize: '0.9em',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e: any) => {
                    if (providerFilter !== name) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.color = '#667eea';
                    }
                  }}
                  onMouseLeave={(e: any) => {
                    if (providerFilter !== name) {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.color = '#333';
                    }
                  }}
                >
                  {name}
                </button>
              ))
            }
          </div>
        </section>
      )}

      <section className="filters">
        <label>
          <strong>Speed tier:</strong>
          <select value={speed} onChange={(e: any) => setSpeed(e.target.value)}>
            {viewMode === 'fixed-wireless' ? (
              <>
                <option value="25">Fixed Wireless 25Mbps</option>
                <option value="50">Fixed Wireless 50Mbps</option>
                <option value="75">Fixed Wireless 75Mbps</option>
              </>
            ) : (
              <>
                <option value="12">NBN 12 (Basic)</option>
                <option value="25">NBN 25 (Standard)</option>
                <option value="50">NBN 50 (Standard Plus)</option>
                <option value="100">NBN 100 (Fast)</option>
                <option value="250">NBN 250 (Superfast)</option>
                <option value="500">NBN 500 (Ultrafast)</option>
                <option value="1000">NBN 1000 (Home Ultrafast)</option>
                <option value="2000">NBN 2000 (2 Gigabit)</option>
              </>
            )}
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
          <strong>Modem:</strong>
          <select value={modemFilter} onChange={(e: any) => { setModemFilter(e.target.value); fetchPlans(speed); }}>
            <option value="">All</option>
            <option value="1">Included</option>
          </select>
        </label>
        <label>
          <strong>Provider:</strong>
          <input
            type="text"
            placeholder="Filter by ISP..."
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            style={{
              padding: '14px 18px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '15px',
              width: '180px'
            }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={ipv6Filter}
            onChange={(e) => setIpv6Filter(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span>IPv6 Support</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={noCgnatFilter}
            onChange={(e) => setNoCgnatFilter(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span>No CGNAT</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={auSupportFilter}
            onChange={(e) => setAuSupportFilter(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span>AU Support</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={staticIpFilter}
            onChange={(e) => setStaticIpFilter(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span>Static IP Available</span>
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
        <h3>📊 {viewMode === 'fixed-wireless' ? 'Fixed Wireless NBN Plans' : 'Standard NBN Plans'} ({plans.filter((p: Plan) => viewMode === 'fixed-wireless' ? p.technology_type === 'fixed-wireless' : p.technology_type !== 'fixed-wireless').length})</h3>
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
        ) : plans.filter((p: Plan) => viewMode === 'fixed-wireless' ? p.technology_type === 'fixed-wireless' : p.technology_type !== 'fixed-wireless').length === 0 ? (
          <div className="loading">
            {viewMode === 'fixed-wireless' 
              ? 'No Fixed Wireless plans found for NBN ' + speed + '. Try a different speed tier or switch to Standard NBN.' 
              : 'No Standard NBN plans found for NBN ' + speed + '. Try a different speed tier or check Fixed Wireless.'}
          </div>
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
                    // Technology type filter (standard vs fixed wireless)
                    if (viewMode === 'fixed-wireless' && p.technology_type !== 'fixed-wireless') {
                      return false;
                    }
                    if (viewMode === 'standard' && p.technology_type === 'fixed-wireless') {
                      return false;
                    }
                    
                    // Search term filter
                    if (searchTerm) {
                      const term = searchTerm.toLowerCase();
                      if (!(p.provider_name.toLowerCase().includes(term) || p.plan_name.toLowerCase().includes(term))) {
                        return false;
                      }
                    }
                    
                    // Provider filter
                    if (providerFilter && !p.provider_name.toLowerCase().includes(providerFilter.toLowerCase())) {
                      return false;
                    }
                    
                    // ISP metadata filters
                    if (ipv6Filter && p.provider_ipv6_support !== 'yes') {
                      return false;
                    }
                    if (noCgnatFilter && p.provider_cgnat !== 'no' && p.provider_cgnat_opt_out !== 'yes') {
                      return false;
                    }
                    if (auSupportFilter && p.provider_australian_support !== 'yes') {
                      return false;
                    }
                    if (staticIpFilter && p.provider_static_ip_available !== 'yes') {
                      return false;
                    }
                    
                    return true;
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
                      <td className="provider-name">
                        <a 
                          href={`/provider/${p.provider_name.toLowerCase().replace(/\s+/g, '-')}`}
                          style={{
                            color: 'inherit',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={(e: any) => { e.target.style.color = '#667eea'; }}
                          onMouseLeave={(e: any) => { e.target.style.color = 'inherit'; }}
                        >
                          {p.provider_name}
                        </a>
                        <ProviderTooltip 
                          provider={{
                            name: p.provider_name,
                            description: p.provider_description,
                            ipv6_support: p.provider_ipv6_support,
                            cgnat: p.provider_cgnat,
                            cgnat_opt_out: p.provider_cgnat_opt_out,
                            static_ip_available: p.provider_static_ip_available,
                            australian_support: p.provider_australian_support,
                            parent_company: p.provider_parent_company,
                            routing_info: p.provider_routing_info,
                            support_hours: p.provider_support_hours
                          }}
                          darkMode={darkMode}
                        />
                      </td>
                      <td>
                        {p.plan_name}
                        {bestValuePlanIds.has(p.id) && (
                          <span 
                            style={{ 
                              marginLeft: '8px', 
                              fontSize: '0.75em', 
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                              color: 'white', 
                              padding: '3px 10px', 
                              borderRadius: '6px', 
                              fontWeight: 'bold', 
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                              cursor: 'help'
                            }}
                            title={`Best Value = Price + Quality Score\n\nThis plan offers the optimal balance of:\n• Competitive pricing\n${p.provider_australian_support === 'yes' ? '• Australian support team\n' : ''}${p.provider_cgnat === 'no' || p.provider_cgnat_opt_out === 'yes' ? '• No CGNAT (or opt-out available)\n' : ''}${p.provider_ipv6_support === 'yes' ? '• IPv6 support\n' : ''}${p.provider_static_ip_available === 'yes' ? '• Static IP available\n' : ''}${p.provider_routing_info && p.provider_routing_info.includes('direct') ? '• Direct routing/good network POIs\n' : ''}${p.modem_included === 1 ? '• Modem included\n' : ''}\nNot just the cheapest, but the best overall value for this speed tier.`}
                          >
                            ⭐ Best Value
                          </span>
                        )}
                        {p.promo_code && (
                          <span style={{ marginLeft: '8px', fontSize: '0.75em', background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '4px', cursor: 'help' }} title={`Use code: ${p.promo_code}${p.promo_description ? ` - ${p.promo_description}` : ''}`}>
                            🎟️ {p.promo_code}
                          </span>
                        )}
                        {p.modem_included === 1 && <span style={{ marginLeft: '8px', fontSize: '0.8em', background: '#4CAF50', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>📡 Modem</span>}
                        {p.contract_type && p.contract_type !== 'month-to-month' && <span style={{ marginLeft: '8px', fontSize: '0.8em', background: '#FF9800', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>🏷️ {p.contract_type}</span>}
                      </td>
                      <td className="price">
                        {p.intro_price_cents ? (
                          <div style={{ lineHeight: '1.4' }}>
                            <span style={{ fontWeight: 'bold', color: '#E91E63', fontSize: '0.95em' }}>
                              ${(p.intro_price_cents/100).toFixed(2)}
                              {p.price_trend && (
                                <span 
                                  style={{ 
                                    marginLeft: '4px',
                                    color: p.price_trend === 'down' ? '#16a34a' : '#dc2626',
                                    fontSize: '0.9em'
                                  }} 
                                  title={p.price_trend === 'down' ? 'Price decreased' : 'Price increased'}
                                >
                                  {p.price_trend === 'down' ? '↓' : '↑'}
                                </span>
                              )}
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
                          <span>
                            ${(p.ongoing_price_cents/100).toFixed(2)}/mo
                            {p.price_trend && (
                              <span 
                                style={{ 
                                  marginLeft: '4px',
                                  color: p.price_trend === 'down' ? '#16a34a' : '#dc2626',
                                  fontSize: '0.9em'
                                }} 
                                title={p.price_trend === 'down' ? 'Price decreased' : 'Price increased'}
                              >
                                {p.price_trend === 'down' ? '↓' : '↑'}
                              </span>
                            )}
                          </span>
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
                            onClick={() => fetchPriceHistory(p)}
                            style={{
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85em',
                              fontWeight: '600'
                            }}
                            title="View price history"
                          >
                            📊
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

            {/* Mobile Card View */}
            <div className="plans-card-view">
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
                .map((p: Plan) => (
                  <div key={p.id} className={`plan-card ${favorites.includes(p.id) ? 'favorite' : ''}`}>
                    <div className="plan-card-header">
                      <div className="plan-card-logo">
                        {p.favicon_url ? (
                          <img
                            src={p.favicon_url}
                            alt={p.provider_name}
                            loading="lazy"
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '8px',
                              objectFit: 'contain',
                              background: 'white',
                              padding: '4px'
                            }}
                          />
                        ) : (
                          <div 
                            style={{
                              background: getProviderColor(p.provider_name),
                              color: 'white',
                              width: '48px',
                              height: '48px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '1em'
                            }}
                          >
                            {getProviderInitials(p.provider_name)}
                          </div>
                        )}
                      </div>
                      <div className="plan-card-title">
                        <h3>
                          {p.provider_name}
                          <ProviderTooltip 
                            provider={{
                              name: p.provider_name,
                              description: p.provider_description,
                              ipv6_support: p.provider_ipv6_support,
                              cgnat: p.provider_cgnat,
                              cgnat_opt_out: p.provider_cgnat_opt_out,
                              static_ip_available: p.provider_static_ip_available,
                              australian_support: p.provider_australian_support,
                              parent_company: p.provider_parent_company,
                              routing_info: p.provider_routing_info,
                              support_hours: p.provider_support_hours
                            }}
                            darkMode={darkMode}
                          />
                        </h3>
                        <p>{p.plan_name}</p>
                      </div>
                    </div>

                    <div className={p.intro_price_cents ? 'plan-card-price plan-card-price-intro' : 'plan-card-price'}>
                      {p.intro_price_cents ? (
                        <>
                          ${(p.intro_price_cents/100).toFixed(2)}/mo
                          {p.price_trend && <span style={{ fontSize: '0.5em' }}> {p.price_trend === 'down' ? '↓' : '↑'}</span>}
                          <span className="plan-card-price-original">
                            then ${(p.ongoing_price_cents!/100).toFixed(2)}/mo
                          </span>
                          {p.intro_duration_days && (
                            <div style={{ fontSize: '0.4em', color: '#E91E63', marginTop: '4px' }}>
                              for {Math.round(p.intro_duration_days/30)} months
                            </div>
                          )}
                        </>
                      ) : p.ongoing_price_cents ? (
                        <>
                          ${(p.ongoing_price_cents/100).toFixed(2)}/mo
                          {p.price_trend && <span style={{ fontSize: '0.5em' }}> {p.price_trend === 'down' ? '↓' : '↑'}</span>}
                        </>
                      ) : (
                        <span style={{ fontSize: '0.5em' }}>Contact provider</span>
                      )}
                    </div>

                    {p.promo_code && (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '8px 12px', 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        borderRadius: '8px',
                        marginBottom: '12px',
                        border: '1px dashed #10b981'
                      }}>
                        <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '4px' }}>Use promo code:</div>
                        <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#10b981', fontFamily: 'monospace' }}>
                          {p.promo_code}
                        </div>
                        {p.promo_description && (
                          <div style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}>{p.promo_description}</div>
                        )}
                      </div>
                    )}

                    <div className="plan-card-details">
                      <div className="plan-card-detail">
                        <strong>Speed</strong>
                        NBN {p.speed_tier ?? '—'}
                        {p.upload_speed_mbps && <span> / {p.upload_speed_mbps}↑</span>}
                      </div>
                      <div className="plan-card-detail">
                        <strong>Data</strong>
                        {p.data_allowance || 'Not stated'}
                      </div>
                      <div className="plan-card-detail">
                        <strong>Contract</strong>
                        {p.contract_type || 'Not stated'}
                      </div>
                      <div className="plan-card-detail">
                        <strong>Tech</strong>
                        {p.technology_type === 'fixed-wireless' ? 'Fixed Wireless' : 'Standard NBN'}
                      </div>
                    </div>

                    <div className="plan-card-badges">
                      {p.modem_included === 1 && (
                        <span style={{ fontSize: '0.8em', background: '#4CAF50', color: 'white', padding: '4px 10px', borderRadius: '6px' }}>
                          📡 Modem Included
                        </span>
                      )}
                      {favorites.includes(p.id) && (
                        <span style={{ fontSize: '0.8em', background: '#E91E63', color: 'white', padding: '4px 10px', borderRadius: '6px' }}>
                          ⭐ Favorite
                        </span>
                      )}
                    </div>

                    <div className="plan-card-actions">
                      <button
                        onClick={() => toggleFavorite(p.id)}
                        style={{
                          background: favorites.includes(p.id) ? '#E91E63' : '#f0f0f0',
                          color: favorites.includes(p.id) ? 'white' : '#666'
                        }}
                      >
                        {favorites.includes(p.id) ? '⭐' : '☆'} Favorite
                      </button>
                      <button
                        onClick={() => fetchPriceHistory(p)}
                        style={{ background: '#10b981', color: 'white' }}
                      >
                        📊 History
                      </button>
                      <button
                        onClick={() => toggleCompare(p.id)}
                        style={{
                          background: compareList.includes(p.id) ? '#667eea' : '#f0f0f0',
                          color: compareList.includes(p.id) ? 'white' : '#666'
                        }}
                      >
                        {compareList.includes(p.id) ? '✓' : '+'} Compare
                      </button>
                    </div>
                    {p.source_url && (
                      <a 
                        href={p.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          marginTop: '12px',
                          color: '#667eea',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '0.9em'
                        }}
                      >
                        View Full Details →
                      </a>
                    )}
                  </div>
                ))}
            </div>
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
                          {plan.price_trend && (
                            <span 
                              style={{ 
                                marginLeft: '6px',
                                color: plan.price_trend === 'down' ? '#16a34a' : '#dc2626',
                                fontSize: '0.8em'
                              }} 
                              title={plan.price_trend === 'down' ? 'Price decreased' : 'Price increased'}
                            >
                              {plan.price_trend === 'down' ? '↓' : '↑'}
                            </span>
                          )}
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
                        {plan.price_trend && (
                          <span 
                            style={{ 
                              marginLeft: '6px',
                              color: plan.price_trend === 'down' ? '#16a34a' : '#dc2626',
                              fontSize: '0.8em'
                            }} 
                            title={plan.price_trend === 'down' ? 'Price decreased' : 'Price increased'}
                          >
                            {plan.price_trend === 'down' ? '↓' : '↑'}
                          </span>
                        )}
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

      {showPriceHistory && selectedPlanForHistory && (
        <PriceHistoryModal
          plan={selectedPlanForHistory}
          history={priceHistoryData}
          loading={loadingHistory}
          onClose={() => setShowPriceHistory(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
