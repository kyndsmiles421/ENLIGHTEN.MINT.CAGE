/**
 * NebulaViewToggle.js — "Ascend to Nebula" Tier Transition Button
 * 
 * A subtle, elegant toggle that allows users to switch between:
 * - Parchment (Essential): Fast, accessible, 2D experience
 * - Nebula (Premium): Immersive 3D WebGL experience
 * 
 * Shows device capability status and respects user preference.
 * Parchment is ALWAYS the default — users must opt-in to Nebula.
 */

import React, { useState } from 'react';
import { Sparkles, FileText, AlertCircle, Battery, Cpu } from 'lucide-react';
import { useEnlightenmentCafe } from '../../context/EnlightenmentCafeContext';
import { useRenderTier } from '../../hooks/useRenderTier';

export default function NebulaViewToggle({ className = '', compact = false }) {
  const { viewTier, setViewTier, colorMode } = useEnlightenmentCafe();
  const { 
    isNebulaAvailable, 
    deviceTier, 
    deviceReason,
    batterySaverActive,
    isLoading,
  } = useRenderTier(viewTier);
  
  const [showTooltip, setShowTooltip] = useState(false);
  
  const isNebula = viewTier === 'nebula';
  const canAscend = isNebulaAvailable && !batterySaverActive;
  
  const handleToggle = () => {
    if (isNebula) {
      // Always allow descent to Parchment
      setViewTier('parchment');
    } else if (canAscend) {
      // Ascend to Nebula only if capable
      setViewTier('nebula');
    }
  };
  
  // Palette based on current mode
  const isDark = colorMode === 'dark' || isNebula;
  
  if (isLoading) {
    return (
      <div className={`nebula-toggle-skeleton ${className}`}>
        <div className="animate-pulse bg-gray-700/30 rounded-full h-10 w-32" />
      </div>
    );
  }
  
  // Compact version for navigation/dock
  if (compact) {
    return (
      <button
        onClick={handleToggle}
        disabled={!canAscend && !isNebula}
        className={`
          nebula-toggle-compact
          flex items-center gap-2 px-3 py-1.5 rounded-full
          transition-all duration-300 ease-out
          ${isNebula 
            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
            : isDark
              ? 'bg-amber-500/10 text-amber-400/80 border border-amber-500/20'
              : 'bg-amber-100 text-amber-700 border border-amber-200'
          }
          ${!canAscend && !isNebula ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        `}
        title={isNebula ? 'Return to Parchment' : canAscend ? 'Ascend to Nebula' : deviceReason}
        data-testid="nebula-toggle-compact"
      >
        {isNebula ? (
          <>
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-xs font-medium">Nebula</span>
          </>
        ) : (
          <>
            <FileText size={14} />
            <span className="text-xs font-medium">Parchment</span>
          </>
        )}
      </button>
    );
  }
  
  // Full version with capability info
  return (
    <div 
      className={`nebula-toggle-container relative ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Main Toggle Button */}
      <button
        onClick={handleToggle}
        disabled={!canAscend && !isNebula}
        className={`
          nebula-toggle-button
          relative flex items-center gap-3 px-5 py-3 rounded-2xl
          transition-all duration-500 ease-out
          ${isNebula 
            ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 shadow-lg shadow-indigo-500/20' 
            : isDark
              ? 'bg-gradient-to-r from-amber-900/20 to-amber-800/10 border border-amber-500/30'
              : 'bg-gradient-to-r from-amber-50 to-amber-100/80 border border-amber-200'
          }
          ${!canAscend && !isNebula ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
        `}
        data-testid="nebula-toggle"
      >
        {/* Icon */}
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          transition-all duration-500
          ${isNebula 
            ? 'bg-indigo-500/30 text-indigo-300' 
            : isDark
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-amber-200/50 text-amber-700'
          }
        `}>
          {isNebula ? (
            <Sparkles size={20} className="animate-pulse" />
          ) : (
            <FileText size={20} />
          )}
        </div>
        
        {/* Labels */}
        <div className="text-left">
          <div className={`
            text-sm font-semibold tracking-wide
            ${isNebula 
              ? 'text-indigo-200' 
              : isDark ? 'text-amber-300' : 'text-amber-800'
            }
          `}>
            {isNebula ? 'Nebula View' : 'Parchment View'}
          </div>
          <div className={`
            text-xs
            ${isNebula 
              ? 'text-indigo-400/70' 
              : isDark ? 'text-amber-500/70' : 'text-amber-600/70'
            }
          `}>
            {isNebula ? 'Tap to return to paper' : canAscend ? 'Tap to ascend' : 'Not available'}
          </div>
        </div>
        
        {/* Status indicator */}
        {!canAscend && !isNebula && (
          <div className="ml-2">
            {batterySaverActive ? (
              <Battery size={16} className="text-orange-400" />
            ) : (
              <AlertCircle size={16} className="text-gray-400" />
            )}
          </div>
        )}
      </button>
      
      {/* Capability Tooltip */}
      {showTooltip && !canAscend && !isNebula && (
        <div 
          className={`
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2
            px-4 py-3 rounded-xl
            ${isDark 
              ? 'bg-gray-900/95 border border-gray-700/50' 
              : 'bg-white border border-gray-200'
            }
            shadow-xl backdrop-blur-sm
            z-50 min-w-[240px]
          `}
        >
          <div className="flex items-start gap-3">
            <div className={`
              p-2 rounded-lg
              ${batterySaverActive ? 'bg-orange-500/20' : 'bg-gray-500/20'}
            `}>
              {batterySaverActive ? (
                <Battery size={16} className="text-orange-400" />
              ) : (
                <Cpu size={16} className="text-gray-400" />
              )}
            </div>
            <div>
              <div className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {batterySaverActive ? 'Battery Saver Active' : 'Device Capability'}
              </div>
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {batterySaverActive 
                  ? 'Nebula view disabled to conserve power. Charge your device to enable.'
                  : deviceReason
                }
              </div>
              <div className={`
                text-xs mt-2 px-2 py-1 rounded-md inline-block
                ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}
              `}>
                Tier: {deviceTier.toUpperCase()}
              </div>
            </div>
          </div>
          
          {/* Arrow */}
          <div className={`
            absolute top-full left-1/2 -translate-x-1/2
            w-0 h-0 border-l-8 border-r-8 border-t-8
            border-l-transparent border-r-transparent
            ${isDark ? 'border-t-gray-900/95' : 'border-t-white'}
          `} />
        </div>
      )}
    </div>
  );
}
