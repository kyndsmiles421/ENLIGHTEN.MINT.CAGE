import React from 'react';
import { motion } from 'framer-motion';

const COSMIC_MESSAGES = [
  'Aligning cosmic frequencies...',
  'Channeling starlight...',
  'Weaving the astral threads...',
  'Consulting the celestial archives...',
  'Attuning to your vibration...',
  'Opening dimensional pathways...',
  'Harmonizing with the cosmos...',
  'Reading the quantum field...',
];

export function CosmicLoader({ message, size = 'md' }) {
  const randomMsg = message || COSMIC_MESSAGES[Math.floor(Math.random() * COSMIC_MESSAGES.length)];
  const dims = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-sm' : 'text-[11px]';

  return (
    <div className="flex flex-col items-center gap-3" data-testid="cosmic-loader">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className={`${dims} rounded-full`}
          style={{
            border: '2px solid rgba(129,140,248,0.1)',
            borderTopColor: '#818CF8',
            borderRightColor: '#C084FC',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C084FC' }} />
        </motion.div>
      </div>
      <motion.p
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className={`${textSize} font-light`}
        style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}
      >
        {randomMsg}
      </motion.p>
    </div>
  );
}

// Full-page loader for initial data fetches
export function CosmicPageLoader({ message }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" data-testid="cosmic-page-loader">
      <CosmicLoader message={message} size="lg" />
    </div>
  );
}

// Inline loader for sections within a page
export function CosmicInlineLoader({ message }) {
  return (
    <div className="py-8 flex items-center justify-center" data-testid="cosmic-inline-loader">
      <CosmicLoader message={message} size="md" />
    </div>
  );
}

// Error fallback — keeps the vibe alive even when things break
export function CosmicError({ title, message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 py-10 px-4 text-center"
      data-testid="cosmic-error"
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.1)' }}>
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="text-lg"
          style={{ color: '#C084FC', fontFamily: 'Cormorant Garamond, serif' }}
        >
          ~
        </motion.span>
      </div>
      <p className="text-sm font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
        {title || 'The cosmic signal wavered'}
      </p>
      <p className="text-[10px] max-w-xs" style={{ color: 'var(--text-muted)' }}>
        {message || 'A momentary disruption in the astral field. Your journey is safe — try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-1.5 rounded-full text-[10px] font-medium transition-all hover:scale-105"
          style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.15)', color: '#818CF8' }}
          data-testid="cosmic-retry-btn"
        >
          Reconnect
        </button>
      )}
    </motion.div>
  );
}

// Cosmic-themed error messages by HTTP status
export function getCosmicErrorMessage(error) {
  const status = error?.response?.status;
  const detail = error?.response?.data?.detail;

  if (status === 429) {
    return {
      title: 'The cosmos needs a moment',
      message: 'Too many requests — the celestial servers are catching their breath. Try again in a few seconds.',
    };
  }
  if (status === 503 || status === 502) {
    return {
      title: 'Dimensional gateway offline',
      message: 'Our cosmic servers are realigning. This usually resolves in a moment.',
    };
  }
  if (status === 500) {
    return {
      title: 'A ripple in the astral plane',
      message: 'Something unexpected happened on our end. Your progress is safe — try again.',
    };
  }
  if (status === 401 || status === 403) {
    return {
      title: 'Access requires alignment',
      message: 'Please sign in to continue your cosmic journey.',
    };
  }
  if (status === 404) {
    return {
      title: 'Path not found in this dimension',
      message: typeof detail === 'string' ? detail : 'The resource you\'re looking for may have shifted planes.',
    };
  }
  if (!error?.response && error?.message?.includes('Network')) {
    return {
      title: 'Connection to the cosmos lost',
      message: 'Check your internet connection and try again. Your journey will resume right where you left off.',
    };
  }

  return {
    title: 'The cosmic signal wavered',
    message: typeof detail === 'string' ? detail : 'A momentary disruption. Try again.',
  };
}
