/**
 * Sensories.js - Haptic Feedback Utility
 * The Enlightenment Cafe | Native Touch Experience
 * 
 * Usage:
 *   import { Sensories } from '../utils/Sensories';
 *   <button onClick={Sensories.tap}>Pillar</button>
 *   <Link onClick={Sensories.confirm}>Enter Sanctuary</Link>
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const Sensories = {
  // UI Interactions (Pillars, Toggles, Hover)
  tap: async () => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
  },

  // Navigation & State Changes (Mood Ring, Watch Journey)
  select: async () => {
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
  },

  // High-Stakes Actions (Sign In, Enter Sanctuary)
  confirm: async () => {
    try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch (e) {}
  },

  // Success/Milestones (Certification, Level Up)
  success: async () => {
    try { await Haptics.notification({ type: NotificationType.Success }); } catch (e) {}
  }
};

export default Sensories;
