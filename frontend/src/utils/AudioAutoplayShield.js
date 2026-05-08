/**
 * AudioAutoplayShield.js — V1.1.22 system-wide silent-rejection guard
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * The OS calls `audio.play()` in 30+ places (Sage chat, Star Chart,
 * SacredTexts, CreationStories, Encyclopedia, VR, etc.). On mobile
 * Safari + Android Chrome, ANY `audio.play()` fired after a fetch's
 * await rejects with NotAllowedError because the user-gesture context
 * has expired. Most call sites don't `.catch()` the resulting promise,
 * so each rejection becomes an "Uncaught (in promise)" warning that
 * shows up as a red flash in the console and — depending on the
 * browser's error reporting policy — can trigger React DevTools or
 * the error boundary in some Webview shells.
 *
 * Rather than touch all 30+ call sites individually (high risk of
 * subtle behavior regressions), we register a global
 * `unhandledrejection` handler that swallows ONLY the well-known
 * autoplay-block rejection types. Real bugs still surface; only the
 * mobile-policy noise is silenced.
 *
 * The proper long-term fix is what we did in PerformanceManager:
 * pre-unlock an Audio element inside the user gesture, then swap
 * src after fetch. We can migrate other call sites to that pattern
 * as we touch them. This shield prevents the "glitchy" feel users
 * report in the meantime.
 */

const AUTOPLAY_REASONS = new Set([
  'NotAllowedError',
  'NotSupportedError',
  'AbortError',
]);

function isAutoplayRejection(reason) {
  if (!reason) return false;
  if (typeof reason === 'string') {
    return /not allowed|user (gesture|interaction)|autoplay|abort/i.test(reason);
  }
  if (reason && typeof reason === 'object') {
    if (reason.name && AUTOPLAY_REASONS.has(reason.name)) return true;
    if (reason.message && /not allowed|user (gesture|interaction)|autoplay|abort/i.test(reason.message)) return true;
  }
  return false;
}

let installed = false;

export function installAudioAutoplayShield() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('unhandledrejection', (event) => {
    if (isAutoplayRejection(event.reason)) {
      // Silently swallow. Mobile autoplay-blocked play() is a browser
      // policy, not an app bug. Pages that care about this state
      // should `.catch()` the promise locally and update UI.
      event.preventDefault();
    }
  });
}

export default { installAudioAutoplayShield };
