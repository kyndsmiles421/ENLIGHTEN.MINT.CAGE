/**
 * Sensories.js - Haptic Feedback Utility
 * The Enlightenment Cafe | Native Touch Experience
 * 
 * Usage:
 *   import { Sensories } from '../utils/Sensories';
 *   onClick={() => { Sensories.tap(); doSomething(); }}
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const Sensories = {
  /**
   * Light: Subtle UI interactions
   * Use for: Pillar hover/tap, toggles, minor selections
   */
  tap: async () => {
    try { 
      await Haptics.impact({ style: ImpactStyle.Light }); 
    } catch (e) {
      // Web fallback - no-op
    }
  },
  
  /**
   * Medium: Navigation & Selections
   * Use for: Mood Ring change, category selection, route navigation
   */
  select: async () => {
    try { 
      await Haptics.impact({ style: ImpactStyle.Medium }); 
    } catch (e) {
      // Web fallback - no-op
    }
  },
  
  /**
   * Heavy: Critical Actions
   * Use for: Sign In, Submit, Finalize, Purchase
   */
  confirm: async () => {
    try { 
      await Haptics.impact({ style: ImpactStyle.Heavy }); 
    } catch (e) {
      // Web fallback - no-op
    }
  },

  /**
   * Success: Achievement/Goal Met
   * Use for: Master Sovereign Cert, Streak completion, Level up
   */
  success: async () => {
    try { 
      await Haptics.notification({ type: NotificationType.Success }); 
    } catch (e) {
      // Web fallback - no-op
    }
  },

  /**
   * Warning: Attention needed
   * Use for: Low credits, session ending, streak at risk
   */
  warning: async () => {
    try { 
      await Haptics.notification({ type: NotificationType.Warning }); 
    } catch (e) {
      // Web fallback - no-op
    }
  },

  /**
   * Error: Something went wrong
   * Use for: Failed submission, network error, validation failure
   */
  error: async () => {
    try { 
      await Haptics.notification({ type: NotificationType.Error }); 
    } catch (e) {
      // Web fallback - no-op
    }
  },

  /**
   * Vibrate: Custom duration (ms)
   * Use for: Breathing exercises, meditation pulses
   */
  vibrate: async (duration = 100) => {
    try { 
      await Haptics.vibrate({ duration }); 
    } catch (e) {
      // Web fallback - no-op
    }
  },

  /**
   * Breathing Pulse: Rhythmic vibration for meditation
   * Creates a gentle in-out pattern
   */
  breathingPulse: async () => {
    try {
      // Inhale pulse
      await Haptics.impact({ style: ImpactStyle.Light });
      await new Promise(r => setTimeout(r, 300));
      await Haptics.impact({ style: ImpactStyle.Medium });
      await new Promise(r => setTimeout(r, 300));
      // Exhale pulse
      await Haptics.impact({ style: ImpactStyle.Medium });
      await new Promise(r => setTimeout(r, 300));
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Web fallback - no-op
    }
  }
};

export default Sensories;
