/**
 * SOVEREIGN CORE — The Unified Manifest
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Direct DOM Override to bypass platform CSS entirely.
 * Forces absolute #000000 Obsidian black.
 */

// ==========================================
// 1. PROPRIETARY MATH & VISUAL DEPTH (THE UNBOXING)
// ==========================================
export const applySovereignReality = (frequency = 174) => {
  // Logic: The lower the frequency, the deeper the black. 
  // Forces #000000 Obsidian depth to kill template gray.
  
  // Remove any existing sovereign style to prevent duplicates
  const existingStyle = document.getElementById('sovereign-reality-override');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = 'sovereign-reality-override';
  style.innerHTML = `
    /* DIRECT DOM OVERRIDE — Kills ALL template gray */
    body, 
    #root, 
    .main-wrapper, 
    .dashboard,
    .dashboard-page,
    .immersive-page,
    [data-testid="dashboard-page"],
    .glass-card,
    .stat-card,
    .stat-pill,
    .card-enlighten,
    .content-wrapper,
    .dashboard-container,
    .sovereign-dashboard-injection,
    .disruption-banner,
    div[class*="glass"],
    div[class*="card"],
    div[class*="wrapper"],
    div[class*="container"],
    section,
    main,
    article { 
      background-color: #000000 !important; 
      background-image: none !important;
      background: #000000 !important;
    }
    
    /* Text Colors */
    body, #root {
      color: #F0FFF0 !important;
      transition: all 0.5s ease-in-out;
    }
    
    /* STOP Button — Nearly invisible bottom-right */
    .floating-stop-button,
    [data-testid="emergency-shutoff"] { 
      position: fixed !important;
      bottom: 85px !important; 
      right: 15px !important; 
      top: auto !important;
      left: auto !important;
      background: rgba(10, 10, 10, 0.95) !important; 
      border-radius: 50% !important; 
      z-index: 9999 !important;
      opacity: 0.08 !important;
    }
    
    /* Wisdom Alert Styling */
    .wisdom-alert { 
      border-left: 2px solid gold !important; 
      padding-left: 10px !important; 
      margin: 20px 0 !important; 
      background: #000000 !important;
    }
    
    /* V40.0: REMOVED — was killing ALL color circles on Light Therapy and other pages */
    /* Previously: *[style*="background: rgb("] { background: #000000 !important; } */
    
    /* Force black on hover states too */
    .glass-card:hover,
    .stat-pill:hover,
    div[class*="card"]:hover {
      background: rgba(0, 0, 0, 0.95) !important;
    }
    
    /* Mint glow borders instead of gray */
    .glass-card,
    .stat-pill,
    .stat-card {
      border: 1px solid rgba(134, 239, 172, 0.15) !important;
    }
    
    /* Navigation buttons mint glow */
    .secure-pill-button,
    .journey-btn,
    .sovereign-nav-btn {
      background: rgba(0, 0, 0, 0.8) !important;
      border: 1px solid rgba(134, 239, 172, 0.3) !important;
    }
    
    /* Disruption banner special treatment */
    .disruption-banner {
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.9) 100%) !important;
      border: 1px solid rgba(134, 239, 172, 0.3) !important;
    }
  `;
  document.head.appendChild(style);
  console.log("Ω [MATH_SYNC]: Obsidian Depth Locked. Frequency:", frequency);
};

// ==========================================
// 2. ECONOMY & VOLUNTEER NODULE (SUSTAINABILITY ENGINE V1.3)
// ==========================================
export const SovereignEconomy = {
  marketRate: 50.00,          // Standard Industry Price
  sovereignDiscount: 0.80,    // Your 20% "Early Adopter" Savings
  volunteerValue: 15.00,      // ADJUSTED RECIPROCITY: Fair exchange for time
  cafeFundFloor: 5.00,        // Minimum contribution to cover operational costs

  calculateAccess: (userHours) => {
    const discountedBase = SovereignEconomy.marketRate * SovereignEconomy.sovereignDiscount; // $40.00
    const credits = userHours * SovereignEconomy.volunteerValue;
    
    // THE FUND PROTECTOR: 
    // Ensures the user always contributes at least $5.00 to the "Cafe Fund" 
    // to cover operational costs regardless of volunteer time.
    const calculatedDue = discountedBase - credits;
    const finalDue = Math.max(SovereignEconomy.cafeFundFloor, calculatedDue);
    
    return {
      rate: discountedBase.toFixed(2),
      credits: credits.toFixed(2),
      due: finalDue.toFixed(2),
      cafeFundFloor: SovereignEconomy.cafeFundFloor.toFixed(2),
      isFunded: calculatedDue <= SovereignEconomy.cafeFundFloor,
      status: calculatedDue <= SovereignEconomy.cafeFundFloor ? "CAFE FUND SUPPORTER" : "DISCOUNTED"
    };
  }
};

// ==========================================
// 3. PORTAL NAVIGATION HELPER
// ==========================================
export const handlePortalSync = async (module, userTier, credits) => {
  const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;
  
  console.log(`Ω [LEDGER_SIGNATURE]: Generating hash for ${module}...`);
  
  try {
    await fetch(`${API}/sovereign/ledger/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        data: { module, tier: userTier, credits },
        sig: Date.now().toString(16)
      })
    });
    return true;
  } catch (err) {
    console.warn('[SovereignCore] Ledger sync failed:', err);
    return false;
  }
};

// ==========================================
// 4. EMERGENCY STOP
// ==========================================
export const executeEmergencyStop = async () => {
  const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;
  
  try {
    const res = await fetch(`${API}/sovereign/stop`, { method: 'POST' });
    const data = await res.json();
    console.log("Ω [EMERGENCY]: System halted.", data);
    return data;
  } catch (err) {
    console.error('[SovereignCore] Emergency stop failed:', err);
    return { status: 'ERROR', message: err.message };
  }
};

// ==========================================
// 5. AUTO-INITIALIZE ON IMPORT
// ==========================================
if (typeof window !== 'undefined') {
  // Apply immediately when script loads
  applySovereignReality(174);
  
  // Also apply after DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applySovereignReality(174));
  }
  
  // And on any route changes (for SPA)
  window.addEventListener('popstate', () => applySovereignReality(174));
}

export default {
  applySovereignReality,
  SovereignEconomy,
  handlePortalSync,
  executeEmergencyStop,
};
