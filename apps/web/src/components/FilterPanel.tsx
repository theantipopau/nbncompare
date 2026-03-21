import React from 'react';
import { CompareFilters } from '../hooks/useCompareFilters';
import type { SetStateFn } from '../types'; // Assuming this type exists

interface FilterPanelProps {
  filters: CompareFilters;
  setters: {
    setSpeed: (v: string) => void;
    setSelectedSpeeds: (v: string[]) => void;
    setContractFilter: (v: string) => void;
    setDataFilter: (v: string) => void;
    setTechnologyFilter: (v: string) => void;
    setModemFilter: (v: string) => void;
    setIpv6Filter: (v: boolean) => void;
    setNoCgnatFilter: (v: boolean) => void;
    setAuSupportFilter: (v: boolean) => void;
    setStaticIpFilter: (v: boolean) => void;
    setExclude6MonthFilter: (v: boolean) => void;
    setUploadSpeedFilter: (v: string) => void;
    setSetupFeeFilter: (v: string) => void;
    setModemCostFilter: (v: string) => void;
    setProviderFilter: (v: string) => void;
    setSelectedProviders: (v: string[]) => void;
    setPlanTypeFilter: (v: 'residential' | 'business' | 'all') => void;
    setServiceTypeFilter: (v: 'nbn' | '5g-home' | 'satellite') => void;
  };
  onResetFilters: () => void;
}

/**
 * FilterPanel Component - Groups all filter controls
 * Can be collapsed/expanded on mobile for better UX
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setters, onResetFilters }) => {
  const hasActiveFilters = 
    filters.speed !== 'all' ||
    filters.contractFilter ||
    filters.dataFilter ||
    filters.technologyFilter ||
    filters.modemFilter ||
    filters.ipv6Filter ||
    filters.noCgnatFilter ||
    filters.auSupportFilter ||
    filters.staticIpFilter ||
    filters.uploadSpeedFilter ||
    filters.setupFeeFilter ||
    filters.modemCostFilter ||
    filters.providerFilter ||
    filters.selectedProviders.length > 0 ||
    filters.planTypeFilter !== 'residential' ||
    filters.serviceTypeFilter !== 'nbn';

  return (
    <div className="filter-panel">
      {/* Speed Tier Filter */}
      <div className="filter-group">
        <label className="filter-label">
          Speed Tier
          {filters.speed !== 'all' && <span className="filter-badge">✓</span>}
        </label>
        <select
          value={filters.speed}
          onChange={(e) => setters.setSpeed(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Speeds</option>
          <option value="12">12 Mbps</option>
          <option value="25">25 Mbps</option>
          <option value="50">50 Mbps</option>
          <option value="100">100 Mbps</option>
          <option value="250">250 Mbps</option>
          <option value="500">500 Mbps</option>
          <option value="1000">1000 Mbps</option>
          <option value="2000">2000 Mbps</option>
        </select>
      </div>

      {/* Provider Filter */}
      <div className="filter-group">
        <label className="filter-label">
          Provider
          {filters.providerFilter && <span className="filter-badge">✓</span>}
        </label>
        <input
          type="text"
          placeholder="Filter by provider..."
          value={filters.providerFilter}
          onChange={(e) => setters.setProviderFilter(e.target.value)}
          className="filter-input"
        />
      </div>

      {/* Contract Type Filter */}
      <div className="filter-group">
        <label className="filter-label">
          Contract Type
          {filters.contractFilter && <span className="filter-badge">✓</span>}
        </label>
        <select
          value={filters.contractFilter}
          onChange={(e) => setters.setContractFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Any Contract</option>
          <option value="month-to-month">Month-to-Month</option>
          <option value="12-month">12 Month</option>
          <option value="24-month">24 Month</option>
        </select>
      </div>

      {/* Data Allowance Filter */}
      <div className="filter-group">
        <label className="filter-label">
          Data Allowance
          {filters.dataFilter && <span className="filter-badge">✓</span>}
        </label>
        <select
          value={filters.dataFilter}
          onChange={(e) => setters.setDataFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Any Amount</option>
          <option value="Unlimited">Unlimited</option>
          <option value="500GB">500GB</option>
          <option value="1TB">1TB</option>
        </select>
      </div>

      {/* Service Type Filter */}
      <div className="filter-group">
        <label className="filter-label">
          Service Type
          {filters.serviceTypeFilter !== 'nbn' && <span className="filter-badge">✓</span>}
        </label>
        <select
          value={filters.serviceTypeFilter}
          onChange={(e) => setters.setServiceTypeFilter(e.target.value as 'nbn' | '5g-home' | 'satellite')}
          className="filter-select"
        >
          <option value="nbn">NBN</option>
          <option value="5g-home">5G Home</option>
          <option value="satellite">Satellite</option>
        </select>
      </div>

      {/* Modem Included */}
      <div className="filter-group checkbox-group">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.modemFilter === 'yes'}
            onChange={(e) => setters.setModemFilter(e.target.checked ? 'yes' : '')}
          />
          <span>Modem Included</span>
        </label>
      </div>

      {/* IPv6 Support */}
      <div className="filter-group checkbox-group">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.ipv6Filter}
            onChange={(e) => setters.setIpv6Filter(e.target.checked)}
          />
          <span>IPv6 Support</span>
        </label>
      </div>

      {/* No CGNAT */}
      <div className="filter-group checkbox-group">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.noCgnatFilter}
            onChange={(e) => setters.setNoCgnatFilter(e.target.checked)}
          />
          <span>No CGNAT</span>
        </label>
      </div>

      {/* Australian Support */}
      <div className="filter-group checkbox-group">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.auSupportFilter}
            onChange={(e) => setters.setAuSupportFilter(e.target.checked)}
          />
          <span>Australian Support</span>
        </label>
      </div>

      {/* Static IP */}
      <div className="filter-group checkbox-group">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.staticIpFilter}
            onChange={(e) => setters.setStaticIpFilter(e.target.checked)}
          />
          <span>Static IP Available</span>
        </label>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          onClick={onResetFilters}
          className="btn btn-secondary btn-block"
          style={{ marginTop: '1rem' }}
        >
          Reset All Filters
        </button>
      )}
    </div>
  );
};

export default FilterPanel;
