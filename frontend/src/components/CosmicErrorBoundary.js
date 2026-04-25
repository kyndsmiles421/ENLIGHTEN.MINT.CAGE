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
      const errMsg = this.state.error?.message || String(this.state.error || 'Unknown error');
      const errStack = this.state.error?.stack || '';
      const compStack = this.state.info?.componentStack || '';
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-8" data-testid="cosmic-error-boundary">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md text-center"
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
            <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
              <button
                onClick={this.handleReset}
                className="px-5 py-2 rounded-full text-[11px] font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.2)', color: '#818CF8' }}
                data-testid="error-boundary-retry"
              >
                Try Again
              </button>
              <button
                onClick={() => { window.location.href = '/sovereign-hub'; }}
                className="px-5 py-2 rounded-full text-[11px] transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}
                data-testid="error-boundary-home"
              >
                Return Home
              </button>
              <button
                onClick={this.toggleDetails}
                className="px-4 py-2 rounded-full text-[10px] transition-all hover:scale-105 uppercase"
                style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)', color: '#FBBF24', letterSpacing: '0.16em', fontFamily: 'monospace' }}
                data-testid="error-boundary-details-toggle"
              >
                {this.state.showDetails ? 'Hide details' : 'Show details'}
              </button>
            </div>
            {this.state.showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-lg mt-2 p-3 text-left overflow-auto"
                style={{
                  background: 'rgba(4,6,15,0.7)',
                  border: '1px solid rgba(251,191,36,0.18)',
                  fontFamily: 'monospace',
                  fontSize: 10,
                  color: '#FCD34D',
                  maxHeight: 320,
                }}
                data-testid="error-boundary-details"
              >
                <p style={{ color: '#F87171', marginBottom: 8, wordBreak: 'break-word' }}>{errMsg}</p>
                {errStack && (
                  <pre style={{ color: 'rgba(252,211,77,0.78)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                    {errStack.split('\n').slice(0, 12).join('\n')}
                  </pre>
                )}
                {compStack && (
                  <pre style={{ color: 'rgba(148,163,184,0.78)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: 8 }}>
                    {compStack.split('\n').slice(0, 8).join('\n')}
                  </pre>
                )}
                <p style={{ color: 'rgba(148,163,184,0.55)', marginTop: 8, fontSize: 9, letterSpacing: '0.1em' }}>
                  Copy this text when reporting the issue.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
