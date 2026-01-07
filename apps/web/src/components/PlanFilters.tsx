import React from 'react';

interface PlanFiltersProps {
  speed: string;
  setSpeed: (speed: string) => void;
  contractFilter: string;
  setContractFilter: (contract: string) => void;
  dataFilter: string;
  setDataFilter: (data: string) => void;
  technologyFilter: string;
  setTechnologyFilter: (technology: string) => void;
  modemFilter: string;
  setModemFilter: (modem: string) => void;
  ipv6Filter: boolean;
  setIpv6Filter: (ipv6: boolean) => void;
  noCgnatFilter: boolean;
  setNoCgnatFilter: (noCgnat: boolean) => void;
  auSupportFilter: boolean;
  setAuSupportFilter: (au: boolean) => void;
  staticIpFilter: boolean;
  setStaticIpFilter: (staticIp: boolean) => void;
  exclude6MonthFilter: boolean;
  setExclude6MonthFilter: (exclude: boolean) => void;
  uploadSpeedFilter: string;
  setUploadSpeedFilter: (upload: string) => void;
  providerFilter: string;
  setProviderFilter: (provider: string) => void;
  selectedProviders: string[];
  setSelectedProviders: (providers: string[]) => void;
  showProviderList: boolean;
  setShowProviderList: (show: boolean) => void;
  viewMode: 'standard' | 'fixed-wireless' | 'business' | '5g-home' | 'satellite';
  setViewMode: (mode: 'standard' | 'fixed-wireless' | 'business' | '5g-home' | 'satellite') => void;
  planTypeFilter: 'residential' | 'business' | 'all';
  setPlanTypeFilter: (type: 'residential' | 'business' | 'all') => void;
  serviceTypeFilter: 'nbn' | '5g-home' | 'satellite';
  setServiceTypeFilter: (type: 'nbn' | '5g-home' | 'satellite') => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  searchTerm: string;
  setSearchTerm: (search: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export function PlanFilters({
  speed,
  setSpeed,
  contractFilter,
  setContractFilter,
  dataFilter,
  setDataFilter,
  technologyFilter,
  setTechnologyFilter,
  modemFilter,
  setModemFilter,
  ipv6Filter,
  setIpv6Filter,
  noCgnatFilter,
  setNoCgnatFilter,
  auSupportFilter,
  setAuSupportFilter,
  staticIpFilter,
  setStaticIpFilter,
  exclude6MonthFilter: _exclude6MonthFilter,
  setExclude6MonthFilter: _setExclude6MonthFilter,
  uploadSpeedFilter,
  setUploadSpeedFilter,
  providerFilter: _providerFilter,
  setProviderFilter: _setProviderFilter,
  selectedProviders: _selectedProviders,
  setSelectedProviders: _setSelectedProviders,
  showProviderList: _showProviderList,
  setShowProviderList: _setShowProviderList,
  viewMode,
  setViewMode,
  planTypeFilter: _planTypeFilter,
  setPlanTypeFilter: _setPlanTypeFilter,
  serviceTypeFilter: _serviceTypeFilter,
  setServiceTypeFilter: _setServiceTypeFilter,
  sortBy,
  setSortBy,
  searchTerm,
  setSearchTerm,
  darkMode,
  setDarkMode,
}: PlanFiltersProps) {
  return (
    <div className="filters-section">
      {/* Speed Filter */}
      <div className="filter-group">
        <label htmlFor="speed-select">Speed:</label>
        <select
          id="speed-select"
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
        >
          <option value="all">All Speeds</option>
          <option value="25">25 Mbps</option>
          <option value="50">50 Mbps</option>
          <option value="75">75 Mbps</option>
          <option value="100">100 Mbps</option>
          <option value="250">250 Mbps</option>
          <option value="500">500 Mbps</option>
          <option value="1000">1000 Mbps</option>
        </select>
      </div>

      {/* Contract Filter */}
      <div className="filter-group">
        <label htmlFor="contract-select">Contract:</label>
        <select
          id="contract-select"
          value={contractFilter}
          onChange={(e) => setContractFilter(e.target.value)}
        >
          <option value="">Any</option>
          <option value="12">12 months</option>
          <option value="24">24 months</option>
          <option value="36">36 months</option>
          <option value="0">No contract</option>
        </select>
      </div>

      {/* Data Allowance Filter */}
      <div className="filter-group">
        <label htmlFor="data-select">Data Allowance:</label>
        <select
          id="data-select"
          value={dataFilter}
          onChange={(e) => setDataFilter(e.target.value)}
        >
          <option value="">Any</option>
          <option value="unlimited">Unlimited</option>
          <option value="1000">1000GB+</option>
          <option value="500">500GB+</option>
          <option value="200">200GB+</option>
          <option value="100">100GB+</option>
          <option value="50">50GB+</option>
        </select>
      </div>

      {/* Technology Filter */}
      <div className="filter-group">
        <label htmlFor="technology-select">Technology:</label>
        <select
          id="technology-select"
          value={technologyFilter}
          onChange={(e) => setTechnologyFilter(e.target.value)}
        >
          <option value="">Any</option>
          <option value="FTTP">FTTP</option>
          <option value="FTTC">FTTC</option>
          <option value="FTTN">FTTN</option>
          <option value="HFC">HFC</option>
          <option value="Wireless">Wireless</option>
        </select>
      </div>

      {/* Modem Filter */}
      <div className="filter-group">
        <label htmlFor="modem-select">Modem:</label>
        <select
          id="modem-select"
          value={modemFilter}
          onChange={(e) => setModemFilter(e.target.value)}
        >
          <option value="">Any</option>
          <option value="1">Included</option>
          <option value="0">Not included</option>
        </select>
      </div>

      {/* Provider Features */}
      <div className="filter-group provider-features">
        <label>Provider Features:</label>
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={ipv6Filter}
              onChange={(e) => setIpv6Filter(e.target.checked)}
            />
            IPv6 Support
          </label>
          <label>
            <input
              type="checkbox"
              checked={noCgnatFilter}
              onChange={(e) => setNoCgnatFilter(e.target.checked)}
            />
            No CGNAT
          </label>
          <label>
            <input
              type="checkbox"
              checked={auSupportFilter}
              onChange={(e) => setAuSupportFilter(e.target.checked)}
            />
            Australian Support
          </label>
          <label>
            <input
              type="checkbox"
              checked={staticIpFilter}
              onChange={(e) => setStaticIpFilter(e.target.checked)}
            />
            Static IP Available
          </label>
        </div>
      </div>

      {/* Upload Speed Filter */}
      <div className="filter-group">
        <label htmlFor="upload-select">Min Upload Speed:</label>
        <select
          id="upload-select"
          value={uploadSpeedFilter}
          onChange={(e) => setUploadSpeedFilter(e.target.value)}
        >
          <option value="">Any</option>
          <option value="10">10 Mbps</option>
          <option value="20">20 Mbps</option>
          <option value="50">50 Mbps</option>
          <option value="100">100 Mbps</option>
        </select>
      </div>

      {/* Sort By */}
      <div className="filter-group">
        <label htmlFor="sort-select">Sort by:</label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="price">Price (Low to High)</option>
          <option value="speed">Speed (High to Low)</option>
          <option value="value">Best Value</option>
        </select>
      </div>

      {/* Search */}
      <div className="filter-group">
        <label htmlFor="search-input">Search:</label>
        <input
          id="search-input"
          type="text"
          placeholder="Provider or plan name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* View Mode */}
      <div className="filter-group">
        <label htmlFor="view-select">View:</label>
        <select
          id="view-select"
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as 'standard' | 'fixed-wireless' | 'business' | '5g-home' | 'satellite')}
        >
          <option value="standard">NBN Standard</option>
          <option value="fixed-wireless">Fixed Wireless</option>
          <option value="5g-home">5G Home</option>
          <option value="satellite">Satellite</option>
        </select>
      </div>

      {/* Dark Mode Toggle */}
      <div className="filter-group">
        <label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
          Dark Mode
        </label>
      </div>
    </div>
  );
}