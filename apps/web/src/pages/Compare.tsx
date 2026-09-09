import React from "react";
const { useEffect, useMemo, useState, Suspense } = React;
// Type aliases for React events
type ChangeEvent<T> = React.ChangeEvent<T>;
type MouseEvent<T> = React.MouseEvent<T>;
type KeyboardEvent<T> = React.KeyboardEvent<T>;
type FormEvent<T> = React.FormEvent<T>;
const PriceHistoryModal = React.lazy(() => import("../components/PriceHistoryModal"));
const SpeedCalculator = React.lazy(() => import("../components/SpeedCalculator"));
const BillComparison = React.lazy(() => import("../components/BillComparison"));
const AIRecommendations = React.lazy(() => import("../components/AIRecommendations"));
const ProviderComparisonMatrix = React.lazy(async () => {
  const module = await import("../components/ProviderComparisonMatrix");
  return { default: module.ProviderComparisonMatrix };
});
import { PlanCard } from "../components/PlanCard";
import { getApiBaseUrl } from "../lib/api";
import { getFaviconUrl } from "../lib/favicon";
import { useCompareFilters } from "../hooks/useCompareFilters";
import { usePagedPlans } from "../hooks/usePlans";
import { useTheme } from "../context/ThemeContext";
import { useComparison } from "../context/ComparisonContext";
import { CompareHero } from "../components/compare/CompareHero";
import { QualificationPanel } from "../components/compare/QualificationPanel";
import { AddressSuggestionsList } from "../components/compare/AddressSuggestionsList";
import { PlanTableRow } from "../components/compare/PlanTableRow";
import { PaginationControls } from "../components/compare/PaginationControls";
import { stripHtml, getSpeedTierColor, getSpeedTierLabel } from "../lib/planDisplay";

interface Plan {
  id: number;
  plan_name: string;
  provider_name: string;
  provider_slug?: string;
  provider_canonical_url?: string | null;
  intro_price_cents?: number | null;
  intro_duration_days?: number | null;
  ongoing_price_cents: number | null;
  speed_tier: number | null;
  last_checked_at?: string | null;
  source_url?: string | null;
  contract_type?: string;
  data_allowance?: string;
  modem_included?: number;
  modem_cost_cents?: number | null;
  favicon_url?: string | null;
  technology_type?: string;
  upload_speed_mbps?: number | null;
  price_trend?: 'up' | 'down' | null;
  promo_code?: string | null;
  promo_description?: string | null;
  service_type?: string;  // 'nbn', '5g-home', 'satellite', etc.
  plan_type?: string;
  setup_fee_cents?: number | null;
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

interface SavedFilterValues {
  selectedSpeeds: string[];
  contractFilter: string;
  dataFilter: string;
  technologyFilter: string;
  modemFilter: string;
  ipv6Filter: boolean;
  noCgnatFilter: boolean;
  auSupportFilter: boolean;
  staticIpFilter: boolean;
  exclude6MonthFilter: boolean;
  uploadSpeedFilter: string;
  providerFilter: string;
  selectedProviders: string[];
  viewMode: 'standard' | 'fixed-wireless' | 'business' | '5g-home' | 'satellite';
  sortBy: string;
}

export default function Compare() {
  // Use centralized filter hook
  const { filters, setters, resetFilters: _resetFilters } = useCompareFilters();
  const {
    selectedSpeeds,
    contractFilter,
    dataFilter,
    technologyFilter,
    modemFilter,
    ipv6Filter,
    noCgnatFilter,
    auSupportFilter,
    staticIpFilter,
    exclude6MonthFilter,
    uploadSpeedFilter,
    setupFeeFilter,
    modemCostFilter,
    providerFilter,
    selectedProviders,
    planTypeFilter,
  } = filters;
  const {
    setSelectedSpeeds,
    setContractFilter,
    setDataFilter,
    setTechnologyFilter,
    setModemFilter,
    setIpv6Filter,
    setNoCgnatFilter,
    setAuSupportFilter,
    setStaticIpFilter,
    setExclude6MonthFilter,
    setUploadSpeedFilter,
    setSetupFeeFilter,
    setModemCostFilter,
    setProviderFilter,
    setSelectedProviders,
    setPlanTypeFilter,
  } = setters;

  // Non-filter UI states
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
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites') || '[]') as number[];
    } catch {
      return [];
    }
  });
  const [viewMode, setViewMode] = useState('standard' as 'standard' | 'fixed-wireless' | 'business' | '5g-home' | 'satellite');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('nbn' as 'nbn' | '5g-home' | 'satellite');
  const [currentPage, setCurrentPage] = useState(0);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [selectedPlanForHistory, setSelectedPlanForHistory] = useState(null as Plan | null);
  const [priceHistoryData, setPriceHistoryData] = useState([] as PriceHistory[]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showProviderList, setShowProviderList] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activePreset, setActivePreset] = useState('');
  const [bestDealsSummary, setBestDealsSummary] = useState(null as string | null);
  const [bestDealsUpdatedAt, setBestDealsUpdatedAt] = useState(null as string | null);
  const [bestDealsLoading, setBestDealsLoading] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const { comparedPlans } = useComparison();
  type SavedFilterPreset = { name: string; filters: SavedFilterValues };
  const [savedPresets, setSavedPresets] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('filterPresets') || '[]') as SavedFilterPreset[];
    } catch {
      return [];
    }
  });
  const persistFilterPresets = (presets: SavedFilterPreset[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('filterPresets', JSON.stringify(presets));
    }
  };

  const standardSpeedOptions = ['12', '25', '50', '100', '250', '500', '1000', '2000'];
  const fixedWirelessSpeedOptions = ['100', '200', '400'];
  const fiveGSpeedOptions = ['100', '250', '300'];
  const satelliteSpeedOptions = ['25', '50', '100', '150'];
  const allowAllSpeedChips = viewMode === 'standard' || viewMode === 'business' || viewMode === 'fixed-wireless' || viewMode === '5g-home' || viewMode === 'satellite';
  const currentModeSpeedOptions = viewMode === 'fixed-wireless'
    ? fixedWirelessSpeedOptions
    : viewMode === '5g-home'
      ? fiveGSpeedOptions
      : viewMode === 'satellite'
        ? satelliteSpeedOptions
        : standardSpeedOptions;
  const speedChips = allowAllSpeedChips ? ['all', ...currentModeSpeedOptions] : currentModeSpeedOptions;

  const toggleSpeedTier = (value: string) => {
    setSelectedSpeeds((prev: string[]) => {
      if (value === 'all') return ['all'];
      const cleaned = prev.filter((s: string) => s !== 'all');
      if (cleaned.includes(value)) {
        const updated = cleaned.filter((s: string) => s !== value);
        if (updated.length === 0) {
          return allowAllSpeedChips ? ['all'] : [value];
        }
        return updated;
      }
      return [...cleaned, value];
    });
  };

  const formatSpeedLabel = (value: string) => {
    if (value === 'all') return 'All speeds';
    if (viewMode === 'fixed-wireless') return `Fixed Wireless ${value}Mbps`;
    if (viewMode === '5g-home') return `5G ${value}Mbps`;
    if (viewMode === 'satellite') return `Satellite ${value}Mbps`;
    return `NBN ${value}`;
  };

  const numericSelectedSpeeds = useMemo(() => {
    if (selectedSpeeds.includes('all')) return null;
    return selectedSpeeds
      .map((s: string) => parseInt(s, 10))
      .filter((n: number) => !isNaN(n));
  }, [selectedSpeeds]);

  const matchesSelectedSpeeds = (plan: Plan) => {
    if (!numericSelectedSpeeds) return true;
    if (!plan.speed_tier) return false;
    return numericSelectedSpeeds.includes(plan.speed_tier);
  };

  const _bestPlan = useMemo(() => {
    return plans.reduce((best: Plan | null, candidate: Plan) => {
      if (!candidate.ongoing_price_cents) return best;
      if (!best) return candidate;
      return candidate.ongoing_price_cents < (best.ongoing_price_cents ?? Infinity) ? candidate : best;
    }, null as Plan | null);
  }, [plans]);

  type HeroPreset = {
    name: string;
    description: string;
    settings: {
      selectedSpeeds: string[];
      viewMode: typeof viewMode;
      sortBy: string;
      uploadSpeedFilter?: string;
      auSupportFilter?: boolean;
    };
  };

  const heroPresets: HeroPreset[] = [
    {
      name: 'Budget pick',
      description: 'Lowest monthly price',
      settings: { selectedSpeeds: ['all'], viewMode: 'standard', sortBy: 'price', uploadSpeedFilter: '' }
    },
    {
      name: 'Fastest upload',
      description: 'Accelerated upload-focused plans',
      settings: { selectedSpeeds: ['500'], viewMode: 'standard', sortBy: 'speed', uploadSpeedFilter: '40' }
    },
    {
      name: 'Reliable Favorites',
      description: 'Providers with Australian support',
      settings: { selectedSpeeds: ['all'], viewMode: 'standard', sortBy: 'price', auSupportFilter: true }
    },
  ];

  const applyPreset = (preset: HeroPreset) => {
    setActivePreset(preset.name);
    setSelectedSpeeds(preset.settings.selectedSpeeds);
    setViewMode(preset.settings.viewMode);
    setSortBy(preset.settings.sortBy);
    setUploadSpeedFilter(preset.settings.uploadSpeedFilter ?? '');
    setAuSupportFilter(!!preset.settings.auSupportFilter);
    setProviderFilter('');
    setContractFilter('');
    setDataFilter('');
    setTechnologyFilter('');
    setModemFilter('');
    setSelectedProviders([]);
  };

  const heroPresetOptions = useMemo(() => {
    return heroPresets.map((preset: HeroPreset) => ({
      name: preset.name,
      description: preset.description,
    }));
  }, [heroPresets]);

  const handlePresetSelect = (presetName: string) => {
    const preset = heroPresets.find((item: HeroPreset) => item.name === presetName);
    if (!preset) return;
    applyPreset(preset);
  };

  useEffect(() => {
    setSpeed(selectedSpeeds[0] ?? 'all');
  }, [selectedSpeeds]);

  useEffect(() => {
    if (viewMode === 'fixed-wireless') {
      setServiceTypeFilter('nbn');
      setPlanTypeFilter('residential');
      setSelectedSpeeds(['all']);
    } else if (viewMode === '5g-home') {
      setServiceTypeFilter('5g-home');
      setPlanTypeFilter('residential');
      setSelectedSpeeds(['all']);
    } else if (viewMode === 'satellite') {
      setServiceTypeFilter('satellite');
      setPlanTypeFilter('residential');
      setSelectedSpeeds(['all']);
    } else if (viewMode === 'business') {
      setServiceTypeFilter('nbn');
      setPlanTypeFilter('business');
      setSelectedSpeeds(['all']);
    } else {
      setServiceTypeFilter('nbn');
      setPlanTypeFilter('residential');
      setSelectedSpeeds(['all']);
    }
  }, [viewMode]);


  const ITEMS_PER_PAGE = 20;

  // Build filters object for usePagedPlans
  const pagedFilters = {
    speed: selectedSpeeds.length === 1 && selectedSpeeds[0] !== 'all' ? selectedSpeeds[0] : undefined,
    contract: contractFilter || undefined,
    data: dataFilter || undefined,
    modem: modemFilter || undefined,
    technology: technologyFilter || undefined,
    uploadSpeed: uploadSpeedFilter || undefined,
    setupFee: setupFeeFilter || undefined,
    modemCost: modemCostFilter || undefined,
    search: searchTerm.trim() || undefined,
    ipv6: ipv6Filter ? '1' : undefined,
    noCgnat: noCgnatFilter ? '1' : undefined,
    auSupport: auSupportFilter ? '1' : undefined,
    staticIp: staticIpFilter ? '1' : undefined,
    exclude6Month: exclude6MonthFilter ? '1' : undefined,
    provider: selectedProviders.length > 0 ? selectedProviders : undefined,
    serviceType: serviceTypeFilter,
    planType: planTypeFilter !== 'all' ? planTypeFilter : undefined,
  };

  // Use paginated plans hook
  const { data: pagedData, isLoading: pagedLoading, error: pagedError, refetch: refetchPlans } = usePagedPlans(
    currentPage,
    ITEMS_PER_PAGE,
    pagedFilters,
    { staleTime: 5 * 60 * 1000 }
  );

  // Update local plans state from paginated data
  useEffect(() => {
    if (pagedData?.rows) {
      setPlans(pagedData.rows);
      setMessage(null);
    }
  }, [pagedData]);

  useEffect(() => {
    if (pagedLoading) {
      setLoading(true);
      setMessage('Loading plans...');
    } else {
      setLoading(false);
    }
  }, [pagedLoading]);

  useEffect(() => {
    if (pagedError) {
      setMessage('Failed to load plans');
    }
  }, [pagedError]);

  const heroStats = useMemo(() => {
    const providerSet = new Set<string>();
    let cheapest = Infinity;
    let highestSpeed = 0;
    plans.forEach((plan: Plan) => {
      if (plan.provider_name) providerSet.add(plan.provider_name);
      if (plan.ongoing_price_cents && plan.ongoing_price_cents < cheapest) cheapest = plan.ongoing_price_cents;
      if (plan.speed_tier && plan.speed_tier > highestSpeed) highestSpeed = plan.speed_tier;
    });
    const statsFromApi = pagedData?.stats;
    const totalPlans = pagedData?.pagination?.total ?? plans.length;
    const totalProviders = statsFromApi?.providers ?? providerSet.size;
    const cheapestCents = statsFromApi?.cheapestCents ?? (isFinite(cheapest) ? cheapest : null);
    const topSpeed = statsFromApi?.topSpeed ?? (highestSpeed || null);

    return {
      plans: totalPlans,
      providers: totalProviders,
      cheapest: cheapestCents !== null ? (cheapestCents / 100).toFixed(2) : null,
      topSpeed,
    };
  }, [plans, pagedData]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (!selectedSpeeds.includes('all')) count += selectedSpeeds.length;
    if (contractFilter) count++;
    if (dataFilter) count++;
    if (technologyFilter) count++;
    if (modemFilter) count++;
    if (ipv6Filter) count++;
    if (noCgnatFilter) count++;
    if (auSupportFilter) count++;
    if (staticIpFilter) count++;
    if (exclude6MonthFilter) count++;
    if (uploadSpeedFilter) count++;
    if (setupFeeFilter) count++;
    if (modemCostFilter) count++;
    if (selectedProviders.length > 0) count += selectedProviders.length;
    if (planTypeFilter !== 'all') count++;
    if (searchTerm.trim()) count++;
    return count;
  }, [
    selectedSpeeds,
    contractFilter,
    dataFilter,
    technologyFilter,
    modemFilter,
    ipv6Filter,
    noCgnatFilter,
    auSupportFilter,
    staticIpFilter,
    exclude6MonthFilter,
    uploadSpeedFilter,
    setupFeeFilter,
    modemCostFilter,
    selectedProviders,
    planTypeFilter,
    searchTerm,
  ]);

  const activeHeroNotes = useMemo(() => {
    const notes: string[] = [];
    if (heroStats.cheapest) notes.push(`From $${heroStats.cheapest}/mo`);
    if (activeFilterCount > 0) notes.push(`${activeFilterCount} live filter${activeFilterCount === 1 ? '' : 's'}`);
    if (comparedPlans.length > 0) notes.push(`${comparedPlans.length} selected to compare`);
    if (selectedProviders.length > 0) notes.push(`${selectedProviders.length} provider${selectedProviders.length === 1 ? '' : 's'} pinned`);
    return notes.slice(0, 4);
  }, [heroStats.cheapest, activeFilterCount, comparedPlans.length, selectedProviders.length]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [
    selectedSpeeds,
    contractFilter,
    dataFilter,
    modemFilter,
    technologyFilter,
    uploadSpeedFilter,
    setupFeeFilter,
    modemCostFilter,
    searchTerm,
    ipv6Filter,
    noCgnatFilter,
    auSupportFilter,
    staticIpFilter,
    exclude6MonthFilter,
    selectedProviders,
    serviceTypeFilter,
    planTypeFilter,
  ]);

  function toggleFavorite(planId: number) {
    const newFavorites = favorites.includes(planId)
      ? favorites.filter((id: number) => id !== planId)
      : [...favorites, planId];
    setFavorites(newFavorites);
    if (typeof window !== 'undefined') {
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    }
  }

  function handleThemeToggle() {
    toggleDarkMode();
  }

  function scrollToSection(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function getProviderColor(providerName: string | null | undefined): string {
    if (!providerName) return '#667eea';
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

  function getProviderInitials(providerName: string | null | undefined): string {
    if (!providerName || providerName.trim() === '') return 'N/A';
    const words = providerName.split(' ').filter(word => word.length > 0);
    if (words.length === 0) return 'N/A';
    const initials = words.map((word: string) => word[0] || '').join('').toUpperCase().slice(0, 2);
    return initials || 'N/A';
  }

  function ProviderLogo({ providerName, faviconUrl, sourceUrl }: { providerName: string | null | undefined; faviconUrl: string | null | undefined; sourceUrl?: string | null }) {
    const [hasFallback, setHasFallback] = useState(false);
    const resolvedFavicon = getFaviconUrl(providerName ?? '', faviconUrl, sourceUrl);

    if (!resolvedFavicon || hasFallback) {
      return (
        <div
          className="provider-logo"
          style={{
            background: getProviderColor(providerName),
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
          {getProviderInitials(providerName)}
        </div>
      );
    }

    return (
      <img
        src={resolvedFavicon}
        alt={providerName || 'Provider logo'}
        loading="lazy"
        decoding="async"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          objectFit: 'contain',
          background: 'white',
          padding: '4px'
        }}
        onError={() => setHasFallback(true)}
      />
    );
  }

  const handleSpeedRecommendation = (recommended: number) => {
    setSelectedSpeeds([String(recommended)]);
  };

  // Calculate best value badges for plans
  function calculateBestValueBadges(plans: Plan[]) {
    const badgesByPlan = new Map<number, { isCheapest?: boolean; isBestValue?: boolean; isPopular?: boolean }>();
    
    // Group plans by speed tier
    const plansBySpeed = new Map<number | null | undefined, Plan[]>();
    plans.forEach(plan => {
      const speed = plan.speed_tier;
      if (!plansBySpeed.has(speed)) {
        plansBySpeed.set(speed, []);
      }
      plansBySpeed.get(speed)!.push(plan);
    });

    // Find cheapest and best value for each speed tier
    plansBySpeed.forEach((speedPlans) => {
      if (speedPlans.length === 0) return;

      // Get price for sorting (intro if available, else ongoing)
      const getPlanPrice = (p: Plan) => {
        if (p.intro_price_cents) return p.intro_price_cents;
        return p.ongoing_price_cents ?? Infinity;
      };

      // Find cheapest
      const cheapest = speedPlans.reduce((min, p) => {
        const minPrice = getPlanPrice(min);
        const pPrice = getPlanPrice(p);
        return pPrice < minPrice ? p : min;
      });
      
      if (cheapest) {
        const existing = badgesByPlan.get(cheapest.id) || {};
        badgesByPlan.set(cheapest.id, { ...existing, isCheapest: true });
      }

      // Find best value (cheapest with best features)
      const withFeatures = speedPlans.filter(p => {
        const featureScore = 
          (p.provider_ipv6_support ? 1 : 0) +
          (p.provider_cgnat === 0 ? 1 : 0) +
          (p.provider_australian_support ? 1 : 0) +
          (p.provider_static_ip_available ? 1 : 0);
        return featureScore >= 2;
      });

      if (withFeatures.length > 0) {
        const bestValue = withFeatures.reduce((min, p) => {
          const minPrice = getPlanPrice(min);
          const pPrice = getPlanPrice(p);
          return pPrice < minPrice ? p : min;
        });
        
        if (bestValue && bestValue.id !== cheapest?.id) {
          const existing = badgesByPlan.get(bestValue.id) || {};
          badgesByPlan.set(bestValue.id, { ...existing, isBestValue: true });
        }
      }
    });

    return badgesByPlan;
  }

  const bestValueBadges = useMemo(() => calculateBestValueBadges(plans), [plans]);

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
    let active = true;
    const loadBestDeals = async () => {
      setBestDealsLoading(true);
      try {
        const apiUrl = getApiBaseUrl();
        const res = await fetch(`${apiUrl}/api/ai/best-deals`);
        const data = await res.json();
        if (!active) return;
        setBestDealsSummary(data?.summary ?? null);
        setBestDealsUpdatedAt(data?.updated_at ?? null);
      } catch (err) {
        if (active) {
          console.error('Failed to load best deals summary:', err);
          setBestDealsSummary(null);
        }
      } finally {
        if (active) setBestDealsLoading(false);
      }
    };
    void loadBestDeals();
    return () => {
      active = false;
    };
  }, []);

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
          const currentSpeed = numericSelectedSpeeds && numericSelectedSpeeds.length > 0 ? numericSelectedSpeeds[0] : null;
          if (currentSpeed && currentSpeed > qual.maxSpeed) {
            setSelectedSpeeds([String(qual.maxSpeed)]);
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

  // Save current filters as a preset
  function saveFilterPreset() {
    if (typeof window === 'undefined') return;
    const name = window.prompt('Save this filter combination as:', 'My Preset');
    if (!name) return;
    const currentFilters = {
      selectedSpeeds,
      contractFilter,
      dataFilter,
      technologyFilter,
      modemFilter,
      ipv6Filter,
      noCgnatFilter,
      auSupportFilter,
      staticIpFilter,
      exclude6MonthFilter,
      uploadSpeedFilter,
      providerFilter,
      selectedProviders,
      viewMode,
      sortBy
    };
    const newPresets: SavedFilterPreset[] = [...savedPresets.filter((p: SavedFilterPreset) => p.name !== name), { name, filters: currentFilters }];
    setSavedPresets(newPresets);
    persistFilterPresets(newPresets);
    alert(`Preset "${name}" saved!`);
  }

  const removeFilterPreset = (name: string) => {
    setSavedPresets((prev: SavedFilterPreset[]) => {
      const updated = prev.filter((p: SavedFilterPreset) => p.name !== name);
      persistFilterPresets(updated);
      return updated;
    });
  };

  // Load a saved preset
  function loadFilterPreset(preset: SavedFilterPreset) {
    const f = preset.filters;
    setSelectedSpeeds(f.selectedSpeeds || ['all']);
    setContractFilter(f.contractFilter || '');
    setDataFilter(f.dataFilter || '');
    setTechnologyFilter(f.technologyFilter || '');
    setModemFilter(f.modemFilter || '');
    setIpv6Filter(f.ipv6Filter || false);
    setNoCgnatFilter(f.noCgnatFilter || false);
    setAuSupportFilter(f.auSupportFilter || false);
    setStaticIpFilter(f.staticIpFilter || false);
    setExclude6MonthFilter(f.exclude6MonthFilter || false);
    setUploadSpeedFilter(f.uploadSpeedFilter || '');
    setProviderFilter(f.providerFilter || '');
    setSelectedProviders(f.selectedProviders || []);
    setViewMode(f.viewMode || 'standard');
    setSortBy(f.sortBy || 'price');
  }

  // Get statistics for current filtered plans
  function getPlanStatistics() {
    const filteredPlans = plans.filter((p: Plan) => {
      if (!matchesSelectedSpeeds(p)) return false;
      if (viewMode === 'fixed-wireless' && p.technology_type !== 'fixed-wireless') return false;
      if (viewMode === 'satellite' && p.technology_type !== 'satellite') return false;
      if (viewMode === '5g-home' && p.technology_type !== '5g-home') return false;
      if (viewMode === 'standard' && (p.technology_type === 'fixed-wireless' || p.technology_type === 'satellite' || p.technology_type === '5g-home')) return false;
      return true;
    });

    const stats: Record<string | number, number> = {};
    filteredPlans.forEach((p: Plan) => {
      const tier = p.speed_tier || 'Unknown';
      stats[tier] = (stats[tier] || 0) + 1;
    });
    return stats;
  }

  // Export favorites as CSV
  function exportFavoritesAsCSV() {
    const favPlans = plans.filter((p: Plan) => favorites.includes(p.id));
    if (favPlans.length === 0) {
      alert('No favorites to export');
      return;
    }

    const headers = ['Provider', 'Plan Name', 'Speed (Mbps)', 'Intro Price (AUD)', 'Ongoing Price (AUD)', 'Contract', 'Data', 'Technology'];
    const rows = favPlans.map((p: Plan) => [
      p.provider_name,
      stripHtml(p.plan_name),
      p.speed_tier || 'N/A',
      p.intro_price_cents ? `$${(p.intro_price_cents / 100).toFixed(2)}` : 'N/A',
      p.ongoing_price_cents ? `$${(p.ongoing_price_cents / 100).toFixed(2)}` : 'N/A',
      p.contract_type || 'N/A',
      p.data_allowance || 'N/A',
      p.technology_type || 'Standard'
    ]);

    const csv = [headers, ...rows].map((row: (string | number)[]) => row.map((cell: string | number) => `"${cell}"`).join(',')).join('\n');
    const blob = new window.Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nbn-favorites-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Export favorites as JSON
  function exportFavoritesAsJSON() {
    const favPlans = plans.filter((p: Plan) => favorites.includes(p.id));
    if (favPlans.length === 0) {
      alert('No favorites to export');
      return;
    }

    const json = JSON.stringify(favPlans, null, 2);
    const blob = new window.Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nbn-favorites-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Helper to render mobile cards using PlanCard component
  function renderMobileCards() {
    return [...plans]
      .filter(p => {
        if (!matchesSelectedSpeeds(p)) return false;
        if (viewMode === 'business') {
          // Business plans filtered by API
        } else if (viewMode === 'fixed-wireless' && p.technology_type !== 'fixed-wireless') {
          return false;
        } else if (viewMode === 'satellite' && p.technology_type !== 'satellite') {
          return false;
        } else if (viewMode === '5g-home' && p.technology_type !== '5g-home') {
          return false;
        } else if (viewMode === 'standard' && (p.technology_type === 'fixed-wireless' || p.technology_type === 'satellite' || p.technology_type === '5g-home')) {
          return false;
        }
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          if (!((p.provider_name || '').toLowerCase().includes(term) || stripHtml(p.plan_name).toLowerCase().includes(term))) {
            return false;
          }
        }
        if (providerFilter && !(p.provider_name || '').toLowerCase().includes(providerFilter.toLowerCase())) {
          return false;
        }
        if (selectedProviders.length > 0 && !selectedProviders.includes(p.provider_name)) {
          return false;
        }
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
        if (uploadSpeedFilter) {
          const minUpload = parseInt(uploadSpeedFilter);
          if (!p.upload_speed_mbps || p.upload_speed_mbps < minUpload) {
            return false;
          }
        }
        if (setupFeeFilter) {
          const fee = p.setup_fee_cents ?? null;
          if (setupFeeFilter === '0' && (fee === null || fee > 0)) {
            return false;
          } else if (setupFeeFilter === '1-100' && (fee === null || fee < 100 || fee > 10000)) {
            return false;
          } else if (setupFeeFilter === '100-200' && (fee === null || fee < 10000)) {
            return false;
          }
        }
        if (modemCostFilter) {
          if (modemCostFilter === '0' && (p.modem_cost_cents == null || p.modem_cost_cents > 0)) {
            return false;
          } else if (modemCostFilter === 'paid' && (p.modem_cost_cents === null || p.modem_cost_cents === 0)) {
            return false;
          }
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
          return (a.provider_name || '').localeCompare(b.provider_name || '');
        } else if (sortBy === 'speed') {
          return (b.speed_tier ?? 0) - (a.speed_tier ?? 0);
        }
        return 0;
      })
      .map((p: Plan) => (
        <PlanCard
          key={p.id}
          plan={p}
          darkMode={darkMode}
          isFavorite={favorites.includes(p.id)}
          onToggleFavorite={toggleFavorite}
          onPriceHistory={(planId: number) => {
            const plan = plans.find((pl: Plan) => pl.id === planId);
            if (plan) fetchPriceHistory(plan);
          }}
          getProviderColor={getProviderColor}
          getProviderInitials={getProviderInitials}
          stripHtml={stripHtml}
          isBestValue={bestValueBadges.get(p.id)?.isBestValue}
          isCheapest={bestValueBadges.get(p.id)?.isCheapest}
          isPopular={false}
        />
      ));
  }

  return (
    <div>
      <CompareHero
        heroStats={heroStats}
        activeHeroNotes={activeHeroNotes}
        heroPresets={heroPresetOptions}
        activePreset={activePreset}
        onPresetSelect={handlePresetSelect}
        onScrollToAddress={() => scrollToSection('address-check')}
        onTuneFilters={() => {
          setShowMobileFilters(true);
          scrollToSection('filters-panel');
        }}
        onBrowsePlans={() => scrollToSection('plan-results')}
      />

      <section className="hero" id="address-check">
        <h2>🏠 Find NBN plans for your home</h2>
        <p>Enter your address to check NBN availability and compare plans from 30+ Australian providers.</p>
        <form onSubmit={onCheckAddress} className="search search--address">
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
            <AddressSuggestionsList
              suggestions={addressSuggestions}
              highlightedIndex={highlightedIndex}
              onSelectAddress={onSelectAddress}
              onHighlightIndex={setHighlightedIndex}
            />
          )}
        </form>
        {message && <p className={message.includes('failed') || message.includes('Please') || message.includes('❌') ? 'error' : 'muted'}>{message}</p>}
        
        {qualification && <QualificationPanel qualification={qualification} />}
      </section>

      {/* Tools Row - Speed Calculator and Bill Comparison */}
      <section style={{
        display: 'flex',
        gap: '12px',
        marginTop: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <Suspense fallback={<div style={{ padding: '12px' }}>Loading tools...</div>}>
          <SpeedCalculator 
            darkMode={darkMode} 
            onSpeedRecommended={handleSpeedRecommendation} 
          />
          <BillComparison 
            darkMode={darkMode} 
            currentPlans={plans} 
          />
        </Suspense>
      </section>

      {/* AI Recommendations */}
      <Suspense fallback={<div style={{ padding: '12px' }}>Loading recommendations...</div>}>
        <AIRecommendations
          darkMode={darkMode}
          onRecommendation={(filters) => {
            // Apply the recommended filters
            if (filters.speed) setSelectedSpeeds([String(filters.speed)]);
            if (filters.ipv6Filter) setIpv6Filter(filters.ipv6Filter as boolean);
            if (filters.noCgnatFilter) setNoCgnatFilter(filters.noCgnatFilter as boolean);
            if (filters.auSupportFilter) setAuSupportFilter(filters.auSupportFilter as boolean);
            if (filters.staticIpFilter) setStaticIpFilter(filters.staticIpFilter as boolean);
            if (filters.contractFilter) setContractFilter(filters.contractFilter as string);
            if (filters.dataFilter) setDataFilter(filters.dataFilter as string);
            if (filters.selectedProviders) setSelectedProviders(filters.selectedProviders as string[]);
          }}
        />
      </Suspense>

      <section style={{
        marginTop: '16px',
        background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(102, 126, 234, 0.06)',
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(102, 126, 234, 0.15)'}`,
        borderRadius: '12px',
        padding: '20px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: darkMode ? '#e2e8f0' : '#1a202c' }}>Best Deals Summary</h3>
        {bestDealsLoading ? (
          <div style={{ color: darkMode ? '#a0aec0' : '#666' }}>Loading summary...</div>
        ) : bestDealsSummary ? (
          <div style={{ whiteSpace: 'pre-line', color: darkMode ? '#e2e8f0' : '#333', lineHeight: 1.6 }}>
            {bestDealsSummary}
          </div>
        ) : (
          <div style={{ color: darkMode ? '#a0aec0' : '#666' }}>Summary not available yet.</div>
        )}
        {bestDealsUpdatedAt && (
          <div style={{ marginTop: '8px', fontSize: '0.8em', color: darkMode ? '#94a3b8' : '#6b7280' }}>
            Updated {new Date(bestDealsUpdatedAt).toLocaleDateString('en-AU')}
          </div>
        )}
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

      {/* Mobile Filters Drawer Toggle Button */}
      <div className="mobile-filters-toggle-container">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="mobile-filters-toggle"
          aria-controls="filters-panel"
          aria-expanded={showMobileFilters}
          aria-label={showMobileFilters ? 'Hide filters' : 'Show filters'}
        >
          {showMobileFilters ? '▼ Hide Filters' : '▶ Show Filters'}
        </button>
      </div>

      <section className={`filters ${showMobileFilters ? 'visible' : 'hidden'}`} id="filters-panel">
        <label className="filters-group">
          <strong>Speed tier:</strong>
          <div className="speed-chip-group">
            {speedChips.map(option => {
              const isSelected = option === 'all' ? selectedSpeeds.includes('all') : selectedSpeeds.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleSpeedTier(option)}
                  className={`speed-chip ${isSelected ? 'speed-chip--selected' : ''} ${darkMode ? 'speed-chip--dark' : ''}`}
                >
                  {formatSpeedLabel(option)}
                </button>
              );
            })}
          </div>
          <small className={`filters-hint ${darkMode ? 'filters-hint--dark' : ''}`}>
            {selectedSpeeds.includes('all')
              ? 'Showing plans across every tier'
              : `Showing ${selectedSpeeds.map((value: string) => formatSpeedLabel(value)).join(', ')}`}
          </small>
        </label>
        <label>
          <strong>Contract:</strong>
          <select value={contractFilter} onChange={(e: ChangeEvent<HTMLSelectElement>) => setContractFilter(e.target.value)}>
            <option value="">All</option>
            <option value="month-to-month">Month-to-Month</option>
            <option value="12-month">12 Month</option>
            <option value="24-month">24 Month</option>
          </select>
        </label>
        <label>
          <strong>Data:</strong>
          <select value={dataFilter} onChange={(e: ChangeEvent<HTMLSelectElement>) => setDataFilter(e.target.value)}>
            <option value="">All</option>
            <option value="unlimited">Unlimited</option>
            <option value="limited">Limited</option>
          </select>
        </label>
        <label>
          <strong>Modem:</strong>
          <select value={modemFilter} onChange={(e: ChangeEvent<HTMLSelectElement>) => setModemFilter(e.target.value)}>
            <option value="">All</option>
            <option value="1">Included</option>
          </select>
        </label>
        <label>
          <strong>Upload Speed:</strong>
          <select value={uploadSpeedFilter} onChange={(e: ChangeEvent<HTMLSelectElement>) => setUploadSpeedFilter(e.target.value)}>
            <option value="">Any</option>
            <option value="10">10+ Mbps</option>
            <option value="20">20+ Mbps</option>
            <option value="40">40+ Mbps</option>
            <option value="100">100+ Mbps (Ultra-fast only)</option>
          </select>
        </label>
        <label>
          <strong>Setup Fee:</strong>
          <select value={setupFeeFilter} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSetupFeeFilter(e.target.value)}>
            <option value="">All</option>
            <option value="0">Free Setup</option>
            <option value="1-100">$1-$100</option>
            <option value="100-200">$100-$200</option>
          </select>
        </label>
        <label>
          <strong>Modem Cost:</strong>
          <select value={modemCostFilter} onChange={(e: ChangeEvent<HTMLSelectElement>) => setModemCostFilter(e.target.value)}>
            <option value="">All</option>
            <option value="0">Free Modem</option>
            <option value="paid">Paid Modem</option>
          </select>
        </label>
        <label>
          <strong>Provider:</strong>
          <input
            type="text"
            placeholder="Filter by ISP..."
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="filter-text-input filter-text-input--compact"
          />
        </label>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={ipv6Filter}
            onChange={(e) => setIpv6Filter(e.target.checked)}
          />
          <span>IPv6 Support</span>
        </label>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={noCgnatFilter}
            onChange={(e) => setNoCgnatFilter(e.target.checked)}
          />
          <span>No CGNAT</span>
        </label>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={auSupportFilter}
            onChange={(e) => setAuSupportFilter(e.target.checked)}
          />
          <span>AU Support</span>
        </label>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={staticIpFilter}
            onChange={(e) => setStaticIpFilter(e.target.checked)}
          />
          <span>Static IP Available</span>
        </label>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={exclude6MonthFilter}
            onChange={(e) => setExclude6MonthFilter(e.target.checked)}
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
        <label className="filter-search-group">
          <strong>Search:</strong>
          <input
            type="text"
            placeholder="Search provider or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-text-input"
          />
        </label>
        <button onClick={() => refetchPlans()}>🔄 Refresh</button>
        <button onClick={handleThemeToggle} className="filter-theme-toggle">
          {darkMode ? '☀️' : '🌙'} {darkMode ? 'Light' : 'Dark'}
        </button>
        {favorites.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
            <button onClick={exportFavoritesAsCSV} style={{ background: '#10b981' }} title="Export as CSV spreadsheet">
              📥 Export CSV
            </button>
            <button onClick={exportFavoritesAsJSON} style={{ background: '#3b82f6' }} title="Export as JSON">
              📥 Export JSON
            </button>
          </div>
        )}
      </section>

      {/* Statistics & Presets Section */}
      {plans.length > 0 && (
        <>
          <section style={{
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.95), rgba(26, 32, 44, 0.98))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95))',
          padding: '20px 30px',
          borderRadius: 'var(--radius-xl)',
          marginTop: '20px',
          marginBottom: '20px',
          boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <strong style={{ color: darkMode ? '#f7fafc' : '#2d3748', fontSize: '1.1em' }}>📊 Plan Statistics by Speed Tier:</strong>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
                {Object.entries(getPlanStatistics()).sort((a, b) => {
                  const aSpeed = parseInt(String(a[0]));
                  const bSpeed = parseInt(String(b[0]));
                  if (isNaN(aSpeed)) return 1;
                  if (isNaN(bSpeed)) return -1;
                  return aSpeed - bSpeed;
                }).map(([tier, count]) => (
                  <div key={tier} style={{
                    padding: '8px 16px',
                    background: darkMode ? '#374151' : '#f3f4f6',
                    borderRadius: '8px',
                    fontSize: '0.9em',
                    border: `2px solid ${getSpeedTierColor(parseInt(String(tier)))}`,
                    color: darkMode ? '#e5e7eb' : '#374151'
                  }}>
                    <strong>{getSpeedTierLabel(parseInt(String(tier)))}</strong>: {count} plans
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={saveFilterPreset}
                style={{
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9em'
                }}
              >
                💾 Save Filters
              </button>
            </div>
          </div>

          {/* Filter Presets */}
          {savedPresets.length > 0 && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `2px solid ${darkMode ? '#4a5568' : '#e0e0e0'}` }}>
              <strong style={{ color: darkMode ? '#cbd5e0' : '#666', fontSize: '0.9em' }}>📌 Your Saved Filter Presets:</strong>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {savedPresets.map((preset: SavedFilterPreset) => (
                  <div key={preset.name} style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => loadFilterPreset(preset)}
                      style={{
                        padding: '6px 12px',
                        background: darkMode ? '#1a202c' : '#f5f5f5',
                        color: darkMode ? '#e2e8f0' : '#333',
                        border: `2px solid #667eea`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.85em',
                        transition: 'all 0.2s'
                      }}
                    >
                      📂 {preset.name}
                    </button>
                    <button
                      onClick={() => removeFilterPreset(preset.name)}
                      style={{
                        padding: '6px 10px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.85em'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="hero-stats">
            <div className="hero-stat-card">
              <span className="hero-stat-value">{heroStats.plans}</span>
              <span className="hero-stat-label">Plans covered</span>
              <span className="hero-stat-note">refreshed throughout the day</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-value">{heroStats.providers}</span>
              <span className="hero-stat-label">Providers indexed</span>
              <span className="hero-stat-note">ratings & trust signals</span>
            </div>
            {heroStats.cheapest && (
              <div className="hero-stat-card">
                <span className="hero-stat-value">${heroStats.cheapest}</span>
                <span className="hero-stat-label">Cheapest ongoing</span>
                <span className="hero-stat-note">per month</span>
              </div>
            )}
            {heroStats.topSpeed && (
              <div className="hero-stat-card">
                <span className="hero-stat-value">{heroStats.topSpeed}Mbps</span>
                <span className="hero-stat-label">Top speed</span>
                <span className="hero-stat-note">across plans</span>
              </div>
            )}
          </div>
          <div className="preset-toolbar">
            {heroPresets.map((preset: HeroPreset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`preset-button ${activePreset === preset.name ? 'active' : ''}`}
              >
                <strong>{preset.name}</strong>
                <span>{preset.description}</span>
              </button>
            ))}
          </div>
          </section>
        </>
      )}

      <section className="plan-list" id="plan-results">
        {/* Provider Comparison Matrix */}
        <div style={{ marginBottom: '24px' }}>
          <Suspense fallback={<div style={{ padding: '12px' }}>Loading comparison matrix...</div>}>
            <ProviderComparisonMatrix />
          </Suspense>
        </div>

        <h3>📊 {viewMode === 'fixed-wireless' ? 'Fixed Wireless NBN Plans' : viewMode === 'business' ? 'Business NBN Plans' : viewMode === 'satellite' ? 'Satellite Internet Plans' : viewMode === '5g-home' ? '5G Home Internet Plans' : 'Standard NBN Plans'} ({plans.filter((p: Plan) => {
          if (!matchesSelectedSpeeds(p)) return false;
          // Technology type filter based on viewMode (skip for business - handled by API)
          if (viewMode === 'business') return true;  // Business plans filtered by API via service_type
          if (viewMode === 'fixed-wireless' && p.technology_type !== 'fixed-wireless') return false;
          if (viewMode === 'satellite' && p.technology_type !== 'satellite') return false;
          if (viewMode === '5g-home' && p.technology_type !== '5g-home') return false;
          if (viewMode === 'standard' && (p.technology_type === 'fixed-wireless' || p.technology_type === 'satellite' || p.technology_type === '5g-home')) return false;
          // Search term
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            if (!((p.provider_name || '').toLowerCase().includes(term) || stripHtml(p.plan_name).toLowerCase().includes(term))) return false;
          }
          // Provider filter
          if (providerFilter && !(p.provider_name || '').toLowerCase().includes(providerFilter.toLowerCase())) return false;
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
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              padding: '12px 16px',
              background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(102, 126, 234, 0.05)',
              borderRadius: '8px',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(102, 126, 234, 0.15)'}`,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95em',
                color: darkMode ? '#e2e8f0' : '#475569',
              }}>
                <span style={{ fontWeight: '600', color: '#667eea', fontSize: '1.1em' }}>
                  {[...plans].filter(p => {
                    // Apply same filters
                    if (viewMode === 'business') {
                      if (p.plan_type !== 'business') return false;
                    } else if (viewMode === 'fixed-wireless' && p.technology_type !== 'fixed-wireless') return false;
                    else if (viewMode === 'satellite' && p.technology_type !== 'satellite') return false;
                    else if (viewMode === '5g-home' && p.technology_type !== '5g-home') return false;
                    else if (viewMode === 'standard' && (p.technology_type === 'fixed-wireless' || p.technology_type === 'satellite' || p.technology_type === '5g-home')) return false;
                    if (searchTerm) {
                      const term = searchTerm.toLowerCase();
                      if (!((p.provider_name || '').toLowerCase().includes(term) || stripHtml(p.plan_name).toLowerCase().includes(term))) return false;
                    }
                    if (providerFilter && !(p.provider_name || '').toLowerCase().includes(providerFilter.toLowerCase())) return false;
                    if (selectedProviders.length > 0 && !selectedProviders.includes(p.provider_name)) return false;
                    if (ipv6Filter && (!p.provider_ipv6_support || p.provider_ipv6_support < 1)) return false;
                    if (noCgnatFilter && p.provider_cgnat !== 0 && (!p.provider_cgnat_opt_out || p.provider_cgnat_opt_out < 1)) return false;
                    if (auSupportFilter && (!p.provider_australian_support || p.provider_australian_support < 1)) return false;
                    if (staticIpFilter && (!p.provider_static_ip_available || p.provider_static_ip_available < 1)) return false;
                    // Don't filter out 6-month deals - we'll display them differently
                    if (uploadSpeedFilter) {
                      const minUpload = parseInt(uploadSpeedFilter);
                      if (!p.upload_speed_mbps || p.upload_speed_mbps < minUpload) return false;
                    }
                    return true;
                  }).length}
                </span>
                <span>
                  {[...plans].filter(p => {
                    if (viewMode === 'business') {
                      if (p.plan_type !== 'business') return false;
                    } else if (viewMode === 'fixed-wireless' && p.technology_type !== 'fixed-wireless') return false;
                    else if (viewMode === 'satellite' && p.technology_type !== 'satellite') return false;
                    else if (viewMode === '5g-home' && p.technology_type !== '5g-home') return false;
                    else if (viewMode === 'standard' && (p.technology_type === 'fixed-wireless' || p.technology_type === 'satellite' || p.technology_type === '5g-home')) return false;
                    if (searchTerm) {
                      const term = searchTerm.toLowerCase();
                      if (!((p.provider_name || '').toLowerCase().includes(term) || stripHtml(p.plan_name).toLowerCase().includes(term))) return false;
                    }
                    if (providerFilter && !(p.provider_name || '').toLowerCase().includes(providerFilter.toLowerCase())) return false;
                    if (selectedProviders.length > 0 && !selectedProviders.includes(p.provider_name)) return false;
                    if (ipv6Filter && (!p.provider_ipv6_support || p.provider_ipv6_support < 1)) return false;
                    if (noCgnatFilter && p.provider_cgnat !== 0 && (!p.provider_cgnat_opt_out || p.provider_cgnat_opt_out < 1)) return false;
                    if (auSupportFilter && (!p.provider_australian_support || p.provider_australian_support < 1)) return false;
                    if (staticIpFilter && (!p.provider_static_ip_available || p.provider_static_ip_available < 1)) return false;
                    // Don't filter out 6-month deals - we'll display them differently
                    if (uploadSpeedFilter) {
                      const minUpload = parseInt(uploadSpeedFilter);
                      if (!p.upload_speed_mbps || p.upload_speed_mbps < minUpload) return false;
                    }
                    return true;
                  }).length === 1 ? 'plan' : 'plans'} shown
                </span>
                {[...plans].filter(p => {
                  if (viewMode === 'business') {
                    if (p.plan_type !== 'business') return false;
                  } else if (viewMode === 'fixed-wireless' && p.technology_type !== 'fixed-wireless') return false;
                  else if (viewMode === 'satellite' && p.technology_type !== 'satellite') return false;
                  else if (viewMode === '5g-home' && p.technology_type !== '5g-home') return false;
                  else if (viewMode === 'standard' && (p.technology_type === 'fixed-wireless' || p.technology_type === 'satellite' || p.technology_type === '5g-home')) return false;
                  if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    if (!((p.provider_name || '').toLowerCase().includes(term) || stripHtml(p.plan_name).toLowerCase().includes(term))) return false;
                  }
                  if (providerFilter && !(p.provider_name || '').toLowerCase().includes(providerFilter.toLowerCase())) return false;
                  if (selectedProviders.length > 0 && !selectedProviders.includes(p.provider_name)) return false;
                  if (ipv6Filter && (!p.provider_ipv6_support || p.provider_ipv6_support < 1)) return false;
                  if (noCgnatFilter && p.provider_cgnat !== 0 && (!p.provider_cgnat_opt_out || p.provider_cgnat_opt_out < 1)) return false;
                  if (auSupportFilter && (!p.provider_australian_support || p.provider_australian_support < 1)) return false;
                  if (staticIpFilter && (!p.provider_static_ip_available || p.provider_static_ip_available < 1)) return false;
                  if (exclude6MonthFilter && (p.contract_type === '6-month' || (p.intro_duration_days && p.intro_duration_days >= 175 && p.intro_duration_days <= 185))) return false;
                  if (uploadSpeedFilter) {
                    const minUpload = parseInt(uploadSpeedFilter);
                    if (!p.upload_speed_mbps || p.upload_speed_mbps < minUpload) return false;
                  }
                  return true;
                }).length !== plans.length && (
                  <span style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.9em' }}>
                    (filtered from {plans.length} total)
                  </span>
                )}
              </div>
            </div>
          
          <div className="table-wrapper">
            <table className="plan-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Provider</th>
                  <th>Plan Details</th>
                  <th>Price</th>
                  <th className="hide-mobile">Speed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...plans]
                  .filter(p => {
                    if (!matchesSelectedSpeeds(p)) return false;
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
                      if (!((p.provider_name || '').toLowerCase().includes(term) || stripHtml(p.plan_name).toLowerCase().includes(term))) {
                        return false;
                      }
                    }
                    
                    // Provider filter
                    if (providerFilter && !(p.provider_name || '').toLowerCase().includes(providerFilter.toLowerCase())) {
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
                    
                    // Don't filter out 6-month deals - we'll display them with ongoing price when filter is active
                    
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
                      // When excluding 6-month deals, sort by ongoing price for those plans
                      const is6MonthA = exclude6MonthFilter && a.intro_price_cents && (a.contract_type === '6-month' || (a.intro_duration_days && a.intro_duration_days >= 175 && a.intro_duration_days <= 185));
                      const is6MonthB = exclude6MonthFilter && b.intro_price_cents && (b.contract_type === '6-month' || (b.intro_duration_days && b.intro_duration_days >= 175 && b.intro_duration_days <= 185));
                      const priceA = is6MonthA ? (a.ongoing_price_cents ?? Infinity) : (a.intro_price_cents ?? a.ongoing_price_cents ?? Infinity);
                      const priceB = is6MonthB ? (b.ongoing_price_cents ?? Infinity) : (b.intro_price_cents ?? b.ongoing_price_cents ?? Infinity);
                      return priceA - priceB;
                    } else if (sortBy === 'price-desc') {
                      const is6MonthA = exclude6MonthFilter && a.intro_price_cents && (a.contract_type === '6-month' || (a.intro_duration_days && a.intro_duration_days >= 175 && a.intro_duration_days <= 185));
                      const is6MonthB = exclude6MonthFilter && b.intro_price_cents && (b.contract_type === '6-month' || (b.intro_duration_days && b.intro_duration_days >= 175 && b.intro_duration_days <= 185));
                      const priceA = is6MonthA ? (a.ongoing_price_cents ?? -Infinity) : (a.intro_price_cents ?? a.ongoing_price_cents ?? -Infinity);
                      const priceB = is6MonthB ? (b.ongoing_price_cents ?? -Infinity) : (b.intro_price_cents ?? b.ongoing_price_cents ?? -Infinity);
                      return priceB - priceA;
                    } else if (sortBy === 'provider') {
                      return (a.provider_name || '').localeCompare(b.provider_name || '');
                    } else if (sortBy === 'speed') {
                      return (b.speed_tier ?? 0) - (a.speed_tier ?? 0);
                    }
                    return 0;
                  })
                  .map((p: Plan) => (
                    <PlanTableRow
                      key={p.id}
                      plan={p}
                      darkMode={darkMode}
                      isFavorite={favorites.includes(p.id)}
                      isBestValue={bestValuePlanIds.has(p.id)}
                      showOngoingInsteadOfIntro={Boolean(exclude6MonthFilter && p.intro_price_cents && (p.contract_type === '6-month' || (p.intro_duration_days && p.intro_duration_days >= 175 && p.intro_duration_days <= 185)))}
                      renderLogo={(plan) => <ProviderLogo providerName={plan.provider_name} faviconUrl={plan.favicon_url} sourceUrl={plan.provider_canonical_url} />}
                      onToggleFavorite={toggleFavorite}
                      onViewPriceHistory={fetchPriceHistory}
                    />
                  ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {!loading && plans.length > 0 && (
              <PaginationControls
                currentPage={currentPage}
                loading={loading}
                totalPages={pagedData?.pagination?.totalPages}
                totalCount={pagedData?.pagination?.total}
                hasNextPage={pagedData?.pagination?.hasNextPage}
                onPrevious={() => setCurrentPage(Math.max(0, currentPage - 1))}
                onNext={() => setCurrentPage(currentPage + 1)}
              />
            )}
          </div>

            {/* Mobile Card View */}
            <div className="plans-card-view">
              {loading ? (
                // Loading skeleton for mobile cards
                [1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="plan-card skeleton" style={{
                    background: darkMode ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.95), rgba(26, 32, 44, 0.98))' : 'white',
                    padding: '24px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '8px' }}></div>
                      <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ width: '140px', height: '20px', marginBottom: '8px', borderRadius: '4px' }}></div>
                        <div className="skeleton" style={{ width: '200px', height: '16px', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                    <div className="skeleton" style={{ width: '100%', height: '1px', margin: '16px 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div className="skeleton" style={{ width: '100px', height: '32px', borderRadius: '4px' }}></div>
                      <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '4px' }}></div>
                    </div>
                    <div className="skeleton" style={{ width: '100%', height: '44px', borderRadius: '8px', marginTop: '16px' }}></div>
                  </div>
                ))
              ) : renderMobileCards()}
            </div>
          </>
        )}
      </section>

      {showPriceHistory && selectedPlanForHistory && (
        <Suspense fallback={<div style={{ padding: '12px' }}>Loading price history...</div>}>
          <PriceHistoryModal
            plan={selectedPlanForHistory}
            history={priceHistoryData}
            loading={loadingHistory}
            onClose={() => setShowPriceHistory(false)}
            darkMode={darkMode}
          />
        </Suspense>
      )}
    </div>
  );
}
