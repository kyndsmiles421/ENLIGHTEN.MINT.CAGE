import React from 'react';
import { motion } from 'framer-motion';
import {
  Crown, Lock, Loader2, ShoppingCart, Package,
  AlertTriangle, Compass, ArrowUpRight,
} from 'lucide-react';
import { SUB_COLORS, TIER_DISPLAY } from './SuanpanCore';

// ━━━ Speed Bridge Modal (4 Tiers) ━━━
export function SpeedBridgeModal({ currentTier, onUpgrade, onClose }) {
  const tiers = [
    { key: 'discovery', name: 'Discovery', price: 'Free', color: '#94A3B8', cap: '3 tracks', features: ['Basic Tones', '44.1kHz Stereo', '5 AI Credits/mo', '15-30s Assembly'] },
    { key: 'player', name: 'Player', price: '$9.99/mo', color: '#2DD4BF', cap: '8 tracks', features: ['Extended Library', '48kHz Hi-Fi', '40 AI Credits/mo', '5-8s Loading'] },
    { key: 'ultra_player', name: 'Ultra Player', price: '$24.99/mo', color: '#C084FC', cap: '20 tracks', features: ['3,000+ Effects', '88.2kHz Lossless', '150 AI Credits/mo', '2-3s Stabilization'] },
    { key: 'sovereign', name: 'Sovereign', price: '$49.99/mo', color: '#EAB308', cap: 'Unlimited', features: ['Full Phonic', '96kHz Spatial', '250+ Credits + NPU', 'Instant'] },
  ];
  const tierOrder = ['discovery', 'player', 'ultra_player', 'sovereign'];
  const currentIdx = tierOrder.indexOf(currentTier);

  return (
    <motion.div className="fixed inset-0 z-[10002] flex items-center justify-center"
      style={{ background: 'transparent', backdropFilter: 'none'}}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      data-testid="speed-bridge-modal">
      <motion.div className="w-full max-w-2xl mx-4 rounded-2xl overflow-hidden"
        style={{ background: 'rgba(0,0,0,0)', border: '1px solid rgba(248,250,252,0.06)' }}
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>

        <div className="p-5 text-center border-b" style={{ borderColor: 'rgba(248,250,252,0.05)' }}>
          <p className="text-[9px] tracking-[0.2em] uppercase mb-1" style={{ color: '#EAB308' }}>Speed Bridge</p>
          <p className="text-base font-light" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Cormorant Garamond, serif' }}>
            Your composition has reached Divine Complexity
          </p>
          <p className="text-[8px] mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Upgrade for more layers, faster rendering, and expanded libraries
          </p>
        </div>

        <div className="p-4 grid grid-cols-4 gap-2">
          {tiers.map((t, i) => {
            const isCurrent = t.key === currentTier;
            const isUpgrade = i > currentIdx;
            return (
              <div key={t.key} className="rounded-xl p-3 text-center flex flex-col"
                style={{ background: isCurrent ? `${t.color}06` : 'rgba(248,250,252,0.015)', border: `1px solid ${isCurrent ? `${t.color}25` : 'rgba(248,250,252,0.04)'}` }}
                data-testid={`tier-card-${t.key}`}>
                <p className="text-[10px] font-medium tracking-wider" style={{ color: t.color }}>{t.name}</p>
                <p className="text-[11px] font-light mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{t.price}</p>
                <p className="text-[8px] font-mono mt-1" style={{ color: `${t.color}80` }}>{t.cap}</p>
                <div className="mt-2 space-y-0.5 flex-1">
                  {t.features.map((f, fi) => <p key={fi} className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{f}</p>)}
                </div>
                {isCurrent && (
                  <p className="text-[7px] mt-2 px-2 py-0.5 rounded-full inline-block mx-auto"
                    style={{ background: `${t.color}12`, color: t.color }}>Current</p>
                )}
                {isUpgrade && (
                  <motion.button className="mt-2 px-3 py-1 rounded-full text-[8px] font-medium cursor-pointer mx-auto"
                    style={{ background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}25` }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => onUpgrade(t.key)} data-testid={`upgrade-to-${t.key}`}>
                    Upgrade <ArrowUpRight size={8} className="inline ml-0.5" />
                  </motion.button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 text-center border-t" style={{ borderColor: 'rgba(248,250,252,0.05)' }}>
          <button className="text-[8px] px-4 py-1.5 rounded-full cursor-pointer"
            style={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(248,250,252,0.02)' }}
            onClick={onClose} data-testid="close-speed-bridge">
            Continue with {TIER_DISPLAY[currentTier] || 'Current'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ━━━ Bonus Pack Card ━━━
export function BonusPackCard({ pack, onPurchase, purchasing }) {
  const tierColor = SUB_COLORS[pack.tier_required] || '#94A3B8';
  return (
    <motion.div className="rounded-xl p-3 mb-2 relative overflow-hidden"
      style={{
        background: pack.owned ? `${pack.color}06` : 'rgba(248,250,252,0.015)',
        border: `1px solid ${pack.owned ? `${pack.color}20` : pack.tier_locked ? 'rgba(248,250,252,0.03)' : 'rgba(248,250,252,0.06)'}`,
        opacity: pack.tier_locked ? 0.5 : 1,
      }}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      data-testid={`bonus-pack-${pack.id}`}>

      {pack.owned && (
        <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ boxShadow: `inset 0 0 16px ${pack.color}10` }}
          animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
      )}

      <div className="flex items-start gap-2 relative z-10">
        <div className="p-1.5 rounded-lg" style={{ background: `${pack.color}12` }}>
          <Package size={12} style={{ color: pack.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium" style={{ color: '#F8FAFC' }}>{pack.name}</p>
          <p className="text-[7px] mt-0.5 line-clamp-2" style={{ color: 'rgba(255,255,255,0.65)' }}>{pack.description}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[6px] px-1.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: `${tierColor}12`, color: tierColor, border: `1px solid ${tierColor}20` }}>
              {(pack.tier_required || '').replace('_', ' ')}
            </span>
            <span className="text-[7px] font-mono" style={{ color: '#22C55E' }}>
              {pack.bonus_wrap?.label}
            </span>
            <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {pack.tracks_included} tracks
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          {pack.tier_locked ? (
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)' }}>
              <Crown size={11} style={{ color: tierColor }} />
            </div>
          ) : pack.owned ? (
            <p className="text-[7px] px-2 py-0.5 rounded-full" style={{ background: `${pack.color}12`, color: pack.color }}>Owned</p>
          ) : (
            <motion.button className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer"
              style={{
                background: pack.can_afford ? `${pack.color}10` : 'rgba(248,250,252,0.02)',
                border: `1px solid ${pack.can_afford ? `${pack.color}20` : 'rgba(248,250,252,0.04)'}`,
                opacity: pack.can_afford ? 1 : 0.5,
              }}
              whileHover={pack.can_afford ? { scale: 1.05 } : {}} whileTap={pack.can_afford ? { scale: 0.95 } : {}}
              onClick={() => pack.can_afford && onPurchase(pack.id)}
              disabled={purchasing || !pack.can_afford}
              data-testid={`buy-pack-${pack.id}`}>
              {purchasing ? <Loader2 size={9} className="animate-spin" style={{ color: pack.color }} />
                : <ShoppingCart size={9} style={{ color: pack.can_afford ? pack.color : 'rgba(255,255,255,0.6)' }} />}
              <span className="text-[8px] font-mono" style={{ color: pack.can_afford ? pack.color : 'rgba(255,255,255,0.6)' }}>
                {pack.price_credits}c
              </span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ━━━ Hexagram Recommendation Card ━━━
export function RecommendationCard({ rec, onPurchase, purchasing }) {
  const isStagnation = rec.type === 'stagnation';
  const isActive = rec.tone === 'active';
  const borderColor = isStagnation ? '#EF4444' : rec.pack_color || '#C084FC';

  return (
    <motion.div className="rounded-xl p-3 mb-2 relative overflow-hidden"
      style={{
        background: isStagnation ? 'rgba(239,68,68,0.04)' : `${rec.pack_color}04`,
        border: `1px solid ${isStagnation ? 'rgba(239,68,68,0.15)' : `${rec.pack_color}15`}`,
      }}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      data-testid={`rec-card-${rec.type}`}>

      <div className="flex items-start gap-2">
        <div className="p-1.5 rounded-lg" style={{ background: `${borderColor}12` }}>
          {isStagnation ? <AlertTriangle size={12} style={{ color: '#EF4444' }} />
            : <Compass size={12} style={{ color: borderColor }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[7px] uppercase tracking-wider font-medium"
              style={{ color: isStagnation ? '#EF4444' : `${borderColor}80` }}>
              {rec.trigram}
            </p>
            <span className="text-[6px] px-1 py-0.5 rounded-full"
              style={{ background: isActive ? `${borderColor}15` : 'rgba(248,250,252,0.03)',
                       color: isActive ? borderColor : 'rgba(255,255,255,0.65)' }}>
              {isActive ? 'RECOMMENDED' : 'IN YOUR KIT'}
            </span>
          </div>
          <p className="text-[10px] font-medium mt-0.5" style={{ color: '#F8FAFC' }}>{rec.pack_name}</p>
          <p className="text-[7px] mt-0.5" style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.6)' }}>
            {rec.message}
          </p>
          {rec.bonus_wrap && (
            <span className="text-[6px] font-mono mt-1 inline-block" style={{ color: '#22C55E' }}>
              {rec.bonus_wrap.label}
            </span>
          )}
        </div>
        {isActive && !rec.owned && (
          <motion.button className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer flex-shrink-0"
            style={{ background: `${borderColor}12`, border: `1px solid ${borderColor}20` }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onPurchase(rec.pack_id)}
            disabled={purchasing}
            data-testid={`rec-buy-${rec.pack_id}`}>
            {purchasing ? <Loader2 size={9} className="animate-spin" style={{ color: borderColor }} />
              : <ShoppingCart size={9} style={{ color: borderColor }} />}
            <span className="text-[7px] font-mono" style={{ color: borderColor }}>{rec.price_credits}c</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
