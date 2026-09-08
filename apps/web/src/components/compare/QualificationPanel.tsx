import React from "react";

interface ServiceQualification {
  serviceType: string;
  techType: string;
  maxSpeed: number;
  available: boolean;
}

interface QualificationPanelProps {
  qualification: ServiceQualification;
}

export function QualificationPanel({ qualification }: QualificationPanelProps) {
  const techLabel =
    qualification.techType === "FTTP"
      ? "🚀 FTTP"
      : qualification.techType === "FTTC"
        ? "📶 FTTC"
        : qualification.techType === "FTTN"
          ? "📡 FTTN"
          : qualification.techType === "HFC"
            ? "📺 HFC"
            : qualification.techType === "Fixed Wireless"
              ? "📡 Fixed Wireless"
              : qualification.techType === "Satellite"
                ? "🛰️ Satellite"
                : qualification.techType;

  return (
    <div className="qualification-panel">
      <div className="qualification-panel__grid">
        <div>
          <div className="qualification-panel__label">Technology Type</div>
          <div className="qualification-panel__value">{techLabel}</div>
        </div>
        <div>
          <div className="qualification-panel__label">Max Speed Available</div>
          <div className="qualification-panel__value">{qualification.maxSpeed}Mbps</div>
        </div>
      </div>

      {qualification.techType === "FTTP" && (
        <div className="qualification-tip qualification-tip--fttp">
          <div className="qualification-tip__title">💡 FTTP (Fiber to the Premises)</div>
          <div className="qualification-tip__text">
            Your premises can achieve speeds up to 2 Gigabit. You may need a free NBN NTD
            upgrade to reach gigabit speeds.
          </div>
        </div>
      )}

      {qualification.techType === "Fixed Wireless" && (
        <div className="qualification-tip qualification-tip--wireless">
          <div className="qualification-tip__title">📡 Fixed Wireless Service</div>
          <div className="qualification-tip__text">
            Plans are optimized for your location. Check Fixed Wireless and satellite filters
            for all available options.
          </div>
        </div>
      )}

      {qualification.techType === "Satellite" && (
        <div className="qualification-tip qualification-tip--satellite">
          <div className="qualification-tip__title">🛰️ Satellite Service</div>
          <div className="qualification-tip__text">
            Your area is serviced by satellite NBN. Latency is higher but speeds are available
            to remote areas.
          </div>
        </div>
      )}
    </div>
  );
}
