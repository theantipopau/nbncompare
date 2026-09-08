import React from "react";
import { stripHtml } from "../../lib/planDisplay";

interface ComparePlan {
  id: number;
  plan_name: string;
  provider_name: string;
  intro_price_cents?: number | null;
  intro_duration_days?: number | null;
  ongoing_price_cents: number | null;
  speed_tier: number | null;
  source_url?: string | null;
  contract_type?: string;
  data_allowance?: string;
  modem_included?: number;
  technology_type?: string;
  upload_speed_mbps?: number | null;
  price_trend?: 'up' | 'down' | null;
}

interface FloatingCompareBarProps {
  comparePlans: ComparePlan[];
  showModal: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onToggleCompare: (planId: number) => void;
}

function PriceTrendTag({ trend }: { trend?: 'up' | 'down' | null }) {
  if (!trend) return null;
  return (
    <span className={`price-trend price-trend--${trend}`} title={trend === 'down' ? 'Price decreased' : 'Price increased'}>
      {trend === 'down' ? '↓' : '↑'}
    </span>
  );
}

export function FloatingCompareBar({
  comparePlans,
  showModal,
  onOpenModal,
  onCloseModal,
  onToggleCompare,
}: FloatingCompareBarProps) {
  if (comparePlans.length === 0 && !showModal) return null;

  return (
    <>
      {comparePlans.length > 0 && (
        <div className="floating-compare-button">
          <button onClick={onOpenModal}>Compare ({comparePlans.length})</button>
        </div>
      )}

      {showModal && (
        <div className="compare-modal-backdrop" onClick={onCloseModal}>
          <div className="compare-modal" onClick={(e) => e.stopPropagation()}>
            <div className="compare-modal__header">
              <h2>Compare Plans</h2>
              <button className="compare-modal__close" onClick={onCloseModal}>
                Close
              </button>
            </div>

            <div className="compare-modal__grid">
              {comparePlans.map((plan) => (
                <div key={plan.id} className="compare-modal__card">
                  <h3 className="compare-modal__provider">{plan.provider_name}</h3>
                  <p className="compare-modal__plan-name">{stripHtml(plan.plan_name)}</p>

                  <div className="compare-modal__price-block">
                    <div className="compare-modal__section-label">Price</div>
                    {plan.intro_price_cents ? (
                      <div>
                        <div className="compare-modal__price compare-modal__price--intro">
                          ${(plan.intro_price_cents / 100).toFixed(2)}/mo
                          <PriceTrendTag trend={plan.price_trend} />
                        </div>
                        <div className="compare-modal__price-note">
                          for {Math.round(plan.intro_duration_days! / 30)} months
                        </div>
                        <div className="compare-modal__price-strike">
                          then ${(plan.ongoing_price_cents! / 100).toFixed(2)}/mo
                        </div>
                      </div>
                    ) : (
                      <div className="compare-modal__price">
                        ${(plan.ongoing_price_cents! / 100).toFixed(2)}/mo
                        <PriceTrendTag trend={plan.price_trend} />
                      </div>
                    )}
                  </div>

                  <div className="compare-modal__details">
                    <div className="compare-modal__detail-row">
                      <div className="compare-modal__section-label">Speed</div>
                      <div className="compare-modal__detail-value">
                        NBN {plan.speed_tier} Mbps
                        {plan.upload_speed_mbps && ` / ${plan.upload_speed_mbps}↑`}
                      </div>
                    </div>

                    <div className="compare-modal__detail-row">
                      <div className="compare-modal__section-label">Contract</div>
                      <div className="compare-modal__detail-value">{plan.contract_type || 'Month-to-month'}</div>
                    </div>

                    <div className="compare-modal__detail-row">
                      <div className="compare-modal__section-label">Data</div>
                      <div className="compare-modal__detail-value">{plan.data_allowance || 'Unlimited'}</div>
                    </div>

                    <div className="compare-modal__detail-row">
                      <div className="compare-modal__section-label">Modem</div>
                      <div className="compare-modal__detail-value">{plan.modem_included === 1 ? 'Included' : 'BYO'}</div>
                    </div>

                    {plan.technology_type === 'fixed-wireless' && (
                      <div className="compare-modal__detail-row">
                        <div className="compare-modal__wireless-tag">📡 Fixed Wireless</div>
                      </div>
                    )}
                  </div>

                  <div className="compare-modal__actions">
                    {plan.source_url && (
                      <a href={plan.source_url} target="_blank" rel="noopener noreferrer" className="compare-modal__view-link">
                        View Plan Details →
                      </a>
                    )}
                    <button onClick={() => onToggleCompare(plan.id)} className="compare-modal__remove-btn">
                      Remove from comparison
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
