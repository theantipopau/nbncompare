import React from 'react';

const { createContext, useContext, useState } = React;

type ReactNode = React.ReactNode;

export interface Plan {
  id: string;
  provider_name: string;
  plan_name: string;
  speed_tier: number;
  ongoing_price_cents: number;
  intro_price_cents?: number;
  intro_duration_days?: number;
  upload_speed_mbps?: number;
  data_allowance?: string;
  contract_type?: string;
  modem_included?: boolean;
  setup_fee_cents?: number;
  typical_evening_speed_mbps?: number;
  technology_type?: string;
  service_type?: string;
  promo_code?: string;
  favicon_url?: string;
  provider_ipv6_support?: number;
  provider_cgnat?: number;
  provider_australian_support?: number;
}

interface ComparisonContextType {
  comparedPlans: Plan[];
  addToComparison: (plan: Plan) => void;
  removeFromComparison: (planId: string) => void;
  clearComparison: () => void;
  isComparing: (planId: string) => boolean;
}

const ComparisonContext = createContext(undefined as ComparisonContextType | undefined);

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

interface ComparisonProviderProps {
  children: ReactNode;
}

export const ComparisonProvider: React.FC<ComparisonProviderProps> = ({ children }) => {
  const [comparedPlans, setComparedPlans] = useState([] as Plan[]);

  const addToComparison = (plan: Plan) => {
    setComparedPlans((prev: Plan[]) => {
      // Max 4 plans
      if (prev.length >= 4) {
        alert('You can compare up to 4 plans at once. Remove one to add another.');
        return prev;
      }
      // Don't add duplicates
      if (prev.some((p: Plan) => p.id === plan.id)) {
        return prev;
      }
      return [...prev, plan];
    });
  };

  const removeFromComparison = (planId: string) => {
    setComparedPlans((prev: Plan[]) => prev.filter((p: Plan) => p.id !== planId));
  };

  const clearComparison = () => {
    setComparedPlans([]);
  };

  const isComparing = (planId: string) => {
    return comparedPlans.some((p: Plan) => p.id === planId);
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparedPlans,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isComparing,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};
