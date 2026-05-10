/**
 * ENLIGHTEN.MINT.CAFE - FRONTEND NODULE BRIDGE
 * VERSION: V53.0 UNIFIED SYNC
 * ARCHITECT: Sovereign Owner
 * 
 * This bridge connects the frontend to the Master Sync endpoint,
 * ensuring all modules get their data in one payload.
 * No more multiple API calls. No more race conditions.
 * Everything synchronized.
 */

const API = process.env.REACT_APP_BACKEND_URL || '';

// ═══════════════════════════════════════════════════════════════════════════════
// THE NODULE BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════

const NoduleBridge = {
  // Cached sync data
  cache: null,
  cacheTime: null,
  CACHE_TTL: 30000, // 30 seconds
  
  /**
   * Get auth token from localStorage
   */
  getToken: function() {
    return localStorage.getItem('zen_token');
  },
  
  /**
   * Fetch all modules in one sync call
   */
  syncAll: async function(forceRefresh = false) {
    // Check cache
    if (!forceRefresh && this.cache && this.cacheTime && (Date.now() - this.cacheTime < this.CACHE_TTL)) {
      console.log('[NoduleBridge] Returning cached sync data');
      return this.cache;
    }
    
    try {
      const token = this.getToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API}/api/sync/all-modules`, { headers });
      
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update cache
      this.cache = data;
      this.cacheTime = Date.now();
      
      console.log('[NoduleBridge] Sync complete:', data.integrity);
      return data;
      
    } catch (error) {
      console.error('[NoduleBridge] Sync error:', error);
      throw error;
    }
  },
  
  /**
   * Fetch a single module on demand
   */
  syncModule: async function(moduleName) {
    try {
      const token = this.getToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API}/api/sync/module/${moduleName}`, { headers });
      
      if (!response.ok) {
        throw new Error(`Module sync failed: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error(`[NoduleBridge] Module ${moduleName} sync error:`, error);
      throw error;
    }
  },
  
  /**
   * Get UI theme configuration
   */
  getTheme: async function() {
    const sync = await this.syncAll();
    return sync?.modules?.ui || {
      background: '#000000',
      palette: 'Refracted Crystal Rainbow',
    };
  },
  
  /**
   * Get Star Chart data
   */
  getStarChart: async function() {
    const sync = await this.syncAll();
    return sync?.modules?.star_chart || null;
  },
  
  /**
   * Get Vault/Ledger data
   */
  getVault: async function() {
    const sync = await this.syncAll();
    return sync?.modules?.the_vault || null;
  },
  
  /**
   * Get Oracle data
   */
  getOracle: async function() {
    const sync = await this.syncAll();
    return sync?.modules?.oracle || null;
  },
  
  /**
   * Get Trade Circle data
   */
  getTrade: async function() {
    const sync = await this.syncAll();
    return sync?.modules?.trade_circle || null;
  },
  
  /**
   * Get user progress
   */
  getProgress: async function() {
    const sync = await this.syncAll();
    return sync?.modules?.progress || null;
  },
  
  /**
   * Get system constants
   */
  getSystem: async function() {
    const sync = await this.syncAll();
    return sync?.system || {
      resonance: 8.4881,
      composite_hz: 690,
      earth_hz: 7.3,
      phi: 1.618,
    };
  },
  
  /**
   * Check if user is authenticated (based on last sync)
   */
  isAuthenticated: function() {
    return this.cache?.authenticated || false;
  },
  
  /**
   * Clear cache (use after login/logout)
   */
  clearCache: function() {
    this.cache = null;
    this.cacheTime = null;
    console.log('[NoduleBridge] Cache cleared');
  },
  
  /**
   * Health check
   */
  healthCheck: async function() {
    try {
      const response = await fetch(`${API}/api/sync/health`);
      return await response.json();
    } catch (error) {
      console.error('[NoduleBridge] Health check failed:', error);
      return { status: 'Error', error: error.message };
    }
  },
};


// ═══════════════════════════════════════════════════════════════════════════════
// THE ENLIGHTEN APP INITIALIZER
// ═══════════════════════════════════════════════════════════════════════════════

const EnlightenApp = {
  initialized: false,
  
  /**
   * Initialize the entire app with one sync call
   */
  async initialize() {
    if (this.initialized) {
      console.log('[EnlightenApp] Already initialized');
      return;
    }
    
    console.log('[EnlightenApp] Initializing Refracted Crystal Rainbow Theme...');
    
    try {
      const sync = await NoduleBridge.syncAll(true);
      
      if (sync.integrity === 'Synced') {
        this.applyTheme(sync.modules.ui);
        this.initModules(sync.modules);
        this.initSystem(sync.system);
        this.initialized = true;
        console.log('[EnlightenApp] Initialization complete');
      } else {
        console.error('[EnlightenApp] Sync integrity check failed');
      }
      
    } catch (error) {
      console.error('[EnlightenApp] Initialization failed:', error);
    }
  },
  
  /**
   * Apply the Obsidian Void theme
   */
  applyTheme(theme) {
    if (!theme) return;
    
    document.body.style.backgroundColor = theme.background || '#000000';
    document.documentElement.style.setProperty('--bg-primary', theme.background || '#000000');
    
    // Apply Solfeggio color map as CSS variables
    if (theme.solfeggio_map) {
      Object.entries(theme.solfeggio_map).forEach(([freq, color]) => {
        document.documentElement.style.setProperty(`--solfeggio-${freq}`, color);
      });
    }
    
    console.log(`[EnlightenApp] Theme applied: ${theme.palette}`);
  },
  
  /**
   * Initialize module states
   */
  initModules(modules) {
    if (!modules) return;
    
    // Star Chart
    if (modules.star_chart) {
      console.log(`[EnlightenApp] Star Chart: ${modules.star_chart.constellations_visible} constellations visible`);
    }
    
    // Vault/Ledger
    if (modules.the_vault?.ledger) {
      const ledger = modules.the_vault.ledger;
      console.log(`[EnlightenApp] Ledger: $${ledger.hourly_rate}/hr | ${ledger.dust} dust | Tier: ${ledger.tier}`);
    }
    
    // Trade Circle
    if (modules.trade_circle) {
      console.log(`[EnlightenApp] Trade Circle: ${modules.trade_circle.total_listings} listings`);
    }
    
    // Manifest Bar
    if (modules.manifest_bar) {
      console.log(`[EnlightenApp] Manifest Bar: ${modules.manifest_bar.join(' | ')}`);
    }
  },
  
  /**
   * Initialize system constants
   */
  initSystem(system) {
    if (!system) return;
    
    // Store system constants globally
    window.ENLIGHTEN_SYSTEM = {
      resonance: system.resonance,
      compositeHz: system.composite_hz,
      earthHz: system.earth_hz,
      phi: system.phi,
    };
    
    console.log(`[EnlightenApp] System: Resonance ${system.resonance} | ${system.composite_hz}Hz composite`);
  },
  
  /**
   * Refresh all data
   */
  async refresh() {
    NoduleBridge.clearCache();
    await this.initialize();
  },
};


// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// Expose to window for console access
if (typeof window !== 'undefined') {
  window.NoduleBridge = NoduleBridge;
  window.EnlightenApp = EnlightenApp;
}

export { NoduleBridge, EnlightenApp };
export default NoduleBridge;
