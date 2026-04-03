import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * Scan text through the Content Sentinel before submission.
 * Returns { clean: true } if safe, or { clean: false, message } if blocked.
 */
export async function scanContent(text, context = 'general', authHeaders = {}) {
  if (!text || !text.trim()) return { clean: true };
  try {
    const res = await axios.post(
      `${API}/sentinel/scan`,
      { text: text.trim(), context },
      { headers: authHeaders }
    );
    return res.data;
  } catch {
    // If sentinel is unreachable, allow content (fail-open for UX, logged server-side)
    return { clean: true };
  }
}

/**
 * Track synthesis events for progressive disclosure.
 * Increments a counter in localStorage each time a synthesis occurs.
 */
const SYNTHESIS_COUNT_KEY = 'cosmic_synthesis_count';

export function recordSynthesis() {
  try {
    const current = parseInt(localStorage.getItem(SYNTHESIS_COUNT_KEY) || '0', 10);
    localStorage.setItem(SYNTHESIS_COUNT_KEY, String(current + 1));
    return current + 1;
  } catch {
    return 0;
  }
}

export function getSynthesisCount() {
  try {
    return parseInt(localStorage.getItem(SYNTHESIS_COUNT_KEY) || '0', 10);
  } catch {
    return 0;
  }
}
