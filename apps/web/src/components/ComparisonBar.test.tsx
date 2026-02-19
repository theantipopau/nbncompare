import { describe, it, expect, vi } from 'vitest';
import React, { useEffect } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComparisonProvider, useComparison } from '../context/ComparisonContext';
import { ComparisonBar } from './ComparisonBar';

const samplePlans = [
  { id: 'p1', provider_name: 'Provider A', plan_name: 'Plan A', speed_tier: 100, ongoing_price_cents: 9900 },
  { id: 'p2', provider_name: 'Provider B', plan_name: 'Plan B', speed_tier: 50, ongoing_price_cents: 5999 },
];

function Prepopulate({ plans, onOpen }: { plans: any[]; onOpen: () => void }) {
  const { addToComparison } = useComparison();
  useEffect(() => {
    plans.forEach(p => addToComparison(p));
  }, []);
  return <ComparisonBar onOpenModal={onOpen} darkMode={false} />;
}

describe('ComparisonBar', () => {
  it('does not render when there are no compared plans', () => {
    render(
      <ComparisonProvider>
        <ComparisonBar onOpenModal={() => {}} darkMode={false} />
      </ComparisonProvider>
    );

    expect(screen.queryByText(/Comparing/)).toBeNull();
  });

  it('renders when plans are present and supports clear + open actions', () => {
    const onOpen = vi.fn();

    render(
      <ComparisonProvider>
        <Prepopulate plans={samplePlans} onOpen={onOpen} />
      </ComparisonProvider>
    );

    expect(screen.getByText(/Comparing 2\/4/)).toBeInTheDocument();

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /Compare Plans/i }));
    expect(onOpen).toHaveBeenCalled();

    // Clear all
    fireEvent.click(screen.getByRole('button', { name: /Clear All/i }));
    expect(screen.queryByText(/Comparing/)).toBeNull();
  });
});