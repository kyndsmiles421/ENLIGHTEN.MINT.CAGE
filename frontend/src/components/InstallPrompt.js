import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState('unknown');
  const deferredPrompt = useRef(null);

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/.test(ua)) setPlatform('ios');
    else if (/Android/.test(ua)) setPlatform('android');
    else setPlatform('desktop');

    // Listen for install prompt (Chrome/Edge/Android)
    const handler = (e) => {
      e.preventDefault();
      deferredPrompt.current = e;
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Track actual installs
    const onInstalled = () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.post(`${API}/app-install`, { platform: platform || 'unknown' }, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    };
    window.addEventListener('appinstalled', onInstalled);

    // Show prompt after 30 seconds if not installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone;
    const dismissed = localStorage.getItem('cosmic_install_dismissed');

    if (!isInstalled && !dismissed) {
      const timer = setTimeout(() => setShow(true), 30000);
      return () => { clearTimeout(timer); window.removeEventListener('beforeinstallprompt', handler); window.removeEventListener('appinstalled', onInstalled); };
    }

    return () => { window.removeEventListener('beforeinstallprompt', handler); window.removeEventListener('appinstalled', onInstalled); };
  }, [platform]);

  const install = async () => {
    if (deferredPrompt.current) {
      deferredPrompt.current.prompt();
      const result = await deferredPrompt.current.userChoice;
      if (result.outcome === 'accepted') setShow(false);
      deferredPrompt.current = null;
    }
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('cosmic_install_dismissed', 'true');
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 rounded-2xl p-5"
        style={{
          background: 'rgba(13, 14, 26, 0.97)',
          border: '1px solid rgba(192,132,252,0.12)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(192,132,252,0.05)',
        }}
        data-testid="install-prompt"
      >
        <button onClick={dismiss} className="absolute top-3 right-3" style={{ color: 'var(--text-muted)' }}>
          <X size={14} />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)' }}>
            <Smartphone size={18} style={{ color: '#C084FC' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Install Cosmic Collective</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Add to your home screen</p>
          </div>
        </div>

        {platform === 'ios' ? (
          <div className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            Tap <Share size={12} className="inline mx-1" style={{ color: '#2DD4BF' }} /> then <strong>"Add to Home Screen"</strong> to install as an app.
          </div>
        ) : (
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            Get the full app experience — works offline, launches instantly, no app store needed.
          </p>
        )}

        <div className="flex gap-2">
          {platform !== 'ios' && deferredPrompt.current && (
            <button onClick={install}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.25)', color: '#C084FC' }}
              data-testid="install-btn">
              <Download size={13} /> Install App
            </button>
          )}
          <button onClick={dismiss}
            className="px-4 py-2.5 rounded-xl text-xs transition-all"
            style={{ color: 'var(--text-muted)' }}>
            Not now
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
