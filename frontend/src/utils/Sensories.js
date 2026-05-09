import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * THE SENSORY API
 * Standardized tactile feedback for all replicated apps.
 */
export const Sensories = {
  tap: async () => { 
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } 
  },
  select: async () => { 
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } 
  },
  confirm: async () => { 
    try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } 
  },
  success: async () => { 
    try { await Haptics.notification({ type: NotificationType.Success }); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } 
  }
};
