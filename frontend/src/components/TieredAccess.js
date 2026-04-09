// /app/frontend/src/components/TieredAccess.js
/**
 * ENLIGHTEN.MINT.CAFE - User Tier Portal (Access Control)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Automatically hides or reveals content based on user tier.
 * Tiers: BASIC (Novice) → PRO (Sovereign) → ULTRA (Enlightened)
 */
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Sparkles, Crown, Zap, ArrowRight } from 'lucide-react';

// Tier definitions with access rights
const TIERS = {
  BASIC: { 
    label: 'Novice', 
    icon: Zap,
    color: '#86efac',
    access: ['174Hz', '285Hz', 'BasicMeditation', 'DailyOracle'],
    description: 'Foundation frequencies and basic practices',
  },
  PRO: { 
    label: 'Sovereign', 
    icon: Sparkles,
    color: '#fbbf24',
    access: ['174Hz', '285Hz', '396Hz', '417Hz', '432Hz', 'CosmicMap', 'GuidedMeditation', 'TarotReading', 'CrystalPairing'],
    description: 'Full Solfeggio spectrum + cosmic navigation',
  },
  ULTRA: { 
    label: 'Enlightened', 
    icon: Crown,
    color: '#a78bfa',
    access: ['ALL'],
    description: 'Unlimited access to all frequencies and features',
  }
};

const TieredAccess = ({ 
  userTier = 'BASIC', 
  moduleContent = [],
  onUpgradeClick,
  onJourneyClick,
}) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  // Check if user has access to a feature
  const hasAccess = useCallback((featureId) => {
    const tierConfig = TIERS[userTier] || TIERS.BASIC;
    return tierConfig.access.includes(featureId) || tierConfig.access.includes('ALL');
  }, [userTier]);

  // Get required tier for a locked feature
  const getRequiredTier = useCallback((featureId) => {
    for (const [tierName, tierConfig] of Object.entries(TIERS)) {
      if (tierConfig.access.includes(featureId) || tierConfig.access.includes('ALL')) {
        return { name: tierName, ...tierConfig };
      }
    }
    return TIERS.PRO;
  }, []);

  const TierIcon = TIERS[userTier]?.icon || Zap;

  return (
    <div className="tiered-access-container">
      {/* Current Tier Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        padding: '16px 20px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        border: `1px solid ${TIERS[userTier]?.color || '#86efac'}40`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: `${TIERS[userTier]?.color || '#86efac'}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <TierIcon size={20} color={TIERS[userTier]?.color || '#86efac'} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Current Tier
            </div>
            <div style={{ fontSize: '16px', color: TIERS[userTier]?.color || '#86efac', fontWeight: 600 }}>
              {TIERS[userTier]?.label || 'Novice'}
            </div>
          </div>
        </div>
        {userTier !== 'ULTRA' && (
          <button
            onClick={() => onUpgradeClick?.(userTier === 'BASIC' ? 'PRO' : 'ULTRA')}
            style={{
              padding: '8px 16px',
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
            Upgrade
          </button>
        )}
      </div>

      {/* Tier Grid */}
      <div className="tier-grid">
        {moduleContent.map((item, index) => {
          const unlocked = hasAccess(item.id);
          const requiredTier = !unlocked ? getRequiredTier(item.id) : null;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`access-card ${unlocked ? 'unlocked' : 'locked'}`}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: unlocked 
                  ? 'rgba(255, 255, 255, 0.03)' 
                  : 'rgba(0, 0, 0, 0.2)',
                border: unlocked 
                  ? '1px solid rgba(134, 239, 172, 0.3)' 
                  : '1px dashed rgba(100, 100, 100, 0.3)',
                borderRadius: '15px',
                padding: '25px',
                textAlign: 'center',
                filter: unlocked ? 'none' : 'grayscale(0.8)',
                opacity: unlocked ? 1 : 0.6,
                transition: 'all 0.3s ease',
                transform: hoveredCard === item.id ? 'translateY(-4px)' : 'translateY(0)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Lock/Unlock Icon */}
              <div style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: unlocked ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 100, 100, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {unlocked ? (
                  <Unlock size={14} color="#22c55e" />
                ) : (
                  <Lock size={14} color="#666" />
                )}
              </div>

              {/* Content */}
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: unlocked 
                  ? `linear-gradient(135deg, ${item.color || '#86efac'}40 0%, ${item.color || '#86efac'}20 100%)`
                  : 'rgba(50, 50, 50, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '24px',
              }}>
                {item.icon || '✦'}
              </div>

              <h4 style={{
                color: unlocked ? '#f8fafc' : '#666',
                fontSize: '16px',
                fontWeight: 600,
                marginBottom: '8px',
              }}>
                {item.name}
              </h4>

              {item.description && (
                <p style={{
                  color: '#666',
                  fontSize: '12px',
                  marginBottom: '16px',
                  lineHeight: 1.5,
                }}>
                  {item.description}
                </p>
              )}

              {/* Action Button */}
              {!unlocked ? (
                <button
                  className="upgrade-btn"
                  onClick={() => onUpgradeClick?.(requiredTier?.name)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #FFD700 0%, #f59e0b 100%)',
                    color: '#000',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Lock size={12} />
                  Unlock with {requiredTier?.label}
                </button>
              ) : (
                <button
                  className="journey-btn"
                  onClick={() => onJourneyClick?.(item)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '20px',
                    border: '1px solid rgba(134, 239, 172, 0.4)',
                    background: 'rgba(134, 239, 172, 0.1)',
                    color: '#86efac',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Begin Journey
                  <ArrowRight size={14} />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TieredAccess;
export { TIERS };
