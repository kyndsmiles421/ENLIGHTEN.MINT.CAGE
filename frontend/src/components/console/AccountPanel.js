/**
 * AccountPanel.js — User account, share, profile, and auth controls
 * Extracted from UnifiedCreatorConsole.js
 */
import React, { useState } from 'react';
import { User, Share2, LogOut, LogIn, Globe, ShoppingCart, Lock, Image as ImageIcon, QrCode } from 'lucide-react';
import { useScene } from '../SceneEngine';
import MyQRSheet from '../SovereignQR';

function SceneButton() {
  const scene = useScene();
  if (!scene) return null;
  return (
    <button onClick={() => scene.setPickerOpen(true)}
      className="flex items-center gap-2 p-3 rounded-xl active:scale-95"
      style={{ background: `${scene.activeSkin.accent}08`, border: `1px solid ${scene.activeSkin.accent}20` }}
      data-testid="account-scene">
      <ImageIcon size={14} style={{ color: scene.activeSkin.accent }} />
      <div>
        <div className="text-[10px] font-bold" style={{ color: scene.activeSkin.accent }}>Realms</div>
        <div className="text-[7px] text-white/20">{scene.isLocked ? scene.activeSkin.name : 'Auto'}</div>
      </div>
    </button>
  );
}

export default function AccountPanel({ authToken, authUser, tier, handleBroadcast, handleSever, handleNav, loadStore }) {
  const isLoggedIn = !!(authToken && authToken !== 'guest_token');
  const userName = authUser?.name || null;
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: isLoggedIn ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)' }}>
          <User size={14} style={{ color: isLoggedIn ? '#22C55E' : 'rgba(255,255,255,0.3)' }} />
        </div>
        <div className="flex-1">
          <div className="text-[11px] font-medium text-white/80" data-testid="account-username">{userName || (isLoggedIn ? 'Sovereign' : 'Guest')}</div>
          <div className="text-[8px] text-white/30">{isLoggedIn ? `Tier: ${tier}` : 'Not logged in'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleBroadcast}
          className="flex items-center gap-2 p-3 rounded-xl active:scale-95"
          style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)' }}
          data-testid="account-share">
          <Share2 size={14} style={{ color: '#38BDF8' }} />
          <div><div className="text-[10px] font-bold text-sky-400">Share</div><div className="text-[7px] text-white/20">Broadcast link</div></div>
        </button>

        <SceneButton />

        <button onClick={() => setQrOpen(true)}
          className="flex items-center gap-2 p-3 rounded-xl active:scale-95"
          style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.25)' }}
          data-testid="account-qr">
          <QrCode size={14} style={{ color: '#C084FC' }} />
          <div><div className="text-[10px] font-bold text-purple-400">My QR</div><div className="text-[7px] text-white/20">Sovereign link</div></div>
        </button>

        <button onClick={() => handleNav('/cosmic-profile')}
          className="flex items-center gap-2 p-3 rounded-xl active:scale-95"
          style={{ background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.15)' }}
          data-testid="account-profile">
          <User size={14} style={{ color: '#C084FC' }} />
          <div><div className="text-[10px] font-bold text-purple-400">Profile</div><div className="text-[7px] text-white/20">Cosmic view</div></div>
        </button>

        {isLoggedIn ? (
          <button onClick={handleSever}
            className="flex items-center gap-2 p-3 rounded-xl active:scale-95"
            style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}
            data-testid="account-logout">
            <LogOut size={14} style={{ color: '#EF4444' }} />
            <div><div className="text-[10px] font-bold text-red-400">Sever</div><div className="text-[7px] text-white/20">Log out</div></div>
          </button>
        ) : (
          <button onClick={() => { window.location.href = '/auth'; }}
            className="flex items-center gap-2 p-3 rounded-xl active:scale-95"
            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}
            data-testid="account-login">
            <LogIn size={14} style={{ color: '#22C55E' }} />
            <div><div className="text-[10px] font-bold text-green-400">Login</div><div className="text-[7px] text-white/20">Sign in</div></div>
          </button>
        )}

        <button onClick={() => handleNav('/sovereign-hub')}
          className="flex items-center gap-2 p-3 rounded-xl active:scale-95"
          style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}
          data-testid="account-hub">
          <Globe size={14} style={{ color: '#EAB308' }} />
          <div><div className="text-[10px] font-bold text-yellow-400">Hub</div><div className="text-[7px] text-white/20">Sovereign Hub</div></div>
        </button>
      </div>

      <button onClick={loadStore}
        className="w-full flex items-center gap-2 p-3 rounded-xl active:scale-95"
        style={{ background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.1)' }}
        data-testid="account-store">
        <ShoppingCart size={14} style={{ color: '#EAB308' }} />
        <div className="text-[10px] font-bold text-yellow-400/80">Mixer Store</div>
      </button>

      <button onClick={() => handleNav('/terms')}
        className="w-full flex items-center gap-2 p-2 rounded-lg active:scale-95"
        style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}
        data-testid="account-terms">
        <Lock size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
        <div className="text-[8px] text-white/20">Trust & Compliance</div>
      </button>
      <MyQRSheet open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
}
