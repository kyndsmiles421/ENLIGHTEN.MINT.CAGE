import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // V1.1.25 — Share an explicit, guest-safe landing URL instead of
    // window.location.origin. The apex root redirects through RootGate
    // which can race on slow mobile connections and land the recipient
    // on a 404 catch-all. /landing.html is the static marketing page
    // that works for both authed AND guest recipients with zero JS
    // routing — guaranteed to render for whoever opens the share.
    const origin = window.location.origin || 'https://enlighten-mint-cafe.me';
    const url = `${origin}/landing.html`;
    const shareData = {
      title: 'The ENLIGHTEN.MINT.CAFE',
      text: 'Your sanctuary for breathwork, meditation, and spiritual growth. Join The ENLIGHTEN.MINT.CAFE.',
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
