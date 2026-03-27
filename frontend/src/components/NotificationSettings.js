import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, Check, Zap, Sun, Sparkles, TestTube } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationSettings({ onClose }) {
  const { authHeaders } = useAuth();
  const [vapidKey, setVapidKey] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [prefs, setPrefs] = useState({
    daily_relaxation: true,
    cosmic_insights: true,
    practice_reminders: true,
  });
  const [supported] = useState('serviceWorker' in navigator && 'PushManager' in window);

  useEffect(() => {
    const init = async () => {
      try {
        const [keyRes, statusRes] = await Promise.all([
          axios.get(`${API}/notifications/vapid-public-key`),
          axios.get(`${API}/notifications/status`, { headers: authHeaders }),
        ]);
        setVapidKey(keyRes.data.public_key);
        setIsSubscribed(statusRes.data.subscribed);
        if (statusRes.data.preferences) setPrefs(statusRes.data.preferences);
      } catch {}
      setLoading(false);
    };
    init();
  }, [authHeaders]);

  const subscribe = useCallback(async () => {
    if (!supported || !vapidKey) return;
    setSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        setSubscribing(false);
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      await axios.post(`${API}/notifications/subscribe`, {
        subscription: subscription.toJSON(),
      }, { headers: authHeaders });
      setIsSubscribed(true);
      toast.success('Quantum field notifications activated');
    } catch (err) {
      toast.error('Failed to subscribe');
    }
    setSubscribing(false);
  }, [supported, vapidKey, authHeaders]);

  const unsubscribe = useCallback(async () => {
    setSubscribing(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await axios.delete(`${API}/notifications/unsubscribe`, {
          data: { endpoint: subscription.endpoint },
          headers: authHeaders,
        });
      }
      setIsSubscribed(false);
      toast.success('Notifications deactivated');
    } catch {
      toast.error('Failed to unsubscribe');
    }
    setSubscribing(false);
  }, [authHeaders]);

  const updatePref = async (key, value) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    try {
      await axios.post(`${API}/notifications/preferences`, newPrefs, { headers: authHeaders });
    } catch {}
  };

  const sendTest = async () => {
    setSendingTest(true);
    try {
      await axios.post(`${API}/notifications/send-test`, {}, { headers: authHeaders });
      toast.success('Test notification sent');
    } catch {
      toast.error('Failed to send test');
    }
    setSendingTest(false);
  };

  const prefItems = [
    { key: 'daily_relaxation', label: 'Daily Relaxation', desc: 'Quantum field alignment reminders', icon: Sun, color: '#FCD34D' },
    { key: 'cosmic_insights', label: 'Cosmic Insights', desc: 'Entangled wisdom from the universe', icon: Sparkles, color: '#C084FC' },
    { key: 'practice_reminders', label: 'Practice Reminders', desc: 'Wave-function collapse into action', icon: Zap, color: '#2DD4BF' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-80 rounded-xl overflow-hidden"
      style={{ background: 'rgba(8,8,18,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
      data-testid="notification-settings"
    >
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-2">
          <Bell size={14} style={{ color: '#C084FC' }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(248,250,252,0.6)' }}>Notifications</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5" data-testid="notification-close-btn">
            <X size={12} style={{ color: 'rgba(248,250,252,0.3)' }} />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {!supported ? (
          <p className="text-xs text-center py-4" style={{ color: 'rgba(248,250,252,0.4)' }}>
            Push notifications are not supported in this browser.
          </p>
        ) : loading ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(192,132,252,0.2)', borderTopColor: '#C084FC' }} />
          </div>
        ) : (
          <>
            {/* Subscribe/Unsubscribe toggle */}
            <button
              onClick={isSubscribed ? unsubscribe : subscribe}
              disabled={subscribing}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all"
              style={{
                background: isSubscribed ? 'rgba(192,132,252,0.1)' : 'rgba(248,250,252,0.03)',
                border: `1px solid ${isSubscribed ? 'rgba(192,132,252,0.2)' : 'rgba(248,250,252,0.06)'}`,
              }}
              data-testid="notification-toggle-btn"
            >
              <div className="flex items-center gap-2.5">
                {isSubscribed ? <Bell size={14} style={{ color: '#C084FC' }} /> : <BellOff size={14} style={{ color: 'rgba(248,250,252,0.3)' }} />}
                <div className="text-left">
                  <p className="text-[11px] font-medium" style={{ color: isSubscribed ? '#C084FC' : 'rgba(248,250,252,0.6)' }}>
                    {isSubscribed ? 'Notifications Active' : 'Enable Notifications'}
                  </p>
                  <p className="text-[9px]" style={{ color: 'rgba(248,250,252,0.25)' }}>
                    {isSubscribed ? 'Quantum field connected' : 'Receive daily cosmic reminders'}
                  </p>
                </div>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-all ${subscribing ? 'opacity-50' : ''}`}
                style={{ background: isSubscribed ? 'rgba(192,132,252,0.4)' : 'rgba(248,250,252,0.1)' }}>
                <div className="absolute top-0.5 w-3 h-3 rounded-full transition-all"
                  style={{ left: isSubscribed ? '18px' : '2px', background: isSubscribed ? '#C084FC' : 'rgba(248,250,252,0.3)' }} />
              </div>
            </button>

            {/* Preferences */}
            {isSubscribed && (
              <div className="space-y-2" data-testid="notification-preferences">
                <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'rgba(248,250,252,0.25)' }}>Preferences</p>
                {prefItems.map(({ key, label, desc, icon: Icon, color }) => (
                  <button key={key} onClick={() => updatePref(key, !prefs[key])}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all hover:bg-white/[0.02]"
                    style={{ border: '1px solid rgba(248,250,252,0.03)' }}
                    data-testid={`notification-pref-${key}`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={12} style={{ color: prefs[key] ? color : 'rgba(248,250,252,0.15)' }} />
                      <div className="text-left">
                        <p className="text-[10px] font-medium" style={{ color: prefs[key] ? 'rgba(248,250,252,0.7)' : 'rgba(248,250,252,0.3)' }}>{label}</p>
                        <p className="text-[8px]" style={{ color: 'rgba(248,250,252,0.2)' }}>{desc}</p>
                      </div>
                    </div>
                    <div className="w-3.5 h-3.5 rounded flex items-center justify-center"
                      style={{ background: prefs[key] ? `${color}20` : 'rgba(248,250,252,0.05)', border: `1px solid ${prefs[key] ? `${color}40` : 'rgba(248,250,252,0.08)'}` }}>
                      {prefs[key] && <Check size={8} style={{ color }} />}
                    </div>
                  </button>
                ))}

                {/* Test notification */}
                <button onClick={sendTest} disabled={sendingTest}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg mt-2 transition-all hover:bg-white/[0.03]"
                  style={{ border: '1px solid rgba(248,250,252,0.05)' }}
                  data-testid="notification-test-btn"
                >
                  <TestTube size={11} style={{ color: 'rgba(248,250,252,0.3)' }} />
                  <span className="text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
                    {sendingTest ? 'Sending...' : 'Send Test Notification'}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
