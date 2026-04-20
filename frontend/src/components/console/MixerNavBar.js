/**
 * MixerNavBar.js — Bottom navigation tab bar with tier gating
 * Tools above user's tier show as locked with tier badge.
 * Tapping a locked tool shows upgrade prompt (no modals — inline).
 */
import React from 'react';
import { Maximize2, Lock } from 'lucide-react';
import { TOOL_TABS, TIER_NAMES, TIER_COLORS } from './constants';

export default function MixerNavBar({ activePanel, togglePanel, isRecording, setIsFullscreen, userTierNum = 1, userRole = 'user' }) {
  const isPrivileged = userRole === 'admin' || userRole === 'creator' || userRole === 'council';
  const effectiveTier = isPrivileged ? 4 : userTierNum;

  return (
    <div data-testid="mixer-nav" className="sovereign-icons"
      style={{ height: 52, minHeight: 52, background: '#060610', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center' }}>
      {TOOL_TABS.map(tab => {
        const isLocked = effectiveTier < tab.minTier;
        const unlockTier = TIER_NAMES[tab.minTier] || 'SOVEREIGN';
        const unlockColor = TIER_COLORS[unlockTier] || '#F59E0B';
        return (
          <button key={tab.key} onClick={() => togglePanel(tab.key)}
            className="flex-1 flex flex-col items-center justify-center active:scale-95 transition-all relative"
            style={{
              color: isLocked ? 'rgba(255,255,255,0.08)' : activePanel === tab.key ? tab.color : 'rgba(255,255,255,0.25)',
              height: '100%', minWidth: 0,
            }}
            data-testid={`tab-${tab.key}`}>
            {isLocked ? <Lock size={13} /> : <tab.icon size={16} />}
            <span className="text-[7px] font-bold mt-0.5 uppercase">{tab.label}</span>
            {isLocked && (
              <div className="absolute -top-1 -right-0.5 text-[5px] font-bold px-1 rounded-full"
                style={{ background: `${unlockColor}20`, color: unlockColor, border: `1px solid ${unlockColor}30` }}>
                {unlockTier.charAt(0)}
              </div>
            )}
            {!isLocked && activePanel === tab.key && <div style={{ width: 4, height: 4, borderRadius: '50%', background: tab.color, marginTop: 2 }} />}
          </button>
        );
      })}
      {isRecording && (
        <div className="flex items-center px-2">
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} className="animate-pulse" />
        </div>
      )}
      <button onClick={() => setIsFullscreen(true)}
        className="flex flex-col items-center justify-center px-2 active:scale-95"
        style={{ color: 'rgba(255,255,255,0.12)', height: '100%' }} data-testid="go-fullscreen">
        <Maximize2 size={12} />
      </button>
    </div>
  );
}
