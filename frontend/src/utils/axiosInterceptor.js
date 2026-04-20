import axios from 'axios';
import { toast } from 'sonner';

let lastToastTime = 0;
const TOAST_COOLDOWN = 3000; // Don't spam toasts faster than 3s

const cosmicToast = (msg, type = 'error') => {
  const now = Date.now();
  if (now - lastToastTime < TOAST_COOLDOWN) return;
  lastToastTime = now;
  if (type === 'error') toast.error(msg);
  else toast(msg);
};

export function setupAxiosInterceptors() {
  // Request interceptor: attach auth token when available
  // V68.29 Hydration-Race Fix: ALWAYS read token fresh from localStorage at request time
  // and ALWAYS overwrite a stale `Bearer guest_token` or stale memoized Authorization
  // that components may have captured from AuthContext before hydration completed.
  axios.interceptors.request.use((config) => {
    const zenToken = localStorage.getItem('zen_token');
    const hasRealToken = zenToken && zenToken !== 'guest_token';
    const existingAuth = config.headers?.Authorization || '';
    const existingIsStaleGuest = existingAuth === 'Bearer guest_token' || existingAuth === 'Bearer null' || existingAuth === 'Bearer undefined';

    if (hasRealToken) {
      // Always prefer the fresh localStorage token. Overwrite any stale
      // Authorization header captured before hydration completed.
      config.headers.Authorization = `Bearer ${zenToken}`;
    } else {
      // Guest user — only abort endpoints that explicitly require auth
      // These are user-specific data fetches that will 401 anyway
      const url = config.url || '';
      const authRequired = [
        '/bank/wallet', '/treasury/', '/classes/mine', '/energy-gates/status',
        '/transmuter/status', '/marketplace/mixer-unlocks', '/sages/quests',
        '/sages/progress', '/academy/', '/activity/track', '/ai-visuals/my-avatar',
        '/atmosphere/gallery', '/atmosphere/save', '/breathing/my-custom',
        '/breathing/save-custom', '/breathing/custom/',
        '/starseed/my-', '/sparks/wallet', '/sparks/cards', '/quests/', '/profile/me',
        '/sovereign/status', '/sovereign-mastery/', '/auth/me',
      ];
      const needsAuth = authRequired.some(p => url.includes(p));
      if (needsAuth) {
        const ctrl = new AbortController();
        ctrl.abort();
        config.signal = ctrl.signal;
      }
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Silently swallow aborted guest-mode requests
      if (error.code === 'ERR_CANCELED' || axios.isCancel(error)) {
        return Promise.reject(error);
      }
      const status = error?.response?.status;

      // Rate limit
      if (status === 429) {
        cosmicToast('The cosmos needs a breath — try again in a moment');
      }
      // Server errors
      else if (status === 502 || status === 503) {
        cosmicToast('Cosmic servers are realigning — this usually resolves quickly');
      }
      else if (status === 500) {
        // Only toast for 500s on non-background requests (skip silent fetches)
        const url = error?.config?.url || '';
        const isSilent = error?.config?.headers?.['X-Silent-Error'];
        if (!isSilent) {
          // Don't toast for expected 500s on optional endpoints
          const optionalPaths = ['/visits/stats', '/my-origin', '/my-journeys', '/badges'];
          const isOptional = optionalPaths.some(p => url.includes(p));
          if (!isOptional) {
            cosmicToast('A ripple in the astral plane — your progress is safe');
          }
        }
      }
      // Network errors
      else if (!error.response && error.message?.includes('Network')) {
        cosmicToast('Lost connection to the cosmos — check your internet');
      }

      return Promise.reject(error);
    }
  );
}
