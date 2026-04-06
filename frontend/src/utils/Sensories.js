import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const Sensories = {
  tap: async () => { try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {} },
  select: async () => { try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {} },
  confirm: async () => { try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch (e) {} },
  success: async () => { try { await Haptics.notification({ type: NotificationType.Success }); } catch (e) {} }
};
