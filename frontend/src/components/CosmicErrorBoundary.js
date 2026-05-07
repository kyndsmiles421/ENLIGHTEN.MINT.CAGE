import React from 'react';
import { motion } from 'framer-motion';

/**
 * CosmicErrorBoundary — captures rendering crashes from any descendant
 * route. The visible "dimensional rift" message is preserved verbatim
 * for narrative consistency, but we now also surface the raw error +
 * stack behind a "Show technical details" toggle so the user can copy
 * the actual cause when reporting a bug. Without this, every crash
 * looks identical and we have no signal about what to fix.
 */
export class CosmicErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Loud + structured so the user can copy-paste from devtools.
    // eslint-disable-next-line no-console
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // eslint-disable-next-line no-console
    console.error('[CosmicErrorBoundary] CAUGHT RUNTIME ERROR');
    // eslint-disable-next-line no-console
    console.error('Message:', error?.message || String(error));
    // eslint-disable-next-line no-console
    console.error('Stack:  ', error?.stack || '(no stack)');
    // eslint-disable-next-line no-console
    console.error('Component stack:', info?.componentStack || '(no component stack)');
    // eslint-disable-next-line no-console
    console.error('Route:  ', typeof window !== 'undefined' ? window.location.pathname : '(ssr)');
    // eslint-disable-next-line no-console
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.setState({ info });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, info: null, showDetails: false });
  };

  toggleDetails = () => {
    this.setState((s) => ({ showDetails: !s.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      // Flatland-clean: no yellow buttons, no modal-card. Inline glyph
      // line + a silent retry. Errors still log to console for debug.
      return (
        <div
          className="min-h-[40vh] flex items-center justify-center px-4 py-8"
          data-testid="cosmic-error-boundary"
          onClick={this.handleReset}
          style={{ cursor: 'pointer' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="text-center select-none"
          >
            <motion.div
              animate={{ opacity: [0.35, 0.85, 0.35] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                fontFamily: 'monospace',
                fontSize: 10,
                letterSpacing: '0.32em',
                color: 'rgba(192,132,252,0.78)',
                textTransform: 'uppercase',
              }}
            >
              · a rift in the lattice ·
            </motion.div>
            <div
              style={{
                marginTop: 14,
                fontFamily: 'monospace',
                fontSize: 8,
                letterSpacing: '0.22em',
                color: 'rgba(248,250,252,0.32)',
                textTransform: 'uppercase',
              }}
            >
              tap to refold
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
