import React from "react";

interface PaginationControlsProps {
  currentPage: number;
  loading: boolean;
  totalPages?: number;
  totalCount?: number;
  hasNextPage?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function PaginationControls({
  currentPage,
  loading,
  totalPages,
  totalCount,
  hasNextPage,
  onPrevious,
  onNext,
}: PaginationControlsProps) {
  return (
    <div className="pagination-controls">
      <button
        onClick={onPrevious}
        disabled={currentPage === 0 || loading}
        className="pagination-controls__button"
      >
        ← Previous
      </button>

      <div className="pagination-controls__status">
        <span>Page <strong>{currentPage + 1}</strong></span>
        {totalPages != null && <span>of <strong>{totalPages || 1}</strong></span>}
        {totalCount != null && (
          <span className="pagination-controls__total">
            ({totalCount} total {totalCount === 1 ? 'plan' : 'plans'})
          </span>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!hasNextPage || loading}
        className="pagination-controls__button"
      >
        Next →
      </button>
    </div>
  );
}
