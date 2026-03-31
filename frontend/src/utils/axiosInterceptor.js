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
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
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
