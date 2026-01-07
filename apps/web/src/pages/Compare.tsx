import React, { useEffect, useState } from "react";
// Type aliases for React events
type ChangeEvent<T> = React.ChangeEvent<T>;
type MouseEvent<T> = React.MouseEvent<T>;
type KeyboardEvent<T> = React.KeyboardEvent<T>;
type FormEvent<T> = React.FormEvent<T>;
import PriceHistoryModal from "../components/PriceHistoryModal";
import SpeedCalculator from "../components/SpeedCalculator";
import BillComparison from "../components/BillComparison";
import { ProviderTooltip } from "../components/ProviderTooltip";
import { getApiBaseUrl } from "../lib/api";

// Helper to strip HTML tags and decode entities from plan names/descriptions
function stripHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&lt;/g, '<')   // Decode &lt;
    .replace(/&gt;/g, '>')   // Decode &gt;
    .replace(/&amp;/g, '&')  // Decode &amp;
    .replace(/&quot;/g, '"') // Decode &quot;
    .replace(/&#39;/g, "'")  // Decode &#39;
    .replace(/<[^>]*>/g, '') // Remove any remaining tags after decode
    .trim();
}

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
  service_type?: string;  // 'nbn', '5g-home', 'satellite', etc.
  // Provider metadata
  provider_ipv6_support?: number;  // 0 = no, 1 = yes
  provider_cgnat?: number;  // 0 = no CGNAT, 1 = uses CGNAT
  provider_cgnat_opt_out?: number;  // 0 = no opt-out, 1 = free opt-out, 2 = paid opt-out
  provider_static_ip_available?: number;  // 0 = no, 1 = free, 2 = paid addon
  provider_australian_support?: number;  // 0 = offshore, 1 = mixed, 2 = 100% Australian
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
  const [speed, setSpeed] = useState("all");
  const [address, setAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([] as AddressResult[]);
  const [_selectedAddress, setSelectedAddress] = useState(null as AddressResult | null);
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
  const [exclude6MonthFilter, setExclude6MonthFilter] = useState(false);
  const [uploadSpeedFilter, setUploadSpeedFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [selectedProviders, setSelectedProviders] = useState([] as string[]);
  const [viewMode, setViewMode] = useState('standard' as 'standard' | 'fixed-wireless' | 'business' | '5g-home' | 'satellite');
  const [planTypeFilter, setPlanTypeFilter] = useState('residential' as 'residential' | 'business' | 'all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('nbn' as 'nbn' | '5g-home' | 'satellite');
  const [compareList, setCompareList] = useState([] as number[]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [selectedPlanForHistory, setSelectedPlanForHistory] = useState(null as Plan | null);
  const [priceHistoryData, setPriceHistoryData] = useState([] as PriceHistory[]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showProviderList, setShowProviderList] = useState(false);

  async function fetchPlans(s: string) {
    setLoading(true);
    setMessage('Loading plans...');
    try {
      const apiUrl = getApiBaseUrl();
      const params = new URLSearchParams();
      // Only add speed param if not "all"
      if (s !== 'all') params.append('speed', s);
      if (contractFilter) params.append('contract', contractFilter);
      if (dataFilter) params.append('data', dataFilter);
      if (modemFilter) params.append('modem', modemFilter);
      if (technologyFilter) params.append('technology', technologyFilter);
      
      // Set serviceType and planType based on viewMode
      if (viewMode === '5g-home') {
        params.append('serviceType', '5g-home');
      } else if (viewMode === 'satellite') {
        params.append('serviceType', 'satellite');
      } else if (viewMode === 'business') {
        // Business plans: Show all NBN plans for now (until we have proper business plans seeded)
        // In future, can add: params.append('planType', 'business');
        params.append('serviceType', 'nbn');
      } else {
        params.append('serviceType', 'nbn');  // standard and fixed-wireless use NBN
      }
      
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
  }, [speed, contractFilter, dataFilter, modemFilter, technologyFilter, serviceTypeFilter, planTypeFilter, viewMode]);

  // Reset speed when switching between view modes
  useEffect(() => {
    if (viewMode === 'fixed-wireless') {
      // If current speed isn't valid for Fixed Wireless (100, 200, 400), reset to 100
      if (!['100', '200', '400'].includes(speed)) {
        setSpeed('100');
      }
      setServiceTypeFilter('nbn');
      setPlanTypeFilter('residential');
    } else if (viewMode === '5g-home') {
      // 5G Home typically has speeds up to 300
      setServiceTypeFilter('5g-home');
      setPlanTypeFilter('residential');
      if (!['100', '250', '300'].includes(speed)) {
        setSpeed('100');
      }
    } else if (viewMode === 'satellite') {
      // Satellite has varying speeds
      setServiceTypeFilter('satellite');
      setPlanTypeFilter('residential');
      if (!['25', '50', '100', '150'].includes(speed)) {
        setSpeed('100');
      }
    } else if (viewMode === 'business') {
      setServiceTypeFilter('nbn');
      setPlanTypeFilter('business');
    } else {
      // Standard mode
      setServiceTypeFilter('nbn');
      setPlanTypeFilter('residential');
      // If current speed is only valid for Fixed Wireless (200, 400), reset to 100 for Standard
      if (['200', '400'].includes(speed)) {
        setSpeed('all');
      }
    }
  }, [viewMode]);

  // Speed tier color function
  const getSpeedTierColor = (tier: number | null): string => {
    if (!tier) return '#6b7280';
    if (tier <= 12) return '#94a3b8'; // Gray for basic
    if (tier <= 25) return '#22c55e'; // Green for standard
    if (tier <= 50) return '#3b82f6'; // Blue for standard plus
    if (tier <= 100) return '#8b5cf6'; // Purple for fast
    if (tier <= 250) return '#f59e0b'; // Amber for superfast
    if (tier <= 500) return '#ef4444'; // Red for ultrafast
    if (tier <= 1000) return '#ec4899'; // Pink for home ultrafast
    return '#06b6d4'; // Cyan for 2 gigabit
  };

  const getSpeedTierLabel = (tier: number | null): string => {
    if (!tier) return '—';
    if (tier <= 12) return 'Basic';
    if (tier <= 25) return 'Standard';
    if (tier <= 50) return 'Standard Plus';
    if (tier <= 100) return 'Fast';
    if (tier <= 250) return 'Superfast';
    if (tier <= 500) return 'Ultrafast';
    if (tier <= 1000) return 'Home Ultrafast';
    return '2 Gigabit';
  };

  // Calculate best value plans - considers price AND quality factors
  const bestValuePlanIds = React.useMemo(() => {
    const bestByTier: Record<number, number> = {};
    
    plans.forEach((p: Plan) => {
      const tier = p.speed_tier;
      if (tier === null) return;
      
      const price = p.intro_price_cents ?? p.ongoing_price_cents;
      if (!price) return;
      
      // Calculate value score (higher is better)
      const priceScore = 100000 / price;
      
      let qualityScore = 0;
      if ((p.provider_australian_support ?? 0) >= 1) qualityScore += 15;
      if (p.provider_cgnat === 0 || (p.provider_cgnat_opt_out ?? 0) >= 1) qualityScore += 12;
      if ((p.provider_ipv6_support ?? 0) >= 1) qualityScore += 8;
      if ((p.provider_static_ip_available ?? 0) >= 1) qualityScore += 6;
      if (p.provider_routing_info?.includes('direct')) qualityScore += 8;
      if (p.modem_included === 1) qualityScore += 5;
      
      const totalScore = priceScore + qualityScore;
      
      const currentBestId = bestByTier[tier];
      if (currentBestId === undefined) {
        bestByTier[tier] = p.id;
      } else {
        const currentBest = plans.find((x: Plan) => x.id === currentBestId);
        if (!currentBest) {
          bestByTier[tier] = p.id;
          return;
        }
        
        const currentPrice = currentBest.intro_price_cents ?? currentBest.ongoing_price_cents;
        if (!currentPrice) {
          bestByTier[tier] = p.id;
          return;
        }
        
        const currentPriceScore = 100000 / currentPrice;
        let currentQualityScore = 0;
        if ((currentBest.provider_australian_support ?? 0) >= 1) currentQualityScore += 15;
        if (currentBest.provider_cgnat === 0 || (currentBest.provider_cgnat_opt_out ?? 0) >= 1) currentQualityScore += 12;
        if ((currentBest.provider_ipv6_support ?? 0) >= 1) currentQualityScore += 8;
        if ((currentBest.provider_static_ip_available ?? 0) >= 1) currentQualityScore += 6;
        if (currentBest.provider_routing_info?.includes('direct')) currentQualityScore += 8;
        if (currentBest.modem_included === 1) currentQualityScore += 5;
        
        const currentTotalScore = currentPriceScore + currentQualityScore;
        
        if (totalScore > currentTotalScore) {
          bestByTier[tier] = p.id;
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

  async function onCheckAddress(e: FormEvent<HTMLFormElement>) {
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
            onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (!showSuggestions || addressSuggestions.length === 0) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedIndex((prev: number) => 
                  prev < addressSuggestions.length - 1 ? prev + 1 : prev
                );
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex((prev: number) => (prev > 0 ? prev - 1 : -1));
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

      {/* Tools Row - Speed Calculator and Bill Comparison */}
      <section style={{
        display: 'flex',
        gap: '12px',
        marginTop: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <SpeedCalculator 
          darkMode={darkMode} 
          onSpeedRecommended={(s) => setSpeed(String(s))} 
        />
        <BillComparison 
          darkMode={darkMode} 
          currentPlans={plans} 
        />
      </section>

      {/* NBN Type Toggle */}
      <section style={{
        background: darkMode 
          ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.95), rgba(26, 32, 44, 0.98))'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95))',
        padding: '20px 30px',
        borderRadius: 'var(--radius-xl)',
        marginTop: '20px',
        boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <strong style={{ color: darkMode ? '#f7fafc' : '#2d3748' }}>Service Type:</strong>
        <div style={{ display: 'flex', gap: '8px', background: darkMode ? '#1a202c' : '#f5f5f5', padding: '4px', borderRadius: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => setViewMode('standard')}
            style={{
              padding: '10px 20px',
              background: viewMode === 'standard' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              color: viewMode === 'standard' ? 'white' : (darkMode ? '#e2e8f0' : '#333'),
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9em',
              transition: 'all 0.2s'
            }}
          >
            🏠 NBN
          </button>
          <button
            onClick={() => setViewMode('fixed-wireless')}
            style={{
              padding: '10px 20px',
              background: viewMode === 'fixed-wireless' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              color: viewMode === 'fixed-wireless' ? 'white' : (darkMode ? '#e2e8f0' : '#333'),
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9em',
              transition: 'all 0.2s'
            }}
          >
            📡 Fixed Wireless
          </button>
          <button
            onClick={() => setViewMode('5g-home')}
            style={{
              padding: '10px 20px',
              background: viewMode === '5g-home' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              color: viewMode === '5g-home' ? 'white' : (darkMode ? '#e2e8f0' : '#333'),
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9em',
              transition: 'all 0.2s'
            }}
          >
            📶 5G Home
          </button>
          <button
            onClick={() => setViewMode('satellite')}
            style={{
              padding: '10px 20px',
              background: viewMode === 'satellite' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              color: viewMode === 'satellite' ? 'white' : (darkMode ? '#e2e8f0' : '#333'),
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9em',
              transition: 'all 0.2s'
            }}
          >
            🛰️ Satellite
          </button>
          <button
            onClick={() => setViewMode('business')}
            style={{
              padding: '10px 20px',
              background: viewMode === 'business' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              color: viewMode === 'business' ? 'white' : (darkMode ? '#e2e8f0' : '#333'),
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9em',
              transition: 'all 0.2s'
            }}
          >
            🏢 Business
          </button>
        </div>
        <span style={{ fontSize: '0.85em', color: darkMode ? '#a0aec0' : '#666', fontStyle: 'italic' }}>
          {viewMode === 'standard' && 'FTTP, FTTC, FTTN, HFC'}
          {viewMode === 'fixed-wireless' && 'For regional/rural areas'}
          {viewMode === '5g-home' && 'No NBN required, uses mobile network'}
          {viewMode === 'satellite' && 'Starlink, SkyMuster for remote areas'}
          {viewMode === 'business' && 'SLAs, static IPs, priority support'}
        </span>
      </section>

      {/* Quick provider filter */}
      {plans.length > 0 && (
        <section style={{ 
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.95), rgba(26, 32, 44, 0.98))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95))',
          padding: '20px 30px',
          borderRadius: 'var(--radius-xl)',
          marginTop: '20px',
          boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <strong style={{ color: darkMode ? '#f7fafc' : '#2d3748' }}>Quick Filter:</strong>
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
                    background: providerFilter === name ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : (darkMode ? '#1a202c' : 'white'),
                    color: providerFilter === name ? 'white' : (darkMode ? '#e2e8f0' : '#333'),
                    border: providerFilter === name ? 'none' : (darkMode ? '2px solid #4a5568' : '2px solid #e0e0e0'),
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: providerFilter === name ? 'bold' : '600',
                    fontSize: '0.9em',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                    if (providerFilter !== name) {
                      (e.target as HTMLButtonElement).style.borderColor = '#667eea';
                      (e.target as HTMLButtonElement).style.color = '#667eea';
                    }
                  }}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                    if (providerFilter !== name) {
                      (e.target as HTMLButtonElement).style.borderColor = '#e0e0e0';
                      (e.target as HTMLButtonElement).style.color = '#333';
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

      {/* Multi-Select Provider Filter */}
      {plans.length > 0 && (
        <section style={{ 
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.95), rgba(26, 32, 44, 0.98))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95))',
          padding: '20px 30px',
          borderRadius: 'var(--radius-xl)',
          marginTop: '20px',
          boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <strong style={{ color: darkMode ? '#f7fafc' : '#2d3748' }}>
                Compare Only Selected Providers
                {selectedProviders.length > 0 && <span style={{ marginLeft: '8px', color: '#667eea', fontSize: '0.9em' }}>({selectedProviders.length} selected)</span>}
              </strong>
              <button
                onClick={() => setShowProviderList(!showProviderList)}
                style={{
                  padding: '4px 10px',
                  background: darkMode ? '#374151' : '#e5e7eb',
                  color: darkMode ? '#e5e7eb' : '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85em',
                  fontWeight: '600'
                }}
              >
                {showProviderList ? '▼ Hide' : '▶ Show'}
              </button>
            </div>
            {selectedProviders.length > 0 && (
              <button 
                onClick={() => setSelectedProviders([])}
                style={{
                  padding: '6px 14px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85em'
                }}
              >
                ✕ Clear Selection
              </button>
            )}
          </div>
          {showProviderList && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {(Array.from(new Set(plans.map((p: Plan) => p.provider_name))) as string[]).sort().map((name: string) => (
                <label 
                  key={name}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '10px 14px',
                    background: selectedProviders.includes(name) 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : (darkMode ? '#1a202c' : '#f8f9fa'),
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: selectedProviders.includes(name) ? 'none' : (darkMode ? '1px solid #4a5568' : '1px solid #e0e0e0')
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedProviders.includes(name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProviders([...selectedProviders, name]);
                      } else {
                        setSelectedProviders(selectedProviders.filter((p: string) => p !== name));
                      }
                    }}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ 
                    fontSize: '0.9em', 
                    fontWeight: selectedProviders.includes(name) ? 'bold' : '500',
                    color: selectedProviders.includes(name) ? 'white' : (darkMode ? '#e2e8f0' : '#333')
                  }}>
                    {name}
                  </span>
                </label>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="filters">
        <label>
          <strong>Speed tier:</strong>
          <select value={speed} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSpeed(e.target.value)}>
            {viewMode === 'fixed-wireless' ? (
              <>
                <option value="all">All Speeds</option>
                <option value="100">Fixed Wireless Plus 100Mbps</option>
                <option value="200">Fixed Wireless Max 200Mbps</option>
                <option value="400">Fixed Wireless Ultra 400Mbps</option>
              </>
            ) : (
              <>
                <option value="all">All Speeds</option>
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
          <select value={contractFilter} onChange={(e: ChangeEvent<HTMLSelectElement>) => { setContractFilter(e.target.value); fetchPlans(speed); }}>
            <option value="">All</option>
            <option value="month-to-month">Month-to-Month</option>
            <option value="12-month">12 Month</option>
            <option value="24-month">24 Month</option>
          </select>
        </label>
        <label>
          <strong>Data:</strong>
          <select value={dataFilter} onChange={(e: ChangeEvent<HTMLSelectElement>) => { setDataFilter(e.target.value); fetchPlans(speed); }}>
            <option value="">All</option>
            <option value="unlimited">Unlimited</option>
            <option value="limited">Limited</option>
          </select>
        </label>
        <label>
          <strong>Modem:</strong>
          <select value={modemFilter} onChange={(e: ChangeEvent<HTMLSelectElement>) => { setModemFilter(e.target.value); fetchPlans(speed); }}>
            <option value="">All</option>
            <option value="1">Included</option>
          </select>
        </label>
        <label>
          <strong>Upload Speed:</strong>
          <select value={uploadSpeedFilter} onChange={(e: ChangeEvent<HTMLSelectElement>) => setUploadSpeedFilter(e.target.value)}>
            <option value="">Any</option>
            <option value="20">20+ Mbps</option>
            <option value="50">50+ Mbps</option>
            <option value="100">100+ Mbps</option>
            <option value="200">200+ Mbps</option>
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
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={exclude6MonthFilter}
            onChange={(e) => setExclude6MonthFilter(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span>Exclude 6-Month Deals</span>
        </label>
        <label>
          <strong>Sort by:</strong>
          <select value={sortBy} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}>
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
                `${p.provider_name} - ${stripHtml(p.plan_name)}\n$${(p.ongoing_price_cents! / 100).toFixed(2)}/mo`
              ).join('\n\n'));
            }
          }} style={{ background: '#E91E63' }}>
            ⭐ Favorites ({favorites.length})
          </button>
        )}
      </section>

      <section className="plan-list">
        <h3>📊 {viewMode === 'fixed-wireless' ? 'Fixed Wireless NBN Plans' : viewMode === 'business' ? 'Business NBN Plans' : viewMode === 'satellite' ? 'Satellite Internet Plans' : viewMode === '5g-home' ? '5G Home Internet Plans' : 'Standard NBN Plans'} ({plans.filter((p: Plan) => {
          // Technology type filter based on viewMode (skip for business - handled by API)
          if (viewMode === 'business') return true;  // Business plans filtered by API via service_type
          if (viewMode === 'fixed-wireless' && p.technology_type !== 'fixed-wireless') return false;
          if (viewMode === 'satellite' && p.technology_type !== 'satellite') return false;
          if (viewMode === '5g-home' && p.technology_type !== '5g-home') return false;
          if (viewMode === 'standard' && (p.technology_type === 'fixed-wireless' || p.technology_type === 'satellite' || p.technology_type === '5g-home')) return false;
          // Search term
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            if (!(p.provider_name.toLowerCase().includes(term) || stripHtml(p.plan_name).toLowerCase().includes(term))) return false;
          }
          // Provider filter
          if (providerFilter && !p.provider_name.toLowerCase().includes(providerFilter.toLowerCase())) return false;
          // Selected providers filter (multi-select)
          if (selectedProviders.length > 0 && !selectedProviders.includes(p.provider_name)) return false;
          // Metadata filters
          if (ipv6Filter && (!p.provider_ipv6_support || p.provider_ipv6_support < 1)) return false;
          if (noCgnatFilter && p.provider_cgnat !== 0 && (!p.provider_cgnat_opt_out || p.provider_cgnat_opt_out < 1)) return false;
          if (auSupportFilter && (!p.provider_australian_support || p.provider_australian_support < 1)) return false;
          if (staticIpFilter && (!p.provider_static_ip_available || p.provider_static_ip_available < 1)) return false;
          // Exclude 6-month deals: check both contract type AND intro duration (6 months = ~180 days)
          if (exclude6MonthFilter && (p.contract_type === '6-month' || (p.intro_duration_days && p.intro_duration_days >= 175 && p.intro_duration_days <= 185))) return false;
          // Upload speed filter
          if (uploadSpeedFilter) {
            const minUpload = parseInt(uploadSpeedFilter);
            if (!p.upload_speed_mbps || p.upload_speed_mbps < minUpload) return false;
          }
          return true;
        }).length})</h3>
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
            <table style={{
              borderCollapse: 'separate',
              borderSpacing: '0 12px',
              width: '100%'
            }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>
                  <th style={{ padding: '16px 12px', borderRadius: '12px 0 0 12px', fontWeight: '600', fontSize: '0.9em', letterSpacing: '0.5px' }}>Logo</th>
                  <th style={{ padding: '16px 12px', fontWeight: '600', fontSize: '0.9em', letterSpacing: '0.5px' }}>Provider</th>
                  <th style={{ padding: '16px 12px', fontWeight: '600', fontSize: '0.9em', letterSpacing: '0.5px' }}>Plan Details</th>
                  <th style={{ padding: '16px 12px', fontWeight: '600', fontSize: '0.9em', letterSpacing: '0.5px' }}>Price</th>
                  <th className="hide-mobile" style={{ padding: '16px 12px', fontWeight: '600', fontSize: '0.9em', letterSpacing: '0.5px' }}>Speed</th>
                  <th style={{ padding: '16px 12px', borderRadius: '0 12px 12px 0', fontWeight: '600', fontSize: '0.9em', letterSpacing: '0.5px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...plans]
                  .filter(p => {
                    // Technology type filter based on viewMode (skip for business - handled by API)
                    if (viewMode === 'business') {
                      // Business plans filtered by API, no frontend technology_type filter needed
                    } else if (viewMode === 'fixed-wireless' && p.technology_type !== 'fixed-wireless') {
                      return false;
                    } else if (viewMode === 'satellite' && p.technology_type !== 'satellite') {
                      return false;
                    } else if (viewMode === '5g-home' && p.technology_type !== '5g-home') {
                      return false;
                    } else if (viewMode === 'standard' && (p.technology_type === 'fixed-wireless' || p.technology_type === 'satellite' || p.technology_type === '5g-home')) {
                      return false;
                    }
                    
                    // Search term filter
                    if (searchTerm) {
                      const term = searchTerm.toLowerCase();
                      if (!(p.provider_name.toLowerCase().includes(term) || stripHtml(p.plan_name).toLowerCase().includes(term))) {
                        return false;
                      }
                    }
                    
                    // Provider filter
                    if (providerFilter && !p.provider_name.toLowerCase().includes(providerFilter.toLowerCase())) {
                      return false;
                    }
                    
                    // Selected providers filter (multi-select)
                    if (selectedProviders.length > 0 && !selectedProviders.includes(p.provider_name)) {
                      return false;
                    }
                    
                    // ISP metadata filters
                    if (ipv6Filter && (!p.provider_ipv6_support || p.provider_ipv6_support < 1)) {
                      return false;
                    }
                    if (noCgnatFilter && p.provider_cgnat !== 0 && (!p.provider_cgnat_opt_out || p.provider_cgnat_opt_out < 1)) {
                      return false;
                    }
                    if (auSupportFilter && (!p.provider_australian_support || p.provider_australian_support < 1)) {
                      return false;
                    }
                    if (staticIpFilter && (!p.provider_static_ip_available || p.provider_static_ip_available < 1)) {
                      return false;
                    }
                    
                    // Exclude 6-month deals filter: check both contract type AND intro duration
                    if (exclude6MonthFilter && (p.contract_type === '6-month' || (p.intro_duration_days && p.intro_duration_days >= 175 && p.intro_duration_days <= 185))) {
                      return false;
                    }
                    
                    // Upload speed filter
                    if (uploadSpeedFilter) {
                      const minUpload = parseInt(uploadSpeedFilter);
                      if (!p.upload_speed_mbps || p.upload_speed_mbps < minUpload) {
                        return false;
                      }
                    }
                    
                    // Plan type filter (business vs residential)
                    // Note: Currently all plans are residential since we don't have business plans yet
                    // This will be used when we add business plan detection to parsers
                    
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
                  .map((p: Plan) => (
                    <tr key={p.id} className={favorites.includes(p.id) ? 'favorite-row' : ''} style={{
                      background: darkMode ? '#2d3748' : 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    }}>
                      <td style={{ padding: '20px 16px', borderRadius: '12px 0 0 12px' }}>
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
                      <td className="provider-name" style={{ padding: '20px 16px' }}>
                        <a 
                          href={`/provider/${p.provider_name.toLowerCase().replace(/\s+/g, '-')}`}
                          style={{
                            color: 'inherit',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => { (e.target as HTMLAnchorElement).style.color = '#667eea'; }}
                          onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => { (e.target as HTMLAnchorElement).style.color = 'inherit'; }}
                        >
                          {p.provider_name}
                        </a>
                        <ProviderTooltip 
                          provider={{
                            name: p.provider_name,
                            description: p.provider_description,
                            ipv6_support: p.provider_ipv6_support ?? 0,
                            cgnat: p.provider_cgnat ?? 0,
                            cgnat_opt_out: p.provider_cgnat_opt_out ?? 0,
                            static_ip_available: p.provider_static_ip_available ?? 0,
                            australian_support: p.provider_australian_support ?? 0,
                            parent_company: p.provider_parent_company,
                            routing_info: p.provider_routing_info,
                            support_hours: p.provider_support_hours
                          }}
                          darkMode={darkMode}
                        />
                      </td>
                      <td style={{ padding: '20px 16px', maxWidth: '280px' }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px', color: darkMode ? '#e2e8f0' : '#1a202c' }}>
                          {stripHtml(p.plan_name)}
                        </div>
                        {bestValuePlanIds.has(p.id) && (
                          <span 
                            style={{ 
                              marginLeft: '0',
                              marginTop: '6px',
                              display: 'inline-block',
                              fontSize: '0.75em', 
                              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', 
                              color: '#000', 
                              padding: '5px 14px', 
                              borderRadius: '10px', 
                              fontWeight: '800', 
                              boxShadow: '0 3px 10px rgba(255, 215, 0, 0.4)',
                              cursor: 'help',
                              letterSpacing: '0.5px',
                              border: '2px solid #FFD700',
                              textTransform: 'uppercase'
                            }}
                            title={`Best Value = Price + Quality Score\n\nThis plan offers the optimal balance of:\n• Competitive pricing\n${p.provider_australian_support && p.provider_australian_support >= 1 ? '• Australian support team\n' : ''}${p.provider_cgnat === 0 || (p.provider_cgnat_opt_out && p.provider_cgnat_opt_out >= 1) ? '• No CGNAT (or opt-out available)\n' : ''}${p.provider_ipv6_support && p.provider_ipv6_support >= 1 ? '• IPv6 support\n' : ''}${p.provider_static_ip_available && p.provider_static_ip_available >= 1 ? '• Static IP available\n' : ''}${p.provider_routing_info && p.provider_routing_info.toLowerCase().includes('direct') ? '• Direct routing/good network POIs\n' : ''}${p.modem_included === 1 ? '• Modem included\n' : ''}\nNot just the cheapest, but the best overall value for this speed tier.`}
                          >
                            ⭐ Best Value
                          </span>
                        )}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                        {p.promo_code && (
                          <span style={{ 
                            fontSize: '0.75em', 
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                            color: 'white', 
                            padding: '4px 12px', 
                            borderRadius: '8px', 
                            cursor: 'help', 
                            fontWeight: '700',
                            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                          }} title={`Use code: ${p.promo_code}${p.promo_description ? ` - ${p.promo_description}` : ''}`}>
                            🎟️ {p.promo_code}
                          </span>
                        )}
                        {p.modem_included === 1 && <span style={{ 
                          fontSize: '0.75em', 
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                          color: 'white', 
                          padding: '4px 12px', 
                          borderRadius: '8px', 
                          fontWeight: '700',
                          boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)'
                        }}>📡 Modem</span>}
                        {p.contract_type && p.contract_type !== 'month-to-month' && <span style={{ 
                          fontSize: '0.75em', 
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                          color: 'white', 
                          padding: '4px 12px', 
                          borderRadius: '8px', 
                          fontWeight: '700',
                          boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)'
                        }}>🏷️ {p.contract_type}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '20px 16px' }}>
                        {p.intro_price_cents ? (
                          <div style={{ lineHeight: '1.6' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                              <span style={{ fontWeight: '700', color: '#f59e0b', fontSize: '1.3em', WebkitTextFillColor: '#f59e0b', background: 'none' }}>
                                ${(p.intro_price_cents/100).toFixed(0)}
                              </span>
                              <span style={{ fontSize: '0.75em', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '500' }}>
                                {p.intro_duration_days ? `${Math.round(p.intro_duration_days/30)}mo` : 'intro'}
                              </span>
                              {p.price_trend && (
                                <span 
                                  style={{ 
                                    color: p.price_trend === 'down' ? '#16a34a' : '#dc2626',
                                    fontSize: '1em',
                                    fontWeight: 'bold'
                                  }} 
                                  title={p.price_trend === 'down' ? 'Price decreased' : 'Price increased'}
                                >
                                  {p.price_trend === 'down' ? '↓' : '↑'}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.8em', color: '#10b981', marginTop: '2px', WebkitTextFillColor: '#10b981', background: 'none' }}>
                              then ${(p.ongoing_price_cents!/100).toFixed(0)}/mo
                            </div>
                          </div>
                        ) : p.ongoing_price_cents ? (
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ fontWeight: '700', fontSize: '1.3em', color: darkMode ? '#e2e8f0' : '#1a202c', WebkitTextFillColor: darkMode ? '#e2e8f0' : '#1a202c', background: 'none' }}>
                              ${(p.ongoing_price_cents/100).toFixed(0)}
                            </span>
                            <span style={{ fontSize: '0.75em', color: darkMode ? '#94a3b8' : '#64748b' }}>/mo</span>
                            {p.price_trend && (
                              <span 
                                style={{ 
                                  color: p.price_trend === 'down' ? '#16a34a' : '#dc2626',
                                  fontSize: '1em',
                                  fontWeight: 'bold'
                                }} 
                                title={p.price_trend === 'down' ? 'Price decreased' : 'Price increased'}
                              >
                                {p.price_trend === 'down' ? '↓' : '↑'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.85em', color: darkMode ? '#94a3b8' : '#64748b' }}>Contact provider</span>
                        )}
                      </td>
                      <td className="hide-mobile" style={{ padding: '20px 16px', minWidth: '140px' }}>
                        <div style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: `${getSpeedTierColor(p.speed_tier)}15`,
                          border: `1px solid ${getSpeedTierColor(p.speed_tier)}40`
                        }}>
                          <span style={{ 
                            fontWeight: '700', 
                            color: getSpeedTierColor(p.speed_tier), 
                            fontSize: '1.1em' 
                          }}>
                            {p.speed_tier ?? '—'}
                          </span>
                          <span style={{ 
                            fontSize: '0.75em', 
                            color: darkMode ? '#94a3b8' : '#64748b',
                            fontWeight: '500'
                          }}>
                            Mbps
                          </span>
                        </div>
                        <div style={{ fontSize: '0.7em', color: getSpeedTierColor(p.speed_tier), marginTop: '4px', fontWeight: '500' }}>
                          {getSpeedTierLabel(p.speed_tier)}
                        </div>
                        {p.upload_speed_mbps && (
                          <div style={{ fontSize: '0.75em', color: darkMode ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
                            ↑ {p.upload_speed_mbps} Mbps upload
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '20px 16px', borderRadius: '0 12px 12px 0' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => toggleFavorite(p.id)}
                            style={{
                              background: favorites.includes(p.id) 
                                ? 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)' 
                                : (darkMode ? '#374151' : '#e5e7eb'),
                              color: favorites.includes(p.id) ? 'white' : (darkMode ? '#9ca3af' : '#6b7280'),
                              border: 'none',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.9em',
                              fontWeight: '600',
                              boxShadow: favorites.includes(p.id) ? '0 2px 8px rgba(233, 30, 99, 0.3)' : 'none',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            {favorites.includes(p.id) ? '⭐' : '☆'}
                          </button>
                          <button
                            onClick={() => fetchPriceHistory(p)}
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.9em',
                              fontWeight: '600',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                              transition: 'all 0.2s ease'
                            }}
                            title="View price history"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            📊
                          </button>
                          <button
                            onClick={() => toggleCompare(p.id)}
                            style={{
                              background: compareList.includes(p.id) 
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                                : (darkMode ? '#374151' : '#f3f4f6'),
                              color: compareList.includes(p.id) ? 'white' : (darkMode ? '#9ca3af' : '#6b7280'),
                              border: 'none',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.9em',
                              fontWeight: '600',
                              boxShadow: compareList.includes(p.id) ? '0 2px 8px rgba(102, 126, 234, 0.3)' : 'none',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            {compareList.includes(p.id) ? '✓ Compare' : 'Compare'}
                          </button>
                          {p.source_url ? (
                            <a 
                              href={p.source_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{
                                color: '#667eea', 
                                textDecoration: 'none', 
                                fontWeight: 700, 
                                fontSize: '0.9em',
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                borderRadius: '8px',
                                border: '2px solid #667eea',
                                transition: 'all 0.2s ease',
                                display: 'inline-block'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)';
                                e.currentTarget.style.color = '#667eea';
                              }}
                            >
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
                  // Technology type filter based on viewMode (skip for business - handled by API)
                  if (viewMode === 'business') {
                    // Business plans filtered by API, no frontend technology_type filter needed
                  } else if (viewMode === 'fixed-wireless' && p.technology_type !== 'fixed-wireless') return false;
                  else if (viewMode === 'satellite' && p.technology_type !== 'satellite') return false;
                  else if (viewMode === '5g-home' && p.technology_type !== '5g-home') return false;
                  else if (viewMode === 'standard' && (p.technology_type === 'fixed-wireless' || p.technology_type === 'satellite' || p.technology_type === '5g-home')) return false;
                  // Search term
                  if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    if (!(p.provider_name.toLowerCase().includes(term) || stripHtml(p.plan_name).toLowerCase().includes(term))) return false;
                  }
                  // Provider filter
                  if (providerFilter && !p.provider_name.toLowerCase().includes(providerFilter.toLowerCase())) return false;
                  // Selected providers filter (multi-select)
                  if (selectedProviders.length > 0 && !selectedProviders.includes(p.provider_name)) return false;
                  // Metadata filters
                  if (ipv6Filter && (!p.provider_ipv6_support || p.provider_ipv6_support < 1)) return false;
                  if (noCgnatFilter && p.provider_cgnat !== 0 && (!p.provider_cgnat_opt_out || p.provider_cgnat_opt_out < 1)) return false;
                  if (auSupportFilter && (!p.provider_australian_support || p.provider_australian_support < 1)) return false;
                  if (staticIpFilter && (!p.provider_static_ip_available || p.provider_static_ip_available < 1)) return false;
                  // Exclude 6-month deals: check both contract type AND intro duration (6 months = ~180 days)
                  if (exclude6MonthFilter && (p.contract_type === '6-month' || (p.intro_duration_days && p.intro_duration_days >= 175 && p.intro_duration_days <= 185))) return false;
                  // Upload speed filter
                  if (uploadSpeedFilter) {
                    const minUpload = parseInt(uploadSpeedFilter);
                    if (!p.upload_speed_mbps || p.upload_speed_mbps < minUpload) return false;
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
                              ipv6_support: p.provider_ipv6_support ?? 0,
                              cgnat: p.provider_cgnat ?? 0,
                              cgnat_opt_out: p.provider_cgnat_opt_out ?? 0,
                              static_ip_available: p.provider_static_ip_available ?? 0,
                              australian_support: p.provider_australian_support ?? 0,
                              parent_company: p.provider_parent_company,
                              routing_info: p.provider_routing_info,
                              support_hours: p.provider_support_hours
                            }}
                            darkMode={darkMode}
                          />
                        </h3>
                        <p style={{ marginBottom: '6px' }}>{stripHtml(p.plan_name)}</p>
                        {/* Quick feature badges */}
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                          {p.provider_ipv6_support && p.provider_ipv6_support >= 1 && (
                            <span style={{ 
                              fontSize: '0.65em', 
                              background: 'linear-gradient(135deg, #10b981, #059669)', 
                              color: 'white', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              boxShadow: '0 1px 3px rgba(16, 185, 129, 0.3)'
                            }} title="Supports IPv6">
                              IPv6
                            </span>
                          )}
                          {p.provider_australian_support && p.provider_australian_support >= 2 && (
                            <span style={{ 
                              fontSize: '0.65em', 
                              background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                              color: 'white', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              boxShadow: '0 1px 3px rgba(59, 130, 246, 0.3)'
                            }} title="100% Australian support">
                              🇦🇺 AU Support
                            </span>
                          )}
                          {p.provider_static_ip_available && p.provider_static_ip_available >= 1 && (
                            <span style={{ 
                              fontSize: '0.65em', 
                              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 
                              color: 'white', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              boxShadow: '0 1px 3px rgba(139, 92, 246, 0.3)'
                            }} title={p.provider_static_ip_available === 1 ? 'Free static IP' : 'Paid static IP'}>
                              Static IP{p.provider_static_ip_available === 1 && ' ✓'}
                            </span>
                          )}
                          {p.provider_cgnat === 0 && (
                            <span style={{ 
                              fontSize: '0.65em', 
                              background: 'linear-gradient(135deg, #10b981, #059669)', 
                              color: 'white', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              boxShadow: '0 1px 3px rgba(16, 185, 129, 0.3)'
                            }} title="No CGNAT">
                              No CGNAT
                            </span>
                          )}
                        </div>
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
                      {bestValuePlanIds.has(p.id) && (
                        <span style={{ 
                          fontSize: '0.85em', 
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', 
                          color: '#000', 
                          padding: '6px 12px', 
                          borderRadius: '8px', 
                          fontWeight: '800',
                          boxShadow: '0 4px 12px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
                          cursor: 'help',
                          letterSpacing: '0.5px',
                          border: '2px solid #FFD700',
                          textTransform: 'uppercase',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          animation: 'glow 2s ease-in-out infinite'
                        }} title="Best overall value for this speed tier">
                          ⭐ Best Value
                        </span>
                      )}
                      {p.modem_included === 1 && (
                        <span style={{ 
                          fontSize: '0.8em', 
                          background: 'linear-gradient(135deg, #4CAF50, #45a049)', 
                          color: 'white', 
                          padding: '5px 10px', 
                          borderRadius: '6px',
                          fontWeight: '600',
                          boxShadow: '0 2px 6px rgba(76, 175, 80, 0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          📡 Modem Included
                        </span>
                      )}
                      {favorites.includes(p.id) && (
                        <span style={{ 
                          fontSize: '0.8em', 
                          background: 'linear-gradient(135deg, #E91E63, #C2185B)', 
                          color: 'white', 
                          padding: '5px 10px', 
                          borderRadius: '6px',
                          fontWeight: '600',
                          boxShadow: '0 2px 6px rgba(233, 30, 99, 0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
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
                  <p style={{ margin: '0 0 20px 0', fontSize: '0.95em', color: darkMode ? '#ccc' : '#666' }}>{stripHtml(plan.plan_name)}</p>

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
