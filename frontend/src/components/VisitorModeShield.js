import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, KeyRound, Eye } from 'lucide-react';
import SovereignPreferences from '../kernel/SovereignPreferences';
import { setVisitorPin, hasVisitorPin, verifyVisitorPin } from '../kernel/SovereignTiers';

/**
 * VisitorModeShield — the social-layer PIN shield.
 *
 * Flow:
 *   1. Sovereign opens this panel → sets a 4-6 digit PIN (first time only).
 *   2. Sovereign taps "Hand off as Visitor" → app forces Gamer Mode + sets
 *      `html[data-visitor-mode]`. Settings/Choice Panel locked behind PIN.
 *   3. Guest browses the Starseed Adventure and the 7 Pillars freely.
 *   4. Sovereign enters PIN → shield lifts, Scholar Mode restores.
 *
 * Never locks anyone out — the PIN is a social courtesy shield, not a
 * cryptographic one. The Sovereign Vault (MasteryLedger, Preferences)
 * stays protected on the backend via the auth token, not this PIN.
 */

export default function VisitorModeShield({ open, onClose }) {
  const [step, setStep] = useState('menu'); // menu | setPin | lockConfirm | unlockPrompt
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState(null);
  const [visitorActive, setVisitorActive] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const v = document.documentElement.getAttribute('data-visitor-mode') === 'true';
    setVisitorActive(v);
  }, [open]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  const engageVisitor = () => {
    SovereignPreferences.setGamerMode(true);
    document.documentElement.setAttribute('data-visitor-mode', 'true');
    setVisitorActive(true);
    onClose?.();
  };

  const handleSetPin = () => {
    setError(null);
    if (!/^\d{4,6}$/.test(pin)) return setError('PIN must be 4-6 digits');
    if (pin !== pin2) return setError('PINs do not match');
    try { setVisitorPin(pin); setStep('lockConfirm'); }
    catch (e) { setError(e.message); }
  };

  const handleUnlock = () => {
    setError(null);
    if (!verifyVisitorPin(pin)) return setError('Incorrect PIN');
    document.documentElement.removeAttribute('data-visitor-mode');
    SovereignPreferences.setGamerMode(false);
    setVisitorActive(false);
    setPin('');
    onClose?.();
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(4,6,15,0.94)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}
        data-testid="visitor-shield"
      >
        <motion.div
          initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }}
          className="relative rounded-2xl max-w-md w-full p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(22,22,36,0.95), rgba(10,10,20,0.95))',
            border: '1px solid rgba(244,114,182,0.3)',
          }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5" data-testid="visitor-shield-close">
            <X size={18} style={{ color: '#cbd5e1' }} />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} style={{ color: '#F472B6' }} />
            <p className="text-[10px] uppercase tracking-[0.32em] sov-telemetry" style={{ color: '#F472B6' }}>
              Visitor Shield
            </p>
          </div>

          {step === 'menu' && (
            <>
              <h2 className="text-2xl font-light mt-0.5" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
                {visitorActive ? 'Visitor Mode is active' : 'Hand off the Ferrari — safely.'}
              </h2>
              <p className="text-sm mt-1 mb-5" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif', fontSize: 15 }}>
                {visitorActive
                  ? 'Enter your PIN to reclaim Sovereign mode.'
                  : 'Your guest gets the cinematic world. They cannot change your calibration, spend Sparks, or read your Mastery Ledger.'}
              </p>

              {!visitorActive && !hasVisitorPin() && (
                <button onClick={() => setStep('setPin')} data-testid="visitor-set-pin" className="w-full px-4 py-3 rounded-xl text-[11px] uppercase tracking-[0.28em] font-bold"
                  style={{ background: 'rgba(244,114,182,0.16)', border: '1px solid rgba(244,114,182,0.55)', color: '#FBCFE8' }}>
                  Set Visitor PIN first
                </button>
              )}
              {!visitorActive && hasVisitorPin() && (
                <button onClick={engageVisitor} data-testid="visitor-engage" className="w-full px-4 py-3 rounded-xl text-[11px] uppercase tracking-[0.28em] font-bold"
                  style={{ background: 'rgba(244,114,182,0.16)', border: '1px solid rgba(244,114,182,0.55)', color: '#FBCFE8' }}>
                  Hand off as Visitor
                </button>
              )}
              {visitorActive && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <KeyRound size={14} style={{ color: '#cbd5e1' }} />
                    <input
                      type="password" inputMode="numeric" maxLength={6}
                      value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      data-testid="visitor-pin-input"
                      className="flex-1 bg-transparent border-b border-white/10 text-center text-xl tracking-[0.5em] sov-telemetry py-2 focus:outline-none focus:border-pink-400"
                      style={{ color: '#fff' }}
                    />
                  </div>
                  {error && <p className="text-[11px] mb-2" style={{ color: '#F87171' }}>{error}</p>}
                  <button onClick={handleUnlock} data-testid="visitor-unlock" className="w-full px-4 py-3 rounded-xl text-[11px] uppercase tracking-[0.28em] font-bold"
                    style={{ background: 'rgba(244,114,182,0.18)', border: '1px solid rgba(244,114,182,0.55)', color: '#FBCFE8' }}>
                    Reclaim Sovereign Mode
                  </button>
                </>
              )}
            </>
          )}

          {step === 'setPin' && (
            <>
              <h2 className="text-2xl font-light mt-0.5 mb-3" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
                Choose a 4-6 digit PIN
              </h2>
              <input
                type="password" inputMode="numeric" maxLength={6}
                value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter PIN"
                data-testid="visitor-new-pin"
                className="w-full bg-transparent border border-white/10 rounded-xl text-center text-xl tracking-[0.5em] sov-telemetry py-3 mb-2 focus:outline-none focus:border-pink-400"
                style={{ color: '#fff' }}
              />
              <input
                type="password" inputMode="numeric" maxLength={6}
                value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))}
                placeholder="Confirm PIN"
                data-testid="visitor-confirm-pin"
                className="w-full bg-transparent border border-white/10 rounded-xl text-center text-xl tracking-[0.5em] sov-telemetry py-3 mb-3 focus:outline-none focus:border-pink-400"
                style={{ color: '#fff' }}
              />
              {error && <p className="text-[11px] mb-2" style={{ color: '#F87171' }}>{error}</p>}
              <button onClick={handleSetPin} data-testid="visitor-save-pin" className="w-full px-4 py-3 rounded-xl text-[11px] uppercase tracking-[0.28em] font-bold"
                style={{ background: 'rgba(244,114,182,0.16)', border: '1px solid rgba(244,114,182,0.55)', color: '#FBCFE8' }}>
                Save PIN
              </button>
            </>
          )}

          {step === 'lockConfirm' && (
            <>
              <h2 className="text-2xl font-light mt-0.5 mb-3" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
                PIN saved. Ready for handoff.
              </h2>
              <button onClick={engageVisitor} data-testid="visitor-engage-now" className="w-full px-4 py-3 rounded-xl text-[11px] uppercase tracking-[0.28em] font-bold"
                style={{ background: 'rgba(244,114,182,0.18)', border: '1px solid rgba(244,114,182,0.55)', color: '#FBCFE8' }}>
                Hand off as Visitor now
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
