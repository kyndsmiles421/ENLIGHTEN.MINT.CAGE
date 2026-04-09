/**
 * HARDWARE AESTHETIC LOCK — True Obsidian on Device
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Forces the phone's hardware UI (status bar, nav bar) to match
 * your True Obsidian #000000 aesthetic.
 * 
 * For Play Store / App Store deployment via Capacitor.
 */

/**
 * Lock hardware aesthetic to True Obsidian
 * Call this on app startup in useEffect
 */
export const lockHardwareAesthetic = async () => {
  console.log('Ω [HARDWARE]: Locking aesthetic to True Obsidian...');
  
  try {
    // 1. STATUS BAR (Top - clock, battery, signal)
    if (typeof window !== 'undefined') {
      // Dynamic import for Capacitor plugins
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        
        // Set Status Bar to Black
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#000000' });
        await StatusBar.setOverlaysWebView({ overlay: false });
        
        console.log('Ω [HARDWARE]: Status bar locked to #000000');
      } catch (e) {
        console.log('[HardwareLock] StatusBar plugin not available (web mode)');
      }
    }
    
    // 2. NAVIGATION BAR (Bottom - Android only)
    if (typeof window !== 'undefined' && window.NavigationBar) {
      try {
        window.NavigationBar.backgroundColorByHexString('#000000', false);
        console.log('Ω [HARDWARE]: Navigation bar locked to #000000');
      } catch (e) {
        console.log('[HardwareLock] NavigationBar not available');
      }
    }
    
    // 3. SPLASH SCREEN (Hide after app loads)
    try {
      const { SplashScreen } = await import('@capacitor/splash-screen');
      await SplashScreen.hide();
      console.log('Ω [HARDWARE]: Splash screen hidden');
    } catch (e) {
      console.log('[HardwareLock] SplashScreen not available (web mode)');
    }
    
    // 4. KEYBOARD (Dark keyboard on focus)
    if (typeof window !== 'undefined') {
      try {
        const { Keyboard } = await import('@capacitor/keyboard');
        await Keyboard.setStyle({ style: 'DARK' });
        console.log('Ω [HARDWARE]: Keyboard set to dark mode');
      } catch (e) {
        console.log('[HardwareLock] Keyboard plugin not available');
      }
    }
    
    console.log('Ω [HARDWARE]: All hardware aesthetic locks applied.');
    return true;
    
  } catch (err) {
    console.warn('[HardwareLock] Error locking hardware aesthetic:', err);
    return false;
  }
};

/**
 * Check if running in Capacitor native environment
 */
export const isCapacitorNative = () => {
  return typeof window !== 'undefined' && 
         window.Capacitor && 
         window.Capacitor.isNativePlatform();
};

/**
 * Get current platform
 */
export const getPlatform = () => {
  if (typeof window === 'undefined') return 'server';
  if (window.Capacitor?.getPlatform) {
    return window.Capacitor.getPlatform(); // 'ios', 'android', 'web'
  }
  return 'web';
};

/**
 * Lock screen orientation to portrait (optional)
 */
export const lockPortraitOrientation = async () => {
  try {
    const { ScreenOrientation } = await import('@capacitor/screen-orientation');
    await ScreenOrientation.lock({ orientation: 'portrait' });
    console.log('Ω [HARDWARE]: Orientation locked to portrait');
  } catch (e) {
    console.log('[HardwareLock] ScreenOrientation not available');
  }
};

/**
 * Enable haptic feedback
 */
export const triggerHaptic = async (type = 'medium') => {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    
    const styles = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };
    
    await Haptics.impact({ style: styles[type] || ImpactStyle.Medium });
  } catch (e) {
    // Haptics not available
  }
};

/**
 * Initialize all hardware features on app startup
 */
export const initializeHardware = async () => {
  const isNative = isCapacitorNative();
  const platform = getPlatform();
  
  console.log(`Ω [HARDWARE]: Initializing... Platform: ${platform}, Native: ${isNative}`);
  
  if (isNative) {
    await lockHardwareAesthetic();
  }
  
  return { isNative, platform };
};

export default {
  lockHardwareAesthetic,
  isCapacitorNative,
  getPlatform,
  lockPortraitOrientation,
  triggerHaptic,
  initializeHardware,
};
