// /app/frontend/src/components/EconomyPortal.js
/**
 * ENLIGHTEN.MINT.CAFE - Tiered Pay Scale & Economy Portal
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Shows users their savings with the 20% below market rate.
 * Links to the Multimedia Creator for machine time tracking.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, Zap, Crown, Sparkles, Calculator, Clock, Shield } from 'lucide-react';

const TieredPayScale = ({ 
  currentTier = 'NOVICE',
  machineTime = 0,
  onUpgradeClick,
}) => {
  const [economy, setEconomy] = useState({
    market: 50.00,
    baseRate: 40.00,  // 20% below market
    yourRate: 40.00,
    savings: 10.00,
    tierDiscount: 0,
  });

  // Tier multipliers (additional discounts)
  const tierConfig = {
    NOVICE: { label: 'Novice', multiplier: 1.0, color: '#86efac', icon: Zap, discount: '0%' },
    SOVEREIGN: { label: 'Sovereign', multiplier: 0.9, color: '#fbbf24', icon: Sparkles, discount: '10%' },
    ENLIGHTENED: { label: 'Enlightened', multiplier: 0.8, color: '#a78bfa', icon: Crown, discount: '20%' },
  };

  const currentTierConfig = tierConfig[currentTier] || tierConfig.NOVICE;
  const TierIcon = currentTierConfig.icon;

  // Calculate rates based on tier
  useEffect(() => {
    const market = 50.00;
    const baseRate = market * 0.80; // 20% below market
    const yourRate = baseRate * currentTierConfig.multiplier;
    const savings = market - yourRate;
    const tierDiscount = baseRate - yourRate;

    setEconomy({
      market,
      baseRate,
      yourRate: parseFloat(yourRate.toFixed(2)),
      savings: parseFloat(savings.toFixed(2)),
      tierDiscount: parseFloat(tierDiscount.toFixed(2)),
    });
  }, [currentTier, currentTierConfig.multiplier]);

  // Calculate machine cost
  const machineHours = machineTime / 3600;
  const machineCost = (machineHours * economy.yourRate).toFixed(2);
  const marketCost = (machineHours * economy.market).toFixed(2);
  const totalSaved = (marketCost - machineCost).toFixed(2);

  return (
    <div className="main-wrapper">
      <div className="economy-card-green" style={{
        background: 'rgba(10, 15, 10, 0.95)',
        border: '1px solid rgba(134, 239, 172, 0.3)',
        borderRadius: '20px',
        padding: '28px',
        backdropFilter: 'blur(20px)',
        maxWidth: '480px',
      }}>
        {/* Header */}
        <header style={{
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(134, 239, 172, 0.15)',
        }}>
          <span className="wisdom-tag" style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '12px',
            background: 'rgba(134, 239, 172, 0.1)',
            color: '#86efac',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            SOVEREIGN ECONOMY
          </span>
          <h2 style={{
            color: '#f8fafc',
            fontSize: '24px',
            fontWeight: 600,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Calculator size={24} color="#86efac" />
            Machine Access
          </h2>
        </header>

        {/* Rate Display */}
        <div className="rate-display" style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <p className="market-compare" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <span style={{ color: '#666', fontSize: '14px' }}>Market Average:</span>
            <span style={{ 
              color: '#ef4444', 
              fontSize: '18px',
              textDecoration: 'line-through',
              opacity: 0.7,
            }}>
              ${economy.market.toFixed(2)}/hr
            </span>
          </p>
          
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="enlighten-rate"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: 'rgba(134, 239, 172, 0.1)',
              borderRadius: '12px',
              marginBottom: '12px',
            }}
          >
            <span style={{ color: '#86efac', fontSize: '14px' }}>Your Rate:</span>
            <span style={{ 
              color: '#22c55e', 
              fontSize: '28px',
              fontWeight: 700,
            }}>
              ${economy.yourRate}/hr
            </span>
          </motion.div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '8px',
          }}>
            <TrendingDown size={16} color="#22c55e" />
            <span style={{ color: '#22c55e', fontSize: '13px' }}>
              20% Competitive Reduction Applied
            </span>
          </div>

          {economy.tierDiscount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px',
              background: `${currentTierConfig.color}15`,
              borderRadius: '8px',
              marginTop: '8px',
            }}>
              <TierIcon size={16} color={currentTierConfig.color} />
              <span style={{ color: currentTierConfig.color, fontSize: '13px' }}>
                +{currentTierConfig.discount} {currentTierConfig.label} Tier Bonus (saves ${economy.tierDiscount}/hr)
              </span>
            </div>
          )}
        </div>

        {/* Tier Benefit */}
        <div className="tier-benefit" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: `${currentTierConfig.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TierIcon size={20} color={currentTierConfig.color} />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Current Tier</div>
              <div style={{ fontSize: '16px', color: currentTierConfig.color, fontWeight: 600 }}>
                {currentTierConfig.label}
              </div>
            </div>
          </div>
          
          {currentTier === 'NOVICE' && (
            <button
              onClick={() => onUpgradeClick?.('SOVEREIGN')}
              style={{
                padding: '10px 16px',
                borderRadius: '20px',
                border: 'none',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: '#000',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={14} />
              Upgrade for extra 10% off
            </button>
          )}
          
          {currentTier === 'SOVEREIGN' && (
            <button
              onClick={() => onUpgradeClick?.('ENLIGHTENED')}
              style={{
                padding: '10px 16px',
                borderRadius: '20px',
                border: 'none',
                background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Crown size={14} />
              Ascend to Enlightened
            </button>
          )}
        </div>

        {/* Machine Time Stats (if applicable) */}
        {machineTime > 0 && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
          }}>
            <div style={{ 
              fontSize: '10px', 
              color: '#666', 
              textTransform: 'uppercase',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Clock size={12} />
              Current Session
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#666' }}>Time</div>
                <div style={{ fontSize: '18px', color: '#86efac', fontFamily: 'monospace' }}>
                  {machineHours.toFixed(2)}h
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#666' }}>Your Cost</div>
                <div style={{ fontSize: '18px', color: '#22c55e', fontFamily: 'monospace' }}>
                  ${machineCost}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#666' }}>Saved</div>
                <div style={{ fontSize: '18px', color: '#fbbf24', fontFamily: 'monospace' }}>
                  ${totalSaved}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trust Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px',
          background: 'rgba(34, 197, 94, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(34, 197, 94, 0.1)',
        }}>
          <Shield size={14} color="#22c55e" />
          <span style={{ fontSize: '11px', color: '#666' }}>
            SHA-256 Secured • Ledger Audited • 80/20 Community Split
          </span>
        </div>
      </div>
    </div>
  );
};

export default TieredPayScale;
