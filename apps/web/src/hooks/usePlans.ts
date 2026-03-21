import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

export interface Plan {
  id: number;
  plan_name: string;
  provider_name: string;
  intro_price_cents?: number | null;
  intro_duration_days?: number | null;
  ongoing_price_cents: number | null;
  speed_tier: number | null;
  confidence_score?: number | null;
  effective_monthly_cents?: number | null;
  promo_expires_at?: string | null;
  [key: string]: unknown;
}

export interface PlansResponse {
  ok: boolean;
  rows: Plan[];
}

export interface PagedPlansResponse extends PlansResponse {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8787';

/**
 * Custom hook for fetching plans with React Query caching
 * Automatically deduplicates requests and caches results
 * 
 * Usage:
 *   const { data, isLoading, error } = usePlans({ speed: '100' });
 */
export function usePlans(
  filters?: Record<string, string | number>,
  options?: UseQueryOptions<PlansResponse>
): UseQueryResult<PlansResponse> {
  const queryKey = ['plans', filters];
  
  const fetchPlans = async (): Promise<PlansResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const url = `${API_BASE_URL}/api/plans${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch plans: ${response.statusText}`);
    }
    
    return response.json();
  };

  return useQuery({
    queryKey,
    queryFn: fetchPlans,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    ...options,
  });
}

/**
 * Custom hook for fetching paginated plans
 * 
 * Usage:
 *   const { data, isLoading, error } = usePagedPlans(0, 20, { speed: '100' });
 */
export function usePagedPlans(
  page: number = 0,
  pageSize: number = 20,
  filters?: Record<string, string | number>,
  options?: UseQueryOptions<PagedPlansResponse>
): UseQueryResult<PagedPlansResponse> {
  const queryKey = ['plans-paged', page, pageSize, filters];
  
  const fetchPagedPlans = async (): Promise<PagedPlansResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const url = `${API_BASE_URL}/api/plans/paginated?${params.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch paginated plans: ${response.statusText}`);
    }
    
    return response.json();
  };

  return useQuery({
    queryKey,
    queryFn: fetchPagedPlans,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: page >= 0 && pageSize > 0, // Only run query if params are valid
    ...options,
  });
}

/**
 * Custom hook for fetching a single plan's details
 */
export function usePlan(
  planId: number,
  options?: UseQueryOptions<Plan>
): UseQueryResult<Plan> {
  const queryKey = ['plan', planId];
  
  const fetchPlan = async (): Promise<Plan> => {
    const response = await fetch(`${API_BASE_URL}/api/plans/${planId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch plan: ${response.statusText}`);
    }
    
    return response.json();
  };

  return useQuery({
    queryKey,
    queryFn: fetchPlan,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: planId > 0,
    ...options,
  });
}

export default usePlans;
