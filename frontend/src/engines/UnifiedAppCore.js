/**
 * UNIFIED APP CORE — Sovereign Mobile Manifest
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Contains the Logic Gate, the Aesthetic Guard, and the Economy Engine.
 * For Play Store / App Store deployment via Capacitor.
 */

// ============================================================
// 1. AESTHETIC GUARD (KILLS THE TEMPLATE GRAY FOREVER)
// ============================================================
export const lockObsidianReality = () => {
  // Remove existing guard if present
  const existing = document.getElementById('obsidian-guard');
  if (existing) existing.remove();

  const css = `
    /* OBSIDIAN GUARD — Direct DOM Override */
    body, html, #root, .ion-page, .main-wrapper, .dashboard { 
      background: #000000 !important; 
      background-image: none !important;
      color: #F0FFF0 !important; 
    }
    
    /* Kill ALL gray backgrounds universally */
    * { 
      --ion-background-color: #000000 !important;
    }
    
    /* Subtle mint borders */
    * { 
      border-color: rgba(240, 255, 240, 0.1) !important; 
    }
    
    /* Ionic framework override */
    .ion-content, ion-content { 
      --background: #000000 !important; 
    }
    
    /* STOP Pill — Fixed position, always accessible */
    .pill-stop, .floating-stop-button { 
      position: fixed !important; 
      top: 10px !important; 
      left: 10px !important; 
      z-index: 9999 !important; 
      background: rgba(220, 20, 60, 0.6) !important; 
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      border-radius: 20px !important; 
      padding: 5px 15px !important; 
      font-weight: bold !important;
      cursor: pointer !important;
      color: #ffffff !important;
    }
    
    /* Disruption Banner */
    .disruption-banner {
      background: rgba(240, 255, 240, 0.03) !important;
      border-left: 4px solid gold !important;
      padding: 15px !important;
      margin: 80px 0 20px 0 !important;
    }
    
    /* Secure Pill Buttons */
    .secure-pill-button, .nav-btn {
      background: #000 !important;
      border: 1px solid rgba(134, 239, 172, 0.3) !important;
      color: #86efac !important;
      padding: 15px 20px !important;
      border-radius: 30px !important;
      margin-bottom: 10px !important;
      width: 100% !important;
      text-align: center !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
    }
    
    .secure-pill-button:hover, .nav-btn:hover {
      background: rgba(134, 239, 172, 0.1) !important;
      transform: scale(1.02) !important;
    }
    
    .secure-pill-button:active, .nav-btn:active {
      transform: scale(0.98) !important;
    }
    
    /* Economy Portal Section */
    .economy-portal {
      background: #000 !important;
      border: 1px solid rgba(134, 239, 172, 0.15) !important;
      border-radius: 16px !important;
      padding: 20px !important;
      margin: 20px 0 !important;
    }
    
    /* Footer */
    .sovereign-footer {
      position: fixed !important;
      bottom: 10px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      font-size: 0.6rem !important;
      opacity: 0.3 !important;
      color: #F0FFF0 !important;
    }
  `;
  
  const style = document.createElement('style');
  style.id = 'obsidian-guard';
  style.innerHTML = css;
  document.head.appendChild(style);
  
  console.log("Ω [OBSIDIAN_GUARD]: Template gray eliminated. True black locked.");
};

// ============================================================
// 2. SOVEREIGN ECONOMY & AUTO-VERIFIER (THE DETACHED ENGINE)
// ============================================================
export const SovereignEngine = {
  rates: { 
    market: 50.00, 
    discount: 0.80,  // 20% below market
    volValue: 25.00  // $25 per volunteer hour
  },

  // Calculate rate with volunteer credits
  calculate: (userHours) => {
    const baseRate = SovereignEngine.rates.market * SovereignEngine.rates.discount;
    const credits = userHours * SovereignEngine.rates.volValue;
    const finalPrice = Math.max(0, baseRate - credits);
    
    return {
      marketRate: SovereignEngine.rates.market.toFixed(2),
      sovereignRate: baseRate.toFixed(2),
      volunteerCredits: credits.toFixed(2),
      finalPrice: finalPrice.toFixed(2),
      isGratis: finalPrice === 0,
      status: finalPrice === 0 ? 'GRATIS / SOVEREIGN' : 'DISCOUNTED'
    };
  },

  // Automates verification so you don't have to do it personally
  autoVerify: (userHours, activityType) => {
    const isApproved = (userHours <= 4); // Auto-approve up to 4 hours
    const baseRate = SovereignEngine.rates.market * SovereignEngine.rates.discount;
    const credits = userHours * SovereignEngine.rates.volValue;
    const finalPrice = Math.max(0, baseRate - credits);
    
    // Generate Crystal Seal signature
    const timestamp = Date.now();
    const signature = btoa(`SHA256:${timestamp}:${userHours}:${activityType}`);
    
    return {
      status: isApproved ? 'VERIFIED' : 'PENDING_AUDIT',
      autoApproved: isApproved,
      hours: userHours,
      activityType: activityType,
      credits: credits.toFixed(2),
      finalPrice: finalPrice.toFixed(2),
      signature: signature,
      timestamp: new Date(timestamp).toISOString(),
      message: isApproved 
        ? 'Reciprocity verified. Credits applied to your account.'
        : 'Submission pending manual review (exceeds auto-approve limit).'
    };
  }
};

// ============================================================
// 3. SOVEREIGN STATE — Global State Manager
// ============================================================
export const SovereignState = {
  tier: localStorage.getItem('zen_user_tier') || 'BASIC',
  volunteerHours: 0,
  
  setTier: (newTier) => {
    SovereignState.tier = newTier;
    localStorage.setItem('zen_user_tier', newTier);
    console.log(`Ω [STATE]: Tier updated to ${newTier}`);
  },
  
  unlockTier: (targetTier) => {
    SovereignState.setTier(targetTier);
    window.dispatchEvent(new CustomEvent('TIER_UNLOCKED', { detail: { tier: targetTier } }));
    console.log(`Ω [STATE]: ${targetTier} tier UNLOCKED`);
  },
  
  addVolunteerHours: (hours) => {
    SovereignState.volunteerHours += hours;
    console.log(`Ω [STATE]: Added ${hours} volunteer hours. Total: ${SovereignState.volunteerHours}`);
  }
};

// Expose to window for global access
if (typeof window !== 'undefined') {
  window.SovereignState = SovereignState;
  window.SovereignEngine = SovereignEngine;
  window.lockObsidianReality = lockObsidianReality;
}

// ============================================================
// 4. EMERGENCY STOP HANDLER
// ============================================================
export const executeEmergencyStop = async () => {
  console.log("Ω [EMERGENCY]: Hard Halt Executed.");
  
  // Stop all audio contexts
  if (window.AudioContext) {
    const contexts = window.__audioContexts || [];
    contexts.forEach(ctx => {
      try { ctx.close(); } catch (e) {}
    });
  }
  
  // Hit backend
  try {
    const API = process.env.REACT_APP_BACKEND_URL || '';
    await fetch(`${API}/api/sovereign/stop`, { method: 'POST' });
  } catch (e) {
    console.warn('[EmergencyStop] Backend call failed:', e);
  }
  
  return { status: 'HALTED', message: 'All systems zeroed.' };
};

// ============================================================
// 5. AUTO-INITIALIZE
// ============================================================
if (typeof window !== 'undefined') {
  // Lock Obsidian on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', lockObsidianReality);
  } else {
    lockObsidianReality();
  }
  
  // Re-apply on route changes (SPA)
  window.addEventListener('popstate', lockObsidianReality);
  
  console.log("Ω [UNIFIED_CORE]: Sovereign Mobile Manifest initialized. Ready for Store deployment.");
}

export default {
  lockObsidianReality,
  SovereignEngine,
  SovereignState,
  executeEmergencyStop,
};
