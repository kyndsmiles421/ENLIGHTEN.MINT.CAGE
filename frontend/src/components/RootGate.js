import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * RootGate — deciding what the root "/" shows.
 *
 * The app uses a Guest Mode fallback: if a user has no real token, the
 * AuthContext hands out a `guest_token` + synthetic guest user so the
 * hub can render in preview. So "logged out" really means
 *   token === 'guest_token' OR user.id === 'guest'.
 *
 *   Real user → fall through to /sovereign-hub
 *   Guest/logged-out → punt to the static /landing.html marketing page
 */
export default function RootGate({ children }) {
  const auth = useAuth() || {};
  const { user, token, loading } = auth;
  const [punted, setPunted] = useState(false);

  useEffect(() => {
    if (loading) return;
    const isGuest = !user || user.id === 'guest' || token === 'guest_token' || !token;
    if (isGuest) {
      window.location.replace('/landing.html');
      setPunted(true);
    }
  }, [user, token, loading]);

  if (loading || punted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(148,163,184,0.6)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        letterSpacing: '0.3em',
      }}>
        TUNING…
      </div>
    );
  }
  return children;
}
