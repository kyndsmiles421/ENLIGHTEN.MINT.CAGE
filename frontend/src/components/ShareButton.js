import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // V1.2.7 — Share-link bug fix. Use the canonical hyphenated domain
    // EXPLICITLY in both the URL field AND the visible text. Previously
    // the text contained the brand wordmark "ENLIGHTEN.MINT.CAFE"
    // (with periods) which Facebook's preview displays prominently and
    // recipients were typing into their browser bar — landing on
    // `http://enlighten.mint.cafe/` (which is NOT a real domain — the
    // owner has `.me`, not `.cafe`) and getting ERR_NAME_NOT_RESOLVED.
    //
    // Strategy: drop the wordmark from the share text; always
    // hand-craft the URL to `https://enlighten-mint-cafe.me` so neither
    // the Share API nor a clipboard copy can ever produce the broken
    // form. window.location.origin is still preferred when the user is
    // already on the production domain, but we guard against the
    // preview origin leaking into a share by hard-replacing it with
    // the canonical production URL.
    const PROD = 'https://enlighten-mint-cafe.me';
    const liveOrigin = (typeof window !== 'undefined' && window.location?.origin) || '';
    const isProd = liveOrigin === PROD || liveOrigin === 'http://enlighten-mint-cafe.me';
    const url = `${isProd ? liveOrigin : PROD}/landing.html`;
    const shareData = {
      title: 'ENLIGHTEN MINT CAFE — Sovereign Engine',
      text: 'Sanctuary for breathwork, meditation, and spiritual growth. Open the Sovereign Engine →',
      url,
    };

    // Use native share on mobile if available
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or not supported — fall through to copy
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <button onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-all hover:scale-105"
      style={{
        background: 'rgba(22,24,38,0.8)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'none',
        color: 'var(--text-muted)',
      }}
      data-testid="share-btn">
      {copied ? <Check size={13} style={{ color: '#22C55E' }} /> : <Share2 size={13} />}
      <span className="text-[10px] font-bold">{copied ? 'Copied!' : 'Share'}</span>
    </button>
  );
}
