import { useState } from 'react';

/**
 * Custom hook to manage all filter state in the Compare page.
 * Centralizes filter management to improve performance and reusability.
 */
export function useCompareFilters() {
  const [speed, setSpeed] = useState("all");
  const [selectedSpeeds, setSelectedSpeeds] = useState(['all']);
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
  const [setupFeeFilter, setSetupFeeFilter] = useState('');
  const [modemCostFilter, setModemCostFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [selectedProviders, setSelectedProviders] = useState([] as string[]);
  const [planTypeFilter, setPlanTypeFilter] = useState('residential' as 'residential' | 'business' | 'all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('nbn' as 'nbn' | '5g-home' | 'satellite');

  // Reset all filters to defaults
  const resetFilters = () => {
    setSpeed('all');
    setSelectedSpeeds(['all']);
    setContractFilter('');
    setDataFilter('');
    setTechnologyFilter('');
    setModemFilter('');
    setIpv6Filter(false);
    setNoCgnatFilter(false);
    setAuSupportFilter(false);
    setStaticIpFilter(false);
    setExclude6MonthFilter(false);
    setUploadSpeedFilter('');
    setSetupFeeFilter('');
    setModemCostFilter('');
    setProviderFilter('');
    setSelectedProviders([]);
    setPlanTypeFilter('residential');
    setServiceTypeFilter('nbn');
  };

  // Export all filters as an object for easy passing
  const filters = {
    speed,
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
    serviceTypeFilter,
  };

  // Setters grouped by category
  const setters = {
    setSpeed, setSelectedSpeeds, setContractFilter, setDataFilter, setTechnologyFilter,
    setModemFilter, setIpv6Filter, setNoCgnatFilter, setAuSupportFilter, setStaticIpFilter,
    setExclude6MonthFilter, setUploadSpeedFilter, setSetupFeeFilter, setModemCostFilter,
    setProviderFilter, setSelectedProviders, setPlanTypeFilter, setServiceTypeFilter
  };

  // Build API query string from filters (memoized later)
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (speed !== 'all' && speed !== '') params.append('speed', speed);
    if (contractFilter) params.append('contract', contractFilter);
    if (dataFilter) params.append('data', dataFilter);
    if (technologyFilter) params.append('technology', technologyFilter);
    if (modemFilter === 'yes') params.append('modem', '1');
    if (uploadSpeedFilter) params.append('uploadSpeed', uploadSpeedFilter);
    if (providerFilter) params.append('provider', providerFilter);
    if (planTypeFilter !== 'all') params.append('planType', planTypeFilter);
    if (serviceTypeFilter !== 'nbn') params.append('serviceType', serviceTypeFilter);
    return params.toString();
  };

  return {
    filters,
    setters,
    resetFilters,
    buildQueryString,
  };
}

export type CompareFilters = ReturnType<typeof useCompareFilters>['filters'];
