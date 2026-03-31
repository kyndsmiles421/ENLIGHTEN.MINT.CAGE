import React from 'react';
import { motion } from 'framer-motion';

export class CosmicErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('CosmicErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4" data-testid="cosmic-error-boundary">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-sm text-center"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.1)' }}>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{ fontSize: '24px', color: '#C084FC', fontFamily: 'Cormorant Garamond, serif' }}
              >
                *
              </motion.div>
            </div>
            <h2 className="text-lg font-light mb-2"
              style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              A dimensional rift appeared
            </h2>
            <p className="text-[11px] mb-5" style={{ color: 'var(--text-muted)' }}>
              Something unexpected disrupted this part of the cosmos. Your data and progress are safe.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2 rounded-full text-[11px] font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.2)', color: '#818CF8' }}
                data-testid="error-boundary-retry"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-5 py-2 rounded-full text-[11px] transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}
                data-testid="error-boundary-home"
              >
                Return Home
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
