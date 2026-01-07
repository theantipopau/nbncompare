import { render, screen, fireEvent } from '@testing-library/react';
import { PlanFilters } from '../components/PlanFilters';

describe('PlanFilters', () => {
  const mockProps = {
    speed: 'all',
    setSpeed: vi.fn(),
    contractFilter: '',
    setContractFilter: vi.fn(),
    dataFilter: '',
    setDataFilter: vi.fn(),
    technologyFilter: '',
    setTechnologyFilter: vi.fn(),
    modemFilter: '',
    setModemFilter: vi.fn(),
    ipv6Filter: false,
    setIpv6Filter: vi.fn(),
    noCgnatFilter: false,
    setNoCgnatFilter: vi.fn(),
    auSupportFilter: false,
    setAuSupportFilter: vi.fn(),
    staticIpFilter: false,
    setStaticIpFilter: vi.fn(),
    exclude6MonthFilter: false,
    setExclude6MonthFilter: vi.fn(),
    uploadSpeedFilter: '',
    setUploadSpeedFilter: vi.fn(),
    providerFilter: '',
    setProviderFilter: vi.fn(),
    selectedProviders: [],
    setSelectedProviders: vi.fn(),
    showProviderList: false,
    setShowProviderList: vi.fn(),
    viewMode: 'standard' as const,
    setViewMode: vi.fn(),
    planTypeFilter: 'residential' as const,
    setPlanTypeFilter: vi.fn(),
    serviceTypeFilter: 'nbn' as const,
    setServiceTypeFilter: vi.fn(),
    sortBy: 'price',
    setSortBy: vi.fn(),
    searchTerm: '',
    setSearchTerm: vi.fn(),
    darkMode: false,
    setDarkMode: vi.fn(),
  };

  it('renders all filter controls', () => {
    render(<PlanFilters {...mockProps} />);

    expect(screen.getByLabelText('Speed:')).toBeInTheDocument();
    expect(screen.getByLabelText('Contract:')).toBeInTheDocument();
    expect(screen.getByLabelText('Data Allowance:')).toBeInTheDocument();
    expect(screen.getByLabelText('Technology:')).toBeInTheDocument();
    expect(screen.getByLabelText('Modem:')).toBeInTheDocument();
    expect(screen.getByText('Provider Features:')).toBeInTheDocument();
    expect(screen.getByLabelText('Min Upload Speed:')).toBeInTheDocument();
    expect(screen.getByLabelText('Sort by:')).toBeInTheDocument();
    expect(screen.getByLabelText('Search:')).toBeInTheDocument();
    expect(screen.getByLabelText('View:')).toBeInTheDocument();
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });

  it('calls setSpeed when speed select changes', () => {
    render(<PlanFilters {...mockProps} />);

    const speedSelect = screen.getByLabelText('Speed:');
    fireEvent.change(speedSelect, { target: { value: '100' } });

    expect(mockProps.setSpeed).toHaveBeenCalledWith('100');
  });

  it('calls setIpv6Filter when IPv6 checkbox changes', () => {
    render(<PlanFilters {...mockProps} />);

    const ipv6Checkbox = screen.getByLabelText('IPv6 Support');
    fireEvent.click(ipv6Checkbox);

    expect(mockProps.setIpv6Filter).toHaveBeenCalledWith(true);
  });

  it('calls setSearchTerm when search input changes', () => {
    render(<PlanFilters {...mockProps} />);

    const searchInput = screen.getByLabelText('Search:');
    fireEvent.change(searchInput, { target: { value: 'Telstra' } });

    expect(mockProps.setSearchTerm).toHaveBeenCalledWith('Telstra');
  });
});