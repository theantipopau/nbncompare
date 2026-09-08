import React from "react";

export interface CompareHeroPresetOption {
  name: string;
  description: string;
}

interface CompareHeroProps {
  heroStats: {
    plans: number;
    providers: number;
    cheapest: string | null;
    topSpeed: number | null;
  };
  activeHeroNotes: string[];
  heroPresets: CompareHeroPresetOption[];
  activePreset: string;
  onPresetSelect: (presetName: string) => void;
  onScrollToAddress: () => void;
  onTuneFilters: () => void;
  onBrowsePlans: () => void;
}

export function CompareHero({
  heroStats,
  activeHeroNotes,
  heroPresets,
  activePreset,
  onPresetSelect,
  onScrollToAddress,
  onTuneFilters,
  onBrowsePlans,
}: CompareHeroProps) {
  return (
    <>
      <section className="hero-section">
        <div className="hero-section__content">
          <div className="hero-section__copy">
            <span className="hero-section__eyebrow">Daily plan intelligence</span>
            <h1>Find the right NBN plan faster</h1>
            <p>
              Check your address, tune the shortlist, and compare providers with clear
              pricing, trust signals, and speed-focused presets.
            </p>
            <div className="hero-section__badges">
              <span>Refreshed throughout the day</span>
              <span>No account required</span>
              <span>Built for Australian households</span>
            </div>
            <div className="hero-section__actions">
              <button type="button" className="btn-primary" onClick={onScrollToAddress}>
                Check your address
              </button>
              <button type="button" className="btn-secondary" onClick={onTuneFilters}>
                Tune filters
              </button>
              <button type="button" className="btn-secondary" onClick={onBrowsePlans}>
                Browse plans
              </button>
            </div>
          </div>

          <aside className="hero-section__panel" aria-label="Current comparison overview">
            <div className="hero-panel__header">
              <strong>Comparison snapshot</strong>
              <span>{heroStats.providers} providers in view</span>
            </div>
            <div className="hero-stats hero-stats--compact">
              <div className="hero-stat-card">
                <span className="hero-stat-label">Active plans</span>
                <span className="hero-stat-value">{heroStats.plans}</span>
                <span className="hero-stat-note">Filtered result count</span>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-label">Cheapest</span>
                <span className="hero-stat-value">{heroStats.cheapest ? `$${heroStats.cheapest}` : "TBC"}</span>
                <span className="hero-stat-note">Current lowest monthly price</span>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-label">Top speed</span>
                <span className="hero-stat-value">{heroStats.topSpeed ? `${heroStats.topSpeed}Mbps` : "TBC"}</span>
                <span className="hero-stat-note">Fastest tier available now</span>
              </div>
            </div>
            <div className="hero-section__notes">
              {activeHeroNotes.map((note) => (
                <span key={note} className="hero-section__note-pill">
                  {note}
                </span>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <div className="preset-toolbar preset-toolbar--hero">
        {heroPresets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onPresetSelect(preset.name)}
            className={`preset-button preset-button--hero ${activePreset === preset.name ? "active" : ""}`}
          >
            <strong>{preset.name}</strong>
            <span>{preset.description}</span>
          </button>
        ))}
      </div>
    </>
  );
}
