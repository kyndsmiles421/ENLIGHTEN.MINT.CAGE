/**
 * SOVEREIGN ROUTER - Master Navigation Wiring
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * This replaces dead links by ensuring:
 * 1. Tier Check - Only let users in with right access
 * 2. Ledger Sync - Log every entry to Creator Mode
 * 3. The Move - Go to the actual page
 */

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * Access map for tiered navigation
 * Maps destination names to allowed tiers
 */
const ACCESS_MAP = {
  'Sanctuary': ['SOVEREIGN', 'ENLIGHTENED'],
  'Practice': ['BASIC', 'SOVEREIGN', 'ENLIGHTENED'],
  'Divination': ['ENLIGHTENED'],
  'Dashboard': ['BASIC', 'SOVEREIGN', 'ENLIGHTENED'],
  'Today': ['BASIC', 'SOVEREIGN', 'ENLIGHTENED'],
  'Explore': ['BASIC', 'SOVEREIGN', 'ENLIGHTENED'],
  'Economy': ['BASIC', 'SOVEREIGN', 'ENLIGHTENED'],
};

/**
 * Route map for destination to URL path
 */
const ROUTE_MAP = {
  'Sanctuary': '/sanctuary',
  'Practice': '/breathing',
  'Divination': '/oracle',
  'Dashboard': '/dashboard',
  'Today': '/daily-briefing',
  'Explore': '/journey',
  'Economy': '/economy',
};

/**
 * Handle Sovereign Navigation with tier checks and ledger sync
 * 
 * @param {string} destination - The destination name (e.g., 'Sanctuary', 'Practice')
 * @param {string} userTier - The user's current tier (e.g., 'BASIC', 'SOVEREIGN', 'ENLIGHTENED')
 * @param {object} options - Additional options { navigate, authHeaders }
 * @returns {Promise<boolean>} - True if navigation succeeded
 */
export const handleSovereignNav = async (destination, userTier = 'BASIC', options = {}) => {
  const { navigate, authHeaders } = options;
  
  // 1. Tier Check: Only let them in if they have the right access
  const allowedTiers = ACCESS_MAP[destination] || ['BASIC', 'SOVEREIGN', 'ENLIGHTENED'];
  
  if (!allowedTiers.includes(userTier)) {
    console.warn(`[SovereignRouter] Access denied: ${destination} requires ${allowedTiers.join('/')}, user has ${userTier}`);
    alert("This portal requires a higher Tier. Check your Volunteer Credits!");
    return false;
  }

  // 2. Ledger Sync: Log the entry to Creator Mode
  try {
    const token = localStorage.getItem('zen_token');
    const headers = authHeaders || (token ? { Authorization: `Bearer ${token}` } : {});
    
    await fetch(`${API}/sovereign/ledger/sync`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({ 
        data: {
          module: destination, 
          action: 'ACCESS_PORTAL',
          timestamp: new Date().toISOString(),
        },
        sig: generateClientSig(`${destination}:ACCESS_PORTAL`)
      })
    });
    
    console.log(`[SovereignRouter] Ledger synced for ${destination}`);
  } catch (err) {
    console.warn('[SovereignRouter] Ledger sync failed (continuing anyway):', err);
    // Continue with navigation even if ledger sync fails
  }

  // 3. The Move: Go to the actual page
  const targetPath = ROUTE_MAP[destination] || `/${destination.toLowerCase()}`;
  
  if (navigate) {
    // Use React Router navigate for SPA transitions
    navigate(targetPath);
  } else {
    // Fallback to hash-based navigation
    window.location.hash = `#${targetPath}`;
  }
  
  console.log(`[SovereignRouter] Navigated to ${targetPath}`);
  return true;
};

/**
 * Generate a simple client-side signature for the ledger
 * Note: This is NOT cryptographically secure - real verification happens server-side
 */
function generateClientSig(data) {
  // Simple hash-like signature for client-side
  let hash = 0;
  const str = `${data}:${Date.now()}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(12, '0');
}

/**
 * Trigger Emergency Stop - calls backend kill switch
 * @returns {Promise<object>} - Result from backend
 */
export const triggerEmergencyStop = async () => {
  console.log('[SovereignRouter] EMERGENCY STOP TRIGGERED');
  
  try {
    const token = localStorage.getItem('zen_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await fetch(`${API}/sovereign/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({
        action: 'HARD_STOP',
        timestamp: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    console.log('[SovereignRouter] Emergency stop result:', result);
    return result;
  } catch (err) {
    console.error('[SovereignRouter] Emergency stop backend call failed:', err);
    return { status: 'ERROR', message: err.message };
  }
};

/**
 * Quick navigation helper - wraps handleSovereignNav with defaults
 */
export const quickNav = (destination, navigate) => {
  // Get user tier from localStorage or default to BASIC
  const userTier = localStorage.getItem('zen_user_tier') || 'BASIC';
  return handleSovereignNav(destination, userTier, { navigate });
};

export default {
  handleSovereignNav,
  triggerEmergencyStop,
  quickNav,
  ACCESS_MAP,
  ROUTE_MAP,
};
