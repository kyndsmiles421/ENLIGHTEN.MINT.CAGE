/**
 * zIndexHierarchy.js — Global Z-Index Management
 * 
 * THE LAYER CAKE
 * 
 * Establishes a clear, non-overlapping z-index hierarchy for all UI elements.
 * NO MORE z-index: 99999 chaos!
 * 
 * LAYER SYSTEM:
 * - Background (0-9): Decorative backgrounds, gradients
 * - Content (10-49): Main content, text, images
 * - Navigation (50-99): Nav bars, docks, sidebars
 * - Widgets (100-199): Floating widgets, cards
 * - Overlays (200-299): Tooltips, dropdowns, hints
 * - Modals (300-499): Dialog boxes, panels
 * - Alerts (500-699): Notifications, toasts
 * - Emergency (700-999): Emergency controls, critical alerts
 */

export const Z_LAYERS = {
  // ═══════════════════════════════════════════════════════════════════════════
  // BACKGROUND LAYER (0-9)
  // ═══════════════════════════════════════════════════════════════════════════
  BACKGROUND_DEEP: 0,
  BACKGROUND_GRADIENT: 1,
  BACKGROUND_PATTERN: 2,
  BACKGROUND_GLOW: 5,
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONTENT LAYER (10-49)
  // ═══════════════════════════════════════════════════════════════════════════
  CONTENT_BASE: 10,
  CONTENT_CARDS: 20,
  CONTENT_FOCUS: 30,
  CONTENT_INTERACTIVE: 40,
  
  // ═══════════════════════════════════════════════════════════════════════════
  // NAVIGATION LAYER (50-99)
  // ═══════════════════════════════════════════════════════════════════════════
  NAV_BACKGROUND: 50,
  NAV_DOCK: 60,          // SmartDock, sidebars
  NAV_HEADER: 70,        // Top bars
  NAV_BUTTONS: 80,       // Navigation buttons
  
  // ═══════════════════════════════════════════════════════════════════════════
  // WIDGET LAYER (100-199)
  // ═══════════════════════════════════════════════════════════════════════════
  WIDGET_BACKGROUND: 100,
  WIDGET_SAGE: 110,      // SageAvatar
  WIDGET_STATUS: 120,    // Status indicators
  WIDGET_HUD: 130,       // Kinetic HUD elements
  WIDGET_ACTIVE: 150,    // Currently focused widget
  
  // ═══════════════════════════════════════════════════════════════════════════
  // OVERLAY LAYER (200-299)
  // ═══════════════════════════════════════════════════════════════════════════
  OVERLAY_HINT: 200,     // Tooltips, hints
  OVERLAY_DROPDOWN: 220, // Dropdown menus
  OVERLAY_POPUP: 250,    // Small popups
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MODAL LAYER (300-499)
  // ═══════════════════════════════════════════════════════════════════════════
  MODAL_BACKDROP: 300,
  MODAL_CONTENT: 350,
  MODAL_HEADER: 360,
  MODAL_ACTIONS: 370,
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ALERT LAYER (500-699)
  // ═══════════════════════════════════════════════════════════════════════════
  ALERT_INFO: 500,
  ALERT_WARNING: 550,
  ALERT_ERROR: 600,
  TOAST: 650,
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EMERGENCY LAYER (700-999)
  // ═══════════════════════════════════════════════════════════════════════════
  EMERGENCY_OVERLAY: 700,
  EMERGENCY_SHUTOFF: 900,  // The STOP button - always accessible
  EMERGENCY_MAX: 999,
};

// Helper to get inline style
export const zIndex = (layer) => ({ zIndex: Z_LAYERS[layer] || layer });

// Helper for className-based z-index (Tailwind)
export const zClass = (layer) => `z-[${Z_LAYERS[layer] || layer}]`;

export default Z_LAYERS;
