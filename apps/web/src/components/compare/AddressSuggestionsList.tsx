import React from "react";

interface AddressResult {
  id: string;
  formattedAddress: string;
}

interface AddressSuggestionsListProps {
  suggestions: AddressResult[];
  highlightedIndex: number;
  onSelectAddress: (address: AddressResult) => void;
  onHighlightIndex: (index: number) => void;
}

export function AddressSuggestionsList({
  suggestions,
  highlightedIndex,
  onSelectAddress,
  onHighlightIndex,
}: AddressSuggestionsListProps) {
  return (
    <div id="address-suggestions" role="listbox" className="address-suggestions">
      {suggestions.map((addr, index) => (
        <div
          key={addr.id}
          onClick={() => onSelectAddress(addr)}
          onMouseEnter={() => onHighlightIndex(index)}
          role="option"
          aria-selected={highlightedIndex === index}
          className={`address-suggestion-item ${highlightedIndex === index ? "address-suggestion-item--active" : ""}`}
        >
          📍 {addr.formattedAddress}
        </div>
      ))}
    </div>
  );
}
